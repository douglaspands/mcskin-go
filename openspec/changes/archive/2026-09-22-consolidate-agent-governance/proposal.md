# Proposal

## Why

Agent governance policy (command safety, permission tiers, model selection, loop/graph rules) is currently duplicated verbatim across five files (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `openspec/config.yaml`, `.agents/governance.md`) with no single source of truth. That drift already produced a real security gap: the `command-gate.py` safety gate exists in two diverged copies, and its `PreToolUse` hook is registered only in `.agents/hooks.json` (Antigravity), leaving Claude Code sessions running with no enforced command gate despite every governance file describing it as mandatory. Separately, the `token-optimization` spec mandates a fixed high-effort model tier (`flash`/`sonnet` High) for every subagent dispatch regardless of task complexity, plus per-dispatch logging to two files — identified as the single largest token cost in the project — while only informally describing parallel ("wave") dispatch, with no formal requirement that a planned parallel wave actually stays parallel.

## What Changes

- Add a new `agent-governance` capability requiring: (a) the command safety gate is registered and enforced identically for every supported harness, (b) exactly one canonical file holds agent governance policy text, with every other harness entry point reduced to a short pointer plus harness-specific deltas only, (c) task execution follows TDD (RED before GREEN) with a formal loop-engineering halting rule (cap of 3 attempts, halt on 2 identical failures, halting per parallel stream rather than globally), and (d) autonomy is scoped by command safety tier — non-destructive/safe commands execute without per-command confirmation, destructive commands require the user's explicit request, interactive permission prompts are minimized to destructive/ambiguous commands only, and the harness uses one predictable canonical command form per operation instead of near-duplicate variants that would fragment allowlist matching — consistently regardless of which harness or model is active.
- Modify the `token-optimization` capability: **BREAKING** remove the requirement mandating a fixed `flash`/`sonnet` High-Effort tier (and its per-dispatch logging) for every subagent dispatch; replace it with a user-selected-model-persistence requirement (subagent dispatches always use whatever model the user selected/configured in the harness, no task-type or cost heuristic overrides it), a new planned-wave parallel-dispatch requirement (a wave planned as parallel is honored as parallel, not silently collapsed to sequential), and a new token-economical-command-preference requirement (compact command form over verbose, concise output over verbose output, formalizing the command catalog that already exists informally in `AGENTS.md`).
- Remove the `model-selection` skill (`.claude/skills/model-selection/`, `.agents/skills/model-selection/`) and its 8 cross-references (`AGENTS.md`, `GEMINI.md`, both `token-guardian` and `prototype-iteration-loop` skill copies); fold the wave-independence parallelism rule directly into `AGENTS.md` / the `token-optimization` spec instead of a standalone skill.
- Unify the two diverged `scripts/command-gate.py` / `.agents/scripts/command-gate.py` copies into one canonical script (using the stricter `.agents/` version's logic — main-branch protection, `gh pr` allowlist, per-pattern regex flags — as the base, adding polyglot harness support for both Antigravity and Claude Code stdin/exit-code contracts), and register its hook in `.claude/settings.json` in addition to `.agents/hooks.json` so Claude Code sessions are actually gated.
- Consolidate `AGENTS.md` as the single canonical governance document; reduce `CLAUDE.md`, `GEMINI.md`, `.agents/governance.md`, and `openspec/config.yaml`'s `context`/`rules` fields to short pointers plus only the facts unique to that harness (binary paths, hook file name, etc.).
- Lower-priority, same change: review the largest canonical specs (`skin-editor/spec.md`, 286 lines; `web-server/spec.md`, 135 lines) for verbosity reduction without losing WHEN/THEN scenario coverage.

## Capabilities

### New Capabilities
- `agent-governance`: Cross-harness command safety gate parity, single-source-of-truth policy for AI agent governance documentation, TDD-verified task execution with loop-engineering halting discipline, and autonomy scoped by command safety tier (minimal, predictable permission prompts) across every harness/model combination.

### Modified Capabilities
- `token-optimization`: Replace the mandatory fixed-tier/logged-dispatch requirement with a user-selected-model-persistence requirement, a new formal planned-wave parallel-dispatch requirement, and a new token-economical-command-preference requirement.

## Impact

- Governance docs: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.agents/governance.md`, `openspec/config.yaml`
- Security/hooks: `scripts/command-gate.py`, `.agents/scripts/command-gate.py`, `.agents/hooks.json`, `.claude/settings.json`
- Skills removed: `.claude/skills/model-selection/`, `.agents/skills/model-selection/`
- Skills updated (drop model-selection references): `.claude/skills/token-guardian/SKILL.md`, `.agents/skills/token-guardian/SKILL.md`, `.claude/skills/prototype-iteration-loop/SKILL.md`, `.agents/skills/prototype-iteration-loop/SKILL.md`
- Logging made optional/removed: `.agents/model-log.md`, `.agents/model-benchmark.jsonl`
- Specs reviewed for size: `openspec/specs/skin-editor/spec.md`, `openspec/specs/web-server/spec.md`
