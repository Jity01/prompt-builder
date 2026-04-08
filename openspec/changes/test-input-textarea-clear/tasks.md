## 1. State and handlers

- [x] 1.1 Extend test input state in `PromptRefinerApp` to support stable row identity (e.g. `{ id, value }[]` or equivalent) if removing rows; keep `Run all` filtering as non-empty trimmed strings
- [x] 1.2 Add `onRemoveTestInput(index)` (or by id) that removes a row only when length > 1, and wire it to `PromptEditor`

## 2. Prompt editor UI

- [x] 2.1 Replace per-row `<input type="text">` with `<textarea>` in `PromptEditor`, with default row count, `resize-y`, and styles aligned with existing inputs
- [x] 2.2 Add a per-row remove button (e.g. “×” or icon) shown only when `testInputs.length > 1`, with accessible `aria-label`

## 3. Verification

- [x] 3.1 Manually verify: multi-line paste, resize handle, remove middle/first/last row, Run all still maps inputs to runs correctly
- [x] 3.2 Run lint (`pnpm lint` or project equivalent) on touched files
