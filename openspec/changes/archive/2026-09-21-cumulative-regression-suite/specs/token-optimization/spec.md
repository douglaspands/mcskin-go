# Spec Delta

## ADDED Requirements

### Requirement: Skill & Process Optimization Suggestion at Proposal Closure
At the close of every proposal, the workflow SHALL evaluate whether the feature's construction process could be made more token-efficient — through a reusable skill, a subagent delegation point, or a compact-reporting improvement — and SHALL surface that evaluation's outcome to the user, whether or not it recommends creating anything new.

#### Scenario: Optimization opportunity identified
- **WHEN** a proposal's artifacts are complete and the construction process for the feature has been evaluated
- **THEN** the proposal names the specific repetitive or verbose step that could be optimized and suggests a concrete skill, subagent pattern, or reporting change to address it

#### Scenario: No optimization opportunity found
- **WHEN** the evaluation finds no token-saving opportunity beyond what already exists
- **THEN** the proposal states explicitly that no new optimization was identified, rather than omitting the evaluation

### Requirement: Development & Test Tooling Dependency Boundary
The project SHALL keep the shipped Go binary and the frontend served to end users free of external runtime dependencies, while permitting development and test tooling to use external dependencies when they meaningfully improve quality or efficiency, provided those dependencies are never bundled into the production binary or served static assets.

#### Scenario: Test tooling dependency added
- **WHEN** a development or test tool requires an external package to function effectively
- **THEN** that package is declared in dependency manifests scoped to tooling only, and is not present in `cmd/`, `internal/`, or the assets served by the embedded web server

#### Scenario: Production code remains dependency-free
- **WHEN** the production Go binary is built or the web frontend is served
- **THEN** no code path introduced by test-tooling dependencies is compiled into the binary or delivered to the browser
