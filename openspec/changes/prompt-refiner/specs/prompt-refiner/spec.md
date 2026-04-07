## ADDED Requirements

### Requirement: Single-page responsive workspace

The system SHALL present a single main view with a two-column layout on desktop and stacked sections on small viewports: left panel for behavior description, system prompt, test inputs, run action, and version history; right panel for test run results, refinement suggestion, and apply actions.

#### Scenario: Desktop layout

- **WHEN** the viewport is at least the `lg` breakpoint
- **THEN** the left and right panels appear side-by-side as specified in the product layout

#### Scenario: Mobile layout

- **WHEN** the viewport is below the `lg` breakpoint
- **THEN** the primary sections stack vertically without horizontal scrolling for default content

### Requirement: Prompt editing and test inputs

The system SHALL provide a text area for a plain-English behavior description, a text area for the active system prompt, a dynamic list of user-defined test input strings, controls to add a blank input row, and a primary control to run all non-empty inputs against the current system prompt.

#### Scenario: Run All disabled without prerequisites

- **WHEN** the system prompt is empty or every test input is empty
- **THEN** the Run All control is disabled

#### Scenario: Add input

- **WHEN** the user activates Add input
- **THEN** a new empty test input field is available in the list

### Requirement: Execute runs via API

The system SHALL call `POST /api/run` once per test input with the current system prompt and that input, and SHALL display each returned assistant message as the output for that run.

#### Scenario: Successful run

- **WHEN** Run All is activated with valid prompt and inputs and the API returns 200 with `{ output }`
- **THEN** each run card shows the corresponding input and rendered model output

### Requirement: Feedback capture on runs

The system SHALL allow the user to rate each run with good or bad, capture a free-text reason for that rating, and SHALL visually distinguish submitted feedback with green (good) or red (bad) card styling.

#### Scenario: Submit good feedback

- **WHEN** the user selects good, enters a reason, and submits
- **THEN** the run is marked with good feedback and the card border reflects the positive state

#### Scenario: Submit bad feedback

- **WHEN** the user selects bad, enters a reason, and submits
- **THEN** the run is marked with bad feedback and the card border reflects the negative state

### Requirement: Refine suggestion via API

The system SHALL expose a Get Suggestion control when at least one run has submitted feedback, and SHALL call `POST /api/refine` with behavior description, current prompt, and the list of feedback items, and SHALL render explanation plus line-level diff chunks from the response.

#### Scenario: Suggestion gated on feedback

- **WHEN** no run has submitted feedback
- **THEN** Get Suggestion is not available

#### Scenario: Parse refine response

- **WHEN** the refine API returns valid JSON with `newPrompt`, `explanation`, and `diffs`
- **THEN** the UI shows the explanation and a visual diff with added, removed, and unchanged segments as provided

### Requirement: Apply refined prompt and version history

The system SHALL allow applying a refined prompt from the diff viewer, replacing the active system prompt with `newPrompt`, preserving the previous prompt in an ordered version history, and SHALL show selectable version chips labeled v1, v2, … with aggregate good/bad counts per version.

#### Scenario: Apply diff

- **WHEN** the user applies a refined prompt
- **THEN** the active prompt updates, the prior prompt is retained in history, and a new version chip reflects the updated totals as runs accrue

#### Scenario: Restore version

- **WHEN** the user selects a version chip
- **THEN** that version’s prompt loads into the system prompt editor

### Requirement: Empty state

The system SHALL show a concise empty-state message with example behavior, prompt, and input text to guide first-time use.

#### Scenario: Initial load

- **WHEN** the user opens the app with no meaningful content yet
- **THEN** placeholder guidance is visible per the empty-state requirement

### Requirement: Server environment for OpenAI

The system SHALL read `OPENAI_API_KEY` in server-side route handlers only and SHALL use model `gpt-4o` for both run and refine calls as specified.

#### Scenario: Missing API key

- **WHEN** a route handler runs without a configured API key
- **THEN** the handler returns an error response without leaking secret material
