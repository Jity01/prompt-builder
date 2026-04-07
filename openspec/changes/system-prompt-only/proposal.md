## Why

The **behavior description** field duplicates intent that users already express in the **system prompt** (the artifact we refine). Maintaining two text areas adds noise and splits attention; the primary loop is: edit system prompt → run tests → give feedback → refine. Dropping the separate behavior field keeps the UI focused on the prompt under iteration.

## What Changes

- **Remove** the behavior description textarea from the left panel and all related React state.
- **Update** `POST /api/refine` request body and meta-prompt: stop requiring or mentioning `behaviorDescription`; refinement uses **`currentPrompt`** plus **feedback** only (the model infers goals from the prompt text and labeled examples).
- **Adjust** empty-state / example copy so it references **system prompt + sample input** only (no “behavior” example block).
- **Update** `PromptRefinerApp` / `PromptEditor` props accordingly.

## Capabilities

### New Capabilities

<!-- None. -->

### Modified Capabilities

- `prompt-refiner`: Editor and refine flow no longer include a separate behavior-description field; requirements for layout, prompt editing, refine API contract, and empty state are updated accordingly.

## Impact

- **Client**: `components/PromptEditor.tsx`, `components/PromptRefinerApp.tsx`
- **Server**: `app/api/refine/route.ts`
- **Types**: Remove any `behaviorDescription` from client-side refine payloads (no new types if inline only)
- **Specs**: Delta under this change for `prompt-refiner` capability
