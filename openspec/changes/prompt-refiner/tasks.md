## 1. Project scaffold

- [x] 1.1 Initialize Next.js (App Router) with Tailwind in the repo root
- [x] 1.2 Add `openai` and (if used) `react-markdown` dependencies; document `OPENAI_API_KEY` in `.env.example`
- [x] 1.3 Add shared TypeScript types for `PromptVersion`, `TestRun`, `PromptDiff`, `DiffChunk` in a `lib/` or `types/` module

## 2. Layout and empty state

- [x] 2.1 Implement `app/page.tsx` two-column responsive layout (left editor stack, right runs/diff)
- [x] 2.2 Add empty-state placeholder copy with example behavior, prompt, and sample input

## 3. Prompt editor and inputs

- [x] 3.1 Build `PromptEditor.tsx` with behavior + system prompt text areas, dynamic test inputs, Add input, and Run All with disabled rules
- [x] 3.2 Wire client state (`useReducer` or `useState`) for behavior text, prompt, input rows, versions, and runs

## 4. Run API and run cards

- [x] 4.1 Implement `app/api/run/route.ts` with OpenAI `gpt-4o` chat completion (system + user) and JSON `{ output }`
- [x] 4.2 Implement `RunCard.tsx` (and container) to show input, markdown output, loading/error
- [x] 4.3 Implement Run All to create/update `TestRun` rows per input and call `/api/run`

## 5. Feedback

- [x] 5.1 Add 👍/👎 flow with inline reason field and green/red borders after submit
- [x] 5.2 Track submitted feedback on runs and enable **Get Suggestion** only when ≥1 feedback exists

## 6. Refine API and diff viewer

- [x] 6.1 Implement `app/api/refine/route.ts` with JSON response format and meta-prompt over behavior, prompt, and feedback array
- [x] 6.2 Build `DiffViewer.tsx` to render `diffs` (added/removed/unchanged), show `explanation`, and **Apply** to update prompt
- [x] 6.3 On Apply, push previous prompt into `PromptVersion` history and set active prompt to `newPrompt`

## 7. Version history

- [x] 7.1 Build `VersionHistory.tsx` with v1… chips showing aggregate 👍/👎 counts per version
- [x] 7.2 Implement chip click to restore a version’s prompt into the editor

## 8. Hardening

- [x] 8.1 Handle API/route errors with user-visible messages; guard missing `OPENAI_API_KEY` on server
- [x] 8.2 Manual pass against `openspec/changes/prompt-refiner/specs/prompt-refiner/spec.md` scenarios
