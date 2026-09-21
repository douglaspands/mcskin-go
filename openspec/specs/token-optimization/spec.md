# token-optimization Specification

## Purpose
Defines engineering rules, module boundaries, subagent delegations, and tooling constraints to guarantee that mcskin minimizes token consumption across Google Antigravity and Anthropic Claude harnesses while preserving high readability for human maintainers.

## Requirements

### Requirement: Modular Source File Boundary
All new and refactored application files in the codebase SHALL NOT exceed 300 lines or 15 KB in size, ensuring that AI file-view operations remain strictly bounded and context-efficient.

#### Scenario: Frontend module size compliance
- **WHEN** any frontend JavaScript module (`internal/web/static/js/*.js`) is inspected or created
- **THEN** it MUST contain fewer than 300 lines of code, focus on a single architectural concern, and export clear functions documented with JSDoc.

#### Scenario: Vendor library isolation
- **WHEN** third-party minified libraries (such as Three.js or QRCode) are included in the repository
- **THEN** they MUST reside inside `internal/web/static/vendor/` and be excluded from general code search and AI context reads.

### Requirement: Silent-on-Success Compact Test Execution
The test execution tooling SHALL provide a compact runner that outputs a single summary line on success and surfaces only failing test names and assertion diffs on error.

#### Scenario: All tests passing
- **WHEN** the compact test script is executed and all Go test packages pass
- **THEN** the script outputs a single status line (`PASS: all packages OK`) and exits with code 0.

#### Scenario: Test failure encountered
- **WHEN** a test assertion or compilation fails
- **THEN** the runner outputs only the failed package name, the specific failing test identifier, and the relevant assertion failure message, suppressing verbose passing logs.

### Requirement: Subagent Context Offloading
Repetitive research, verbose test repair loops, and code investigations SHALL be isolated within subagents so that the parent conversation context receives only concise summaries.

#### Scenario: Subagent execution
- **WHEN** an AI assistant delegates test-running, symbol searching, or verification to a subagent
- **THEN** the subagent completes the diagnostic loop in its own isolated context and returns a brief actionable status summary to the parent orchestrator.

### Requirement: Standardized High-Effort Model Execution
All subagent dispatches and skill executions across both Google Antigravity and Anthropic Claude Code harnesses SHALL strictly use `flash` (Antigravity) and `sonnet` (Claude Code) configured in High Effort Mode (high reasoning effort / thinking budget). Use of cheap/fast models (`flash_lite`, `haiku`) or heavy models (`pro`, `opus`) is prohibited.

#### Scenario: PO/QA Reviewer Dispatch
- **WHEN** the `feature-qa-reviewer` skill is triggered or dispatched to an adversarial evaluation subagent
- **THEN** it MUST be dispatched with `flash` in High Effort mode on Antigravity and `sonnet` in High Effort mode on Claude Code.
- **AND** it MUST rigorously evaluate requirements, child usability (6+), Minecraft UX, Bedrock pack compliance, and regression suites without superficial inspection.

#### Scenario: General Subagent Task Dispatch
- **WHEN** any implementation, analysis, or testing subagent is dispatched via `invoke_subagent` (Antigravity) or `Agent` (Claude Code)
- **THEN** it MUST use `model: flash` (Antigravity) or `model: "sonnet"` (Claude Code) with High Effort / reasoning mode explicitly enforced.
- **AND** it MUST NOT use `flash_lite`, `haiku`, `pro`, or `opus`.

#### Scenario: Planning and Task Annotation
- **WHEN** tasks are generated or annotated during the OpenSpec propose workflow (`openspec-propose`)
- **THEN** all tasks MUST be annotated with `flash (AGY, High) / sonnet (Claude, High)` as the execution model tier.
- **AND** the Model Selection Summary MUST reflect `flash` / `sonnet` in High Effort mode as the uniform project standard.
