## 1. Model Configuration and API Contract

- [ ] 1.1 Define a shared allowlist of supported model identifiers for generation.
- [ ] 1.2 Extend generation/refinement request types to include a required `model` field.
- [ ] 1.3 Add server-side validation that rejects unknown model values with clear error responses.

## 2. UI Model Picker Flow

- [ ] 2.1 Add a model picker control before initial answer generation with a sensible default.
- [ ] 2.2 Persist selected model in page-level state and include it in generate requests.
- [ ] 2.3 Show the active model label in the results area for each generated result set.

## 3. Regeneration with Updated Model

- [ ] 3.1 Allow changing model selection after results are displayed.
- [ ] 3.2 Wire regenerate actions to use the currently selected model instead of stale selection values.
- [ ] 3.3 Ensure regenerated outputs replace/update displayed results and reflect the new active model.

## 4. Verification and Safeguards

- [ ] 4.1 Add/adjust tests for model selection in initial generation and regeneration flows.
- [ ] 4.2 Add/adjust tests for invalid model rejection and user-visible error handling.
- [ ] 4.3 Confirm no LiteLLM or similar model-routing dependency is introduced.
