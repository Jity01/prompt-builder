## Context

The Prompt Refiner editor (`PromptEditor`) renders each test input as a single-line `<input type="text">`. The app stores `testInputs` as `string[]` in `PromptRefinerApp` and runs one API call per non-empty trimmed string. Users want to paste or type longer content and to remove individual rows without manually clearing text.

## Goals / Non-Goals

**Goals:**

- Use a `<textarea>` per test input with styling consistent with the system prompt field (borders, focus ring, monospace optional—match existing test input styling).
- Allow vertical resizing via CSS `resize-y` and a sensible default `rows` (e.g. 2–3) so short inputs stay compact while long content can grow.
- Provide a clear **remove** affordance (icon or “×” button) on each row when **more than one** row exists; removing splices that index from `testInputs`.
- Keep **at least one** row at all times (initial state remains `[""]`).

**Non-Goals:**

- Horizontal-only resize, auto-grow without user resize, or a separate “expand” modal.
- Drag-and-drop reordering of test inputs.
- Changing run/refine API contracts or how inputs are trimmed for “Run all”.

## Decisions

1. **Textarea vs. contenteditable** — Use native `<textarea>` for accessibility, predictable newline handling, and alignment with the system prompt control. **Alternative:** `contenteditable` divs (rejected: more edge cases).

2. **Resize behavior** — Use `resize-y` and `min-h` so users can drag to enlarge; avoid forcing a huge default height. **Alternative:** `rows={6}` fixed (rejected: wastes space for short inputs).

3. **Remove when only one row** — Hide or disable the remove control when `testInputs.length === 1` so the list never becomes empty. **Alternative:** Allow zero rows (rejected: breaks “Add input” mental model and empty-state gating).

4. **List keys** — Prefer stable `id` per row in state (e.g. `{ id: string; value: string }[]`) if React reconciliation issues appear when using `key={index}` after removals; otherwise minimal change with index keys is acceptable for small lists. **Recommendation:** introduce `id` per row when implementing remove to avoid subtle bugs.

5. **Trimming** — Keep existing behavior: `trim()` on run; newlines inside non-empty strings remain part of the value until the whole string trims to empty.

## Risks / Trade-offs

- **Large pasted inputs** → Slightly heavier DOM; acceptable for typical prompt-builder use. Mitigation: no change to API batching.
- **Migration of state shape** → If moving to `{ id, value }`, touch all `testInputs` consumers (`handleRunAll`, etc.). Mitigation: single refactor in `PromptRefinerApp` and props.

## Migration Plan

Not applicable (client-only UI change; no data migration).

## Open Questions

- None; if product later wants **clear** on the last row (empty string only), that can be a small follow-up.
