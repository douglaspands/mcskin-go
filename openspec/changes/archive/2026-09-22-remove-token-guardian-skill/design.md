# Design

## Context

See proposal.md - Why. Current state, verified on `main` post-`consolidate-agent-governance`:

- `.claude/skills/token-guardian/SKILL.md` and `.agents/skills/token-guardian/SKILL.md` are byte-identical, 99 lines each, with 6 numbered sections.
- Sections 1 ("Born Otimizadas"), 2 (Token Budget & File Size Thresholds), 3 (Compact Test Execution), and 5 (I/O Protocol, including the Token-Economical Command Catalog) are now verbatim-duplicated in `AGENTS.md`'s "Token & Resource Optimization" (lines ~102-106) and "Fast, Safe & Token-Economical Reading & Writing" (lines ~117-148) sections.
- Section 4 (Subagent Delegation & Context Offloading — concrete Antigravity `subagent`/Claude Code `Agent` tool syntax) and section 6 (Token Guardian Verification Checklist) have no equivalent elsewhere in `AGENTS.md`.
- `AGENTS.md` line 112 (inside "Parallel Dispatch (Planned Waves) & Model Selection") reads: "**Token Guardian Skill**: Use the `token-guardian` skill (`.agents/skills/token-guardian/SKILL.md`) to inspect and enforce file size budgets before committing." — this becomes a dangling reference once the skill is deleted.
- `CLAUDE.md` and `GEMINI.md` each list `token-guardian` in their skill inventory line.
- `.agents/model-log.md` has 3 historical rows naming `token-guardian` as a past task step; these are a log of what happened, not live instructions, so they are left untouched (same treatment `consolidate-agent-governance` gave `model-selection`'s log history).

## Goals / Non-Goals

**Goals:**
- Delete `token-guardian` from both harnesses with zero content loss: every scrap of its non-duplicated guidance (sections 4 and 6) ends up in `AGENTS.md`.
- Leave no dangling reference to the deleted skill in any live (non-archived) file.
- Generalize the `agent-governance` spec's `Single-Source Governance Documentation` requirement so this exact duplication pattern (a skill restating canonical policy) is a spec violation next time, not just a discovered-by-audit fact.

**Non-Goals:**
- Re-auditing the other 11 skills in either harness — a prior audit already confirmed they're each tied to real, active project surfaces (pack verification, the mcskin web editor, OpenSpec CLI scaffolding).
- Touching `.agents/model-log.md`'s historical rows or any archived change under `openspec/changes/archive/`.
- Any change to application code (Go/JS) — this is docs/governance only.

## Decisions

**1. Section 4's content replaces the dangling `AGENTS.md` line 112, in place, rather than being appended elsewhere.**
Line 112 already sits inside "Parallel Dispatch (Planned Waves) & Model Selection", the section that discusses subagent dispatch — the same topic section 4 covers. Replacing the one dangling bullet with section 4's concrete tool syntax (Antigravity `subagent: research` / `role: "Codebase Researcher"`; Claude Code `Agent` tool with `subagent_type: "Explore"` or `"fork"`) keeps the fold local and avoids growing `AGENTS.md`'s structure. The merged text drops token-guardian's self-reference to "AGENTS.md's Parallel Dispatch & Model Selection section" (circular once inlined) and points instead at the "User-Selected Model Persistence" bullet already in that same section.

**2. Section 6 becomes a new "Pre-Completion Verification Checklist" subsection, placed after the Token-Economical Command Catalog and before "Safe Autonomy Boundaries".**
It's a distinct, concrete checklist (not prose policy), so it doesn't merge into an existing bullet the way section 4 does. It reads naturally right after the catalog it references (item 7) and before the autonomy-tier material that follows. The checklist's original `/opsx-archive` reference is corrected to name both harnesses' actual archive commands (`/opsx:archive` / `/openspec-archive-change`), matching this file's own convention elsewhere.

**3. Generalize `Single-Source Governance Documentation` (agent-governance spec) with a new scenario rather than a new requirement.**
The requirement already exists to prevent exactly this failure mode (policy restated outside the canonical document); it just named "harness entry-point files" and didn't anticipate skills doing the same thing. Broadening its statement plus one new scenario ("Skill file restates canonical policy") captures the real, observed drift without inventing an unrelated requirement.

**4. `CLAUDE.md` / `GEMINI.md` skill-inventory lines are edited by removing the `token-guardian` entry only — no other wording changes.**
These are short, single-line comma-separated lists (per `consolidate-agent-governance`'s "pointer + harness-unique facts" treatment); removing one entry needs no further restructuring.

## Risks / Trade-offs

- **[Risk]** Folding section 4/6 into `AGENTS.md` could silently drop a nuance in the source text. → **Mitigation**: task-level RED/GREEN diff check — grep for each of the 7 checklist items and the two tool-dispatch syntaxes in `AGENTS.md` after the edit, confirming presence before deleting the skill.
- **[Risk]** Deleting the skill directories could leave a stale reference in a file not yet checked. → **Mitigation**: repo-wide re-grep for `token-guardian` (excluding `openspec/changes/archive/` and `.agents/model-log.md`'s historical rows) after all edits, expecting zero hits.
- **[Risk]** Broadening a spec requirement after the fact could be read as scope creep beyond "delete a skill". → **Mitigation**: the new scenario only states the general form of the specific violation this change fixes; it adds no new obligation beyond what this change itself satisfies.

## Migration Plan

1. Edit `AGENTS.md`: replace line 112 (dangling `token-guardian` reference) with section 4's subagent dispatch tool syntax; insert section 6 as a new "Pre-Completion Verification Checklist" subsection after the Token-Economical Command Catalog.
2. Edit `CLAUDE.md` and `GEMINI.md`: drop `token-guardian` from each skill-inventory line.
3. Delete `.claude/skills/token-guardian/` and `.agents/skills/token-guardian/`.
4. Re-grep the repo (excluding `openspec/changes/archive/` and the historical rows in `.agents/model-log.md`) for `token-guardian` and confirm zero remaining live references.
5. Run `openspec validate remove-token-guardian-skill --strict` (the delta spec is already written as a planning artifact; syncing it into `openspec/specs/agent-governance/spec.md` happens at archive time, not during apply).
