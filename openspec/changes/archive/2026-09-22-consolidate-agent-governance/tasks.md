# Tasks

## 0. Dispatch Plan (Parallel Wave Graph)

File/state overlap analysis across the groups below, decided at planning time per the `token-optimization` spec's "Wave structure decided during task planning" scenario:

```
Wave A (dispatched in parallel):
  [Group 1: Command Gate Unification]  (scripts/command-gate.py, .agents/hooks.json, .claude/settings.json)
        ||
  [Group 4: Canonical Spec Verbosity Pass]  (openspec/specs/skin-editor, openspec/specs/web-server)
        ||
  [Group 2: Governance Consolidation] -> [Group 3: Remove model-selection]
      (sequential within this stream: both touch AGENTS.md and GEMINI.md)

Wave A/B boundary:
  [Group 5: Wave Boundary Checkpoint]  (quick validate + single checkpoint commit)

Wave B (after the Group 5 checkpoint):
  [Group 6: Final Verification]  (depends on every prior group)
```

Groups 1, 4, and the (2 -> 3) stream touch disjoint files and share no read-after-write dependency, so they run as three parallel streams in Wave A. Groups 2 and 3 both edit `AGENTS.md`/`GEMINI.md`, so they stay sequential relative to each other. Group 5 is a lightweight gate between the waves: it catches a coherence break early (before Group 6's full verification) and gives a clean rollback point. Group 6 validates the whole change and re-greps for dangling references, so it waits for the Group 5 checkpoint.

**Stop conditions (per the `agent-governance` spec's Loop Engineering Halting Discipline)**: within any task below, a repair/fix loop is capped at 3 attempts, and halts immediately if the same error recurs identically across 2 consecutive attempts — escalate to the user instead of retrying. Halting applies per stream: if Group 1 or Group 4 hits its cap, that stream stops and escalates while the other Wave A streams keep going; Group 5 and Group 6 are blocked on Wave A finishing (successfully or via a reported, user-acknowledged halt).

**Manual checkpoints (distinct from error-triggered halts)**: task 1.7 and Group 5 are deliberate pauses, not failure responses — they exist because of blast radius (a misconfigured command gate or an over-broad permission allowlist) or because a wave boundary is a natural, cheap point to confirm coherence before continuing, not because anything went wrong.

**Autonomy while executing this plan (per the `agent-governance` spec's Autonomy Scoped by Command Safety Tier)**: tasks marked (RED)/(GREEN)/(VERIFY) that only run Tier-1 safe commands (tests, greps, counts, `openspec validate`, non-`main` commits) proceed without per-command confirmation. Tasks marked (STOP) always pause for the user regardless of harness or model in use.

## 1. Command Gate Unification (Wave A - parallel stream)

- [x] 1.1 (RED) Write a test script exercising representative allow/deny commands (Tier-1 examples: `go test ./...`, `git status -s`, `openspec ...`; Tier-2/3 examples: `git push --force`, `rm -rf /`, `sudo`, a direct `git commit` on `main`) against `scripts/command-gate.py`, and verify it currently FAILS the main-branch-protection and `gh pr` allowlist cases — those only exist in `.agents/scripts/command-gate.py` today
- [x] 1.2 (GREEN) Merge `.agents/scripts/command-gate.py`'s stricter logic (main-branch commit protection, `gh pr` subcommand allowlist, per-pattern regex flags) and polyglot harness payload parsing (Antigravity's `toolCall.args.CommandLine` and Claude Code's `tool_input.command` / `input.command`, returning JSON stdout for Antigravity and non-zero exit code / stderr on deny for Claude Code) into `scripts/command-gate.py` as the single canonical script, and verify the test script from 1.1 now passes
- [x] 1.3 (GREEN) Delete `.agents/scripts/command-gate.py` and `.agents/scripts/__pycache__/`, update `.agents/hooks.json` to reference the single canonical `scripts/command-gate.py` path directly (drop the multi-path fallback), and verify `.agents/hooks.json` is valid JSON referencing only the canonical path
- [x] 1.4 (GREEN) Add a matching `hooks` block to `.claude/settings.json` (new file, project-level, committed) registering the same `PreToolUse` gate for Claude Code, and verify a manual test command that should be denied (e.g. a direct commit on `main`) is actually denied through the wired hook
- [x] 1.5 (GREEN, Claude Code-specific) Seed `.claude/settings.json`'s `permissions.allow` with the project's canonical Tier-1 command forms — one entry per operation, matching `AGENTS.md`'s Token-Economical Command Catalog exactly (e.g. `git status -s`, not also `git status --short`) — using the `fewer-permission-prompts` skill's approach (scan for common read-only Bash/MCP calls, prioritize the allowlist) rather than hand-inventing entries, and verify no destructive pattern from the Tier-3 list is present in the allowlist. This is Claude Code's own two-layer mechanism (allowlist + hook); Antigravity has no equivalent separate file — see 1.6.
- [x] 1.6 (VERIFY, Antigravity-specific) Confirm Antigravity's prompt mechanism against official documentation (`agy-customizations/docs/hooks.md`): verify that `command-gate.py`'s JSON return value (`"decision": "allow"` / `"ask"` / `"deny"`) is the sole mechanical mechanism controlling Antigravity's prompts (Tier 1 = `"allow"`, no prompt; Tier 2 = `"ask"`; Tier 3 = `"deny"`), with no separate allowlist file needed, and document the confirmed behavior in `AGENTS.md`
- [x] 1.7 (STOP) Before relying on the wired hook, the new Claude Code allowlist, and the confirmed Antigravity prompt behavior for the rest of this change's execution, pause and get the user's explicit confirmation that (a) the gate's behavior on a small sample of real Tier-1/2/3 commands matches expectations on both harnesses and (b) the Claude Code allowlist covers common Tier-1 operations without also covering anything destructive — a misconfigured gate or an over-broad allowlist has high blast radius (it could block, or fail to protect, the user's own future commands across every harness), so this is a deliberate checkpoint, not a failure response

## 2. Governance Consolidation (Wave A - parallel stream, runs before Group 3)

- [x] 2.1 (RED) Grep-count lines of duplicated governance prose across `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.agents/governance.md`, and `openspec/config.yaml`, and record the baseline total as evidence of duplication
- [x] 2.2 (GREEN) Restructure `AGENTS.md` as the self-contained canonical governance document (state graph, loop caps, permission tiers, host security, command gate location) and verify it needs no external pointer for any of those topics
- [x] 2.3 (GREEN) Trim `CLAUDE.md` to a pointer to `AGENTS.md` plus only Claude-Code-unique facts (settings/hook file location, skill list), and verify its line count drops while the hook file path is still present
- [x] 2.4 (GREEN) Trim `GEMINI.md` to a pointer to `AGENTS.md` plus only Antigravity/Gemini-unique facts, and verify its line count drops
- [x] 2.5 (GREEN) Trim `.agents/governance.md` to a short stub pointing at `AGENTS.md` (kept, not deleted, since `GEMINI.md` references its path) and verify that reference still resolves
- [x] 2.6 (GREEN) Trim `openspec/config.yaml`'s `context` and `rules` fields to domain vocabulary plus a pointer to `AGENTS.md`, and verify `openspec validate consolidate-agent-governance` still parses the config without error
- [x] 2.7 (VERIFY) Re-run the grep-count from 2.1 and confirm the duplicated-line total dropped versus the RED baseline

## 3. Remove the `model-selection` Skill (Wave A - parallel stream, runs after Group 2)

- [x] 3.1 (RED) Grep the repo for `model-selection`, `model-log.md`, and `model-benchmark.jsonl` (excluding `openspec/changes/archive/`) and record the current count of live references as the baseline (expect > 0)
- [x] 3.2 (GREEN) Delete `.claude/skills/model-selection/` and `.agents/skills/model-selection/`
- [x] 3.3 (GREEN) Remove `model-selection` references from `AGENTS.md`, `GEMINI.md`, `.claude/skills/token-guardian/SKILL.md`, `.agents/skills/token-guardian/SKILL.md`, `.claude/skills/prototype-iteration-loop/SKILL.md`, `.agents/skills/prototype-iteration-loop/SKILL.md`
- [x] 3.4 (GREEN) Add a short "Parallel Dispatch (Planned Waves) & Model Selection" section to `AGENTS.md`'s governance content reflecting the `token-optimization` spec's requirements: a wave planned as parallel is dispatched as parallel (sequential only when files/state overlap is detected during planning); subagent dispatches always use the model the user selected/configured in the harness (natively aligning with Antigravity's `Model: inherit`), with no task-type or cost override and no required logging file
- [x] 3.5 (VERIFY) Re-run the grep from 3.1 and confirm the reference count is now zero

## 4. Canonical Spec Verbosity Pass (Wave A - parallel stream)

- [x] 4.1 (RED) Count existing scenarios in `openspec/specs/skin-editor/spec.md` and `openspec/specs/web-server/spec.md` with `grep -c "^#### Scenario:"` and record the baseline counts
- [x] 4.2 (GREEN) Condense `openspec/specs/skin-editor/spec.md` requirement/scenario prose for verbosity, and verify the scenario count is unchanged from the 4.1 baseline
- [x] 4.3 (GREEN) Condense `openspec/specs/web-server/spec.md` requirement/scenario prose for verbosity, and verify the scenario count is unchanged from the 4.1 baseline

## 5. Wave Boundary Checkpoint (Wave A/B gate)

- [x] 5.1 (VERIFY) Once Groups 1, 4, and the (2 -> 3) stream have all completed, run `openspec validate consolidate-agent-governance` and confirm it passes before continuing, catching any coherence break early instead of waiting for Group 6
- [x] 5.2 (GREEN) Commit the Wave A changes as a single checkpoint commit on `feat/consolidate-agent-governance` (e.g. `docs(governance): consolidate agent governance and remove model-selection`), giving a clean rollback point before Group 6's final verification

## 6. Final Verification (Wave B - after the Group 5 checkpoint)

- [x] 6.1 (VERIFY) Run `openspec validate consolidate-agent-governance --strict` and verify it passes
- [x] 6.2 (VERIFY) Run a repo-wide grep for the deleted file paths (`.agents/scripts/command-gate.py`, `.claude/skills/model-selection`, `.agents/skills/model-selection`) and verify no non-archived file still references them
- [x] 6.3 (VERIFY) Run `go test ./...` (or `./scripts/test-compact.sh`) and verify it still passes, confirming the governance/doc changes did not affect application code
