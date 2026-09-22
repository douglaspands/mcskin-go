---
name: token-guardian
description: Enforces codebase token economy, file size boundaries (< 300 lines / 15 KB), compact test execution, vendor library isolation, and subagent offloading guidelines across Google Antigravity and Anthropic Claude harnesses.
---

# Token Guardian (`token-guardian`)

Use this skill when designing new features, writing code, refactoring modules, or executing verification loops in `mcskin` to ensure the project maintains maximal context window efficiency and eliminates cognitive overload.

---

## 1. Core Principles: "Nascem Otimizadas" (Born Modularized)

Every new feature and refactored component in `mcskin` must be born modularized:
- **Never create monolithic source files**: No application source file in `cmd/`, `internal/`, or `static/js/` may exceed **300 lines of code** or **15 KB** in size.
- **Single Responsibility Principle (SRP)**: Each file must address one discrete architectural concern (e.g., converter, palette, 3D viewport, shutdown modal).
- **Zero Third-Party Bundler Requirement**: JavaScript modules must use standard browser ES6 `import` / `export` syntax without Node.js, Webpack, or Vite build steps.
- **Human-Readable Architecture**: Clean semantic identifiers, Go docstrings, and comprehensive JSDoc comments so developers and AI agents can rapidly grok any file in isolation.

---

## 2. Token Budget & File Size Thresholds

| File Category | Target Size | Hard Limit | Inspection Command |
|---|---|---|---|
| Orchestrator (`js/app.js`) | < 100 lines | 120 lines | `wc -l internal/web/static/js/app.js` |
| Feature Module (`js/*.js`) | 100–250 lines | 300 lines / 15 KB | `wc -l internal/web/static/js/*.js` |
| Go Components (`internal/*/*.go`) | 100–250 lines | 300 lines | `wc -l internal/**/*.go` |
| Vendor Libraries | N/A (isolated) | In `vendor/` only | Excluded from context reads |

### Vendor Isolation Rule
- All third-party minified libraries (e.g., `three.min.js`, `qrcode.js`) MUST reside in `internal/web/static/vendor/`.
- Agents MUST NOT read vendor libraries into conversational context or include them in general file searches.

---

## 3. Compact Test Execution & Token Savings

When verifying code or running test suites during iterative development:
- **Silent-on-Success**: Use `./scripts/test-compact.sh` instead of verbose `go test -v ./...`.
  - On PASS: Outputs a single concise line (`PASS: all packages OK`), saving 500–2,000 output tokens.
  - On FAIL: Surfaces only the failing package, test identifier, and assertion diff.
- **Targeted Test Runs**: When working on a single package, run only that package (e.g. `go test ./internal/web/...`).

---

## 4. Subagent Delegation & Context Offloading

- **Research & Exploration**: Delegate codebase exploration, multi-file inspection, and symbol discovery to subagents.
  - **Antigravity**: `subagent: research` or `role: "Codebase Researcher"`.
  - **Claude Code**: the `Agent` tool with `subagent_type: "Explore"` for read-only lookups, or `"fork"` when the exploration needs this conversation's existing context. Use the model the user has selected/configured in the harness (see AGENTS.md's Parallel Dispatch & Model Selection section) — no per-task model override.
- **Verbose Diagnostic Loops**: When troubleshooting unexpected behavior, run investigation loops inside an isolated subagent so that only the final root-cause conclusion is returned to the parent conversation context.
- **Progressive Disclosure**: Keep parent conversations lean and actionable.

---

## 5. Fast, Safe & Token-Economical I/O Protocol

To eliminate latency and maximize token efficiency during file operations:
- **Surgical Reading via Line Slices**:
  - Always read specific line slices (`StartLine`/`EndLine`, 30–60 lines) instead of loading entire files.
  - Locate line numbers first using quick `grep -n "symbol"` before reading slices.
  - Never re-read unchanged files already in conversational context; trust previous tool results and git diffs.
  - Exclude noise folders (`.git`, `bin`, `.venv`, `vendor/`) from all search operations (`--exclude-dir={.git,bin,.venv,vendor}`).
- **Surgical Writing via Contiguous Block Replacement**:
  - For existing files, always use `replace_file_content` targeting the smallest unique contiguous block.
  - Avoid `write_to_file` overwrites on multi-line files to prevent massive token payloads and roundtrip lag.
  - Batch cohesive changes within the same function into a single block replacement rather than multiple single-line calls.
- **Responsive Command Execution**:
  - Use bounded wait times (`WaitMsBeforeAsync: 3000` to `5000` ms) for synchronous Go commands to avoid task backgrounding.
  - Run compact, targeted tests (`go test -run TestX ./internal/...` or `./scripts/test-compact.sh`) during iterative work.
- **Token-Economical Command Catalog**: Always prefer low-overhead command flags that bound or summarize output:
  | Operation | Verbose Form (AVOID) | Economical Alternative (USE) | Token Savings |
  |---|---|---|---|
  | **Git Status** | `git status` | `git status -s` | ~80% (1 line per file) |
  | **Git Log** | `git log -n 5` | `git log -n 3 --oneline` | ~75% (hash + title only) |
  | **Git Diff Check** | `git diff` | `git diff --stat` (or `git diff -U2 <file>`) | ~85% (summary diff) |
  | **Current Branch** | `git branch` | `git branch --show-current` | ~80% (clean single word) |
  | **Testing** | `go test -v ./...` | `./scripts/test-compact.sh` (or `go test ./internal/...`) | ~90% (silent on pass) |
  | **Code Search** | `grep -rn "term" .` | `grep -rn --exclude-dir={.git,bin,.venv,vendor} -m 10 "term" <dir>` | ~85% (bounds results) |
  | **File Match List** | `grep -rn "term" <dir>` | `grep -l "term" <dir>/*` | ~75% (paths only) |
  | **Symbol Location** | Reading full file | `grep -n "symbol" <file>` | Pinpoints lines for slicing |
  | **File Listing** | `ls -la` / `find .` | `ls -1 <dir>` / `find <dir> -maxdepth 2` | ~70% (no noise) |
  | **File Length** | Reading full file | `wc -l <file>` | ~95% (single number) |
  | **File Preview** | Reading whole file | `head -n 25 <file>` / `tail -n 25 <file>` | ~80% (bounded peek) |

---

## 6. Token Guardian Verification Checklist

Before marking any task complete or archiving a change (`/opsx-archive`):
1. [ ] Check file line counts: `wc -l internal/web/static/js/*.js` (all < 300 lines).
2. [ ] Check vendor isolation: no minified vendor files outside `static/vendor/`.
3. [ ] Run compact tests: `./scripts/test-compact.sh` (outputs `PASS: all packages OK`).
4. [ ] Ensure no monolithic files exist in the changes.
5. [ ] Ensure surgical reads were used (line slices instead of full dumps).
6. [ ] Ensure surgical writes were used (contiguous replace instead of full overwrites).
7. [ ] Ensure token-economical command alternatives were used (`git status -s`, `git log -n 3 --oneline`, etc.).
