# Gemini & Antigravity Project Rules: `mcskin`

## 1. Command Execution & Safety Protocol

### Safe & Auto-Allowed Commands (Tier 1)
You are explicitly permitted and encouraged to autonomously execute harmless development commands:
- **Go toolchain**:
  - `go test ...` (e.g. `go test -v ./...`, `go test -run TestX ./internal/...`)
  - `go build ...` (e.g. `go build ./...`, `go build -o bin/mcskin ./cmd/...`)
  - `go vet ...`
  - `go run ...`
  - `go fmt ...`
  - `go mod tidy`, `go mod verify`, `go mod download`
  - `go version`, `go doc`, `go list`
- **Build automation**:
  - `make`, `make test`, `make build`, `make build-linux`, `make build-windows`, `make lint`, `make clean`
  - `./scripts/test-compact.sh`, `./scripts/package-mac-app.sh`, `./scripts/run-regression-suite.sh`
  - `./bin/mcskin ...`
  - `./bin/png-to-mcpack ...`
- **OpenSpec**:
  - `openspec ...`
- **Node.js**:
  - `node ...` (e.g. `node --test ...`, `node --check ...`, script executions)
- **Python & uv**:
  - `uv ...` (e.g. `uv venv .venv`, `uv pip ...`)
  - `python3 ...` (e.g. python scripts, `.venv/bin/python ...`)
- **Browser Automation**:
  - `google-chrome ...` (e.g. `google-chrome --headless=new ...`)
- **Git & GitHub (safe inspection & PR workflow)**:
  - `git status`, `git diff`, `git log`, `git show`, `git branch`, `git add`, `git commit`
  - `git checkout -b feat/...`, `git checkout main`, `git pull origin main`, `git merge --squash ...`, `git push origin feat/...`
  - `gh pr create ...`, `gh pr view ...`, `gh pr status`
- **Inspections**:
  - `ls`, `cat`, `head`, `tail`, `grep`, `find`, `which`, `stat`, `file`, `unzip -l`, `unzip -p`, `wc`, `diff`

### Destructive & Strictly Prohibited Commands (Tier 3)
The following commands are hard-blocked by project policy. You must NEVER propose or execute them:
- Direct commits to `main` branch (`git commit` on `main`). All commits must occur on a feature branch (`feat/...`) or via PR merge.
- `rm -rf` targeting root, current directory, parent directory, `*`, or `.git` (e.g. `rm -rf /`, `rm -rf *`, `rm -rf .git`). Only targeted removal of build outputs (`bin/`, `files/*.mcpack`) is allowed.
- Destructive git operations: `git push --force`, `git push -f`, `git reset --hard`, `git clean -f`, `git branch -D`.
- Destructive disk operations: `mkfs`, `dd if=`, `fdisk`, `parted`.
- Privilege escalation: `sudo`, `su`.
- System modifications outside repository boundary.

---

## 2. Methodology & Architecture
- **TDD First**: Always write tests in `*_test.go` and verify RED before implementing code (GREEN).
- **Strict Unit Test Isolation (100% Mocked / Zero Integration)**:
  - Unit tests MUST NOT have external integration. All external dependencies, filesystem I/O, or data streams must be mocked using in-memory representations (`io.Reader`, `bytes.Buffer`, mock structs).
  - Unit tests must NEVER touch the network, spawn external system processes, or write to persistent filesystem paths outside transient ephemeral test runners (`t.TempDir()`).
  - Integration tests must be strictly segregated from unit tests (e.g., dedicated integration test suites or files).
- **Zero Dependencies**: Go standard library only.
- **Cross-Platform**: Windows (`.exe`) and Linux paths (`filepath.ToSlash` for ZIP entries).
- **Standardized High-Effort Execution (`flash` / `sonnet`)**:
  All subagents, task implementations, and skill executions (including `feature-qa-reviewer`) MUST strictly use **`flash` (Antigravity)** and **`sonnet` (Claude Code) in High Effort Mode** (high reasoning effort / thinking budget). The cheap tier (`flash_lite`, `haiku`) and heavy tier (`pro`, `opus`) are strictly prohibited per `.agents/skills/model-selection/SKILL.md`.
- **OpenSpec Branching & Squash Merge Protocol**:
  - **First Step on `/opsx-propose`**: Before creating any new feature branch, the harness MUST ensure that the local `main` branch is checked out and updated with the latest remote changes (`git checkout main && git pull origin main`):
    ```bash
    git checkout main && git pull origin main
    git checkout -b feat/<nome_spec>
    ```
    This guarantees that the feature branch branches from the freshest codebase, prevents branch divergence, and allows immediate rollback if anything deviates from expectations.
  - **Automatic PO/QA Review upon Implementation Completion**:
    Immediately upon finishing all tasks in `/openspec-apply-change` (or `/opsx-apply`), the harness MUST automatically execute the `feature-qa-reviewer` skill in High Effort Mode (`role: "PO/QA Reviewer"` with `flash (High)`) to rigorously evaluate requirements, child usability (6+), Minecraft UX, and Bedrock `.mcpack` compliance.
    - **Bounded Loop Remediation (Anti-Infinite Loop Protection)**:
      In case defects or rejections are detected, enter a bounded remediation loop using Loop Engineering:
      1. Maximum 3 iterations (`max_attempts = 3`).
      2. 2-Strike Halting: Halt execution immediately if the identical error or rejection recurs across 2 attempts without progress.
      3. Scope Boundary: Halt if fix requires expanding requirements beyond the spec (trigger `/openspec-update-change`).
      4. Targeted Verification: Re-run tests before re-evaluating with QA.
    - **Apply Phase Boundary**: Upon receiving formal approval (`APROVADO`), commit the implementation and inform the user to run `/opsx-archive`. **NEVER automatically archive or solicit PR/merge during the apply phase.**
  - **Final Step ONLY on `/opsx-archive`**: After the user executes `/opsx-archive` and all spec synchronization and archiving steps are completed:
    1. **Mandatory Archive Commit on Feature Branch**: All git updates (moving change to `archive/` and syncing `openspec/specs/`) MUST be committed directly on `feat/<nome_spec>` BEFORE pushing or opening the PR:
       ```bash
       git add openspec/
       git commit -m "docs(openspec): archive change <nome_spec> and sync main specs"
       ```
    2. Explicitly request user confirmation to choose between:
       - **Local Squash Merge into `main`**:
         ```bash
         git checkout main && git merge --squash feat/<nome_spec>
         ```
       - **Create a Pull Request on GitHub**:
         ```bash
         git push origin feat/<nome_spec>
         gh pr create --base main --head feat/<nome_spec> --title "feat: <nome_spec>"
         git checkout main
         ```
    3. **Post-PR Invariant (No Commits on Branch, ZERO Commits on `main`)**:
       - Once the PR is created and returning to `main`, **NEVER make any further commits on the feature branch** (it is frozen awaiting review/merge).
       - **ABSOLUTELY NEVER COMMIT DIRECTLY ON `main`**. The `main` branch is strictly protected. All git updates must happen inside the archive command on the feature branch. The working tree on `main` must remain clean.

---

## 3. Host & Environment Security Protocol for AI Harnesses
To guarantee the safety and integrity of the host machine and execution environment:
- **Workspace Confinement**: Agents are strictly confined to the repository root (`/home/douglas/Workspace/minecraft/png-to-mcpack`). Never access, modify, or delete files outside this boundary (especially `/etc`, `/usr`, `~/.ssh`, `~/.bashrc`, `~/.config`, or other workspace directories).
- **Zero Privilege Escalation**: Commands invoking `sudo`, `su`, or modifying system user permissions (`setuid`, `chmod 777`) are strictly prohibited and hard-blocked.
- **Process & Resource Protection**:
  - No background daemonizing, shell hooking, persistence mechanisms, or crontab modifications.
  - Commands must execute synchronously with bounded timeouts (maximum 30s) to prevent hangs or resource exhaustion.
  - Air-gapped execution: development, tests, and builds must never initiate outbound network connections.
- **Filesystem Safety & Idempotence**:
  - All automated writes must be scoped and idempotent.
  - Destructive wildcards (`rm -rf *`, `rm -rf /`, `rm -rf .`) are completely blocked by policy and mechanical gates.

---

## 4. Fast, Safe & Token-Economical I/O Directives
To accelerate file operations and prevent latency or token waste:
- **Surgical Reading via Targeted Slices**:
  - Always read specific line slices (`StartLine` / `EndLine`, typically 30–60 lines) instead of loading entire files.
  - Locate line numbers first using quick `grep -n "symbol"` before reading slices.
  - Never re-read unchanged files already in conversational context; trust previous tool results and git diffs.
  - Exclude noise folders (`.git`, `bin`, `.venv`, `vendor/`) from all search operations.
- **Surgical Writing via Contiguous Block Replacement**:
  - For existing files, always use `replace_file_content` targeting the smallest unique contiguous block.
  - Avoid `write_to_file` overwrites on multi-line files to prevent massive token payloads and harness roundtrip lag.
  - Batch cohesive changes within the same function into a single block replacement rather than multiple single-line calls.
- **Responsive Command Execution**:
  - Use bounded wait times (`WaitMsBeforeAsync: 3000` to `5000` ms) for synchronous Go commands to avoid task backgrounding.
  - Run compact, targeted tests (`go test -run TestX ./internal/...` or `./scripts/test-compact.sh`) during iterative work.

### Token-Economical Command Catalog
Always prefer concise, flag-optimized commands over verbose defaults:

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

## 5. Token Conservation & Proactive Skill Creation
- **Proactive Skill Proposal**: Whenever you identify a repetitive, multi-step, or verbose workflow where creating a specialized **SKILL** (`.agents/skills/<name>/SKILL.md`) would conserve context window tokens through progressive disclosure, you MUST:
  1. Clearly explain the workflow opportunity and the token savings benefit.
  2. Propose the name, scope, and structure of the recommended SKILL.
  3. **Specify Required Autonomy Permissions**: Inform the exact commands, scripts, and file access needed for the SKILL to run autonomously (Tier 1).
  4. Explicitly ask for user approval for both the skill and its permissions before implementing it.
- **Autonomous Permission Provisioning**: Upon user approval:
  1. Create the skill files in `.agents/skills/<name>/`.
  2. Immediately configure and grant the authorized permissions in the command safety gate (`.agents/scripts/command-gate.py`) and project documentation (`GEMINI.md`, `AGENTS.md`, `.agents/governance.md`) so that agents can execute the skill autonomously without repeatedly asking for permission.

---

## 6. Environment Tooling & Runtimes (Zero Search / Token Preservation)

To completely eliminate token waste and prevent search loops (`which`, `find /`, `whereis`), all harnesses must strictly observe the pre-configured runtime environments:

- **Version Manager (`asdf`)**:
  - All language runtimes (`golang`, `nodejs`, `python`) are managed via `asdf` and tracked in `.tool-versions`:
    - `golang 1.27.0` (Shims: `/home/douglas/.asdf/shims/go` or `go`)
    - `nodejs lts` (Shims: `/home/douglas/.asdf/shims/node` or `node`)
    - `python 3.14.7` (Shims: `/home/douglas/.asdf/shims/python3` or `python3`)
  - **Invariance**: NEVER search for Go, Node, or Python binaries across the system filesystem. They are deterministically available via asdf shims.

- **Python & `uv` (Strict Local Venv Policy)**:
  - Package & virtualenv manager: `uv` (available at `/home/linuxbrew/.linuxbrew/bin/uv` or `uv`).
  - **Zero Global Installs**: Installing packages globally via `pip install` or `pip install --user` is strictly forbidden.
  - **Mandatory Local Venv**: Whenever Python dependencies are required, always create and use a local virtual environment in `.venv/` using `uv`:
    ```bash
    uv venv .venv
    .venv/bin/python -m pip install <package>  # or uv pip install <package>
    ```
  - The `.venv/` and `venv/` directories are gitignored and localized to the repository.

- **Node.js (No Global Installs)**:
  - Node is available via asdf shims (`node`, `npm`).
  - **Zero Global Installs**: Global package installation (`npm install -g`, `pnpm add -g`) is strictly prohibited. Use native Node capabilities (`node --test`, native `WebSocket`, standard library ES6 modules) or repository-local scripts.

- **Headless Browser (Google Chrome)**:
  - Binary location: `/usr/bin/google-chrome` (or `google-chrome`).
  - **Zero Search**: NEVER run discovery commands searching for browsers (`which chromium`, `find / -name chrome`, etc.). Use `/usr/bin/google-chrome` directly (e.g. for headless screenshots or automation via `--headless=new`).


