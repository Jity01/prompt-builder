## ADDED Requirements

### Requirement: AI auto-critic evaluation

The system SHALL provide an automated evaluator that compares each model output against the corresponding expected output and returns structured feedback containing a numeric similarity score, mismatch reasons, and concrete improvement guidance for prompt refinement.

#### Scenario: Evaluate run set

- **WHEN** the user starts auto-refine with at least one completed run containing expected output
- **THEN** the system computes per-run similarity and mismatch feedback for the current prompt state

### Requirement: Iterative auto-refine loop

The system SHALL support an iterative refinement loop that uses auto-critic feedback to update the system prompt repeatedly until either the aggregate similarity score meets or exceeds a configured threshold or a maximum iteration limit is reached.

#### Scenario: Stop on threshold

- **WHEN** an iteration produces aggregate similarity at or above the configured threshold
- **THEN** the auto-refine loop stops and marks the run set as ready for manual refinement

#### Scenario: Stop on max iterations

- **WHEN** the loop reaches the maximum configured iteration count before meeting threshold
- **THEN** the loop stops and reports incomplete auto-convergence with latest score and prompt

### Requirement: Auto-refine controls and visibility

The system SHALL expose controls to start and stop the auto-refine loop, display current iteration progress, show score trend, and surface latest auto-critic rationale so users can understand what changed and why.

#### Scenario: User cancels auto-refine

- **WHEN** the user stops the loop during execution
- **THEN** in-flight automation is halted and the latest available prompt remains editable

## MODIFIED Requirements

### Requirement: Refine suggestion via API

The system SHALL support two refinement paths: (a) existing user-submitted feedback for manual refinement and (b) AI-generated feedback from the auto-critic loop. The refine API contract SHALL accept feedback items produced by either path and SHALL preserve explanation plus line-level diff output for prompt updates.

#### Scenario: Manual path after auto handoff

- **WHEN** auto-refine reaches threshold and user submits manual feedback on new runs
- **THEN** the system processes manual feedback using the existing suggestion workflow

#### Scenario: Auto path refinement

- **WHEN** the auto-critic loop produces mismatch feedback
- **THEN** the refine API uses that feedback to generate the next prompt revision and diff payload
