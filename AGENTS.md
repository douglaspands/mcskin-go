# AI Agent & Harness Guidelines: `mcskin`

Welcome, AI Agent / Harness. This repository enforces strict architectural patterns, Test-Driven Development (TDD), OpenSpec-driven feature lifecycles, and bounded execution governance. Adhere to all guidelines below.

---

## 1. Project Overview & Architecture

`mcskin` is a fast, lightweight, cross-platform command-line tool written in Go that transforms Minecraft PNG skin textures into ready-to-import Minecraft Bedrock `.mcpack` skin pack archives.

### Core Architectural Principles
- **Zero External Dependencies**: Use Go standard library exclusively (`image/png`, `archive/zip`, `crypto/rand`, `encoding/json`, `path/filepath`). No third-party modules or runtime dependencies.
- **Cross-Platform Compatibility**: Must run natively on both Linux (`amd64`) and Windows (`amd64`). Always use `filepath.ToSlash()` when writing ZIP/mcpack entry paths to ensure cross-platform Bedrock compatibility.
- **Deterministic Output Placement**: The `.mcpack` output file must always be generated in the exact same directory as the input `.png`, matching its base filename (e.g., `path/to/skin.png` -> `path/to/skin.mcpack`).

### Package Layout
- `cmd/mcskin/main.go`: CLI entrypoint (argument parsing, flags `--slim`, exit codes).
- `internal/skin/`: Skin PNG decoding, dimension validation (64x64 or 128x128 RGBA), and model detection (classic Steve vs. slim Alex).
- `internal/bedrock/`: Manifest generation, RFC-4122 UUIDv4 generator, `skins.json`, localization (`texts/en_US.lang`).
- `internal/pack/`: ZIP archive packaging stream writing into `.mcpack`.
- `internal/converter/`: High-level orchestration coupling validation, manifest creation, and output file resolution.
- `internal/web/`: Embedded HTTP server hosting "CRIE SKINS LEGAIS" web UI, local QR code, and browser opener.

---

## 2. OpenSpec Feature Lifecycle (Mandatory)

Every new feature, modification, or refactor must follow the OpenSpec specification-driven workflow:

1. **Explore / Propose**:
   - For brainstorming or exploring ideas: run the explore workflow (`/opsx:explore` on Claude Code, `/openspec-explore` on Antigravity).
   - **MANDATORY FIRST STEP (Branch Isolation)**: The very first command executed upon triggering the propose workflow (`/opsx:propose` on Claude Code, `/openspec-propose` on Antigravity) MUST be creating and checking out a dedicated feature branch:
     ```bash
     git checkout -b feat/<nome_spec>
     ```
     This ensures complete sandbox isolation so that if anything deviates or fails, changes can be rolled back without impacting `main`.
2. **Review Planning Artifacts**:
   - Ensure `proposal.md`, `specs/`, `design.md`, and `tasks.md` are coherent and validated (`openspec validate <change-name>`).
3. **Implementation (`/opsx:apply` on Claude Code, `/openspec-apply-change` on Antigravity)**:
   - Work through tasks sequentially. Update tasks in `tasks.md` as they are completed (`- [ ]` -> `- [x]`).
   - **AUTOMATIC QA TRIGGER**: Immediately upon completing all implementation tasks, the harness MUST automatically run the `feature-qa-reviewer` protocol (`.agents/skills/feature-qa-reviewer/SKILL.md`) to validate deliverables before moving forward. On Claude Code this isn't a slash command — read the skill file directly, or dispatch it via the `Agent` tool per its own Claude Code dispatch note.
4. **PO/QA Review & Bounded Loop Remediation (`feature-qa-reviewer`)**:
   - The persona validates functional user requirements, child usability (6+), Minecraft aesthetic fidelity, cross-platform build artifacts, and Bedrock `.mcpack` compliance.
   - **Loop Engineering Remediation**: If defects or rejections occur, trigger remediation using harness Loop Engineering guardrails with anti-infinite-loop best practices:
     1. **Max Iterations Cap**: Maximum 3 fix attempts (`max_attempts = 3`).
     2. **2-Strike Identical Failure Halting**: Halt immediately if the same error or rejection reason repeats across 2 consecutive attempts without progress.
     3. **Scope Boundary Guard**: Halt and request spec revision if remediation requires out-of-scope architectural changes.
     4. **Targeted Verification**: Re-run targeted unit tests before re-evaluating with QA.
   - Proceed to archive only after receiving a formal `APROVADO` verdict.
   - **DO NOT Auto-Archive or Prompt PR During Apply**: Upon receiving `APROVADO` during apply, commit the code, display the approval report, and instruct the user to run the archive workflow (`/opsx:archive` on Claude Code, `/openspec-archive-change` on Antigravity). Do NOT run archive automatically and do NOT prompt for PR/merge during the apply phase.
5. **Archive (`/opsx:archive` on Claude Code, `/openspec-archive-change` on Antigravity)**:
   - Triggered explicitly when the user runs that archive workflow (or `openspec archive`).
   - Once all tasks are complete, verified, and approved by PO/QA, archive the change to sync specs.
   - **MANDATORY ARCHIVE COMMIT ON FEATURE BRANCH**: All git updates (moving change to `archive/` and syncing `openspec/specs/`) MUST be staged and committed directly on the feature branch `feat/<nome_spec>` BEFORE pushing or opening the PR:
     ```bash
     git add openspec/
     git commit -m "docs(openspec): archive change <nome_spec> and sync main specs"
     ```
   - **MANDATORY SQUASH MERGE OR PULL REQUEST PROMPT (ONLY AFTER ARCHIVE)**: Immediately after archiving, committing, and synchronization are finished within the archive workflow, request user confirmation to choose between:
     1. **Local Squash Merge into `main`**:
        ```bash
        git checkout main && git merge --squash feat/<nome_spec>
        ```
     2. **GitHub Pull Request**:
        ```bash
        git push origin feat/<nome_spec>
        gh pr create --base main --head feat/<nome_spec> --title "feat: <nome_spec>"
        git checkout main
        ```
   - **POST-PR INVARIANT (NO COMMITS ON BRANCH, ZERO COMMITS ON MAIN)**:
     - Once the PR is created and git switches back to `main`, **NO further commits may be made to the feature branch** (it is frozen awaiting review/merge).
     - **ABSOLUTELY NO DIRECT COMMITS ON `main`**: The `main` branch is strictly protected. Committing directly to `main` is strictly prohibited. All git updates must have already occurred inside the archive command on the feature branch. The working tree on `main` must remain clean.

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

### Strict Unit Test Isolation (100% Mocked / Zero Integration)
- **Zero External Integration**: Unit tests MUST NOT have external integration. All external dependencies, filesystem I/O, and data streams must be completely mocked using in-memory representations (`io.Reader`, `bytes.Buffer`, mock structs).
- **No Network or OS Side-Effects**: Unit tests must never initiate network calls, spawn arbitrary external system processes, or write to persistent filesystem paths outside transient test runners (`t.TempDir()`).
- **Segregation of Concerns**: Integration tests verifying end-to-end pipelines (e.g., `internal/converter/converter_test.go`) must be clearly segregated from pure unit tests.

---

## 4. AI Agent Governance: Graph & Loop Engineering

To guarantee safe, efficient, and bounded execution cycles:

### State Graph Phases
```
[Plan: OpenSpec] ──> [TDD: Write Tests (RED)] ──> [Implement Code (GREEN)] ──> [Verify & Lint] ──> [PO/QA Review (SKILL)] ──> [Commit / Archive]
```

### Loop Engineering Guardrails
- **Max Iterations Cap**: No test-fix or debugging loop may exceed **3 iterations** (`max_attempts = 3`).
- **Halting Condition**: If an identical error or test failure repeats across 2 iterations without new diagnostic information, **halt execution immediately** and ask the user for guidance.
- **Idempotence**: All setup commands, scripts, and file generators must be idempotent (safe to execute multiple times without unintended side effects).

### Token & Resource Optimization
- **Born Modularized ("Nascem Otimizadas")**: All new and refactored application files in `cmd/`, `internal/`, and `internal/web/static/js/` SHALL NOT exceed 300 lines or 15 KB in size. Keep frontend code in discrete, cohesive ES6 modules with single architectural concerns and JSDoc documentation.
- **Vendor Isolation**: Third-party libraries (such as Three.js or QRCode) MUST reside in `internal/web/static/vendor/` and are excluded from AI context reads.
- **Targeted Test Execution & Compact Runner**: Run targeted tests (e.g., `go test -v -run TestSpecific ./internal/...`) while iterating. Prefer the compact test runner `./scripts/test-compact.sh` for multi-package runs to preserve tokens (silent on PASS, concise diffs on FAIL).
- **Subagent Offloading**: Repetitive research, verbose test repair loops, and code investigations SHALL be offloaded to subagents so parent conversations receive only concise summaries.
- **Token Guardian Skill**: Use the `token-guardian` skill (`.agents/skills/token-guardian/SKILL.md`) to inspect and enforce file size budgets before committing.
- **Context Hygiene**: Do not dump binary files, large images, or massive directory trees into the context.
- **Concise Communication**: Keep outputs structured, actionable, and focused on code changes and verification results.
- **Proactive Skill Suggestion & Autonomy Provisioning**: Whenever a recurring, multi-step, or verbose workflow is identified that could save context tokens via progressive disclosure, proactively suggest creating a new SKILL. The proposal MUST explicitly list the authorizations and permissions needed for the skill to operate autonomously. Once approved by the user, immediately provision those permissions into the command safety gate (`.agents/scripts/command-gate.py`) and project documentation to avoid repetitive permission prompts.

### Safe Autonomy Boundaries

- **Harmless & Auto-Allowed Commands (Tier 1)**:
  - **Go Toolchain**: `go test ...`, `go build ...`, `go vet ...`, `go run ...`, `go fmt ...`, `go mod tidy`, `go mod verify`, `go version`, `go doc`.
  - **Build Automation**: `make`, `make test`, `make build`, `make build-linux`, `make build-windows`, `make build-darwin-arm64`, `make build-all`, `make lint`, `make clean`.
  - **Packaging & Testing Scripts**: `./scripts/test-compact.sh`, `./scripts/package-mac-app.sh`, `./scripts/run-regression-suite.sh`.
  - **OpenSpec**: `openspec ...`
  - **Git & GitHub Operations**: `git status`, `git diff`, `git log`, `git show`, `git add`, `git commit`, `git checkout -b feat/...`, `git checkout main`, `git merge --squash ...`, `git push origin feat/...`, `gh pr create ...`, `gh pr view ...`, `gh pr status`.
  - **Inspections**: `ls`, `cat`, `head`, `tail`, `grep`, `find`, `stat`, `unzip -l`, `unzip -p`.
  - **Targeted Cleanup**: `rm -rf bin/`, `rm -rf files/*.mcpack`.

- **Destructive & Strictly Blocked Commands (Tier 3)**:
  - **Direct Commits to Main**: Committing directly to the `main` branch (`git commit` on `main`). All commits must occur on a feature branch (`feat/...`) during implementation/archive or via PR merge.
  - **Unbounded Deletion**: `rm -rf /`, `rm -rf *`, `rm -rf .`, `rm -rf ..`, `rm -rf .git`, `rm -rf ~`.
  - **Destructive Git**: `git push --force`, `git push -f`, `git reset --hard`, `git clean -f`, `git branch -D`.
  - **Disk & System Writes**: `dd if=`, `mkfs`, `fdisk`, `parted`, `shutdown`, `reboot`.
  - **Privilege Escalation**: `sudo`, `su`.
  - **Out-of-Scope Files**: Any write or deletion outside this workspace repository.

- **Requires Explicit Confirmation (Tier 2)**:
  - Any unfamiliar shell commands or network calls.

### Host & Environment Security Protocol
To guarantee the absolute protection and stability of the host environment:
- **Sandbox Boundary Confinement**: AI harnesses must operate exclusively within the repository directory (`/home/douglas/Workspace/minecraft/png-to-mcpack`). Never read, modify, or delete files outside this directory (including `/etc`, `/usr`, `~/.ssh`, `~/.bashrc`, `~/.config`, and parent paths).
- **Zero Privilege Escalation**: Commands invoking `sudo`, `su`, or altering file ownership/permissions (`setuid`, `chmod 777`) are strictly forbidden.
- **Process Protection**:
  - Commands must execute synchronously with bounded timeouts (max 30s) to prevent resource exhaustion, fork bombs, or hung processes.
  - No background daemonizing, crontab manipulation, or persistence mechanisms.
  - Air-gapped execution: all test suites, builds, and tooling must execute offline without outbound network requests.
- **Filesystem Integrity**: All automated modifications must be scoped and idempotent. Destructive wildcards (`rm -rf *`, `rm -rf /`) are blocked at both prompt and mechanical gate levels.

---

## 5. Git & Commit Guidelines

- **Zero Direct Commits on `main`**: Commits must NEVER be made directly to `main`. All updates, archiving, spec synchronizations, and fixes happen on feature branches.
- Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
  - `feat: ...` for new capabilities.
  - `fix: ...` for bug fixes.
  - `test: ...` for test suite additions.
  - `refactor: ...` for code reorganization without behavior change.
  - `docs: ...` for documentation updates.
  - `chore: ...` for build scripts or configuration updates.
