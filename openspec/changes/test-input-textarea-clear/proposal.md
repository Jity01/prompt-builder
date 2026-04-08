## Why

Single-line test inputs are awkward for realistic prompts and multi-turn snippets, and users cannot drop a row they no longer need without leaving stray text. Improving the test-input area makes iteration faster and matches how people actually paste content.

## What Changes

- Replace each test input **single-line field** with a **multi-line text area** so longer inputs and line breaks are visible and editable comfortably.
- Support **vertical resize** (or equivalent) so users can expand a row to fit content without scrolling inside a tiny box.
- Add a **per-row remove (“×”) control** so users can delete a test input row when they have more than one; keep at least one row so the list never becomes empty in a confusing way.

## Capabilities

### New Capabilities

- None (behavior extends the existing prompt refiner workspace).

### Modified Capabilities

- `prompt-refiner`: Update the “Prompt editing and test inputs” requirement so test inputs use multi-line, resizable fields and support removing extra rows.

## Impact

- **UI**: `components/PromptEditor.tsx`, and state/handlers in `components/PromptRefinerApp.tsx` (remove row callback, stable row identity if needed for list updates).
- **API**: No change to `POST /api/run` payload shape (still one string per input; newlines preserved in JSON).
- **Tests / tooling**: None required unless e2e exists for the editor.
