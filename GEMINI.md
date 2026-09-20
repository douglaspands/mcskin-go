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
  - `./bin/mcskin ...`
  - `./bin/png-to-mcpack ...`
- **OpenSpec**:
  - `openspec ...`
- **Git & GitHub (safe inspection & PR workflow)**:
  - `git status`, `git diff`, `git log`, `git show`, `git branch`, `git add`, `git commit`
  - `git checkout -b feat/...`, `git checkout main`, `git merge --squash ...`, `git push origin feat/...`
  - `gh pr create ...`, `gh pr view ...`, `gh pr status`
- **Inspections**:
  - `ls`, `cat`, `head`, `tail`, `grep`, `find`, `which`, `stat`, `file`, `unzip -l`, `unzip -p`

### Destructive & Strictly Prohibited Commands (Tier 3)
The following commands are hard-blocked by project policy. You must NEVER propose or execute them:
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
- **OpenSpec Branching & Squash Merge Protocol**:
  - **First Step on `/opsx-propose`**: The absolute first command executed MUST be creating and checking out a dedicated feature branch:
    ```bash
    git checkout -b feat/<nome_spec>
    ```
    This ensures complete isolation and allows immediate rollback if anything deviates from expectations.
  - **Automatic PO/QA Review upon Implementation Completion**:
    Immediately upon finishing all tasks in `/openspec-apply-change` (or `/opsx-apply`), the harness MUST automatically execute the `feature-qa-reviewer` skill (or subagent with `role: "PO/QA Reviewer"`) to rigorously evaluate requirements, child usability (6+), Minecraft UX, and Bedrock `.mcpack` compliance.
    - **Bounded Loop Remediation (Anti-Infinite Loop Protection)**:
      In case defects or rejections are detected, enter a bounded remediation loop using Loop Engineering:
      1. Maximum 3 iterations (`max_attempts = 3`).
      2. 2-Strike Halting: Halt execution immediately if the identical error or rejection recurs across 2 attempts without progress.
      3. Scope Boundary: Halt if fix requires expanding requirements beyond the spec (trigger `/openspec-update-change`).
      4. Targeted Verification: Re-run tests before re-evaluating with QA.
    - Proceed to archive only upon formal approval (`APROVADO`).
  - **Final Step on `/opsx-archive`**: After all tasks and spec synchronization are completed, explicitly request user confirmation to choose between:
    1. Merge the feature branch into `main` using the squash method:
       ```bash
       git checkout main && git merge --squash feat/<nome_spec>
       ```
    2. Create a Pull Request on GitHub:
       ```bash
       git push origin feat/<nome_spec>
       gh pr create --base main --head feat/<nome_spec> --title "feat: <nome_spec>"
       ```

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

## 4. Token Conservation & Proactive Skill Creation
- **Proactive Skill Proposal**: Whenever you identify a repetitive, multi-step, or verbose workflow where creating a specialized **SKILL** (`.agents/skills/<name>/SKILL.md`) would conserve context window tokens through progressive disclosure, you MUST:
  1. Clearly explain the workflow opportunity and the token savings benefit.
  2. Propose the name, scope, and structure of the recommended SKILL.
  3. **Specify Required Autonomy Permissions**: Inform the exact commands, scripts, and file access needed for the SKILL to run autonomously (Tier 1).
  4. Explicitly ask for user approval for both the skill and its permissions before implementing it.
- **Autonomous Permission Provisioning**: Upon user approval:
  1. Create the skill files in `.agents/skills/<name>/`.
  2. Immediately configure and grant the authorized permissions in the command safety gate (`.agents/scripts/command-gate.py`) and project documentation (`GEMINI.md`, `AGENTS.md`, `.agents/governance.md`) so that agents can execute the skill autonomously without repeatedly asking for permission.

