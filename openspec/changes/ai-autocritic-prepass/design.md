## Context

The current flow already supports task description + input/output examples, run outputs, and refine suggestions. The user request is to add an AI-led bootstrap loop that does the heavy early lifting: compare actual outputs against expected outputs, identify where the model is off, and iterate until quality is close enough before handing control to human taste-based feedback.

## Goals / Non-Goals

**Goals:**

- Introduce a phased refinement loop: `auto_critic` then `human_refine`.
- Define a measurable stopping condition (similarity threshold + max iterations).
- Keep human feedback flow unchanged once auto phase is complete.
- Expose transparent progress (iteration count, score trend, latest critique summary).
- Provide user control to start, pause/cancel, and resume manual mode at any time.

**Non-Goals:**

- No persistent job queue or background worker for MVP.
- No model-level fine-tuning; only prompt updates.
- No universal semantic metric; keep a practical rubric score over expected vs actual outputs.

## Decisions

1. **Two-step AI orchestration**
   - **Choice**: Implement explicit server steps: `evaluate` (score + mismatches) and `refine` (prompt update from mismatches), orchestrated by a loop endpoint.
   - **Why**: Better debuggability and UI visibility than one opaque "improve everything" call.
   - **Alternative**: Single call that refines and returns score; rejected due to poor traceability.

2. **Similarity metric for handoff**
   - **Choice**: Use a bounded 0-1 score per run plus aggregate mean; handoff when mean >= configurable threshold (default e.g. 0.8).
   - **Why**: Simple and interpretable.
   - **Alternative**: Token overlap/embedding metric only; rejected for weak alignment with task-specific quality.

3. **Safety limits**
   - **Choice**: Require max iteration cap (default e.g. 5), plus cancel action.
   - **Why**: Controls cost and prevents runaway loops.

4. **Handoff behavior**
   - **Choice**: On threshold hit or max-iteration stop, keep the latest prompt in editor and enable manual feedback controls as normal.
   - **Why**: Preserves existing UX and user agency.

## Risks / Trade-offs

- **[Risk] Critic hallucination / brittle scoring** → **Mitigation**: structured evaluator schema with explicit rubric and evidence snippets tied to input/output rows.
- **[Risk] Cost/latency increase** → **Mitigation**: iteration cap, explicit start action, optional smaller evaluator model if needed later.
- **[Trade-off] Automation vs control** → **Mitigation**: user can stop auto mode at any time and switch to manual mode.

## Migration Plan

- Add endpoints and UI controls behind the same main screen (no schema/data migration).
- Default to manual mode for existing sessions unless user starts auto loop.
- Rollback by removing auto controls and routes; manual flow remains intact.

## Open Questions

- Should threshold be global app setting or per session control?
- Should failed runs be weighted more heavily than near-miss runs in aggregate score?
- Do we store full iteration history in UI or only latest + trend summary for MVP?
