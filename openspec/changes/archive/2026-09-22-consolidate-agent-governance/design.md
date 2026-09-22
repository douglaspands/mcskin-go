# Design

## Context

See proposal.md - Why. Current state, verified by direct inspection:

- Governance prose is restated (not referenced) in `AGENTS.md` (222 lines, positions itself as the harness-agnostic entry point), `CLAUDE.md` (19 lines, auto-loaded every Claude Code session), `GEMINI.md` (177 lines, read by Antigravity/Gemini), `.agents/governance.md` (134 lines, explicitly "for supported terminal harnesses: Antigravity and Claude Code"), and `openspec/config.yaml`'s `context`/`rules` fields (injected into every OpenSpec workflow prompt).
- `scripts/command-gate.py` (106 lines) and `.agents/scripts/command-gate.py` (127 lines) are independent copies that have diverged: the `.agents/` version adds main-branch commit protection, a `gh pr` subcommand allowlist, and per-pattern regex flags that the `scripts/` version lacks.
- The gate's `PreToolUse` hook is registered only in `.agents/hooks.json`, which resolves the script via a fallback chain (`.agents/scripts/command-gate.py` → `scripts/command-gate.py` → an absolute path). `.claude/settings.json` does not exist at all; `.claude/settings.local.json` contains only `{"enabledPlugins": {}}`. Claude Code sessions currently execute shell commands with no gate evaluation.
- `.claude/skills/model-selection/SKILL.md` and `.agents/skills/model-selection/SKILL.md` (147 lines each) mandate `sonnet`/`flash` in High Effort mode for every subagent dispatch and require writing to `.agents/model-log.md` and `.agents/model-benchmark.jsonl` on every dispatch. They are referenced from 6 other files plus each other.
- `.claude/{commands/opsx,skills/openspec-*}` and `.agents/{workflows,skills/openspec-*}` are OpenSpec-CLI-scaffolded (`generatedBy: "1.13.1"` in frontmatter) and near-duplicates of each other by construction, not by drift.

## Goals / Non-Goals

**Goals:**
- One canonical file for agent governance policy; every other harness entry point becomes a pointer plus harness-unique facts.
- One canonical `command-gate.py`, invoked identically (by hook config, not by file path fallback guessing) from both `.claude/settings.json` and `.agents/hooks.json`.
- Remove `model-selection` and its mandatory tier/logging without losing the planned-wave parallel-dispatch rule, which moves into the `token-optimization` spec.
- Every reference cleanup verified by re-grep, not assumed (RED baseline, GREEN after).
- Task execution itself follows TDD and a formal loop-engineering halting rule, with an explicit per-stream stop condition for parallel waves — reusing the project's existing 3-attempt/2-identical-failure convention rather than inventing a new one.
- Autonomy stays scoped to the existing Tier-1/Tier-3 split (safe commands run without confirmation, destructive commands need an explicit user request), formalized as a spec requirement so it holds the same regardless of which harness or which model the user has selected.
- Interactive permission prompts are minimized to destructive/ambiguous commands, using one canonical command form per operation so a single allowlist entry actually covers every occurrence instead of prompting again for an equivalent variant.

**Non-Goals:**
- Rewriting `.claude/{commands/opsx,skills/openspec-*}` or `.agents/{workflows,skills/openspec-*}` — these are OpenSpec-CLI scaffolding; hand-editing them would be overwritten by a future `openspec update` and is a separate concern from this change.
- Changing which commands are allowed/blocked beyond merging the two existing gate scripts' logic (no new policy decisions about what's Tier 1/2/3).
- A line-by-line rewrite of `openspec/specs/skin-editor/spec.md` / `web-server/spec.md` — this change trims verbosity only, preserving every existing scenario; a deeper restructuring is out of scope.

## Decisions

**1. `AGENTS.md` is the canonical governance document.**
It already frames itself as the harness-agnostic entry point ("Welcome, AI Agent / Harness"), `CLAUDE.md` already points to it, and `AGENTS.md` is an increasingly-recognized convention multiple tools read natively. Alternative considered: making `openspec/config.yaml`'s `context` field canonical instead — rejected because that field is only injected during OpenSpec workflows (propose/apply/archive/explore/sync), not during ordinary coding sessions, so it cannot be the sole source for rules (command gate, permission tiers) that apply outside OpenSpec too.

**2. Canonical gate script lives at `scripts/command-gate.py` (repo root), not under `.agents/`.**
Both `.claude/settings.json` and `.agents/hooks.json` need to reference the same file; nesting it under a harness-specific directory implies false ownership. Merge the stricter `.agents/scripts/command-gate.py` logic (main-branch protection, `gh pr` allowlist, per-pattern flags) into `scripts/command-gate.py`, delete `.agents/scripts/command-gate.py` and its `__pycache__`, and point `.agents/hooks.json` at the single path (dropping the multi-path fallback guess, which is itself a smell — silent fallback to a *different* script than intended is how the two copies diverged in the first place). Furthermore, `scripts/command-gate.py` must be polyglot across harnesses: it must accept Antigravity's JSON payload (`toolCall.args.CommandLine`) and Claude Code's JSON payload (`tool_input.command` / `input.command`). On every decision (not just `deny`), it emits stdout JSON in the shape each harness's own hook schema requires — a top-level `{"decision": ...}` body for Antigravity, and `{"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": ...}}` for Claude Code, whose schema validates stdout JSON regardless of exit code and rejects the legacy top-level `decision` field — with `deny` additionally exiting non-zero and writing the reason to stderr.

**3. Register the hook in `.claude/settings.json` (project-level, committed), not `.claude/settings.local.json`.**
`settings.local.json` is the personal/gitignored override file; a security control that's supposed to be mandatory for every contributor and agent belongs in the committed project file, mirroring how `.agents/hooks.json` is committed.

**4. `model-selection`'s useful content (planned-wave parallelism) moves into the `token-optimization` spec and a short AGENTS.md section — no replacement skill file.**
A 147-line skill (times two copies) is disproportionate to a short parallelism policy. Keeping it as spec text + a few lines in the canonical governance doc means it's loaded only when relevant context already loads AGENTS.md/the spec, not as a standalone skill invocation. Model selection itself is no longer a heuristic at all: dispatches always use whatever model the user has selected/configured in the harness — there is no cost or task-type logic to encode. In Antigravity, this natively maps to `invoke_subagent`'s default `Model: inherit` parameter, seamlessly inheriting whatever model the user configured without heuristic overrides or mandatory dispatch logging.

**5. `.agents/model-log.md` and `.agents/model-benchmark.jsonl` are left in place but no longer required.**
They're historical records now that per-dispatch tier logging is dropped as a requirement; deleting them would destroy data for no benefit. Future dispatches simply stop appending to them.

**6. `.agents/governance.md` becomes a stub pointer, not a deletion.**
`GEMINI.md` references it by path; removing the file would break that reference. It's trimmed to a pointer at AGENTS.md plus any Antigravity-only operational detail, same treatment as `CLAUDE.md`/`GEMINI.md`.

**7. Task execution reuses the project's existing loop-engineering numbers (3-attempt cap, halt on 2 identical failures) rather than inventing new ones, and applies them per parallel stream.**
The cap and halting condition already exist informally in `AGENTS.md`/`openspec/config.yaml`; this change's job is to formalize them as a validated requirement, not to renegotiate the numbers. Applying the halting condition per stream (not globally) is what makes it compatible with the Wave A parallel plan in `tasks.md`: one stream hitting its cap must not force the other independent streams to stop too, or parallel dispatch loses its point.

**8. A lightweight Wave Boundary Checkpoint (Group 5 in `tasks.md`) sits between Wave A and Wave B, distinct from the failure-triggered halts.**
Waiting until the very end (Group 6) to discover a coherence break across three independently-edited streams would waste the whole Wave A effort if something is wrong. A cheap `openspec validate` plus a single checkpoint commit after Wave A costs little and gives a real rollback point. This is a scheduled gate, not a reaction to an error — kept separate from the halting discipline in Decision 7.

**9. Task 1.5 is a manual (STOP) checkpoint, not a loop-engineering halt.**
Wiring the command gate hook (1.4) is the one task in this change with asymmetric risk: if the merged gate script has a gap, it either fails open (no real security improvement) or fails closed on a legitimate command (blocks the user, across every harness, until fixed). Neither failure mode is something automated verification alone should wave through, so 1.5 requires the user to look at a sample of real allow/deny decisions before the rest of the change proceeds — independent of whether 1.1-1.4's own checks passed.

**10. Autonomy tier formalization (agent-governance's "Autonomy Scoped by Command Safety Tier") is written to be harness- and model-independent by construction.**
Because `token-optimization`'s "User-Selected Model Persistence" (this change) already lets the user pick any model per harness, autonomy could otherwise drift per model if left as convention instead of a spec requirement — e.g., a more cautious model second-guessing an already-safe Tier-1 command, or a more permissive one skipping a Tier-3 confirmation. The requirement pins tier assignment to the command itself, not to which model is evaluating it.

**11. `.claude/settings.json`'s `permissions.allow` list is seeded with the `fewer-permission-prompts` skill's approach, not hand-written — and the requirement it serves is written mechanism-agnostic.**
That skill already exists in this environment specifically to scan for common read-only Bash/MCP calls and produce a prioritized allowlist — reusing it keeps the allowlist grounded in this project's actual command usage instead of a guessed list, and keeps the "one canonical form per operation" property (Decision/Goal above) enforced by the same process that builds `AGENTS.md`'s Token-Economical Command Catalog, rather than two independently-maintained lists drifting apart. Claude Code and Antigravity implement prompt-minimization differently: Claude Code layers a separate allowlist file on top of the hook, while Antigravity's official hook specification (`agy-customizations/docs/hooks.md`) confirms that the hook script directly returns the `allow`/`ask`/`deny`/`force_ask` decision with no separate allowlist file. The spec requirement is written around the outcome (Tier 1 = no prompt), not around Claude Code's two-layer shape, so it does not implicitly require Antigravity to grow a file it has no use for. Task 1.6 documents this confirmed behavior in `AGENTS.md`.

## Risks / Trade-offs

- **[Risk]** Merging the two gate scripts could accidentally narrow the allowlist and block a command Claude Code currently runs freely (since it currently runs ungated). → **Mitigation**: build the merged allowlist as the union of both scripts' patterns, cross-check against AGENTS.md's Tier-1 command catalog table, and dry-run the merged script against representative Tier-1/2/3 commands before wiring the hook live.
- **[Risk]** Wiring the hook into `.claude/settings.json` mid-session could immediately start denying a legitimate command if the merge missed a pattern. → **Mitigation**: verify the merged script's decisions for `openspec ...`, `go test ...`, `git commit` (non-main), and the destructive-pattern list before considering the task done; treat any unexpected `deny` as a bug in the merge, not a policy change.
- **[Risk]** Trimming `CLAUDE.md`/`GEMINI.md` to pointers could drop a fact that's genuinely harness-unique (not duplicated) rather than redundant. → **Mitigation**: keep binary paths, hook file names, and any harness-specific tool syntax (e.g. `invoke_subagent` vs `Agent`) verbatim in each thin file; only remove prose that restates AGENTS.md's governance rules.
- **[Risk]** Removing `model-selection` references could leave a dangling link in `token-guardian`/`prototype-iteration-loop`. → **Mitigation**: after edits, re-grep for `model-selection`, `model-log.md`, `model-benchmark.jsonl` across the repo (excluding `openspec/changes/archive/`) and confirm zero remaining live references.
- **[Risk]** Spec verbosity trimming (skin-editor, web-server) could silently drop a scenario. → **Mitigation**: scenario count before and after must match exactly (`grep -c "^#### Scenario:"`); only requirement/scenario *prose* is condensed, not the count.

## Migration Plan

1. Merge gate logic into `scripts/command-gate.py`; delete `.agents/scripts/command-gate.py` (+ `__pycache__`).
2. Point `.agents/hooks.json` at the single canonical script path; add the equivalent `hooks` block to `.claude/settings.json`.
3. Dry-run the merged gate against representative allowed/blocked commands; seed `.claude/settings.json`'s `permissions.allow` using the `fewer-permission-prompts` skill's approach, cross-checked one-for-one against `AGENTS.md`'s Token-Economical Command Catalog (Decision 11, Claude Code-specific).
4. Verify, rather than assume, that Antigravity's documented `allow`/`ask`/`deny` prompt behavior (`.agents/governance.md` §4.1) actually holds; update `AGENTS.md` with the confirmed behavior (Decision 11).
5. **(STOP)** Get explicit user confirmation on the gate's sampled behavior on both harnesses and the Claude Code allowlist's coverage before treating any of it as active (Decision 9) — high blast radius, not covered by automated checks alone.
6. Restructure `AGENTS.md` as the self-contained canonical governance doc (light edit — it already covers most ground).
7. Trim `CLAUDE.md`, `GEMINI.md`, `.agents/governance.md` to pointers + harness-unique facts; trim `openspec/config.yaml`'s `context`/`rules` similarly.
8. Delete `.claude/skills/model-selection/` and `.agents/skills/model-selection/`; remove references from `AGENTS.md`, `GEMINI.md`, both `token-guardian` and `prototype-iteration-loop` copies.
9. Re-grep the whole repo for the removed skill/log names to confirm no live references remain.
10. **(Wave Boundary Checkpoint)** Run a quick `openspec validate`, then commit the accumulated changes as one checkpoint on `feat/consolidate-agent-governance` (Decision 8).
11. Trim `openspec/specs/skin-editor/spec.md` and `openspec/specs/web-server/spec.md` for verbosity, preserving scenario count.
12. Run `openspec validate consolidate-agent-governance --strict`.
