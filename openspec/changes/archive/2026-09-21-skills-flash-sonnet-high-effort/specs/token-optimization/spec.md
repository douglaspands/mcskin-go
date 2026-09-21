# Spec Delta: token-optimization

## ADDED Requirements

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
