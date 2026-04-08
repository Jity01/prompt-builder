## Why

The model picker currently exposes only a small hardcoded subset of GPT models, which limits comparison workflows and makes it harder to test prompt quality across current GPT families. Exposing all supported GPT models improves experimentation speed and gives users finer control over cost/quality tradeoffs.

## What Changes

- Expand model picker options from a short static list to the full supported GPT model catalog used by the app.
- Keep server-side model validation aligned with the same source of truth used by the UI model picker.
- Ensure generation, auto-refine, and manual refine all accept any GPT model in the supported catalog.
- Add safeguards for deprecated/unavailable models so invalid selections fail with clear errors.

## Capabilities

### New Capabilities
- `full-gpt-model-catalog-selection`: Allow users to select from the complete supported GPT model catalog in generation/refinement workflows.

### Modified Capabilities
- None.

## Impact

- Affected code: shared model configuration, model picker UI, and API validation paths for run/refine/auto-refine.
- API behavior: broader accepted `model` values, still constrained to validated supported GPT models.
- Dependencies: no new routing/proxy packages; continue direct provider integration only.
