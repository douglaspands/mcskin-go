# Proposal

## Why

Minecraft Bedrock Edition requires custom player skins to be bundled in a specific `.mcpack` format (a ZIP archive containing `manifest.json`, `skins.json`, textures, and UUIDs) to be imported and recognized in-game. Manually creating UUIDs, folder hierarchies, and manifest configurations for skin `.png` files is cumbersome, error-prone, and time-consuming. A fast, reliable, zero-dependency command-line converter written in Go solves this by automating the transformation from a `.png` file directly into a ready-to-import `.mcpack` in the same directory, running natively on both Windows and Linux.

## What Changes

- Initialize a Git repository with standard `.gitignore`, GitHub workflow conventions, and multi-platform compilation support (Linux and Windows).
- Develop a Go CLI application (`png-to-mcpack`) that converts a `.png` skin image into an `.mcpack` file in the same directory with the same basename.
- Implement strict PNG skin validation (verifying PNG header, 64x64 or 128x128 dimensions, and arm geometry detection for classic vs. slim models).
- Generate Minecraft Bedrock skin pack manifests with unique UUIDv4 identifiers, version metadata, `skins.json`, and localization files (`texts/en_US.lang`).
- Package the generated assets into a standard zip-compressed `.mcpack` file placed alongside the input `.png`.
- Adopt Test-Driven Development (TDD) as the core methodology, ensuring test suites are implemented and validated prior to domain and packaging logic.
- Establish Universal AI Agent Governance and Harness Configuration: configure OpenSpec project context (`openspec/config.yaml`), root `AGENTS.md`, multi-harness instruction adapters (Claude, Cursor, Copilot, Antigravity, Cline, etc.), and detailed governance rules (`.agents/governance.md`) with graph and loop engineering, ensuring any AI harness follows project guidelines, TDD workflows, and bounded autonomous execution across future features.
- Provide a clear, comprehensive `README.md` covering installation, cross-compilation, usage examples, and architecture.

## Capabilities

### New Capabilities
- `pack-conversion`: Parsing and validating PNG skin textures, generating compliant Minecraft Bedrock pack metadata (`manifest.json`, `skins.json`, localization), and assembling the `.mcpack` zip archive in the source directory with identical base filename.
- `cli`: Command-line interface accepting file paths, handling cross-platform filesystem paths (Windows/Linux), validating flags, and returning descriptive exit codes and messages.

### Modified Capabilities
<!-- None: Greenfield project -->

## Impact

- **Repository**: New Git repository initialization, GitHub Actions workflow for cross-compilation (Windows & Linux) and testing, and comprehensive `README.md`.
- **Go Project**: Go module initialized with standard library utilities (`image/png`, `archive/zip`, `crypto/rand` / UUID generation) to keep binary footprints minimal and portable.
- **Testing**: Complete unit and integration test suite created via TDD before application logic.
- **Agent Governance & Harness Compatibility**: Repository-wide AI harness enablement via `AGENTS.md`, enriched OpenSpec context/rules, multi-tool instructions, loop guards (depth bounds, cycle termination), token-optimized workflows, and permission escalation boundaries for agentic operations.
