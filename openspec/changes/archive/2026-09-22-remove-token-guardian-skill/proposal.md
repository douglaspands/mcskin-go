# Proposal

## Why

The `token-guardian` skill (identical copies at `.claude/skills/token-guardian/SKILL.md` and `.agents/skills/token-guardian/SKILL.md`) is now largely a second copy of policy that already lives in `AGENTS.md`: its file-size-budget, vendor-isolation, compact-test, and I/O-optimization sections were duplicated verbatim into `AGENTS.md`'s "Token & Resource Optimization" and "Fast, Safe & Token-Economical Reading & Writing" sections by the `consolidate-agent-governance` change. This is the exact duplication pattern that change already eliminated for the `model-selection` skill — the same fix was just missed for `token-guardian`.

## What Changes

- **BREAKING**: Delete the `token-guardian` skill entirely from both harnesses (`.claude/skills/token-guardian/`, `.agents/skills/token-guardian/`); it is no longer invocable by name in either harness.
- Fold `token-guardian`'s two non-duplicated sections into `AGENTS.md` before deleting the skill, so no content is lost: the Subagent Delegation & Context Offloading tool syntax (Antigravity `subagent`/Claude Code `Agent` dispatch), and the Token Guardian Verification Checklist (a pre-completion/pre-archive checklist).
- Remove the now-dangling `AGENTS.md` line pointing at the `token-guardian` skill, and drop `token-guardian` from the skill inventories listed in `CLAUDE.md` and `GEMINI.md`.
- Modify the `agent-governance` capability's `Single-Source Governance Documentation` requirement to explicitly cover skill files, not only harness entry-point files, so a skill that duplicates canonical policy is caught by the same rule going forward.

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `agent-governance`: `Single-Source Governance Documentation` requirement broadened to also apply to skill files (`.claude/skills/*/SKILL.md`, `.agents/skills/*/SKILL.md`) that restate canonical policy rather than only harness entry-point files.

## Impact

- Skills removed: `.claude/skills/token-guardian/`, `.agents/skills/token-guardian/`
- Governance docs updated: `AGENTS.md` (gains the Subagent Delegation tool-syntax and Verification Checklist content, loses the dangling `token-guardian` reference), `CLAUDE.md`, `GEMINI.md` (drop `token-guardian` from skill inventory lists)
- Spec updated: `openspec/specs/agent-governance/spec.md` (`Single-Source Governance Documentation` requirement)
- No application code (Go/JS) is touched; `.agents/model-log.md`'s historical entries mentioning `token-guardian` are left as-is (same treatment `consolidate-agent-governance` gave `model-selection`'s log history)
