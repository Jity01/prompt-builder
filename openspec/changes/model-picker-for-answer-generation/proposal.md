## Why

Prompt refinement quality varies by model, and users currently cannot choose which model generates comparison answers. This blocks side-by-side experimentation and makes it harder to compare refinement outcomes across models.

## What Changes

- Add a model picker in the UI before answer generation so users can select which model to use.
- Persist the selected model through answer generation and refinement feedback flows.
- Allow regenerating answers with a newly selected model after results are shown.
- Surface the active model in generated results so comparisons are explicit.
- Keep the implementation on direct provider SDK/API usage and avoid introducing LiteLLM or similar proxy abstractions.

## Capabilities

### New Capabilities
- `model-selection-for-generation`: Allow users to choose an available model for generation and regeneration, and apply that selection to answer/refine requests.

### Modified Capabilities
- None.

## Impact

- Affected areas: generation/refinement UI controls, request payload contracts, and backend API handlers that call model providers.
- APIs: request schema updates to include selected model identifier.
- Dependencies: no new model-routing dependency should be introduced; continue with direct trusted packages and existing provider integrations.
