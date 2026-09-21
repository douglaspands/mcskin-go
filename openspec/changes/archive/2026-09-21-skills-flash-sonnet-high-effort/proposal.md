# Proposal: Standardize Skills on Flash and Sonnet in High Effort Mode

## Why

Currently, skills and subagent dispatch across the project define a mix of models (`flash`, `pro`, `sonnet`, `opus`), with some skills (like `opsx-propose` and architecture tasks) still referencing `pro`/`opus`, while `feature-qa-reviewer` and other skills do not explicitly enforce high reasoning effort mode.

Na prática do projeto, a combinação de modelos rápidos e modernos (`flash` no Antigravity e `sonnet` no Claude Code) operando com orçamento de raciocínio profundo (**High Effort**) comprovou ser a relação **custo/benefício ideal para desenvolvimento**. Ela entrega o rigor técnico e analítico necessário (especialmente em revisões adversariais de QA e arquitetura) sem a latência e os custos elevados dos tiers Pro/Opus, e sem as deficiências de raciocínio dos modelos ultraleves.

## What Changes

- **Standardize Model Tier**: Enforce `flash` (Antigravity) and `sonnet` (Claude Code) across all skills, task annotations, and subagent dispatch guides, replacing any remaining references to `pro` and `opus`.
- **Enforce High Effort Mode**: Explicitly mandate High Effort / High Reasoning mode (`effort: high` / high thinking budget) for all executions, ensuring deep reasoning without switching to more expensive or slower architectures.
- **Specialize PO/QA Reviewer**: Explicitly update `.agents/skills/feature-qa-reviewer/SKILL.md` (and `.claude/skills/feature-qa-reviewer/SKILL.md`) to require `flash (High)` on Antigravity and `sonnet (High)` on Claude Code, emphasizing thorough adversarial evaluation for requirements, 6+ child usability, and Bedrock `.mcpack` compliance.
- **Synchronize Claude Code Skills**: Ensure `.claude/skills/` mirrors all `.agents/skills/` updates identically so both harnesses operate under identical governance.
- **Update Model Selection Matrix**: Adjust Decision Table, flowchart, task templates, and benchmark logging rules to standardize on `flash (High)` / `sonnet (High)`.

## Capabilities

### Modified Capabilities
- `token-optimization`: Add explicit requirement for standardized high-effort model governance (`flash` on Antigravity, `sonnet` on Claude Code) across all skills and subagent dispatches, prohibiting low-effort and non-standard model assignments.

## Impact

- **Affected Skills**:
  - `.agents/skills/model-selection/SKILL.md` and `.claude/skills/model-selection/SKILL.md`
  - `.agents/skills/feature-qa-reviewer/SKILL.md` and `.claude/skills/feature-qa-reviewer/SKILL.md`
  - `.agents/skills/openspec-propose/SKILL.md` and `.claude/skills/openspec-propose/SKILL.md`
  - `.agents/skills/openspec-apply-change/SKILL.md` and `.claude/skills/openspec-apply-change/SKILL.md`
  - `.agents/skills/prototype-iteration-loop/SKILL.md` and `.claude/skills/prototype-iteration-loop/SKILL.md`
- **Documentation & Governance**:
  - `AGENTS.md` and `GEMINI.md` references to subagents and model selection.
- **Dependencies**: Zero external dependencies (Go standard library and markdown/spec governance files only).
