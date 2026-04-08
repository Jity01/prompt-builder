## MODIFIED Requirements

### Requirement: Single-page responsive workspace

The system SHALL preserve the existing two-column prompt-refiner layout and SHALL add an auto-refine phase control area that lets users configure threshold and iteration limits, start/stop automation, and view automation status without leaving the page.

#### Scenario: Auto controls visible

- **WHEN** the user has provided valid input/output pairs and generated or entered a system prompt
- **THEN** auto-refine controls are available in the workspace

### Requirement: Prompt editing and test inputs

The system SHALL keep task description, input/output pair editing, and run controls, and SHALL allow users to proceed directly to manual refinement or to start auto-refine first.

#### Scenario: Skip auto mode

- **WHEN** the user chooses not to start auto-refine
- **THEN** the manual run-feedback-refine flow behaves as before

### Requirement: Apply refined prompt and version history

The system SHALL retain prompt version history across both auto-generated and manually-generated prompt updates so users can restore prior versions regardless of which phase produced them.

#### Scenario: Restore pre-auto version

- **WHEN** the user restores a prompt version created before auto-refine iterations
- **THEN** that prompt is loaded into the editor and can be used for new runs or refinement
