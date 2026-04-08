## ADDED Requirements

### Requirement: Model picker exposes full supported GPT catalog
The system SHALL present all GPT models supported by the application in the model picker prior to generation.

#### Scenario: User opens picker before generation
- **WHEN** a user opens the model picker before running tests
- **THEN** the picker lists every GPT model in the configured supported catalog
- **AND** the default model is one of the listed supported GPT models

### Requirement: Backend accepts any model in the supported GPT catalog
The system SHALL accept any model identifier from the supported GPT catalog across run, refine, and auto-refine APIs.

#### Scenario: Supported model is used in run/refine flows
- **WHEN** a request to run, refine, or auto-refine includes a model identifier from the supported GPT catalog
- **THEN** the API accepts the request and uses that model for the operation

### Requirement: Unsupported model selections are rejected consistently
The system SHALL reject model identifiers that are not in the supported GPT catalog with a consistent validation error.

#### Scenario: Unsupported model identifier submitted
- **WHEN** a request includes a model identifier not present in the supported GPT catalog
- **THEN** the API returns a validation error
- **AND** the client can present a clear actionable message without crashing

### Requirement: Model catalog source remains shared between UI and API
The system SHALL derive picker options and server validation from the same shared model catalog source.

#### Scenario: Catalog update propagates to UI and API
- **WHEN** the shared model catalog is updated
- **THEN** the picker options reflect the update
- **AND** API validation accepts/rejects models according to the same updated catalog
