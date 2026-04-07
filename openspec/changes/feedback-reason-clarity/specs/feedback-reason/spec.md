## ADDED Requirements

### Requirement: Visible feedback section with reason input

The system SHALL show a dedicated **Feedback** section on each test run card whenever feedback has not yet been submitted, including a visible section title, short helper text that states a written reason is required for refinement, and a multiline text control for the user to explain why the output was good or bad.

#### Scenario: Reason field is visible before rating

- **WHEN** the user views a run card that has not yet received submitted feedback
- **THEN** the text control for explaining why the output was good or bad is visible without requiring any prior click

### Requirement: Rating and reason both required to submit

The system SHALL require the user to select exactly one of good or bad and SHALL require non-empty reason text before feedback can be submitted.

#### Scenario: Submit disabled until complete

- **WHEN** either no rating is selected or the reason text is empty or whitespace-only
- **THEN** the submit control is disabled

#### Scenario: Successful submit

- **WHEN** the user has selected good or bad and entered non-empty reason text and activates submit
- **THEN** the feedback is recorded with rating and reason and the card shows the submitted state

### Requirement: Accessible labeling

The system SHALL associate the good/bad controls and the reason field with programmatic names or labels so assistive technologies can convey that the user must explain why they chose that rating.

#### Scenario: Assistive technology

- **WHEN** assistive technology exposes the feedback controls
- **THEN** the good and bad options and the reason field have discernible names that reference feedback quality and explanation
