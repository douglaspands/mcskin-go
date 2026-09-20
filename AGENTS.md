# AI Agent & Harness Guidelines: `png-to-mcpack`

Welcome, AI Agent / Harness. This repository enforces strict architectural patterns, Test-Driven Development (TDD), OpenSpec-driven feature lifecycles, and bounded execution governance. Adhere to all guidelines below.

---

## 1. Project Overview & Architecture

`png-to-mcpack` is a fast, lightweight, cross-platform command-line tool written in Go that transforms Minecraft PNG skin textures into ready-to-import Minecraft Bedrock `.mcpack` skin pack archives.

### Core Architectural Principles
- **Zero External Dependencies**: Use Go standard library exclusively (`image/png`, `archive/zip`, `crypto/rand`, `encoding/json`, `path/filepath`). No third-party modules or runtime dependencies.
- **Cross-Platform Compatibility**: Must run natively on both Linux (`amd64`) and Windows (`amd64`). Always use `filepath.ToSlash()` when writing ZIP/mcpack entry paths to ensure cross-platform Bedrock compatibility.
- **Deterministic Output Placement**: The `.mcpack` output file must always be generated in the exact same directory as the input `.png`, matching its base filename (e.g., `path/to/skin.png` -> `path/to/skin.mcpack`).

### Package Layout
- `cmd/png-to-mcpack/main.go`: CLI entrypoint (argument parsing, flags `--slim`, exit codes).
- `internal/skin/`: Skin PNG decoding, dimension validation (64x64 or 128x128 RGBA), and model detection (classic Steve vs. slim Alex).
- `internal/bedrock/`: Manifest generation, RFC-4122 UUIDv4 generator, `skins.json`, localization (`texts/en_US.lang`).
- `internal/pack/`: ZIP archive packaging stream writing into `.mcpack`.
- `internal/converter/`: High-level orchestration coupling validation, manifest creation, and output file resolution.

---

## 2. OpenSpec Feature Lifecycle (Mandatory)

Every new feature, modification, or refactor must follow the OpenSpec specification-driven workflow:

1. **Explore / Propose**:
   - For brainstorming or exploring ideas: run `/opsx-explore`.
   - To propose a new feature: run `/opsx-propose "<feature description>"` or use `openspec new change "<change-name>"`.
2. **Review Planning Artifacts**:
   - Ensure `proposal.md`, `specs/`, `design.md`, and `tasks.md` are coherent and validated (`openspec validate <change-name>`).
3. **Implementation (`/opsx-apply`)**:
   - Work through tasks sequentially. Update tasks in `tasks.md` as they are completed (`- [ ]` -> `- [x]`).
4. **Archive (`/opsx-archive`)**:
   - Once all tasks are complete and verified (`go test ./...` and `go build ./...`), archive the change to sync specs.

---

## 3. Test-Driven Development (TDD) Protocol

You **MUST** adhere to strict TDD:

1. **RED Phase**:
   - Write tests first in the corresponding package (e.g. `internal/skin/skin_test.go`).
   - Run the test (`go test ./internal/skin/...`) and verify that it fails as expected before implementing application logic.
2. **GREEN Phase**:
   - Write the minimum viable code necessary to satisfy the test.
   - Run the test and verify it passes.
3. **REFACTOR Phase**:
   - Clean up code, remove duplication, and optimize without breaking existing test suites.

---

## 4. AI Agent Governance: Graph & Loop Engineering

To guarantee safe, efficient, and bounded execution cycles:

### State Graph Phases
```
[Plan: OpenSpec] ──> [TDD: Write Tests (RED)] ──> [Implement Code (GREEN)] ──> [Verify & Lint] ──> [Commit]
```

### Loop Engineering Guardrails
- **Max Iterations Cap**: No test-fix or debugging loop may exceed **3 iterations** (`max_attempts = 3`).
- **Halting Condition**: If an identical error or test failure repeats across 2 iterations without new diagnostic information, **halt execution immediately** and ask the user for guidance.
- **Idempotence**: All setup commands, scripts, and file generators must be idempotent (safe to execute multiple times without unintended side effects).

### Token & Resource Optimization
- **Targeted Test Execution**: Run targeted tests (e.g., `go test -v -run TestSpecific ./internal/...`) while iterating. Do not run verbose full-suite tests on every minor edit.
- **Context Hygiene**: Do not dump binary files, large images, or massive directory trees into the context.
- **Concise Communication**: Keep outputs structured, actionable, and focused on code changes and verification results.

### Safe Autonomy Boundaries

- **Harmless & Auto-Allowed Commands (Tier 1)**:
  - **Go Toolchain**: `go test ...`, `go build ...`, `go vet ...`, `go run ...`, `go fmt ...`, `go mod tidy`, `go mod verify`, `go version`, `go doc`.
  - **Build Automation**: `make`, `make test`, `make build`, `make build-linux`, `make build-windows`, `make lint`, `make clean`.
  - **OpenSpec**: `openspec ...`
  - **Git Operations**: `git status`, `git diff`, `git log`, `git show`, `git add`, `git commit`.
  - **Inspections**: `ls`, `cat`, `head`, `tail`, `grep`, `find`, `stat`, `unzip -l`, `unzip -p`.
  - **Targeted Cleanup**: `rm -rf bin/`, `rm -rf files/*.mcpack`.

- **Destructive & Strictly Blocked Commands (Tier 3)**:
  - **Unbounded Deletion**: `rm -rf /`, `rm -rf *`, `rm -rf .`, `rm -rf ..`, `rm -rf .git`, `rm -rf ~`.
  - **Destructive Git**: `git push --force`, `git push -f`, `git reset --hard`, `git clean -f`, `git branch -D`.
  - **Disk & System Writes**: `dd if=`, `mkfs`, `fdisk`, `parted`, `shutdown`, `reboot`.
  - **Privilege Escalation**: `sudo`, `su`.
  - **Out-of-Scope Files**: Any write or deletion outside this workspace repository.

- **Requires Explicit Confirmation (Tier 2)**:
  - Any unfamiliar shell commands or network calls.

---

## 5. Git & Commit Guidelines

- Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
  - `feat: ...` for new capabilities.
  - `fix: ...` for bug fixes.
  - `test: ...` for test suite additions.
  - `refactor: ...` for code reorganization without behavior change.
  - `docs: ...` for documentation updates.
  - `chore: ...` for build scripts or configuration updates.
