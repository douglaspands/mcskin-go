# git-workflow Specification

## Purpose
Establishes rigid git workflow invariants for feature branching, archive-driven atomic commits, Pull Request isolation, and absolute protection of the main branch across all AI harnesses.

## ADDED Requirements

### Requirement: Mandatory Feature Branch Archive Commit
The archive workflow SHALL stage and commit all change archive moves and synchronized main specifications directly on the active feature branch (`feat/<name>`) prior to pushing or opening a Pull Request.

#### Scenario: All archive updates committed before PR
- **WHEN** an OpenSpec change is archived via `/opsx-archive` or `openspec-archive-change`
- **THEN** all path changes in `openspec/changes/archive/` and `openspec/specs/` are committed to the feature branch with message `docs(openspec): archive change <name> and sync main specs` before any remote push or PR creation

### Requirement: Strict Main Branch Protection
The repository environment SHALL strictly prohibit direct git commits on the `main` branch across all AI harnesses and automated agents.

#### Scenario: Direct commit attempt on main blocked
- **WHEN** an AI agent or process invokes `git commit` while the current branch is `main` (outside of an explicit `merge --squash` completion)
- **THEN** the action is classified as a Tier 3 destructive operation and denied by the command safety gate

### Requirement: Post-PR Branch Invariant
Upon creating a Pull Request and returning to the `main` branch, the feature branch SHALL be frozen and no further commits SHALL be made on either the feature branch or `main`.

#### Scenario: Checkout to main leaves working tree clean and inert
- **WHEN** a Pull Request is opened on GitHub via `gh pr create` and the workspace executes `git checkout main`
- **THEN** the git working tree on `main` is clean, no further commits are executed on `feat/<name>`, and zero commits are executed on `main`
