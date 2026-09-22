# Tasks

## 1. Fold Non-Duplicated `token-guardian` Content into `AGENTS.md`

- [x] 1.1 (RED) Grep `AGENTS.md` for `subagent_type: "Explore"` and `Codebase Researcher` and confirm neither string is present yet (the concrete subagent dispatch tool syntax does not exist there today)
- [x] 1.2 (GREEN) Replace `AGENTS.md`'s dangling "**Token Guardian Skill**" bullet (in the "Parallel Dispatch (Planned Waves) & Model Selection" section) with `token-guardian` section 4's subagent dispatch tool syntax (Antigravity `subagent: research` / `role: "Codebase Researcher"`; Claude Code `Agent` tool with `subagent_type: "Explore"` or `"fork"`), rewording its self-reference to point at the "User-Selected Model Persistence" bullet in the same section instead of the now-inlined location, and verify the grep from 1.1 now finds both strings
- [x] 1.3 (RED) Grep `AGENTS.md` for `Pre-Completion Verification Checklist` and confirm it is absent
- [x] 1.4 (GREEN) Add a new "Pre-Completion Verification Checklist" subsection to `AGENTS.md` (after the Token-Economical Command Catalog, before "Safe Autonomy Boundaries") containing `token-guardian` section 6's 7-item checklist, updating its archive-command reference to `/opsx:archive` (Claude Code) / `/openspec-archive-change` (Antigravity), and verify the grep from 1.3 now finds it

## 2. Remove `token-guardian` References from Skill Inventories

- [x] 2.1 (RED) Grep `CLAUDE.md` and `GEMINI.md` for `token-guardian` and record the baseline count (expect 2, one per file)
- [x] 2.2 (GREEN) Remove the `token-guardian` entry from the skill-inventory line in both `CLAUDE.md` and `GEMINI.md`, and verify the grep from 2.1 now returns 0

## 3. Delete the `token-guardian` Skill

- [x] 3.1 (RED) Confirm `.claude/skills/token-guardian/` and `.agents/skills/token-guardian/` currently exist and are byte-identical (`diff .claude/skills/token-guardian/SKILL.md .agents/skills/token-guardian/SKILL.md`)
- [x] 3.2 (GREEN) Delete both `.claude/skills/token-guardian/` and `.agents/skills/token-guardian/` directories, and verify neither path exists afterward

## 4. Verify No Dangling References Remain

- [x] 4.1 (RED) Grep the repo (excluding `openspec/changes/archive/`) for `token-guardian` and record the baseline count before this task group's own cleanup is considered done (expect only the 3 historical rows in `.agents/model-log.md`)
- [x] 4.2 (VERIFY) Re-run the grep from 4.1 after tasks 1-3 and confirm the only remaining live matches are `.agents/model-log.md`'s 3 historical rows (left untouched per design.md Decision on historical logs); any other match is a bug in this change and must be fixed before proceeding

## 5. Final Validation

- [x] 5.1 (VERIFY) Run `openspec validate remove-token-guardian-skill --strict` and verify it passes
- [x] 5.2 (VERIFY) Run `./scripts/test-compact.sh` and verify it still passes (`PASS: all packages OK`), confirming this docs-only change did not affect application code
