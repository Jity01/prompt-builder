## ADDED Requirements

### Requirement: Generate draft system prompt from task and examples

The system SHALL provide a dedicated control to request a draft system prompt from the server using a task description (what the model should do) and the current non-empty input/output example pairs. The system SHALL write the returned draft into the active system prompt editor when the response succeeds.

#### Scenario: Generate disabled without prerequisites

- **WHEN** the task description is empty or there is no complete example pair with both input and expected output filled
- **THEN** the generate-draft control is disabled

#### Scenario: Successful generation

- **WHEN** the user activates generate with valid prerequisites and the server returns a draft system prompt
- **THEN** the system prompt editor shows the draft text returned by the server

### Requirement: Bootstrap generation API

The system SHALL expose an HTTP API route that accepts a task description and a list of example pairs (input and expected output strings) and returns a generated system prompt string suitable for use as the initial draft. The system SHALL use the same server-side model as other LLM routes (`gpt-4o`) and SHALL read `OPENAI_API_KEY` only on the server.

#### Scenario: Missing API key on generate

- **WHEN** the generate route runs without a configured API key
- **THEN** the handler returns an error response without leaking secret material

## MODIFIED Requirements

### Requirement: Single-page responsive workspace

The system SHALL present a single main view with a two-column layout on desktop and stacked sections on small viewports: left panel for task description (what the model should do), input/output example rows, controls to generate a draft system prompt, the active system prompt, run action, and version history; right panel for test run results, refinement suggestion, and apply actions.

#### Scenario: Desktop layout

- **WHEN** the viewport is at least the `lg` breakpoint
- **THEN** the left and right panels appear side-by-side as specified in the product layout

#### Scenario: Mobile layout

- **WHEN** the viewport is below the `lg` breakpoint
- **THEN** the primary sections stack vertically without horizontal scrolling for default content

### Requirement: Prompt editing and test inputs

The system SHALL provide a text area for a short task description, a text area for the active system prompt, a dynamic list of user-defined rows each containing a user input string and an expected output string for that input, controls to add a blank row, a primary control to run all non-empty inputs against the current system prompt, and a primary control to generate a draft system prompt from the task description and complete example pairs as specified elsewhere.

#### Scenario: Run All disabled without prerequisites

- **WHEN** the system prompt is empty or every test input is empty
- **THEN** the Run All control is disabled

#### Scenario: Add input row

- **WHEN** the user activates add row for examples
- **THEN** a new empty input/output pair row is available in the list

### Requirement: Execute runs via API

The system SHALL call `POST /api/run` once per test input with the current system prompt and that input, SHALL display each returned assistant message as the actual output for that run, and SHALL display the user-provided expected output for that row alongside the actual output in the run UI.

#### Scenario: Successful run

- **WHEN** Run All is activated with valid prompt and inputs and the API returns 200 with `{ output }`
- **THEN** each run card shows the corresponding input, the rendered model output, and the expected output for that row when provided

### Requirement: Refine suggestion via API

The system SHALL expose a Get Suggestion control when at least one run has submitted feedback, and SHALL call `POST /api/refine` with the current prompt and the list of feedback items. Each feedback item SHALL include input, actual output, optional expected output for that row, rating, and reason. The system SHALL render explanation plus line-level diff chunks from the response.

#### Scenario: Suggestion gated on feedback

- **WHEN** no run has submitted feedback
- **THEN** Get Suggestion is not available

#### Scenario: Parse refine response

- **WHEN** the refine API returns valid JSON with `newPrompt`, `explanation`, and `diffs`
- **THEN** the UI shows the explanation and a visual diff with added, removed, and unchanged segments as provided

### Requirement: Empty state

The system SHALL show a concise empty-state message with example task description, example input/output pair, and pointers to generate a draft then run and refine.

#### Scenario: Initial load

- **WHEN** the user opens the app with no meaningful content yet
- **THEN** placeholder guidance is visible per the empty-state requirement

### Requirement: Server environment for OpenAI

The system SHALL read `OPENAI_API_KEY` in server-side route handlers only and SHALL use model `gpt-4o` for run, refine, and draft-generation calls as specified.

#### Scenario: Missing API key

- **WHEN** a route handler runs without a configured API key
- **THEN** the handler returns an error response without leaking secret material
