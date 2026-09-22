# agent-governance Specification

## Purpose

Defines cross-harness security parity for the command safety gate, requires a single canonical source of truth for AI agent governance policy, and formalizes TDD-verified task execution with loop-engineering halting discipline, so enforcement, documentation, and orchestration all have explicit, testable stop conditions instead of relying on unwritten convention.

## Requirements

### Requirement: Cross-Harness Command Safety Gate Parity
Every supported harness (Claude Code, Antigravity) SHALL register and enforce the project's command safety gate before executing a shell command, using that harness's own hook configuration mechanism.

#### Scenario: Command evaluated before execution regardless of harness
- **WHEN** a harness is about to execute a shell command via its tool-use mechanism
- **THEN** the command SHALL be evaluated by the project's canonical command safety gate before execution, with the gate's `PreToolUse` hook registered in that harness's own configuration file (`.claude/settings.json` for Claude Code, `.agents/hooks.json` for Antigravity)

#### Scenario: Destructive command blocked identically regardless of harness
- **WHEN** a destructive command pattern (e.g. `rm -rf /`, `git push --force`, `git reset --hard`, a direct commit to `main`) is submitted for execution
- **THEN** the gate SHALL deny it with equivalent reasoning regardless of which harness issued it

### Requirement: Autonomy Scoped by Command Safety Tier
The harness SHALL execute non-destructive, safe commands (Tier 1) autonomously without requiring per-command user confirmation, and SHALL require the user's explicit request or confirmation before executing a destructive command (Tier 3), consistently regardless of which harness or which underlying model is handling the session. Interactive permission prompts SHALL be minimized to destructive/ambiguous commands only, and SHALL be predictable rather than fragmented across near-duplicate command forms.

#### Scenario: Safe command runs without confirmation
- **WHEN** a command matches the project's Tier-1 safe/non-destructive allowlist (e.g. `go test`, `git status`, `openspec ...`)
- **THEN** the harness SHALL execute it autonomously without pausing for user confirmation, regardless of which harness or model is active

#### Scenario: Destructive command requires explicit user request
- **WHEN** a command matches a destructive pattern (e.g. force-push, hard reset, a direct commit to `main`, unbounded deletion)
- **THEN** the harness SHALL NOT execute it until the user has explicitly requested or confirmed that specific action, regardless of which harness or model is active

#### Scenario: Autonomy scope is model-independent
- **WHEN** the session's underlying model changes (e.g. switching between the models covered by the `token-optimization` spec's User-Selected Model Persistence requirement)
- **THEN** the autonomy tier assignments (what runs freely vs. what needs confirmation) SHALL remain the same — model choice SHALL NOT expand or restrict which commands require confirmation

#### Scenario: Interactive permission prompts minimized to destructive commands only
- **WHEN** a harness is configured for a project
- **THEN** Tier-1 safe/non-destructive commands SHALL run without an interactive prompt, and only Tier-2/Tier-3 commands SHALL be subject to interactive confirmation — via whichever mechanism is native to that harness (e.g. a separate permission-allowlist file for Claude Code, or the command gate script's own `allow`/`ask`/`deny` decision for Antigravity); the outcome, not the mechanism, is what this requirement pins down

#### Scenario: Canonical command form avoids redundant permission prompts
- **WHEN** the harness repeatedly performs the same logical operation (e.g. checking git status, viewing recent commits, running tests)
- **THEN** it SHALL use the same canonical, token-economical command form each time rather than varying equivalent flags or phrasing, so a single allowlist entry covers it consistently instead of triggering repeated, fragmented prompts

### Requirement: Single Canonical Command Gate Script
The project SHALL maintain exactly one command safety gate script as the source of truth for command evaluation logic; every harness's hook configuration SHALL invoke that single script rather than an independent copy.

#### Scenario: Gate logic updated once
- **WHEN** a new destructive command pattern needs to be blocked
- **THEN** updating the single canonical gate script SHALL change the enforced behavior for every harness without editing more than one script file

#### Scenario: Polyglot harness input and output compatibility
- **WHEN** the gate script is invoked by different harnesses with distinct stdin schemas (e.g. Antigravity's `toolCall.args.CommandLine` vs Claude Code's `tool_input.command`)
- **THEN** the gate script SHALL extract and evaluate the command correctly from either schema, and SHALL return the decision in each harness's own required stdout JSON schema — a top-level `{"decision": ...}` body for Antigravity, and a `{"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": ...}}` body for Claude Code (whose PreToolUse hook schema rejects the legacy top-level `decision` field) — with a denial additionally exiting non-zero with the reason on stderr

### Requirement: Single-Source Governance Documentation
The project SHALL maintain exactly one canonical document containing AI agent governance policy (state graph, loop/iteration caps, permission tiers, host security protocol). Every other harness entry-point file SHALL contain only a pointer to that canonical document plus facts unique to that harness.

#### Scenario: Harness entry-point file contains only a pointer
- **WHEN** an agent harness reads its own entry-point file (`CLAUDE.md`, `GEMINI.md`, `.agents/governance.md`, or `openspec/config.yaml`'s `context`/`rules` fields)
- **THEN** the file SHALL reference the canonical governance document rather than restate its rules, except for facts unique to that harness (e.g. binary paths, hook file location)

#### Scenario: Governance rule updated in one place
- **WHEN** a governance rule changes (e.g. the loop iteration cap or a permission tier)
- **THEN** editing the canonical document SHALL be sufficient, and no other file SHALL require an edit to stay consistent with it

### Requirement: TDD-Verified Task Execution
A task in a change's `tasks.md` that alters mechanically-checkable behavior (code, scripts, configuration, or reference counts) SHALL state its verification check in the task description and SHALL be executed RED (confirm the check currently fails or the baseline condition holds) before GREEN (apply the change and confirm the check now passes).

#### Scenario: Mechanically-checkable task follows RED before GREEN
- **WHEN** a task changes behavior that can be verified by a test, a grep/count, or a validate command
- **THEN** the harness SHALL run that check once before the change, expecting the pre-change (RED) result, and once after, expecting the post-change (GREEN) result, before marking the task complete

#### Scenario: Prose-only planning task has no RED/GREEN
- **WHEN** a task produces only prose or planning artifacts with no mechanical check available
- **THEN** TDD RED/GREEN does not apply, and the task's verification is the artifact's existence and coherence instead

### Requirement: Loop Engineering Halting Discipline
Any repair or fix loop the harness runs while executing a task SHALL be capped at 3 attempts, and SHALL halt and escalate to the user if the same error or failure recurs identically across 2 consecutive attempts, rather than continuing to retry.

#### Scenario: Repeated identical failure halts the loop
- **WHEN** a task's verification check fails with the same error on two consecutive attempts
- **THEN** the harness SHALL stop, report both failures and their identical cause, and ask the user for guidance instead of attempting a third fix

#### Scenario: Attempt cap reached without repetition
- **WHEN** a task's verification check has failed on three consecutive distinct attempts without resolving
- **THEN** the harness SHALL stop after the third attempt and escalate to the user rather than continuing indefinitely

#### Scenario: Parallel wave halts per stream, not globally
- **WHEN** a task within one parallel stream of a planned wave hits its halting condition
- **THEN** only that stream SHALL halt and escalate; other streams in the same wave that have not hit a halting condition SHALL continue independently
