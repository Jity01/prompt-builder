## Context

`PromptRefinerApp` holds `behaviorDescription` state, passes it to `PromptEditor` and to `fetch("/api/refine", { body: { behaviorDescription, currentPrompt, feedback } })`. The refine route’s system message tells the model to expect `behaviorDescription` in the JSON user payload.

## Goals / Non-Goals

**Goals:**

- Single source of truth for “what we want” at the UI level: the **system prompt** textarea.
- Smaller refine payload: `{ currentPrompt, feedback }` (plus unchanged server-side model/JSON schema expectations).
- Meta-prompt text that instructs the model to improve the system prompt using **current prompt + per-run feedback** only.

**Non-Goals:**

- Persisting or migrating old “behavior” text (MVP is in-memory; no migration).
- Changing `/api/run` or `TestRun` / feedback shapes.

## Decisions

1. **API**: Remove `behaviorDescription` from the refine `POST` body; validate `currentPrompt` and `feedback` as today.
2. **Meta-prompt**: Replace “Behavior goal: …” with instructions that the user’s **intent is expressed in `currentPrompt`** and that test feedback shows where the prompt fails or succeeds.
3. **Empty state**: `fillExample()` sets only **system prompt** and **test input** strings; remove `EXAMPLE_BEHAVIOR` and the “Example behavior” line from the empty-state card.
4. **`showEmptyHint`**: Derive from absence of system prompt, empty inputs, and no runs—**no** `behaviorDescription` in the condition.

## Risks / Trade-offs

- Users who liked splitting “goal” vs “prompt” lose that separation → **Mitigation**: they can prepend a short “Goal:” section inside the system prompt if desired.

## Migration Plan

Deploy client + API together; old clients sending `behaviorDescription` are harmless if the server ignores the field (optional: explicitly strip). Prefer **removing** the field from client entirely.

## Open Questions

None.
