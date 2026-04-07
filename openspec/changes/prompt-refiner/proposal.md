## Why

Building and tuning LLM system prompts from chat alone is slow and fuzzy. Teams need a tight loop: run a prompt on sample inputs, label outputs good or bad with reasons, and get minimal, targeted prompt edits backed by a visible diff—without standing up auth or a database for an MVP.

## What Changes

- Introduce a **single-page Next.js (App Router)** web app with **Tailwind** styling.
- Add **in-memory client state** (`useState` / `useReducer`) for prompt versions, test runs, and feedback—no persistence for MVP.
- Add **two API routes**: `POST /api/run` (execute system prompt + user input via **OpenAI `gpt-4o`**) and `POST /api/refine` (meta-prompt returns JSON: new prompt, explanation, line-level diff chunks).
- Implement UI: **PromptEditor** (behavior description, system prompt, test inputs, Run All), **TestRunner** / **RunCard** (markdown output, 👍/👎 + reason, colored borders), **DiffViewer** (visual diff + explanation + Apply), **VersionHistory** (chips with aggregate scores, restore).
- Enforce UX rules: disabled Run All when prompt or inputs missing; **Get Suggestion** after ≥1 feedback; empty state with example copy; responsive two-column layout.

## Capabilities

### New Capabilities

- `prompt-refiner`: End-to-end MVP for iterative system-prompt refinement—UI layout, data structures (`PromptVersion`, `TestRun`, `PromptDiff`), `/api/run` and `/api/refine` contracts, feedback-driven refinement flow, and version history with restore.

### Modified Capabilities

<!-- No existing specs in openspec/specs/. -->

## Impact

- **New** Next.js app under the repo root (or `prompt-builder` package): `app/page.tsx`, `app/api/run`, `app/api/refine`, `components/*`.
- **Dependency**: `openai`, `next`, `react`, `tailwindcss`; **env**: `OPENAI_API_KEY`.
- **Out of scope**: auth, DB, multi-model, bulk import, sharing/export, fine-tuning.
