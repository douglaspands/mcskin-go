# Spec Delta

## REMOVED Requirements

### Requirement: Standardized High-Effort Model Execution
**Reason**: Mandating a fixed high-effort tier (`flash`/`sonnet` High) for every subagent dispatch — including trivial lookups and mechanical single-file edits — was identified as the single largest token cost in the project, with no allowance for cheaper models on simple tasks, and required a per-dispatch logging step (`.agents/model-log.md`, `.agents/model-benchmark.jsonl`) that added further overhead.
**Migration**: Replaced by "User-Selected Model Persistence" (subagent dispatches always use the model the user selected or configured in the harness, with no task-type or cost heuristic overriding it) and "Parallel Dispatch via Planned Waves" (formalizes that a planned parallel wave is honored rather than silently collapsed to sequential, replacing the rule that previously lived only in the removed `model-selection` skill).

## ADDED Requirements

### Requirement: User-Selected Model Persistence
Subagent dispatches and skill executions SHALL always use the model the user has selected or configured in the harness (e.g. via `/config`, an explicit `model` parameter, or the harness's own configured default); no task-type, complexity, or cost heuristic SHALL override that selection.

#### Scenario: Dispatching any subagent task
- **WHEN** a subagent or skill execution is dispatched, regardless of task type or complexity
- **THEN** it SHALL use the model the user has selected or configured in that harness

#### Scenario: No per-task model override
- **WHEN** a task could be classified as simple (e.g. a lookup) or complex (e.g. architecture/design work)
- **THEN** the harness SHALL NOT switch models based on that classification — the user's configured model applies uniformly, with no required per-dispatch logging file

### Requirement: Parallel Dispatch via Planned Waves
Tasks SHALL be grouped into parallel waves as planned (whether by explicit user instruction or by dependency/file-disjointness analysis); once a set of tasks is planned to run in parallel, the harness SHALL dispatch them in parallel rather than silently collapsing the wave back to sequential execution.

#### Scenario: Planned parallel wave is dispatched as planned
- **WHEN** tasks have been grouped into a parallel wave
- **THEN** the harness SHALL dispatch them in parallel rather than falling back to sequential execution without cause

#### Scenario: Overlap or dependency detected during planning
- **WHEN** tasks share files or have a read-after-write dependency
- **THEN** they SHALL be planned into different (sequential) waves rather than the same parallel wave

#### Scenario: Wave structure decided during task planning
- **WHEN** `tasks.md` is authored during the planning phase (propose or update workflow)
- **THEN** independent task groups SHALL be identified and annotated as parallel-safe waves at that time, based on file/state disjointness, so the apply phase follows a pre-decided dispatch plan instead of deciding ad hoc

### Requirement: Token-Economical Command Preference
When an operation has both a verbose and a compact form that return equivalent information (e.g. `git status -s` vs. `git status`, `git log --oneline` vs. `git log`, a compact test runner vs. verbose test output), the harness SHALL use the compact form, and SHALL use the same canonical form for that operation every time rather than varying between equivalent alternatives.

#### Scenario: Compact form preferred over verbose
- **WHEN** an operation has a documented compact alternative (e.g. the project's command catalog in `AGENTS.md`)
- **THEN** the harness SHALL use that compact form instead of the verbose default

#### Scenario: Output kept concise
- **WHEN** a command's output would otherwise be long (e.g. a full diff or a full test log)
- **THEN** the harness SHALL bound or summarize the output rather than emitting it in full, consistent with the Silent-on-Success Compact Test Execution requirement
