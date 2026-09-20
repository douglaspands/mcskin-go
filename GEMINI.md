# Gemini & Antigravity Project Rules: `png-to-mcpack`

## 1. Command Execution & Safety Protocol

### Safe & Auto-Allowed Commands (Tier 1)
You are explicitly permitted and encouraged to autonomously execute harmless development commands:
- **Go toolchain**:
  - `go test ...` (e.g. `go test -v ./...`, `go test -run TestX ./internal/...`)
  - `go build ...` (e.g. `go build ./...`, `go build -o bin/png-to-mcpack ./cmd/...`)
  - `go vet ...`
  - `go run ...`
  - `go fmt ...`
  - `go mod tidy`, `go mod verify`, `go mod download`
  - `go version`, `go doc`, `go list`
- **Build automation**:
  - `make`, `make test`, `make build`, `make build-linux`, `make build-windows`, `make lint`, `make clean`
  - `./bin/png-to-mcpack ...`
- **OpenSpec**:
  - `openspec ...`
- **Git (safe inspection & local workflow)**:
  - `git status`, `git diff`, `git log`, `git show`, `git branch`, `git add`, `git commit`
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
- **Zero Dependencies**: Go standard library only.
- **Cross-Platform**: Windows (`.exe`) and Linux paths (`filepath.ToSlash` for ZIP entries).

---

## 3. Token Conservation & Proactive Skill Creation
- **Proactive Skill Proposal**: Whenever you identify a repetitive, multi-step, or verbose workflow where creating a specialized **SKILL** (`.agents/skills/<name>/SKILL.md`) would conserve context window tokens through progressive disclosure, you MUST:
  1. Clearly explain the workflow opportunity and the token savings benefit.
  2. Propose the name, scope, and structure of the recommended SKILL.
  3. **Specify Required Autonomy Permissions**: Inform the exact commands, scripts, and file access needed for the SKILL to run autonomously (Tier 1).
  4. Explicitly ask for user approval for both the skill and its permissions before implementing it.
- **Autonomous Permission Provisioning**: Upon user approval:
  1. Create the skill files in `.agents/skills/<name>/`.
  2. Immediately configure and grant the authorized permissions in the command safety gate (`.agents/scripts/command-gate.py`) and project documentation (`GEMINI.md`, `AGENTS.md`, `.agents/governance.md`) so that agents can execute the skill autonomously without repeatedly asking for permission.

