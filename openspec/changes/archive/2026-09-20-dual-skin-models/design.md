# Design

## Context

Minecraft Bedrock skin packs represent collections of skins packaged in a `.mcpack` zip archive. A single `skins.json` file can declare an array of multiple `SkinEntry` objects. Each skin entry specifies a geometry identifier (`geometry.humanoid.custom` for classic 4px arms, or `geometry.humanoid.customSlim` for slim 3px arms) and points to a texture file. In Bedrock, multiple skin entries can point to the exact same PNG texture.

Currently, `png-to-mcpack` generates a single skin entry per pack. By generating both classic and slim variants inside the pack by default, players who import the `.mcpack` can immediately select either geometry variant directly within Bedrock's dressing room.

In addition, distributing the CLI binaries for end users requires an automated continuous delivery pipeline that packages native Linux and Windows binaries whenever a new release tag is pushed.

## Goals / Non-Goals

**Goals:**
- By default, generate a single `.mcpack` containing both classic (Steve, 4px) and slim (Alex, 3px) humanoid skin entries.
- Both skin entries reference the same single PNG texture file in the archive root to avoid file size duplication.
- Localize both variants in `texts/en_US.lang` with clear labels (e.g. `<Skin> (Classic)` and `<Skin> (Slim)`).
- Provide `--classic` and `--slim` CLI flags to allow generating single-model packs when explicitly desired.
- Reject conflicting arguments when both `--classic` and `--slim` flags are specified together.
- Maintain zero external dependencies using only Go standard library.
- Adhere to strict TDD with 100% mocked pure unit tests.
- Provide a GitHub Actions release workflow triggering on tag push (`v*`) to build and upload Linux and Windows standalone binaries with checksums.

**Non-Goals:**
- Creating two separate `.mcpack` files on disk (one `.mcpack` containing both skins is the chosen and Bedrock-standard approach).
- Multi-texture pack aggregation (combining multiple distinct PNG skins into one pack is out of scope for this change).

## Decisions

### 1. Representation of Model Modes (`internal/bedrock`)
- **Decision**: Define a `ModelMode` string type in `internal/bedrock` with constants:
  - `ModelModeBoth = "both"` (default)
  - `ModelModeClassic = "classic"`
  - `ModelModeSlim = "slim"`
- **Rationale**: Clean, type-safe representation throughout `bedrock`, `converter`, and `main` packages.
- **Alternatives Considered**: Passing a boolean `both` alongside `slim` (error-prone state combinations), or passing a string slice of geometries (unnecessarily complex).

### 2. Skin Entries and Localization Structure
- **Decision**: When `ModelModeBoth` is active:
  - `skins.json`:
    - Entry 1: `localization_name: "<name>_classic"`, `geometry: "geometry.humanoid.custom"`, `texture: "<filename>.png"`, `type: "free"`
    - Entry 2: `localization_name: "<name>_slim"`, `geometry: "geometry.humanoid.customSlim"`, `texture: "<filename>.png"`, `type: "free"`
  - `texts/en_US.lang`:
    ```
    skinpack.<name>=<name>
    skin.<name>.<name>_classic=<name> (Classic)
    skin.<name>.<name>_slim=<name> (Slim)
    ```
  When a single model mode (`classic` or `slim`) is selected, retain the single-skin structure with `localization_name: "<name>"`.
- **Rationale**: Matches Bedrock conventions and cleanly differentiates the skins in the in-game UI.

### 3. CLI Argument Handling (`cmd/png-to-mcpack`)
- **Decision**:
  - Add `--classic` boolean flag.
  - Retain `--slim` boolean flag for backwards compatibility.
  - Add optional `--both` boolean flag.
  - Default when neither `--classic` nor `--slim` is set: `ModelModeBoth`.
  - Mutually exclusive validation: if both `--classic` and `--slim` are passed, exit with error message and code 1.
- **Rationale**: Completely backwards-compatible with previous usage while giving users intuitive flags.

### 4. Package Architecture and Responsibilities
- **`internal/bedrock`**:
  - `GenerateSkinsJSON(skinName, textureFilename string, mode ModelMode) (*SkinsConfig, error)`
  - `GenerateLang(skinName string, mode ModelMode) string`
- **`internal/converter`**:
  - `Options.Model` (`bedrock.ModelMode`, default `ModelModeBoth`)
  - `Result.Model` (`bedrock.ModelMode`)
  - Converts texture, generates metadata, and calls pack writer.
- **`cmd/png-to-mcpack`**:
  - Flag parsing, validation, and terminal feedback (`[both (classic & slim)]`, `[classic (4px)]`, or `[slim (3px)]`).
- **`.agents/skills/bedrock-skin-pack-verifier`**:
  - Update `verify-mcpack.py` to iterate through all skins in `skins.json` and report multi-model packs accurately.

### 5. TDD Test Execution Sequence
1. **Red Phase 1 (Bedrock)**: Write unit tests in `internal/bedrock/manifest_test.go` asserting dual-model `skins.json` generation and localization formatting. Verify tests fail (RED).
2. **Green Phase 1 (Bedrock)**: Implement `ModelMode` and updated `GenerateSkinsJSON` / `GenerateLang` in `internal/bedrock/manifest.go`. Verify tests pass (GREEN).
3. **Red Phase 2 (Converter)**: Write unit tests in `internal/converter/converter_test.go` checking dual-model packaging and single-model overrides. Verify tests fail (RED).
4. **Green Phase 2 (Converter)**: Implement converter logic updates in `internal/converter/converter.go`. Verify tests pass (GREEN).
5. **Red Phase 3 (CLI)**: Write CLI unit tests in `cmd/png-to-mcpack/main_test.go` testing flag parsing, default both, `--classic`, `--slim`, and mutual exclusion error. Verify tests fail (RED).
6. **Green Phase 3 (CLI)**: Implement CLI flag resolution in `cmd/png-to-mcpack/main.go`. Verify tests pass (GREEN).
7. **Verification & Skill Update**: Update verification script in `.agents/skills/bedrock-skin-pack-verifier/scripts/verify-mcpack.py` and run full regression suite.

### 6. GitHub Actions Release Workflow (`.github/workflows/release.yml`)
- **Trigger**: `push: tags: ['v*']`
- **Runner**: `ubuntu-latest`
- **Permissions**: `contents: write`
- **Build Strategy**:
  - `CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o dist/png-to-mcpack-linux-amd64 ./cmd/png-to-mcpack`
  - `CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -ldflags="-s -w" -o dist/png-to-mcpack-windows-amd64.exe ./cmd/png-to-mcpack`
- **Packaging & Integrity**:
  - Generate SHA256 checksums file (`checksums.txt`) covering both release binaries.
  - Use `softprops/action-gh-release@v2` with `files: dist/*` to publish release notes and assets.

## Risks / Trade-offs

- **[Risk]** Bedrock skin picker showing duplicate skin icons if both share the texture.
  → **Mitigation**: Minecraft Bedrock natively renders model previews using the specified geometry (4px vs 3px arms) alongside localized names, clearly distinguishing the classic Steve arm width from the slim Alex arm width.
- **[Risk]** Conflicting CLI flags (`--classic` and `--slim` provided simultaneously).
  → **Mitigation**: Strict validation at the CLI level halting execution with exit code 1 and an informative error message.
- **[Risk]** Breaking existing test assertions expecting a single skin entry.
  → **Mitigation**: Refactor tests to verify the dual-model default while keeping explicit single-model tests.

## AI Agent Governance & Host Security

- **Loop Limits**: Maximum 3 repair iterations per test step (`max_attempts = 3`). Halt and escalate if an identical error occurs across 2 iterations without new diagnostics.
- **Host Security**: Strictly confine file changes to `/home/douglas/Workspace/minecraft/png-to-mcpack`. No network access, no daemonizing, synchronous commands bounded by 30s timeout.
- **Test Isolation**: All unit tests must use in-memory constructs (`io.Reader`, `bytes.Buffer`) with zero persistent disk or external process integration.
