## Why

Users need to explain **why** a model output was good or bad so refinement has usable signal. The app already supports a free-text reason after picking 👍/👎, but the flow is easy to miss: the reason field only appears after a thumb is selected, so it can feel like “rating only” with no obvious place to type **why**. This change makes the explanation step explicit and scannable.

## What Changes

- **Run card feedback UI**: Present a single, clearly labeled **Feedback** region on each run (before submit) that includes thumbs, a **required** “Why?” text area, helper copy, and submit—so users always see where to type their rationale.
- **Copy and accessibility**: Visible labels (not placeholder-only), optional hint text, and `aria-*` wiring so screen readers understand the rating + reason relationship.
- **No API or data model changes**: `TestRun.feedback` shape and `/api/refine` payload stay the same; this is UX-only.

## Capabilities

### New Capabilities

- `feedback-reason`: Requirements for how users enter and submit a textual reason alongside good/bad ratings on test runs.

### Modified Capabilities

<!-- No specs promoted under openspec/specs/ yet. -->

## Impact

- **Components**: `RunCard.tsx` (and any small layout tweaks in `TestRunner` / `PromptRefinerApp` if needed).
- **No** changes to `app/api/*`, `lib/types.ts` (unless minor prop types), or refine payload shape.
