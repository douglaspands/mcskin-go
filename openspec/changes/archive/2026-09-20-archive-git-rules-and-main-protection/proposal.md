# Proposal: Enforce Archive Git Rules and Main Protection

## Why

In previous agentic execution cycles, commits were erroneously applied directly to the `main` branch after PR creation, and archive changes were left uncommitted prior to branch pushing. This violated the principle of `main` branch immutability and caused residual dirty states. All git updates (spec synchronization and change archiving) must be consolidated strictly within the archive lifecycle on the isolated feature branch, and `main` must remain completely protected against direct commits.

## What Changes

- **Mandatory Feature Branch Commit on Archive**: During `/opsx-archive` (and `openspec-archive-change`), all change moves (`openspec/changes/archive/`) and synchronized main specs (`openspec/specs/`) MUST be staged and committed directly on `feat/<name>` before pushing or opening a Pull Request.
- **Strict Prohibition of Direct Commits to `main`**: Committing directly to `main` is classified as a Tier 3 Destructive Command and strictly blocked.
- **Post-PR Branch Invariant**: Once a PR is opened and the local workspace checks out `main`, no further commits may be made to the feature branch (frozen awaiting review/merge) or to `main`.
- **Mechanical Safety Gate**: Update `.agents/scripts/command-gate.py` to deny any `git commit` commands attempted while on the `main` branch (unless executing an authorized `merge --squash`).

## Capabilities

### New Capabilities
- `git-workflow`: Governs git branching, archive-driven atomic commits, PR lifecycle, and strict protection of the `main` branch across all AI harnesses.

### Modified Capabilities
<!-- None -->

## Impact

- **Affected Files**:
  - `AGENTS.md`
  - `GEMINI.md`
  - `CLAUDE.md`
  - `.agents/governance.md`
  - `.agents/workflows/opsx-archive.md`
  - `.agents/skills/openspec-archive-change/SKILL.md`
  - `openspec/config.yaml`
  - `.agents/scripts/command-gate.py`
- **APIs & Dependencies**: Zero external dependencies (Go standard library and standard Python3 gate script only).
