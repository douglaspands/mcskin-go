---
name: model-selection
description: Use when dispatching any subagent to choose the most economical model for the task, and to log the decision for future benchmarking.
---

# Model Selection

## Overview

Choose the **cheapest model that can succeed** at a given task, **with a hard floor of Sonnet-tier (`flash`/`sonnet`) — never the cheap/fast tier**. Log every decision so future sessions can benchmark whether the choice was correct.

> [!IMPORTANT]
> **Always specify the model explicitly** when dispatching a subagent. An omitted model silently inherits the session's model — often the most expensive.

> [!WARNING]
> **User directive (this project): never dispatch the Cheap/fast tier.** `flash_lite` (Antigravity) and `haiku` (Claude Code) are **disabled for this project** — always use `flash`/`sonnet` or higher, on both harnesses. This applies everywhere a tier decision is made below: the Decision Table, the mcskin-Specific Assignments, and the Fallback Protocol all treat **Mid / standard as the floor**, not Cheap/fast. Rows below that still document the retired tier for historical/benchmark context, but must not be selected for new dispatches.

---

## Available Models (Antigravity tiers)

| Token | Model | Speed | Reasoning | Status |
|---|---|---|---|---|
| ~~`flash_lite`~~ | ~~Gemini Flash Lite~~ | ⚡⚡⚡ fastest | Minimal — single-step, lookup | 🚫 **Disabled for this project** — use `flash` instead |
| `flash` | Gemini Flash | ⚡⚡ fast | Moderate — multi-step, clear spec | ✅ **Floor tier** |
| `pro` | Gemini Pro | 🐢 slower | Deep — judgment, architecture | ✅ |
| `inherit` | Session default | varies | **Avoid**: inherits parent cost | — |

---

## Cross-Harness Model Mapping

Use this table to translate a tier decision into the correct model name for each harness.

Claude Code is on the **Claude 5 family** (+ Haiku 4.5): `claude-opus-5`, `claude-sonnet-5`, `claude-haiku-4-5-20251001`. But subagent dispatch in Claude Code does not take a full model ID — the `Agent` tool's `model` parameter only accepts the short tier enum: `sonnet` | `opus` | `haiku` | `fable`. Use the enum value when dispatching; use the full ID only when logging/benchmarking or citing the model by name in prose.

| Tier | Antigravity | Claude Code dispatch (`Agent` tool `model` param) | Claude Code full model ID (logging only) | Rationale |
|---|---|---|---|---|
| ~~Cheap / fast~~ 🚫 | ~~`flash_lite`~~ | ~~`haiku`~~ | ~~`claude-haiku-4-5-20251001`~~ | **Disabled for this project.** Use Mid / standard instead, even for single-step or transcription-like tasks. |
| **Mid / standard (floor)** | `flash` | `sonnet` | `claude-sonnet-5` | Multi-step, prose spec, integration — also the new floor for anything that would have been Cheap/fast |
| **Capable / deep** | `pro` | `opus` | `claude-opus-5` | Architecture, QA review, design |

> [!NOTE]
> **Claude Code** does not use Antigravity's `flash_lite`/`flash`/`pro` tokens.
> When dispatching a subagent via the `Agent` tool on Claude Code, pass the short enum (`model: "haiku"` / `"sonnet"` / `"opus"`) — never the Antigravity token and never the full model ID string.
> `fable` (`claude-fable-5-1`) is a distinct persona model, not a cost tier — only use it if a task explicitly calls for it.
> Omitting `model` on a non-`fork` agent falls back to the session/default model — always set it explicitly per the Decision Table below.

> [!IMPORTANT]
> **Project preference (Claude Code, user-set default)**: for the main interactive session on this project, the user prefers **Sonnet with high reasoning effort** as the standing default — set via `/config` (Model → Sonnet, Effort Level → High), not per-dispatch. When the Decision Table below selects the **Mid / standard** tier for a Claude Code subagent dispatch, prefer `sonnet` at `high` effort over the model's own default effort when the harness exposes an effort control for that dispatch path (the `Agent` tool's `model` parameter itself has no effort field — this applies to the main session and to any dispatch mechanism that does expose one).

### Log both harness and model name

When on Claude Code, record entries in `.agents/model-log.md` with the prefix `[claude]`, using the full model ID for traceability:

```
| 2026-09-20 | [claude] Write Go unit test | claude-haiku-4-5-20251001 | 1 file, mocked spec | ok |
```

This allows the benchmark to separate Antigravity vs Claude performance per tier.

---

## Decision Table

Match the task to the **first row** whose signals apply.

| Task Type | Signals | Model | Rationale |
|---|---|---|---|
| **Lookup / grep** | single question, read-only, no synthesis | `flash` | Floor tier — Cheap/fast is disabled for this project |
| **Mechanical implementation** | 1–2 files, complete spec with exact values, transcription-like | `flash` | Floor tier — Cheap/fast is disabled for this project |
| **Single-file fix** | clear bug, isolated change, targeted test | `flash` | Floor tier — Cheap/fast is disabled for this project |
| **Standard implementation** | prose spec, 2–4 files, requires test authoring | `flash` | Needs multi-step judgment |
| **Review (small diff)** | < 100 lines changed, mechanical check | `flash` | Diff is the context |
| **Integration task** | multi-file coordination, interface contracts, pattern matching | `flash` | Cross-file reasoning |
| **Review (complex diff)** | concurrency, security, cross-package, subtle behavior | `flash` | Subtle failure modes |
| **Debugging (unknown root cause)** | non-obvious failure, multi-system interaction | `flash` | Hypothesis + exploration |
| **Architecture / design** | new package, API design, spec authoring, `opsx-propose` | `pro` | Deep judgment required |
| **Final branch review** | whole-branch diff before merge | `flash` | Broadest scope |
| **Fix-loop escalation (round 4–5)** | same implementer failed 3× | tier above previous | Fresh eyes + capability bump |

> [!TIP]
> **Turn count beats token price.** A cheap-tier model taking 3× more turns on a multi-step task can cost *more* than `flash`/`sonnet`. `flash`/`sonnet` is the floor for every task on this project, prose-driven or not.

---

## Graph Engineering: Parallel Waves

Model tier and parallelism are separate decisions — pick a task's tier from the Decision Table above, *then* decide whether it can run alongside other tasks. `openspec-propose` runs this pass automatically (see its own SKILL.md step 8) right after model annotation, over `tasks.md`'s task list.

**Building waves:**
- Two tasks go in the same wave only if they touch **disjoint files** and neither consumes the other's output (no shared state, no read-after-write dependency).
- When file overlap or dependency is unclear, keep both sequential (separate waves). A wrong "parallel" call risks two writers clobbering the same file — this is a real, observed failure mode, not a theoretical one.
- Waves run in order; a wave's own tasks all start together.

**Dispatch per harness, once waves exist:**
- **Antigravity**: dispatch a wave's tasks as parallel subagents via its own graph-engineering / parallel task execution mechanism.
- **Claude Code**: dispatch a wave's tasks as separate `Agent` tool calls **in one assistant message** — parallelism only happens for tool calls issued together in the same turn, never across turns. Use `subagent_type: "fork"` only when a task needs this conversation's existing context; otherwise use a fresh type (e.g. `general-purpose`) to avoid paying for unneeded context. Always pass `model` explicitly (the short enum: `sonnet`/`opus` — never `haiku`, disabled for this project).

**Token-optimization rules:**
- Never parallelize a wave of size 1 — dispatch it directly; subagent-launch overhead isn't worth it.
- Wave membership follows the file-conflict analysis, not list adjacency.
- Log every dispatch in a wave (model + outcome) in `.agents/model-log.md` before starting the next wave.

---

## Token Optimization (always-on, independent of model tier)

Model-tier selection is only one lever. **Always apply these regardless of which tier a task lands on** — the floor being `flash`/`sonnet` (never Cheap/fast) makes per-token discipline more important, not less, since the cheap escape hatch is gone.

- **Scope every subagent prompt to only what it needs.** Don't paste unrelated context "just in case" — a fresh agent that doesn't need the whole conversation should get a short, targeted brief, not a context dump.
- **Prefer `fork` over a fresh agent only when the task genuinely needs this conversation's existing context.** A fork is cheap because it shares the parent's prompt cache — but dispatching a fork for a task that could run cold wastes the cache-sharing benefit on padding it didn't need.
- **Never re-read a file already in context** unless a tool result or a system note says it changed on disk. Trust what's already been read this session.
- **Use targeted reads over full-file dumps**: `grep`/`Read` with `offset`/`limit`, not whole-file reads, when only a section is relevant.
- **Prefer compact/silent-on-success tooling** (e.g. `./scripts/test-compact.sh` over `go test -v ./...`) while iterating — verbose output costs tokens on every single run, not just the first.
- **Batch independent tool calls into one message** (parallel `Agent` dispatches, or several read-only lookups) instead of spreading them across turns — this isn't just about wall-clock time, each extra turn re-sends the accumulated conversation.
- **Delegate verbose investigation/debugging loops to a subagent** (per `token-guardian`) so only the final conclusion re-enters the parent conversation — not the exploratory back-and-forth that got there.
- **Prompt caching**: this session's TTL is fixed by the harness (see `ScheduleWakeup` tool docs if applicable) — don't schedule extra activity purely to "keep the cache warm"; it doesn't help and adds tokens.

---

## Quick Decision Flowchart

```
Is the task purely read-only (grep, lookup)?
  └── YES → flash (Cheap/fast tier is disabled for this project)

Does the plan contain the complete code to write (transcription)?
  └── YES → flash

Does the task touch only 1 file with a clear, self-contained spec?
  └── YES → flash

Does the task require test authoring or multi-file coordination?
  └── YES → flash

Does the task require design judgment, root-cause investigation,
            or reviewing a complex diff?
  └── YES → flash

Is this a fix-loop round ≥ 4?
  └── YES → one tier above whoever got stuck (flash)
```

---

## mcskin-Specific Assignments

Assignments calibrated for this project's common task types:

| mcskin Task | Model |
|---|---|
| `opsx-explore` brainstorming | `flash` |
| `opsx-propose` (spec + design + tasks) | `pro` |
| Write Go unit test (mocked, single package) | `flash` |
| Implement Go function from complete spec | `flash` |
| Implement Go function from prose description | `flash` |
| Refactor existing Go module | `flash` |
| Web UI: add HTML/CSS panel from scaffold | `flash` |
| Web UI: new JS module from prose brief | `flash` |
| Web UI prototype generation (multi-file) | `flash` |
| `feature-qa-reviewer` (PO/QA eval) | `flash` |
| `bedrock-skin-pack-verifier` (script run) | `flash` |
| Fix-loop remediation (rounds 1–3) | same as implementer |
| Fix-loop remediation (rounds 4–5) | one tier up |
| Final branch review (`opsx-archive`) | `flash` |
| Research / codebase exploration | `flash` |

---

## Decision Log Format

**Before dispatching a subagent**, append one line to `.agents/model-log.md` (create if absent):

```
| <YYYY-MM-DD> | <task-id or short> | <model> | <signal> | pending |
```
Update `pending` → outcome after task completes.

### Outcome Values

| Value | Meaning |
|---|---|
| `ok` | Correct choice |
| `ok-overtier` | Cheaper tier would have worked |
| `fail-undertier` | Had to escalate |
| `fail-other` | Unrelated to model capability |

---

## Persistent Benchmark (JSONL)

Append one JSON line per dispatch to `.agents/model-benchmark.jsonl`:

```json
{"date":"2026-09-20","session":"opsx-apply","change":"add-validator",
 "task":"task-3","harness":"antigravity","model_tier":"flash",
 "model_name":"flash","signal":"1-file mechanical","annotated_in_spec":true,
 "outcome":"pending","turns":null,"escalated_to":null,"notes":""}
```

After task completes, append an amended entry with `"amended":true` and the resolved `outcome`, `turns`, and `escalated_to`. Do not edit lines in place.


---

## Benchmark Protocol

Run a benchmark review at the end of any `opsx-apply` session or on demand.

### Step 1 — Rodar o relatório de benchmark

```bash
# Relatório completo (requer Python 3):
python3 .agents/skills/model-selection/scripts/benchmark-report.py

# Entradas resolvidas — inspeção manual rápida:
grep -v '"outcome":"pending"' .agents/model-benchmark.jsonl | grep -v '^{"version"'
```

O script `benchmark-report.py` imprime:
- Tabela por tier (ok / ok-overtier / fail-undertier / fail-other / avg turns)
- Alertas automáticos de ajuste (undertier > 30% ou overtier > 50%)
- Lista de escalações registradas
- Resumo por harness (Antigravity vs Claude)


### Step 2 — Score each decision

For each completed entry:
- `ok` → correct choice ✅
- `ok-overtier` → could save cost by dropping one tier ⬇️
- `fail-undertier` → undertier cost: count escalation turns wasted 🔺
- `fail-other` → noise, exclude from model-selection scoring

### Step 3 — Summary report format

```markdown
## Benchmark Summary — <date range>

| Model | Tasks assigned | ok | ok-overtier | fail-undertier |
|---|---|---|---|---|
| flash_lite | N | N | N | N |
| flash      | N | N | N | N |
| pro        | N | N | N | N |

### Insights
- Most common undertier signal: <describe>
- Most common overtier signal: <describe>
- Recommended table adjustment: <specific row to revise>
```

### Step 4 — Update the Decision Table if needed

If `fail-undertier` rate for a task type exceeds **30%** across 5+ samples → bump that row up one tier.
If `ok-overtier` rate exceeds **50%** across 5+ samples → drop that row down one tier.

---

## Fallback Protocol (limite de tokens / rate limit)

Quando o harness principal atinge seu limite de quota ou rate limit, aplique este protocolo antes de abandonar a tarefa.

### Gatilhos de Fallback

| Sinal | Causa provável | Ação |
|---|---|---|
| `429 Too Many Requests` | Rate limit de API | Aguardar 60s; se persistir → fallback |
| `Resource exhausted` | Quota diária esgotada | Fallback imediato para outro harness |
| Contexto > 90% da janela | Context window quase cheio | Comprimir contexto OU fallback |
| Subagente não responde (timeout > 60s) | Harness indisponível | Fallback imediato |

### Mapeamento de Fallback

```
Antigravity (limite atingido)  →  Claude Code (fallback)
Claude Code (limite atingido)  →  Antigravity (fallback)
```

| Tier original | Antigravity → Claude fallback | Claude → Antigravity fallback |
|---|---|---|
| ~~Cheap / fast~~ | — (tier disabled for this project; nothing dispatches here) | — |
| Mid / standard (floor) | `flash` → `sonnet` (`claude-sonnet-5`) | `sonnet` → `flash` |
| Capable / deep | `pro` → `opus` (`claude-opus-5`) | `opus` → `pro` |

> [!IMPORTANT]
> **Mantenha o mesmo tier**: ao fazer fallback, preserve a capacidade do modelo.
> Não degrade de `pro` para `haiku`/`flash_lite` — esse tier está desabilitado neste projeto, mesmo como fallback.

### Handoff de Contexto (como transferir a tarefa)

O modelo de fallback não herda o contexto da sessão atual. Monte um handoff explícito:

```markdown
## Handoff Context

**Harness original:** Antigravity (flash) — limite de rate atingido
**Tarefa:** <descrição completa da task>
**Estado atual:** <o que já foi feito, arquivos modificados>
**Próxima ação esperada:** <o que o subagente deve fazer agora>
**Arquivos relevantes:** <lista de paths>
**Restrições ativas:** TDD, zero deps externas, < 300 linhas/arquivo
**Ledger:** .agents/model-log.md linha <N> (outcome: pending → atualizar após)
```

### Log de Fallback

Registre o fallback com outcome `fail-other` na entrada original E crie uma nova entrada para o fallback:

```
| 2026-09-20 | opsx-apply task-3       | flash                     | prose spec, 2 files  | fail-other(ratelimit) |
| 2026-09-20 | opsx-apply task-3 [FB]  | claude-sonnet-5 (sonnet)  | handoff from AGY     | ok                    |
```

### Quando NÃO fazer fallback

- **Erro de lógica / bug no código** → não é problema de harness; não faça fallback
- **Spec ambígua** → pause e pergunte ao usuário antes de trocar de harness
- **Primeira tentativa de rate limit** → aguarde 60s antes de acionar fallback

---

## Anti-Patterns

| Anti-Pattern | Cost | Fix |
|---|---|---|
| Omitting model → `inherit` | Pays top-tier for all subagents silently | Always specify explicitly |
| Using `pro` for every task "to be safe" | 3–5× over-budget per session | Apply the decision table |
| Dispatching `flash_lite`/`haiku` (Cheap/fast tier) | **Disabled for this project** — violates the user's stated floor, regardless of how trivial the task looks | Use `flash`/`sonnet` as the floor for every task |
| Not logging the decision | No benchmark data; can't improve | Log every dispatch |
| Not updating outcome after task | Log becomes "all pending"; useless | Update outcome before next task |
