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
