## Why

When prompts start far from target behavior, manual thumbs/reason feedback is too slow and too high-effort for the first few iterations. An AI prepass that compares actual vs ideal outputs can rapidly identify major failure patterns and drive larger early corrections before the user switches to taste-level refinement.

## What Changes

- Add an **auto-critic phase** that evaluates each run by comparing model output to expected output and returns structured mismatch feedback.
- Add an **auto-refine loop** that can apply repeated refinement passes from AI-generated feedback until a similarity threshold is reached or a max-iteration limit is hit.
- Add a **phase handoff**: once threshold is met, transition to the existing human feedback flow (thumbs + reason + Get suggestion).
- Add UI controls for starting/stopping auto-refine, showing current iteration, score/progress, and why each mismatch was flagged.
- Add server support for scoring/comparison and orchestration across evaluate/refine steps.

## Capabilities

### New Capabilities

- `auto-critic-refinement`: AI-driven bootstrap loop that compares actual outputs against expected outputs, produces actionable feedback, and iteratively updates the system prompt until quality is “roughly similar” by threshold.

### Modified Capabilities

- `prompt-refiner`: Existing manual feedback flow gains phased behavior: auto-critic bootstrap first, then user-led refinement after handoff criteria are met.

## Impact

- **Client**: `PromptRefinerApp`, run/result UI, control panel for threshold + max iterations, status/progress components.
- **Server**: New evaluation endpoint (or route mode) and loop orchestration endpoint; update refine contracts to accept AI-generated feedback shape.
- **Types**: Add score/mismatch/iteration models and phase state.
- **Operational**: More LLM calls per session (evaluation + repeated refinement), requiring clear limits and cancellation behavior.
