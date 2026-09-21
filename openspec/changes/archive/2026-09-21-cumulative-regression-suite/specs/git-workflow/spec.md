# Spec Delta

## ADDED Requirements

### Requirement: Main Synchronization Before Proposal Branching
Every AI harness and agent capable of initiating a proposal SHALL synchronize the local `main` branch with its remote (`git checkout main && git pull origin main`) immediately before creating the `feat/<name>` isolation branch, and this directive SHALL be stated identically across every harness/agent definition that documents the proposal workflow, not only a single harness's configuration.

#### Scenario: Main is pulled before branch creation
- **WHEN** a proposal is initiated and no `feat/<name>` branch yet exists for it
- **THEN** the workflow checks out `main`, pulls it from the configured remote, and only then creates `feat/<name>` from the updated `main`

#### Scenario: Directive is consistent across harnesses
- **WHEN** any harness- or agent-specific governance document (Claude Code, Antigravity/Gemini, or any other configured harness) describes the first step of a proposal
- **THEN** it states the same pull-before-branch sequence, so no harness can create a feature branch from a stale local `main`
