# Design: Skills Flash and Sonnet in High Effort Mode

## Context

See `proposal.md` for motivation.
Currently, skills and subagent dispatch instructions across `.agents/skills/` and `.claude/skills/` contain scattered references to models:
- Some tasks in `model-selection` and `openspec-propose` still reference `pro` (Antigravity) and `opus` (Claude Code).
- `.claude/skills/` has drifted behind `.agents/skills/` in recent commits.
- Neither `feature-qa-reviewer` nor `model-selection` explicitly mandates high reasoning effort ("High Effort Mode") across both interactive sessions and subagent dispatches.

## Goals / Non-Goals

**Goals:**
- Unify all skills across `.agents/skills/` and `.claude/skills/` to strictly prescribe `flash` (Antigravity) and `sonnet` (Claude Code) in High Effort Mode.
- Explicitly emphasize in `feature-qa-reviewer` that PO/QA adversarial evaluations require High Effort Mode to rigorously test functional requirements, child usability (6+), Bedrock pack compliance, and regression suites.
- Align `model-selection` decision tables, mcskin task assignments, flowchart, and logging protocols to reflect `flash (High)` / `sonnet (High)`.
- Update `openspec-propose` and `openspec-apply-change` templates and task annotations to default to `flash (High)` / `sonnet (High)`.
- Keep `.claude/skills/` completely in sync with `.agents/skills/`.

**Non-Goals:**
- Modifying Go production code or converter logic.
- Adding third-party dependencies or external runtime tools.
- Re-enabling low-tier models (`flash_lite` / `haiku`), which remain strictly disabled.

## Decisions

### Decision 1: High Effort Mode Specification Across Harnesses
- **Antigravity**: Model token is `flash` (operating with Gemini Flash in High Effort / high reasoning mode, as configured via session settings `Gemini 3.8 Flash (High)` or explicit subagent reasoning prompt/configuration).
- **Claude Code**: Model enum is `sonnet` (`claude-sonnet-5`), operating with reasoning effort set to `high` (`/config` Effort Level → High, or explicit high effort instruction).
- **Rationale**: Combining fast/cost-effective frontier-class models (`flash`/`sonnet`) with deep reasoning tokens (high effort) produces superior task accuracy and adversarial rigor without the latency or pricing extremes of Pro/Opus.

### Decision 2: Elimination of `pro` / `opus` in Standard Decision Tables
- Previously, architecture/design (`opsx-propose`) and complex diffs retained `pro` / `opus`.
- We eliminate `pro` and `opus` from standard assignments and the flowchart. All tasks—from mechanical edits to architecture, design, and PO/QA reviews—now standardize on `flash (High)` / `sonnet (High)`.

### Decision 3: Strengthening `feature-qa-reviewer` Mandate
- The PO/QA review protocol in Section 2 is updated to mandate:
  - Antigravity: `role: "PO/QA Reviewer"`, `model: flash` in High Effort mode.
  - Claude Code: `subagent_type: "general-purpose"`, `model: "sonnet"` in High Effort mode.
  - The adversarial persona must utilize high reasoning capacity to scrutinize edge cases, cross-platform builds, child usability (6+), and Bedrock specification compliance without rushing or skipping checks.

### Decision 4: Cross-Harness Synchronization
- Every change made in `.agents/skills/` will be systematically mirrored in `.claude/skills/`.

## Risks / Trade-offs

- **[Risk] High effort consumes additional thinking tokens per subagent turn**
  → *Mitigation*: Flash and Sonnet token costs are dramatically lower than Pro/Opus. Furthermore, strict adherence to `token-guardian` (< 300 lines/file, compact test runner, zero vendor reads) prevents context bloat.
- **[Risk] Subagent dispatch tools may lack a direct `effort` parameter in certain CLI versions**
  → *Mitigation*: Specify high effort in the subagent system prompt/role description, while configuring the parent session default to High Effort.

## Migration Plan

1. Update `.agents/skills/model-selection/SKILL.md`.
2. Update `.agents/skills/feature-qa-reviewer/SKILL.md`.
3. Update `.agents/skills/openspec-propose/SKILL.md`, `openspec-apply-change/SKILL.md`, and `prototype-iteration-loop/SKILL.md`.
4. Mirror updated skills into `.claude/skills/`.
5. Update project documentation (`AGENTS.md`, `GEMINI.md`) if necessary.
6. Verify file formatting and token boundaries using `token-guardian`.
