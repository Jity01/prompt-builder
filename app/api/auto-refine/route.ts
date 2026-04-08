import OpenAI from "openai";
import { NextResponse } from "next/server";
import type { AutoCriticEvaluation, AutoRefineIteration, AutoRefineResponse } from "@/lib/types";
import { resolveAutoRefineStatus, validateAutoRefineConfig } from "@/lib/auto-refine";

const EVALUATE_SYSTEM = `You are an evaluator for prompt quality.
Given a task description and rows of (input, expectedOutput, actualOutput), assess how closely each actualOutput matches expectedOutput.
Return JSON:
{
  "aggregateScore": number,
  "summary": "short summary of common failures",
  "runs": [
    {
      "input": "string",
      "output": "string",
      "expectedOutput": "string",
      "score": number,
      "mismatchReasons": ["string"],
      "improvementHints": ["string"]
    }
  ]
}`;

const REFINE_SYSTEM = `You are a prompt engineering assistant.
You receive currentPrompt and auto-critic feedback with mismatch reasons and improvement hints.
Make the smallest prompt change that improves weak cases while preserving strengths.
Return JSON only:
{
  "newPrompt": "string",
  "explanation": "1-2 sentences",
  "diffs": [{ "type": "unchanged" | "removed" | "added", "text": "string" }]
}`;

type RunRow = { input: string; output: string; expectedOutput: string };

async function evaluate(
  client: OpenAI,
  taskDescription: string,
  runs: RunRow[],
): Promise<AutoCriticEvaluation> {
  const payload = JSON.stringify({ taskDescription, runs });
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: EVALUATE_SYSTEM },
      { role: "user", content: payload },
    ],
    response_format: { type: "json_object" },
  });
  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty model response from evaluate.");
  const parsed = JSON.parse(raw) as AutoCriticEvaluation;
  if (!Array.isArray(parsed.runs) || typeof parsed.aggregateScore !== "number") {
    throw new Error("Invalid evaluate JSON shape.");
  }
  return {
    aggregateScore: Math.max(0, Math.min(1, Number(parsed.aggregateScore ?? 0))),
    summary: String(parsed.summary ?? ""),
    runs: parsed.runs.map((r) => ({
      input: String(r.input ?? ""),
      output: String(r.output ?? ""),
      expectedOutput: String(r.expectedOutput ?? ""),
      score: Math.max(0, Math.min(1, Number(r.score ?? 0))),
      mismatchReasons: Array.isArray(r.mismatchReasons)
        ? r.mismatchReasons.map((x) => String(x))
        : [],
      improvementHints: Array.isArray(r.improvementHints)
        ? r.improvementHints.map((x) => String(x))
        : [],
    })),
  };
}

async function refineFromAutoFeedback(
  client: OpenAI,
  currentPrompt: string,
  evaluation: AutoCriticEvaluation,
): Promise<{ newPrompt: string; explanation: string }> {
  const autoFeedback = evaluation.runs.map((r) => ({
    input: r.input,
    output: r.output,
    expectedOutput: r.expectedOutput,
    rating: r.score >= 0.8 ? "good" : "bad",
    reason: [
      ...r.mismatchReasons.slice(0, 2),
      ...r.improvementHints.slice(0, 2),
    ]
      .filter(Boolean)
      .join("; "),
  }));

  const payload = JSON.stringify({ currentPrompt, feedback: autoFeedback });
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: REFINE_SYSTEM },
      { role: "user", content: payload },
    ],
    response_format: { type: "json_object" },
  });
  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty model response from auto-refine.");
  const parsed = JSON.parse(raw) as { newPrompt?: string; explanation?: string };
  if (!parsed.newPrompt) throw new Error("Invalid auto-refine JSON shape.");
  return {
    newPrompt: String(parsed.newPrompt),
    explanation: String(parsed.explanation ?? ""),
  };
}

export async function POST(req: Request) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured on the server." },
      { status: 500 },
    );
  }

  let body: {
    taskDescription?: string;
    currentPrompt?: string;
    runs?: RunRow[];
    threshold?: number;
    maxIterations?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const taskDescription = String(body.taskDescription ?? "").trim();
  const currentPrompt = String(body.currentPrompt ?? "").trim();
  const threshold = Number(body.threshold ?? 0.8);
  const maxIterations = Number(body.maxIterations ?? 5);
  const runs = Array.isArray(body.runs)
    ? body.runs
        .map((r) => ({
          input: String(r?.input ?? "").trim(),
          output: String(r?.output ?? "").trim(),
          expectedOutput: String(r?.expectedOutput ?? "").trim(),
        }))
        .filter((r) => r.input && r.expectedOutput)
    : [];

  if (!currentPrompt) {
    return NextResponse.json({ error: "currentPrompt is required." }, { status: 400 });
  }
  if (runs.length === 0) {
    return NextResponse.json(
      { error: "At least one run with input and expectedOutput is required." },
      { status: 400 },
    );
  }
  const configError = validateAutoRefineConfig(threshold, maxIterations);
  if (configError) return NextResponse.json({ error: configError }, { status: 400 });

  const client = new OpenAI({ apiKey: key });
  const iterations: AutoRefineIteration[] = [];
  let prompt = currentPrompt;
  let status: AutoRefineResponse["status"] = "max_iterations";
  let finalScore = 0;

  try {
    for (let i = 1; i <= maxIterations; i++) {
      if (req.signal.aborted) break;

      // Re-run prompt on each input
      const actualRuns: RunRow[] = [];
      for (const row of runs) {
        const runRes = await client.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: prompt },
            { role: "user", content: row.input },
          ],
        });
        actualRuns.push({
          input: row.input,
          expectedOutput: row.expectedOutput,
          output: String(runRes.choices[0]?.message?.content ?? ""),
        });
      }

      const evaluation = await evaluate(client, taskDescription, actualRuns);
      finalScore = evaluation.aggregateScore;

      const maybeStatus = resolveAutoRefineStatus({
        aborted: req.signal.aborted,
        score: evaluation.aggregateScore,
        threshold,
        iteration: i,
        maxIterations,
      });
      if (maybeStatus === "threshold_met") {
        iterations.push({
          iteration: i,
          aggregateScore: evaluation.aggregateScore,
          summary: evaluation.summary,
          runFeedback: evaluation.runs,
          refineExplanation: "Threshold reached; no additional auto-refine needed.",
        });
        status = maybeStatus;
        break;
      }

      const refined = await refineFromAutoFeedback(client, prompt, evaluation);
      prompt = refined.newPrompt;
      iterations.push({
        iteration: i,
        aggregateScore: evaluation.aggregateScore,
        summary: evaluation.summary,
        runFeedback: evaluation.runs,
        refineExplanation: refined.explanation,
      });
      if (maybeStatus === "max_iterations") {
        status = maybeStatus;
      }
    }

    if (req.signal.aborted) {
      status = "cancelled";
    }

    return NextResponse.json({
      status,
      finalPrompt: prompt,
      finalScore,
      iterations,
    } satisfies AutoRefineResponse);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Auto-refine failed.";
    return NextResponse.json(
      {
        error: message,
        partial: {
          status,
          finalPrompt: prompt,
          finalScore,
          iterations,
        },
      },
      { status: 502 },
    );
  }
}
