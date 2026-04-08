## Why

Refining a system prompt from **inputs alone** hides the user’s intent for each case: what “good” looks like per input. Teams think in **input/output exemplars** and a short **task description** (“what the model should do”). Starting from a blank system prompt is also slow; a **generated draft** from those examples accelerates the loop before **run → feedback → refine** takes over.

## What Changes

- Replace the **inputs-only** test rows with **input + expected output** pairs (and add/remove row controls as today).
- Add a **task description** field: plain-language summary of what the model should do, used for bootstrap (not a duplicate long-term “behavior” essay alongside the prompt—it feeds **generate**, then iteration centers on the **system prompt**).
- Add a **Generate base system prompt** action (new server route) that sends task description + non-empty I/O pairs to the model and **writes the draft into the system prompt** editor (user edits and refines from there).
- **Run all** still executes the current system prompt on each **input**; the UI shows **actual output** alongside **expected output** so feedback compares model behavior to the exemplar.
- **Refine** (`POST /api/refine`) and client payloads include **expected output** per feedback item where present so refinement can align the prompt with exemplars.
- Update **empty-state** copy to describe task + I/O pairs → generate → run → feedback → refine.

## Capabilities

### New Capabilities

<!-- None — behavior extends existing prompt-refiner capability. -->

### Modified Capabilities

- `prompt-refiner`: Workspace moves from “system prompt + test inputs” to “task description + I/O pairs → optional draft generation → system prompt + runs with expected vs actual + existing feedback and refine flow.” Requirements for layout, editor, run display, refine payload, and empty state are updated accordingly.

## Impact

- **Client**: `PromptEditor`, `PromptRefinerApp`, `TestRunner` / run cards, types (`TestInputRow` → pair shape), empty state.
- **Server**: New route e.g. `POST /api/generate-system-prompt` (name TBD in design); `POST /api/refine` meta-prompt and body include optional `expectedOutput` per feedback row; `POST /api/run` unchanged.
- **Model**: Continues `gpt-4o` for new generation route and existing routes.
