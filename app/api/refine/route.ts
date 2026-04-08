import OpenAI from "openai";
import { NextResponse } from "next/server";
import type { RefineFeedbackItem } from "@/lib/types";

const META_SYSTEM = `You are a prompt engineering assistant. The user is refining an LLM system prompt using test outputs and ratings.

You will receive JSON in the user message with keys: currentPrompt, feedback (array of { input, output, expectedOutput?, rating, reason }).

expectedOutput is the user's exemplar for that input when provided; use it to judge whether the model matched the desired answer. Infer goals from the system prompt, exemplars, and feedback (what worked vs what failed).

Your job:
1. Identify what the prompt is getting wrong based on the bad feedback (and preserve what works from good feedback).
2. Suggest a minimal, targeted edit to the system prompt.
3. Return JSON only, no prose outside the JSON. Use this exact shape:
{
  "newPrompt": "string — full replacement system prompt",
  "explanation": "1–2 sentences on what changed and why",
  "diffs": [
    { "type": "unchanged" | "removed" | "added", "text": "string (line or chunk)" }
  ]
}

Only make the smallest change necessary. Preserve everything that's working.
Build diffs as a reasonable line-level sequence so the UI can color added (green) vs removed (red) vs unchanged.`;

export async function POST(req: Request) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured on the server." },
      { status: 500 },
    );
  }

  let body: {
    currentPrompt?: string;
    feedback?: RefineFeedbackItem[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const currentPrompt = body.currentPrompt ?? "";
  const feedback = Array.isArray(body.feedback) ? body.feedback : [];
  if (feedback.length === 0) {
    return NextResponse.json({ error: "At least one feedback item is required." }, { status: 400 });
  }

  const client = new OpenAI({ apiKey: key });

  const userPayload = JSON.stringify({
    currentPrompt,
    feedback,
  });

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: META_SYSTEM },
        { role: "user", content: userPayload },
      ],
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json({ error: "Empty model response." }, { status: 502 });
    }

    const parsed = JSON.parse(raw) as {
      newPrompt?: string;
      explanation?: string;
      diffs?: { type: string; text: string }[];
    };

    if (!parsed.newPrompt || !parsed.explanation || !Array.isArray(parsed.diffs)) {
      return NextResponse.json({ error: "Model returned invalid JSON shape." }, { status: 502 });
    }

    const diffs = parsed.diffs.map((d) => ({
      type: d.type as "added" | "removed" | "unchanged",
      text: String(d.text ?? ""),
    }));

    return NextResponse.json({
      newPrompt: parsed.newPrompt,
      explanation: parsed.explanation,
      diffs,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "OpenAI request failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
