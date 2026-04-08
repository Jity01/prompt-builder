## Context

The app today stores **test inputs** only, runs `POST /api/run` per input, and refines with feedback `{ input, output, rating, reason }`. The product goal is a **bootstrap phase**: user supplies **task description** + **input/expected-output pairs**, gets a **draft system prompt**, then uses the **existing** run/refine/version loop. The prior **behavior description** textarea was removed in favor of focusing on the system prompt; the new **task description** is scoped to **one-shot generation**, not parallel long-form intent next to the prompt.

## Goals / Non-Goals

**Goals:**

- Data model: each row is `{ id, input, expectedOutput }` (both user-editable text).
- UI: task description field; pair list with labels Input / Expected output; **Generate base system prompt** button with clear prerequisites.
- New API: accepts `taskDescription` + `examples: { input, expectedOutput }[]`, returns `{ systemPrompt: string }` (or equivalent); server uses structured JSON from the model.
- Runs: unchanged contract for `/api/run`; UI shows **expected** next to **actual** for each row.
- Refine: extend feedback items with optional `expectedOutput`; update meta-prompt so the refiner can use exemplar outputs.

**Non-Goals:**

- No persistence beyond current in-memory MVP.
- No automatic diff between expected and actual strings (beyond displaying both); user judgment + feedback drives refine.
- No multi-model or few-shot “inject examples into chat” for `/api/run` unless explicitly added later.

## Decisions

1. **Single generation route**  
   **Choice**: `POST /api/generate-system-prompt` (or `/api/bootstrap-prompt`) dedicated to draft creation.  
   **Rationale**: Keeps `POST /api/refine` focused on iterative edits; generation uses different instructions and inputs (task + pairs, no feedback array).  
   **Alternative considered**: One `/api/llm` with `mode` — rejected to keep handlers simple and logs clear.

2. **When Generate is enabled**  
   **Choice**: Require non-empty `taskDescription.trim()` and at least one pair with both `input` and `expectedOutput` non-empty (or at least one complete pair—exact rule can match disabled styling to Run all patterns).  
   **Rationale**: Avoid low-quality drafts from empty fields.

3. **Generate overwrites vs append**  
   **Choice**: **Replace** the system prompt textarea with the returned draft; user can undo via version history only if we snapshot before generate—or **no** auto-snapshot unless we add “previous prompt” on generate.  
   **Rationale**: Simplest UX. Optional follow-up: push current prompt to history before replace (open question).

4. **Refine payload**  
   **Choice**: Add optional `expectedOutput: string` on each feedback object; omit or empty when not applicable.  
   **Rationale**: Backward-compatible if any client sends old shape; server normalizes.

5. **Run All gating**  
   **Choice**: Unchanged: need non-empty system prompt and at least one non-empty **input**; expected output is not required to run (user may run before filling exemplars).

## Risks / Trade-offs

- **[Risk] Draft quality varies** with few or vague pairs → **Mitigation**: Empty state and placeholders stress adding multiple diverse pairs; user edits prompt before Run.
- **[Risk] Large pair lists** → **Mitigation**: Same textarea patterns as today; no new pagination in MVP.
- **[Trade-off] Task description vs system prompt** → User could duplicate content; copy should clarify task is **only** for the Generate step.

## Migration Plan

- Ship UI + APIs together in one change; no DB migration.
- Rollback: revert components and routes; types revert to input-only rows.

## Open Questions

- Should **Generate** save the current system prompt into **version history** before replacing? (Recommended for safety; can be a small follow-up task.)
- Exact **button label**: “Generate base system prompt” vs “Draft system prompt from examples”.
