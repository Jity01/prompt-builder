## 1. Expand Shared GPT Model Catalog

- [x] 1.1 Audit current model allowlist and enumerate all GPT models the app should support.
- [x] 1.2 Update the shared model configuration to include the full supported GPT catalog.
- [x] 1.3 Keep a single default model and ensure it remains present in the expanded catalog.

## 2. Keep UI and API in Sync

- [x] 2.1 Ensure model picker options are rendered from the shared catalog without duplicated lists.
- [x] 2.2 Verify run, refine, and auto-refine request payloads continue carrying the selected model unchanged.
- [x] 2.3 Ensure server validation paths use the same shared catalog for acceptance/rejection.

## 3. Validation and Error Handling

- [x] 3.1 Preserve consistent API validation errors for unsupported model identifiers.
- [x] 3.2 Add/adjust tests for supported-model acceptance and unsupported-model rejection.
- [x] 3.3 Add/adjust tests or checks to ensure default model remains valid after catalog updates.

## 4. Regression and Safety Checks

- [x] 4.1 Verify model picker usability with the expanded catalog (ordering/readability).
- [x] 4.2 Run lint/tests and confirm generation/refinement flows still function with multiple GPT variants.
- [x] 4.3 Confirm no LiteLLM or similar model-routing dependency is introduced.
