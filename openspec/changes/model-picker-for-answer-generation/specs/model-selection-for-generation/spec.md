## ADDED Requirements

### Requirement: User can select a model before generation
The system SHALL provide a model picker before answer generation and SHALL use the selected model for all generated answers in that run.

#### Scenario: Generate with selected model
- **WHEN** a user selects a model and starts generation
- **THEN** the generation request includes that model identifier
- **AND** generated answers are produced using the selected model

### Requirement: User can regenerate with a new model after results
The system SHALL allow users to change the selected model after answers are shown and SHALL regenerate answers using the newly selected model.

#### Scenario: Regenerate with changed model
- **WHEN** results are already displayed and the user selects a different model then triggers regeneration
- **THEN** a new generation request uses the updated model identifier
- **AND** refreshed answers correspond to the updated model selection

### Requirement: System validates model selections
The system SHALL accept only configured model identifiers and SHALL reject unsupported model values with a user-visible error.

#### Scenario: Unsupported model is rejected
- **WHEN** a request includes a model identifier that is not in the allowlist
- **THEN** the API responds with a validation error
- **AND** the UI shows an actionable error message without crashing

### Requirement: Active model is visible in generated results context
The system SHALL display the active model used for the current generated result set.

#### Scenario: Display active model label
- **WHEN** results are rendered after generation or regeneration
- **THEN** the UI shows the model identifier associated with that result set
