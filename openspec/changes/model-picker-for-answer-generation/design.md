## Context

The prompt refiner currently generates outputs with a fixed model path, which prevents users from comparing model behavior during generation and refinement. The requested workflow requires model choice both before the first generation and after results are visible so users can quickly rerun the same prompt across models. Security constraints also require avoiding untrusted model routing packages such as LiteLLM.

## Goals / Non-Goals

**Goals:**
- Add a model selection control in the generation flow and apply the selected model to API requests.
- Support regeneration with a newly selected model after initial outputs are displayed.
- Keep model invocation architecture explicit and direct, using trusted provider SDK/API integrations already used by the app.
- Make selected model state visible in UI output context to support comparison.

**Non-Goals:**
- Building automated quality scoring across models.
- Introducing multi-provider orchestration frameworks or dependency-heavy proxy layers.
- Persisting model preference across users/accounts beyond the current session unless already supported.

## Decisions

- **Single source of truth for selected model in client state.**  
  Maintain selected model in top-level page state that drives generate and regenerate actions.  
  *Why:* avoids mismatches between initial and regenerate requests.  
  *Alternative considered:* separate state per response card; rejected because it increases UI complexity and inconsistent comparisons.

- **Include model identifier in backend request schema.**  
  Extend generation/refinement request payloads with a validated `model` field.  
  *Why:* backend should not infer model from UI defaults once user has made a choice.  
  *Alternative considered:* store model only server-side via session; rejected as unnecessary coupling for this feature.

- **Server-side allowlist validation for selectable models.**  
  Keep a curated list of supported model IDs and reject unknown values.  
  *Why:* prevents arbitrary model injection, keeps behavior predictable.  
  *Alternative considered:* pass-through arbitrary strings; rejected for security and reliability risk.

- **Direct provider integration only.**  
  Continue calling providers through existing trusted client code, with no LiteLLM-style abstraction introduced.  
  *Why:* aligns with supply-chain risk constraints and keeps dependency surface minimal.

## Risks / Trade-offs

- **[Risk] UI and backend model lists diverge** -> Mitigation: centralize model constants in shared config and validate on server.
- **[Risk] Regeneration changes latency/cost unpredictably across models** -> Mitigation: show active model clearly and keep user-driven regeneration explicit.
- **[Risk] Some selected models may not support current prompt/response settings** -> Mitigation: guard with compatibility metadata and clear error messages.
- **[Trade-off] Added UI control increases surface area** -> Accepted because comparison value is the core user need.
