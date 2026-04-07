## Context

`RunCard` currently shows 👍/👎 first; after a click, a textarea and “Submit feedback” appear. Reasons are required (`disabled` until non-empty). The gap is **discoverability**: users who do not click a thumb never see a reason field.

## Goals / Non-Goals

**Goals:**

- Always show the **same** feedback block (rating + reason + submit) whenever feedback is not yet submitted, so “why” is visibly on the page.
- Keep **one** submit action that requires both a selected rating and non-empty reason (preserve quality of refinement signal).
- Improve labeling and assistive names for thumbs and the reason field.

**Non-Goals:**

- Optional reasons, editing reasons after submit, or API/schema changes.

## Decisions

1. **Layout**: Replace the two-step reveal with a **stacked block** under the output: heading “Feedback”, short helper line, row of two toggle buttons (Good / Bad) with `aria-pressed`, labeled multiline “Why was this output good or bad?” (required), then “Submit feedback”.
2. **State**: Continue using local `useState` for `pendingRating` and `reason` until submit; no change to parent `TestRun` shape.
3. **Styling**: Use distinct selected styles for Good vs Bad; keep green/red borders after submit as today.

## Risks / Trade-offs

- Slightly taller cards → **Mitigation**: keep textarea rows modest (2–3), tight spacing.

## Migration Plan

N/A (client-only UI change).

## Open Questions

None.
