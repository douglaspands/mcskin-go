---
name: model-selection
description: Use when dispatching any subagent to choose the most economical model for the task, and to log the decision for future benchmarking.
---

# Model Selection

## Overview

All tasks and subagent dispatches across this project are standardized on **Flash-tier (Antigravity) and Sonnet-tier (Claude Code) in High Effort Mode**.

> [!IMPORTANT]
> **Project Standard: `flash (High)` / `sonnet (High)`.**
> - **Antigravity**: Always dispatch subagents with `model: flash` in High Effort mode.
> - **Claude Code**: Always dispatch subagents via the `Agent` tool with `model: "sonnet"` in High Effort mode (with `/config` Effort Level → High in interactive sessions).
> - **Prohibited Tiers**: Cheap/fast models (`flash_lite`, `haiku`) and heavy/expensive models (`pro`, `opus`) are strictly retired from standard selection. High-effort reasoning on fast frontier models provides optimal precision and cost efficiency.

---

## Available Models & Cross-Harness Mapping

| Tier / Harness | Antigravity Token | Claude Code (`Agent` param) | Mode / Effort | Status |
|---|---|---|---|---|
| ~~Cheap / fast~~ | ~~`flash_lite`~~ | ~~`haiku`~~ | Minimal | 🚫 **Disabled for this project** |
| **Standard (Uniform)** | `flash` | `sonnet` | **High Effort / Deep Reasoning** | ✅ **Standard for all tasks** |
| ~~Heavy / expensive~~ | ~~`pro`~~ | ~~`opus`~~ | High | 🚫 **Prohibited** — use `flash (High)` / `sonnet (High)` |
| `inherit` | `inherit` | (omitted) | Session default | ⚠️ Avoid silent inheritance; specify explicitly |

### Subagent Dispatch Parameters
- **Antigravity**: Pass `model: "flash"`. Subagents run with High Effort / deep reasoning prompts.
- **Claude Code**: Pass `model: "sonnet"` to the `Agent` tool. In interactive sessions, configure `/config` (Model → Sonnet, Effort Level → High).
- **Benchmark Logging**: Use full IDs in `.agents/model-log.md` (`gemini-3.8-flash (High)` or `[claude] claude-sonnet-5 (High)`).

---

## Decision Table

All task types across the development lifecycle are handled by the standardized High Effort tier. Match the task type to verify the required reasoning depth:

| Task Type | Signals | Antigravity Model | Claude Code Model | Reasoning Focus |
|---|---|---|---|---|
| **Lookup / grep** | single query, read-only | `flash` (High) | `sonnet` (High) | Fast search, zero hallucination |
| **Mechanical edit** | 1–2 files, exact spec | `flash` (High) | `sonnet` (High) | Exact transcription, zero regression |
| **Single-file fix** | isolated bug, targeted test | `flash` (High) | `sonnet` (High) | Root cause isolation |
| **Standard task** | prose spec, 2–4 files, tests | `flash` (High) | `sonnet` (High) | TDD cycle & clean modularity |
| **Review (diff)** | small or complex diff | `flash` (High) | `sonnet` (High) | Subtle edge cases, concurrency |
| **Integration** | multi-file contracts | `flash` (High) | `sonnet` (High) | Cross-package cohesion |
| **Debugging** | unknown root cause | `flash` (High) | `sonnet` (High) | Systematic hypothesis testing |
| **Architecture / design** | `opsx-propose`, specs, tasks | `flash` (High) | `sonnet` (High) | Deep judgment & dependency analysis |
| **Fix-loop remediation** | loop attempts 1–3 | `flash` (High) | `sonnet` (High) | Targeted repair within 3-attempt cap |

---

## Quick Decision Flowchart

```
Start Task / Subagent Dispatch
  │
  ├── Cheap tier requested? ───> 🚫 Prohibited (flash_lite / haiku disabled)
  ├── Heavy tier requested? ───> 🚫 Prohibited (pro / opus replaced by High Effort)
  │
  └── Standard Dispatch ───────> Antigravity: flash (High Effort)
                                 Claude Code: sonnet (High Effort)
```

---

## mcskin-Specific Assignments

Standardized assignments across project capabilities:

| mcskin Task | Antigravity Model | Claude Code Model |
|---|---|---|
| `opsx-explore` brainstorming | `flash` (High) | `sonnet` (High) |
| `opsx-propose` (spec + design + tasks) | `flash` (High) | `sonnet` (High) |
| Write Go unit test (mocked, TDD RED) | `flash` (High) | `sonnet` (High) |
| Implement Go logic (TDD GREEN) | `flash` (High) | `sonnet` (High) |
| Web UI: HTML/CSS zero-scroll layout | `flash` (High) | `sonnet` (High) |
| Web UI: 2D/3D editor canvas & math | `flash` (High) | `sonnet` (High) |
| `bedrock-skin-pack-verifier` execution | `flash` (High) | `sonnet` (High) |
| Fix-loop remediation (rounds 1–3) | `flash` (High) | `sonnet` (High) |
| Final branch review (`opsx-archive`) | `flash` (High) | `sonnet` (High) |

---

## Graph Engineering: Parallel Waves

Model standardization and parallelism are decoupled:
1. **Wave Independence**: Two tasks run in the same wave only if they touch disjoint files and have no shared state or read-after-write dependency.
2. **Conservative Default**: If file overlap is possible, run sequentially.
3. **Dispatch per Harness**:
   - **Antigravity**: Launch independent tasks as parallel subagents.
   - **Claude Code**: Dispatch tasks as separate `Agent` calls in a single assistant turn.
4. **Log every dispatch**: Append to `.agents/model-log.md` before launching a wave.

---

## Token Optimization Rules

Regardless of model tier, strict token conservation applies:
- **Scope briefs tightly**: Provide only relevant files and requirements, not entire transcripts.
- **Born Modularized**: Ensure files stay < 300 lines and < 15 KB.
- **Silent on success**: Use `./scripts/test-compact.sh` during iterative testing.
- **No vendor reads**: Never load `internal/web/static/vendor/` into AI context.
- **Offload exploratory loops**: Run verbose investigations in subagents so parent context receives only the concise summary.

---

## Logging & Benchmarking Protocol

### Decision Log Format (`.agents/model-log.md`)
Before dispatching:
```markdown
| <YYYY-MM-DD> | <change>/<task-desc> | <model> | <signal> | pending |
```
After task completes, resolve `pending` to:
- `ok`: Successful execution with `flash (High)` / `sonnet (High)`.
- `fail-undertier`: Rare failure requiring user escalation.
- `fail-other`: Blocker unrelated to model capability (e.g., environment, network).

### Persistent JSONL Benchmark (`.agents/model-benchmark.jsonl`)
```json
{"date":"2026-09-21","session":"opsx-apply","change":"<name>","task":"<id>","harness":"antigravity","model_tier":"flash","model_name":"gemini-3.8-flash (High)","signal":"governance","annotated_in_spec":true,"outcome":"ok","turns":1,"escalated_to":null,"notes":""}
```

---

## Fallback Protocol (Quota / Rate Limits)

If an API quota or rate limit is reached:
1. `429 Too Many Requests`: Wait 60 seconds before retrying.
2. `Resource exhausted`: Switch harness while preserving high reasoning effort:
   - **Antigravity** (`flash` High) ➔ **Claude Code** (`sonnet` High)
   - **Claude Code** (`sonnet` High) ➔ **Antigravity** (`flash` High)
3. Do not downgrade to `haiku` or `flash_lite` during fallback.

---

## Anti-Patterns

| Anti-Pattern | Impact | Proper Practice |
|---|---|---|
| Omitting model parameter | Uncontrolled inheritance | Specify `flash` or `sonnet` explicitly |
| Using `pro` or `opus` | 3–5x cost and higher latency | Use `flash` / `sonnet` in High Effort mode |
| Dispatching `flash_lite` / `haiku` | Quality failures and re-work | Disabled; standard floor is `flash` / `sonnet` |
| Low reasoning effort | Shallow analysis in QA and architecture | Enforce High Effort / deep thinking budget |
| Skipping log update | Broken benchmark metrics | Always update `pending` → `ok` |
