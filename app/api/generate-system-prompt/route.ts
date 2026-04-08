import OpenAI from "openai";
import { NextResponse } from "next/server";

const META_SYSTEM = `You are a prompt engineering assistant. The user describes what an LLM should do (task) and provides input/output exemplars showing desired behavior.

Write a single system prompt string that, when used with a chat model, will steer responses toward those exemplars for similar inputs. Be concrete; include format, tone, and constraints implied by the examples.

Return JSON only, no prose outside JSON. Shape:
{ "systemPrompt": "full system prompt text" }`;

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
    examples?: { input: string; expectedOutput: string }[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const taskDescription = (body.taskDescription ?? "").trim();
  const rawExamples = Array.isArray(body.examples) ? body.examples : [];
  const examples = rawExamples
    .map((e) => ({
      input: String(e?.input ?? "").trim(),
      expectedOutput: String(e?.expectedOutput ?? "").trim(),
    }))
    .filter((e) => e.input.length > 0 && e.expectedOutput.length > 0);

  if (!taskDescription) {
    return NextResponse.json(
      { error: "taskDescription is required." },
      { status: 400 },
    );
  }
  if (examples.length === 0) {
    return NextResponse.json(
      { error: "At least one complete input/output example is required." },
      { status: 400 },
    );
  }

  const client = new OpenAI({ apiKey: key });
  const userPayload = JSON.stringify({ taskDescription, examples });

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

    const parsed = JSON.parse(raw) as { systemPrompt?: string };
    if (!parsed.systemPrompt || typeof parsed.systemPrompt !== "string") {
      return NextResponse.json(
        { error: "Model returned invalid JSON shape." },
        { status: 502 },
      );
    }

    return NextResponse.json({ systemPrompt: parsed.systemPrompt });
  } catch (e) {
    const message = e instanceof Error ? e.message : "OpenAI request failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
