## MODIFIED Requirements

### Requirement: Single-page responsive workspace

The system SHALL present a single main view with a two-column layout on desktop and stacked sections on small viewports: left panel for the system prompt, test inputs, run action, and version history; right panel for test run results, refinement suggestion, and apply actions.

#### Scenario: Desktop layout

- **WHEN** the viewport is at least the `lg` breakpoint
- **THEN** the left and right panels appear side-by-side as specified in the product layout

#### Scenario: Mobile layout

- **WHEN** the viewport is below the `lg` breakpoint
- **THEN** the primary sections stack vertically without horizontal scrolling for default content

### Requirement: Prompt editing and test inputs

The system SHALL provide a text area for the active system prompt, a dynamic list of user-defined test input strings, controls to add a blank input row, and a primary control to run all non-empty inputs against the current system prompt.

#### Scenario: Run All disabled without prerequisites

- **WHEN** the system prompt is empty or every test input is empty
- **THEN** the Run All control is disabled

#### Scenario: Add input

- **WHEN** the user activates Add input
- **THEN** a new empty test input field is available in the list

### Requirement: Refine suggestion via API

The system SHALL expose a Get Suggestion control when at least one run has submitted feedback, and SHALL call `POST /api/refine` with the current prompt and the list of feedback items (no separate behavior-description field), and SHALL render explanation plus line-level diff chunks from the response.

#### Scenario: Suggestion gated on feedback

- **WHEN** no run has submitted feedback
- **THEN** Get Suggestion is not available

#### Scenario: Parse refine response

- **WHEN** the refine API returns valid JSON with `newPrompt`, `explanation`, and `diffs`
- **THEN** the UI shows the explanation and a visual diff with added, removed, and unchanged segments as provided

### Requirement: Empty state

The system SHALL show a concise empty-state message with example system prompt and input text to guide first-time use (no separate behavior-description field).

#### Scenario: Initial load

- **WHEN** the user opens the app with no meaningful content yet
- **THEN** placeholder guidance is visible per the empty-state requirement
