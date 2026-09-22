# Spec Delta

## MODIFIED Requirements

### Requirement: Single-Source Governance Documentation
The project SHALL maintain exactly one canonical document containing AI agent governance policy (state graph, loop/iteration caps, permission tiers, host security protocol). Every other harness entry-point file SHALL contain only a pointer to that canonical document plus facts unique to that harness. Skill files (`.claude/skills/*/SKILL.md`, `.agents/skills/*/SKILL.md`) that restate canonical governance policy rather than providing operational guidance unique to the skill are subject to the same rule.

#### Scenario: Harness entry-point file contains only a pointer
- **WHEN** an agent harness reads its own entry-point file (`CLAUDE.md`, `GEMINI.md`, `.agents/governance.md`, or `openspec/config.yaml`'s `context`/`rules` fields)
- **THEN** the file SHALL reference the canonical governance document rather than restate its rules, except for facts unique to that harness (e.g. binary paths, hook file location)

#### Scenario: Governance rule updated in one place
- **WHEN** a governance rule changes (e.g. the loop iteration cap or a permission tier)
- **THEN** editing the canonical document SHALL be sufficient, and no other file SHALL require an edit to stay consistent with it

#### Scenario: Skill file restates canonical policy
- **WHEN** a skill file contains policy content that duplicates the canonical governance document (e.g. file-size budgets, command-economy rules, permission tiers) rather than skill-unique operational guidance
- **THEN** that policy content SHALL be removed from the skill and consolidated into the canonical document, leaving the skill with only the content not already covered there — or the skill SHALL be deleted entirely if nothing unique remains
