## MODIFIED Requirements

### Requirement: Prompt editing and test inputs

The system SHALL provide a text area for the active system prompt, a dynamic list of user-defined test input strings with each entry edited in a multi-line text area that supports vertical resizing, controls to add a blank input row, a per-row control to remove a test input row when more than one row exists, and a primary control to run all non-empty inputs against the current system prompt.

#### Scenario: Run All disabled without prerequisites

- **WHEN** the system prompt is empty or every test input is empty
- **THEN** the Run All control is disabled

#### Scenario: Add input

- **WHEN** the user activates Add input
- **THEN** a new empty test input field is available in the list

#### Scenario: Multi-line test input

- **WHEN** the user enters text that includes line breaks in a test input text area
- **THEN** that full string is preserved and used as the test input for the corresponding run

#### Scenario: Remove extra input row

- **WHEN** more than one test input row exists and the user activates remove on a row
- **THEN** that row is removed and the remaining rows stay in order

#### Scenario: Minimum one input row

- **WHEN** only one test input row exists
- **THEN** the remove control for that row is not available or is disabled so the list always has at least one row
