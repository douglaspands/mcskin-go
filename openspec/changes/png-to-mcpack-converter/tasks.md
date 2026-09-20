# Tasks

## 1. Project Initialization & AI Governance

- [x] 1.1 Initialize Git repository, configure comprehensive `.gitignore` (ignoring Go binaries, `.mcpack` outputs, IDE artifacts), and verify with `git status`
- [x] 1.2 Initialize Go module `png-to-mcpack` and verify Go toolchain compatibility (`go version`)
- [x] 1.3 Configure OpenSpec project context and artifact rules in `openspec/config.yaml` (injecting Go standards, Bedrock formatting rules, TDD requirements, and OpenSpec conventions for future features)
- [x] 1.4 Create universal root `AGENTS.md` guiding any AI agent/harness on project architecture, OpenSpec lifecycle, TDD workflow, and code standards
- [x] 1.5 Document comprehensive AI Agent Governance specification in `.agents/governance.md` (State Graph, Loop Engineering with 3-iteration caps, halting rules, token conservation, and autonomy permission tiers)
- [x] 1.6 Configure multi-harness support and instruction adapters for AI tools (Antigravity, Claude, Cursor, Copilot, Cline, etc.) via OpenSpec tool configuration

## 2. TDD Test Suite (Tests Written First)

- [x] 2.1 Write unit tests in `internal/skin/skin_test.go` for 64x64, 128x128, invalid dimensions, and corrupt PNG detection, and verify tests fail to compile/run (RED phase)
- [x] 2.2 Write unit tests in `internal/bedrock/manifest_test.go` and `uuid_test.go` validating RFC-4122 UUIDv4 formatting, `manifest.json` schema, and `skins.json` generation, and verify tests fail (RED phase)
- [x] 2.3 Write unit tests in `internal/pack/pack_test.go` validating ZIP archive compression, entry paths (`manifest.json`, `skins.json`, `texts/en_US.lang`, texture), and verify tests fail (RED phase)
- [x] 2.4 Write integration tests in `internal/converter/converter_test.go` testing full conversion pipeline, verifying output is created in the exact same directory with identical base name and `.mcpack` extension, and verify tests fail (RED phase)
- [x] 2.5 Write CLI tests in `cmd/png-to-mcpack/main_test.go` for argument parsing, flags (`--slim`), exit codes, and cross-platform path handling, and verify tests fail (RED phase)

## 3. Core Implementation (Passing the Tests)

- [x] 3.1 Implement UUIDv4 generator and Bedrock manifest/skin metadata models in `internal/bedrock/` and verify `go test ./internal/bedrock/...` passes (GREEN phase)
- [x] 3.2 Implement PNG image decoding and dimension validation in `internal/skin/` and verify `go test ./internal/skin/...` passes (GREEN phase)
- [x] 3.3 Implement ZIP/.mcpack archive packaging in `internal/pack/` and verify `go test ./internal/pack/...` passes (GREEN phase)
- [x] 3.4 Implement conversion orchestrator in `internal/converter/` connecting validation, manifest creation, same-folder file resolution, and compression, and verify `go test ./internal/converter/...` passes (GREEN phase)
- [x] 3.5 Implement CLI application entrypoint in `cmd/png-to-mcpack/main.go` and verify `go test ./cmd/...` and CLI tests pass (GREEN phase)

## 4. Verification, Cross-Compilation & Documentation

- [x] 4.1 Run end-to-end conversion on test file `files/skins-and-cloaks-will-only-be-visible-to-those-using-mineshafter-if-your-skins-appear-on-the-site-but-not-in-game-restart-minecraft.png` and verify resulting `.mcpack` can be extracted and contains valid files
- [x] 4.2 Create `Makefile` and cross-compilation scripts with targets for Linux (`bin/png-to-mcpack`) and Windows (`bin/png-to-mcpack.exe`), and verify both binaries build successfully via `go build`
- [x] 4.3 Configure GitHub Actions CI workflow in `.github/workflows/ci.yml` matrix-testing Linux and Windows builds, linting, and automated test execution
- [x] 4.4 Create detailed `README.md` documenting installation, building for Linux & Windows, command usage, TDD methodology, agent governance patterns, and Minecraft Bedrock import steps
- [x] 4.5 Perform final git commit of implementation files following Conventional Commits format
