## 1. Types and state

- [x] 1.1 Extend `TestInputRow` (or rename) to include `expectedOutput: string`; default new rows with empty input and expected output.
- [x] 1.2 Add `taskDescription: string` state in `PromptRefinerApp` with sensible defaults for empty hint logic.
- [x] 1.3 Thread expected output through `TestRun` creation so each run card can read the exemplar for its row index.

## 2. Prompt editor UI

- [x] 2.1 Add task description textarea (label: what the model should do) above the system prompt.
- [x] 2.2 Replace single input textarea per row with paired Input + Expected output fields; keep add/remove row behavior.
- [x] 2.3 Add **Generate base system prompt** button with disabled rules: non-empty trimmed task description and at least one row with both input and expected output non-empty.
- [x] 2.4 Wire generate handler: call new API, set `systemPrompt` on success, surface errors inline or via existing error patterns.

## 3. Run panel and feedback

- [x] 3.1 Update `TestRunner` / run cards to show expected output beside actual output (e.g. labels or two columns).
- [x] 3.2 Include `expectedOutput` in refine payload for each feedback item when present.

## 4. API routes

- [x] 4.1 Implement `POST /api/generate-system-prompt` with JSON body `{ taskDescription, examples: { input, expectedOutput }[] }`, returning `{ systemPrompt }`, using `gpt-4o` and shared `OPENAI_API_KEY` error handling.
- [x] 4.2 Update `POST /api/refine` to accept optional `expectedOutput` on each feedback item; update meta-prompt to use exemplar outputs when refining.
- [x] 4.3 Confirm `POST /api/run` unchanged; adjust types/docs only if needed.

## 5. Empty state and polish

- [x] 5.1 Replace empty-state copy to describe task + I/O pairs → generate → run → feedback → refine.
- [x] 5.2 Manual pass: keyboard layout, disabled states, and loading for generate action.
