# Design: Enforce Archive Git Rules and Main Protection

## Context
See proposal.md - Why.
Harnesses operate under `.agents/scripts/command-gate.py` and project rules (`AGENTS.md`, `GEMINI.md`, `CLAUDE.md`, `.agents/governance.md`). Previously, post-PR commits occurred directly on `main` because:
1. The archive workflow lacked an explicit git commit instruction on the feature branch.
2. The command safety gate did not mechanically prevent commits to `main`.

## Goals / Non-Goals

**Goals:**
- Guarantee that all change moves and spec updates are committed directly on `feat/<name>` before PR creation.
- Ensure `main` is protected mechanically (via `command-gate.py`) and normatively (via project rules across all harnesses).
- Guarantee a 100% clean git working tree when switching to `main` following PR creation.

**Non-Goals:**
- Modifying Go converter core logic or packaging algorithms.
- Changing GitHub Actions CI/CD workflows.

## Decisions

### Decision 1: Stage and commit archive artifacts during Step 5 of the Archive workflow
- **Rationale**: If archiving and spec syncing do not execute `git add` and `git commit` immediately on the feature branch, the working tree remains dirty, which causes git checkout complications or leads agents to mistakenly commit those changes to `main`.
- **Alternative Considered**: Leaving files uncommitted until PR merge. Rejected because git push will omit the archive and spec sync files from the PR.

### Decision 2: Mechanical enforcement in `command-gate.py`
- **Rationale**: Declarative instructions in markdown files are necessary but agents can occasionally misinterpret state. Adding a Python check in `evaluate_command` that queries `git rev-parse --abbrev-ref HEAD` and checks for `git commit` when on `main` guarantees Tier 3 denial.
- **Alternative Considered**: Relying solely on prompt instructions. Rejected as human and AI error could repeat.

## Risks / Trade-offs

- **[Risk]** A legitimate local squash merge needs to commit on `main`.
  - **Mitigation**: The gate explicitly allows `git commit` if `merge --squash` is part of the command invocation.
