# Design

## Context

The user requires a Go-based CLI tool to convert Minecraft PNG skin textures into Bedrock-compatible `.mcpack` archives. The tool must output the `.mcpack` in the same directory as the source `.png` using the same base name. The project requires Git configuration, cross-compilation for Windows and Linux, GitHub CI/CD, TDD (Test-Driven Development) where tests are written prior to code, and strict AI agent governance (graph and loop engineering to prevent infinite loops, save tokens, and manage autonomy safely).

See `proposal.md` for background and motivation, and `specs/` for behavioral requirements.

## Goals / Non-Goals

**Goals:**
- Provide a clean, zero-external-dependency Go CLI architecture using standard library packages (`image/png`, `archive/zip`, `crypto/rand`, `encoding/json`, `path/filepath`).
- Support cross-compilation targeting `linux/amd64` and `windows/amd64` (e.g. producing `png-to-mcpack` and `png-to-mcpack.exe`).
- Strictly adhere to TDD: define unit and integration test suites first, ensuring tests fail before implementing domain logic.
- Output `.mcpack` files in the exact same directory as the input PNG, altering only the extension.
- Implement Bedrock skin pack standards (`manifest.json` with UUIDv4, `skins.json`, `texts/en_US.lang`).
- Define explicit AI Agent Governance and Universal Harness Enablement incorporating Graph Engineering, Loop Engineering, OpenSpec project context/rules, root `AGENTS.md`, and multi-harness adapter support so any AI tool follows project conventions in future features.
- Set up Git configuration, `.gitignore`, GitHub Actions CI workflow, and a thorough `README.md`.

**Non-Goals:**
- Support for Bedrock behavior packs, resource packs with custom geometry models (beyond standard classic and slim humanoid models), or world templates.
- Graphic User Interface (GUI) or web interface (this is strictly a CLI utility).
- Automatic skin downloading or network-based player lookup.

## Decisions

### 1. Project Structure and Package Layout
- **Decision**: Standard Go project structure:
  - `cmd/png-to-mcpack/main.go`: CLI entrypoint (argument parsing, flags, error code mapping).
  - `internal/skin/`: Skin PNG decoding, dimension validation (64x64, 128x128), and model detection (classic Steve vs. slim Alex).
  - `internal/bedrock/`: Manifest generation, UUIDv4 generator, `skins.json` data structs, and localization templates.
  - `internal/pack/`: ZIP archive packaging stream writing into `.mcpack`.
  - `internal/converter/`: High-level orchestration coupling validation, manifest creation, and output path calculation.
- **Rationale**: Isolates concerns, facilitates testability in isolation (TDD), and prevents circular package dependencies.
- **Alternatives Considered**: Single flat root package (`main.go`). Rejected because it hinders unit testing and violates Go clean architecture principles.

### 2. Dependency Management & UUID Generation
- **Decision**: Zero external dependencies. UUIDv4 is generated using Go standard library `crypto/rand` following RFC 4122.
- **Rationale**: Keeps binary light, eliminates supply-chain risks, ensures lightning-fast build and cross-compilation times without CGO.
- **Alternatives Considered**: Using `github.com/google/uuid`. While popular, standard library cryptographic random bytes formatted as UUIDv4 require fewer than 20 lines of code and avoid third-party module synchronization.

### 3. Output Path and File Naming Resolution
- **Decision**: Use `filepath.Dir(inputPath)` and `strings.TrimSuffix(filepath.Base(inputPath), filepath.Ext(inputPath)) + ".mcpack"`.
- **Rationale**: Guarantees identical directory placement and matching base name on both Linux and Windows filesystems.
- **Alternatives Considered**: Outputting to a fixed `./dist/` or `./output/` directory. Rejected because the explicit requirement mandates same directory and matching filename.

### 4. Cross-Platform Build Strategy
- **Decision**: Makefile and cross-compilation scripts using Go's built-in `GOOS=windows GOARCH=amd64` and `GOOS=linux GOARCH=amd64` flags.
- **Rationale**: Go supports first-class cross-compilation out of the box when `CGO_ENABLED=0`.
- **Alternatives Considered**: Container-based cross-compilation (e.g. Goreleaser or Docker). Rejected for local builds to keep developer friction minimal, but Goreleaser/GitHub Actions matrix can be added in CI.

### 5. TDD Execution Sequence
- **Decision**:
  1. `skin_test.go`: Tests for valid 64x64 PNG, 128x128 PNG, invalid dimensions, non-PNG data.
  2. `bedrock_test.go`: Tests for UUIDv4 format, valid `manifest.json` marshaling, `skins.json` structures.
  3. `pack_test.go`: Tests for ZIP/.mcpack archive structure, verifying entry names and contents.
  4. `converter_test.go`: End-to-end conversion test using `files/...png` ensuring matching output location and filename.
  5. Implementation code written only after corresponding tests exist and fail.
- **Rationale**: Strict TDD guarantees verifiable code quality, high coverage, and regression resistance.

### 6. AI Agent Governance: Multi-Harness Integration, Graph Engineering & Loop Engineering
- **Decision**: Configure universal AI harness guidelines and governance across the repository:
  1. **Universal Harness Entrypoint (`AGENTS.md`)**:
     - Document project architecture (Go standard library, zero dependencies, cross-platform paths).
     - Mandate OpenSpec workflow for all new features and modifications (`openspec propose` / `apply` / `archive`).
     - Mandate strict TDD (Red -> Green -> Refactor) before application logic.
     - Mandate bounded execution and token conservation.
  2. **OpenSpec Context & Rules (`openspec/config.yaml`)**:
     - Inject project tech stack, conventions, and Bedrock formatting rules into OpenSpec's `context` block so that any AI agent generating proposals, specs, or designs for future features receives project directives automatically.
     - Define artifact rules and operational guidance for `apply` and `archive`.
  3. **Multi-Tool Harness Compatibility**:
     - Provide support/instruction files for major AI environments (Antigravity `.agents/`, Claude Code `.claude/`, Cursor `.cursor/`, GitHub Copilot `.github/`, Cline, Devin, etc.) using OpenSpec tooling.
  4. **Graph & Loop Engineering (`.agents/governance.md`)**:
     - **State Graph**: Defined phases:
       `Graph: [OpenSpec Plan] -> [TDD: Write Tests] -> [Verify Red] -> [Implement Code] -> [Verify Green] -> [Cross-Compile & CI] -> [Complete]`
     - **Loop Engineering Guardrails**:
       - *Iteration Cap*: Max 3 iterations for test/repair cycles (`max_attempts = 3`).
       - *Halting Condition*: If an error persists identically across 2 iterations without new diagnostics, halt and escalate to user.
       - *Idempotence*: File generation and configuration commands must be idempotent.
     - **Token Optimization**: Targeted tests (`go test -run TestX ...`), concise logs, avoid dumping binary files.
     - **Safe Command Autonomy**: Autonomous for read/build/test/git commit; permission required for destructive or out-of-scope operations.
- **Rationale**: Ensures any AI agent (regardless of vendor or harness) immediately adopts the project's established conventions, avoiding drift and unstructured implementations.

## Risks / Trade-offs

- **[Risk] Skin dimensions variance**: Some custom player skins are 64x32 (legacy Minecraft skins).
  - **Mitigation**: Detect 64x32 skins and either convert them to 64x64 by expanding the canvas or return a clear diagnostic message.
- **[Risk] Windows path separator differences**: Windows uses `\` while Linux uses `/`, and zip archives require forward slashes `/`.
  - **Mitigation**: Use `filepath.ToSlash()` when writing zip entry paths to ensure Bedrock on Windows, Android, and iOS can unpack the `.mcpack` without malformed entry names.
- **[Risk] Bedrock UUID collisions**: If duplicate UUIDs are used across multiple skin packs, Minecraft Bedrock ignores the newer pack.
  - **Mitigation**: Generate cryptographically secure random UUIDv4 identifiers per conversion run for both the pack header and module.

## Migration Plan

Not applicable (greenfield project). Implementation will be applied in structured, test-verified increments.
