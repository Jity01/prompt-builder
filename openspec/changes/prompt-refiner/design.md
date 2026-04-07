## Context

The repo is a greenfield **Next.js (App Router)** app for **Prompt Refiner**: users describe desired behavior, edit a system prompt, run it on multiple test inputs, rate outputs with reasons, and request a **minimal** improved prompt plus a **visual diff**. All state is **in-memory** on the client for MVP—no auth, no database. LLM access uses the **OpenAI SDK** with **`gpt-4o`** and `OPENAI_API_KEY` on the server.

## Goals / Non-Goals

**Goals:**

- Single-page **responsive** layout: left = editing (behavior + prompt + inputs + run + version chips), right = run cards, diff, actions.
- **Run** flow: `POST /api/run` with `{ systemPrompt, input }` → `{ output }` using chat completions (system + user messages).
- **Refine** flow: `POST /api/refine` with behavior, current prompt, and feedback array → JSON `{ newPrompt, explanation, diffs }` via `response_format: { type: "json_object" }` and the provided meta-prompt behavior.
- **Feedback UX**: 👍/👎 opens reason field; submitted feedback styles the card (green/red); **Get Suggestion** enabled when ≥1 feedback exists.
- **Diff UX**: show line-level added/removed/unchanged chunks; **Apply** replaces the active prompt and appends prior to **version history** with optional aggregate scores on chips.
- **Empty state**: short placeholder with example prompt/input to reduce cold-start friction.

**Non-Goals:**

- Persistence, auth, multi-model, bulk import, sharing/export, fine-tuning (per proposal).

## Decisions

1. **State container**: One **client component** page (or thin server wrapper + client subtree) holding `useReducer` (or composed `useState`) for: behavior text, current prompt string, test input strings, `PromptVersion[]`, `TestRun[]`, active version id, loading/error flags. Rationale: keeps MVP simple; no sync engine needed.

2. **IDs and timestamps**: Generate **crypto.randomUUID()** (or incremental ids for versions only—spec prefers stable ids) for `PromptVersion.id` and `TestRun.id`; `createdAt` as `Date` in memory (serialize only if needed for display). Rationale: avoids extra deps.

3. **Markdown rendering**: Use a **lightweight** markdown path (e.g. `react-markdown` with **default** sanitization / no raw HTML) for model outputs in `RunCard`. Rationale: readable outputs without full CMS scope—add dependency only if not already in scaffold.

4. **Diff display**: Prefer **structural** rendering from API `DiffChunk[]` (color by `type`). If chunks are line-fragments, join for display; optional fallback: compute a simple line diff client-side only if API returns empty—**primary source of truth** is API `diffs`.

5. **Scoring on version chips**: Aggregate **good/bad counts** from `TestRun` entries tied to `promptVersionId` (and optionally only completed feedback). Rationale: matches user spec (`score?: { good, bad }` on `PromptVersion` or derived).

6. **API errors**: Return JSON `{ error: string }` with appropriate HTTP status from route handlers; UI shows non-blocking alert or inline error on cards. Rationale: predictable client handling.

**Alternatives considered:**

- **tRPC / server actions only**: Rejected for MVP—explicit `route.ts` matches the spec and keeps curl-testing easy.
- **Zustand**: Rejected to honor “useState/useReducer only” unless bundle complexity forces it (avoid for MVP).

## Risks / Trade-offs

- **No persistence** → Refresh loses work → Mitigation: copy “export” could be post-MVP; document in UI lightly.
- **Model non-determinism** → Refine output may drift → Mitigation: JSON schema enforcement + validate fields before UI; show raw error if parse fails.
- **API key exposure** → Must stay server-only → Mitigation: never pass key to client; only call OpenAI from `route.ts`.

## Migration Plan

N/A (new app). Deploy: set `OPENAI_API_KEY` in hosting env; run `next build` / standard Vercel or Node host.

## Open Questions

- Whether to add **`react-markdown`** at scaffold time or use `<pre>` for MVP (prefer markdown per spec “rendered as markdown”).
- Exact **label** for the refine CTA: user spec says **Get Suggestion**; ensure string match in UI.
