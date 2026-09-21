---
name: prototype-iteration-loop
description: Use when iterating on a web UI prototype after initial generation — reviewing, adjusting, or applying user feedback to screens in the mcskin interface.
---

# Prototype Iteration Loop

## Overview

Governs the review-adjust cycle for UI prototypes to keep context lean and prevent unbounded token accumulation.

---

## Loop Protocol

```
[Generate v1] → [Self-Review] → [Apply 1 Pass] → [User Feedback]
                                      ↓
                              [max 2 iterations]
                                      ↓
                            [HALT → ask user guidance]
```

### Rules

1. **Max 2 self-directed iterations** before requesting user input.
2. **Targeted diff output only**: report only what changed, not the entire file.
3. **One concern per iteration**: layout OR color OR interaction — not all at once.
4. **Halt condition**: if the same visual issue repeats across 2 iterations without resolution → stop and ask the user for a concrete decision.

---

## Self-Review Checklist (after each generation)

Run this before reporting to the user:

- [ ] All new CSS classes use existing variables (no hardcoded hex)
- [ ] New JS module ≤ 300 lines (`wc -l js/<feature>.js`)
- [ ] No `vendor/` imports in module code
- [ ] Mobile layout works at 375px width (visually verified by reading HTML structure)
- [ ] Text is legible for children 6+ (font-size ≥ 16px, contrast meets `--mc-text-white` on dark bg)
- [ ] Interactive elements have clear hover/active states

---

## Compact Diff Report Format

When reporting changes to the user, use this compact format — **never paste the full file**:

```
## Alterações em v2

### js/feature.js (+12 / -3 linhas)
- `initFeature()`: adicionado parâmetro `onClose` para fechar painel
- `_bind()`: novo listener no botão #confirm-btn

### style.css (+8 linhas)
- `.btn-feature`: nova classe seguindo padrão `.btn-minecraft`
- `@media (min-width: 768px)`: layout 2 colunas para desktop

### index.html (+5 linhas)
- Adicionado `<section id="feature-root">` no tab converter
```

---

## Subagent Offloading Rule

If a prototype requires **generating 3+ variations** of the same screen:
- Offload generation of each variation to a subagent in **High Effort Mode**:
  - **Antigravity**: a `research` or `self` subagent dispatched with `model: flash` in High Effort mode.
  - **Claude Code**: the `Agent` tool with `subagent_type: "general-purpose"` (or `"fork"` if the variation needs this conversation's context) and explicit `model: "sonnet"` in High Effort mode per `.agents/skills/model-selection/SKILL.md`.
- Receive only the final diff summary per variation.
- Never generate all variations inline in the parent conversation.

---

## "Done" Criteria for Prototypes

A prototype is **complete** when all of the following are true:

| Criterion | Check |
|---|---|
| Renders without JS errors | `console.error` free on load |
| All buttons have click handlers (even stubs) | no dead buttons |
| Mobile layout tested at 375px | no horizontal overflow |
| Matches Minecraft dark aesthetic | uses CSS vars, no raw hex |
| Accessible to 6+ children | font ≥ 16px, large tap targets (≥ 44px) |
| File within size budget | `wc -l` < 300 lines |

---

## Anti-Patterns (Stop immediately if doing these)

| Anti-Pattern | Why It Wastes Tokens |
|---|---|
| Paste full file after small change | 200–400 extra tokens per iteration |
| Read all JS modules for context | 1.500–3.000 tokens per session |
| Generate 3 variations inline | Triples context; use subagents instead |
| Re-explain design decisions each round | Use a 1-line changelog, not prose |
| Fix layout + color + interaction in one pass | Creates merge conflicts and ambiguous feedback |
