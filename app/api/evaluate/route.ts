import OpenAI from "openai";
import { NextResponse } from "next/server";
import type { AutoCriticEvaluation } from "@/lib/types";

const EVALUATE_SYSTEM = `You are an evaluator for prompt quality.
Given a task description and rows of (input, expectedOutput, actualOutput), assess how closely each actualOutput matches expectedOutput.

Return JSON only:
{
  "aggregateScore": number, // 0..1 average quality across rows
  "summary": "short summary of common failures",
  "runs": [
    {
      "input": "string",
      "output": "string",
      "expectedOutput": "string",
      "score": number, // 0..1
      "mismatchReasons": ["string"],
      "improvementHints": ["string"]
    }
  ]
}

Scoring rubric:
- 1.0: matches expected output in substance and constraints
- 0.7-0.9: mostly correct, minor misses
- 0.4-0.6: partially correct, notable misses
- 0.0-0.3: wrong, missing, or off-task
Keep feedback concrete and tied to each row.`;

type EvalRow = {
  input: string;
  expectedOutput: string;
  output: string;
};

export async function POST(req: Request) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured on the server." },
      { status: 500 },
    );
  }

  let body: { taskDescription?: string; runs?: EvalRow[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const taskDescription = (body.taskDescription ?? "").trim();
  const runs = Array.isArray(body.runs)
    ? body.runs
        .map((r) => ({
          input: String(r?.input ?? "").trim(),
          expectedOutput: String(r?.expectedOutput ?? "").trim(),
          output: String(r?.output ?? "").trim(),
        }))
        .filter((r) => r.input && r.expectedOutput)
    : [];

  if (runs.length === 0) {
    return NextResponse.json(
      { error: "At least one run with input and expectedOutput is required." },
      { status: 400 },
    );
  }

  const client = new OpenAI({ apiKey: key });

  try {
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
    if (!raw) {
      return NextResponse.json({ error: "Empty model response." }, { status: 502 });
    }

    const parsed = JSON.parse(raw) as AutoCriticEvaluation;
    if (!Array.isArray(parsed.runs) || typeof parsed.aggregateScore !== "number") {
      return NextResponse.json(
        { error: "Model returned invalid JSON shape." },
        { status: 502 },
      );
    }

    const normalizedRuns = parsed.runs.map((r) => ({
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
    }));

    return NextResponse.json({
      aggregateScore: Math.max(0, Math.min(1, Number(parsed.aggregateScore ?? 0))),
      summary: String(parsed.summary ?? ""),
      runs: normalizedRuns,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "OpenAI request failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
