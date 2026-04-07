import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured on the server." },
      { status: 500 },
    );
  }

  let body: { systemPrompt?: string; input?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const systemPrompt = body.systemPrompt?.trim() ?? "";
  const input = body.input ?? "";
  if (!systemPrompt) {
    return NextResponse.json({ error: "systemPrompt is required." }, { status: 400 });
  }

  const client = new OpenAI({ apiKey: key });

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: input },
      ],
    });
    const output = response.choices[0]?.message?.content ?? "";
    return NextResponse.json({ output });
  } catch (e) {
    const message = e instanceof Error ? e.message : "OpenAI request failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
