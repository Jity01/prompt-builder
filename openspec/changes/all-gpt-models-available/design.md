## Context

The recently added model picker validates and offers only a small curated GPT subset. Users want full GPT model coverage to compare behavior, speed, and cost across the entire GPT catalog available to this app. Because model selection is enforced both in the UI and API routes, broadening support is a cross-cutting change that must keep a single source of truth and preserve strict validation.

## Goals / Non-Goals

**Goals:**
- Expose all supported GPT models in the picker without per-route hardcoding.
- Keep model selection validation strict and shared across server routes.
- Ensure run, refine, and auto-refine flows all accept and use any supported GPT model.
- Support future model-list updates with minimal code touchpoints.

**Non-Goals:**
- Supporting non-GPT providers or multi-provider routing.
- Building dynamic server-side model discovery from external APIs in this change.
- Relaxing validation to permit arbitrary user-provided model IDs.

## Decisions

- **Central model catalog remains shared config, expanded to full GPT set.**  
  Keep one allowlist module and expand it to the complete GPT set intended for this app version.  
  *Why:* avoids UI/API drift and supports consistent validation.  
  *Alternative considered:* route-specific allowlists; rejected due to maintenance risk.

- **Model picker renders from shared catalog order.**  
  UI options come directly from shared config, preserving deterministic ordering and clear defaults.  
  *Why:* users should see the same supported set accepted by the backend.  
  *Alternative considered:* duplicate UI options; rejected due to mismatch risk.

- **Validation errors stay explicit for unsupported/deprecated models.**  
  API responses continue rejecting unknown models with actionable messages.  
  *Why:* prevents silent fallbacks and improves troubleshooting when model availability changes.

- **No dependency expansion for model routing.**  
  Continue direct OpenAI SDK usage and avoid LiteLLM or similar proxy libraries.  
  *Why:* aligns with security constraints and keeps dependency risk low.

## Risks / Trade-offs

- **[Risk] Long model lists reduce picker usability** -> Mitigation: preserve ordering and optionally group/sort logically in UI copy.
- **[Risk] Catalog staleness as providers evolve** -> Mitigation: keep single config module and document update path.
- **[Risk] Some models may fail in specific endpoints/settings** -> Mitigation: retain strict error handling and surface per-request failures clearly.
- **[Trade-off] Larger allowlist increases update overhead** -> Accepted because broader model comparison is the core requested value.
