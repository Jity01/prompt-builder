## 1. Data model and API contracts

- [x] 1.1 Add types for auto-critic outputs: per-run score, mismatch reasons, improvement hints, aggregate score, and iteration metadata.
- [x] 1.2 Define phase state model (`auto_critic`, `manual_refine`, `idle`, `running`, `stopped`) and wire it into app state.
- [x] 1.3 Extend refine feedback contracts so both human and AI-generated feedback items are accepted without breaking existing manual flow.

## 2. Server endpoints and orchestration

- [x] 2.1 Implement an evaluation endpoint that compares actual vs expected outputs and returns structured per-run/aggregate scoring plus rationale.
- [x] 2.2 Implement auto-refine orchestration endpoint to iterate evaluate -> refine until threshold met, max iterations reached, or cancelled.
- [x] 2.3 Add request validation and guardrails for threshold bounds, max-iteration limits, and required example/run prerequisites.
- [x] 2.4 Add consistent error responses and cancellation-safe behavior so partial iteration results can still be surfaced.

## 3. UI controls and progress visibility

- [x] 3.1 Add auto-refine control panel with threshold and max-iteration inputs plus Start/Stop actions.
- [x] 3.2 Show automation progress (current iteration, latest aggregate score, score trend, and last critique summary).
- [x] 3.3 Display per-run AI mismatch feedback next to expected/model outputs during auto mode.
- [x] 3.4 Disable/enable controls correctly based on phase and running state; preserve manual controls for post-handoff refinement.

## 4. Handoff and versioning behavior

- [x] 4.1 Implement handoff logic that switches to manual-refine mode when threshold is met or when user explicitly stops automation.
- [x] 4.2 Ensure prompt version history records auto-generated prompt revisions and remains restorable.
- [x] 4.3 Keep existing manual feedback UX unchanged after handoff (thumbs/reason and suggestion flow).

## 5. Quality checks

- [x] 5.1 Add/update tests for evaluate/refine loop stop conditions (threshold hit, max iterations, cancel).
- [x] 5.2 Add/update tests for phase transitions and API contract compatibility between auto and manual paths.
- [x] 5.3 Run lint/build and perform a manual pass on the full flow: generate prompt -> auto-refine bootstrap -> manual refinement.
