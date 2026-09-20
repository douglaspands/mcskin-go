# Proposal

## Why

Currently, `png-to-mcpack` generates a Bedrock `.mcpack` containing only one humanoid geometry model (classic 4px arms by default, or slim 3px arms when `--slim` is specified). However, Minecraft Bedrock skin packs natively support multiple skin definitions within a single `.mcpack` referencing the same texture file. By generating both classic and slim models in the pack by default, players can import a single `.mcpack` and immediately choose between Steve (classic) and Alex (slim) variants in Minecraft Bedrock's dressing room / skin picker without needing to run separate conversions or guess the correct model beforehand.

Additionally, to facilitate distribution and installation for end users, automated releases are needed so that creating a git release tag automatically builds and uploads native cross-platform binaries (Linux and Windows amd64) directly to GitHub release assets.

## What Changes

- **Default Dual-Model Packaging**: By default, converting a PNG will generate a `.mcpack` containing two skin definitions in `skins.json`:
  1. Classic (`geometry.humanoid.custom`, 4px arms)
  2. Slim (`geometry.humanoid.customSlim`, 3px arms)
  Both entries share the single embedded texture file in the archive root.
- **Dual Localization Keys**: `texts/en_US.lang` will contain display names for both skin variants (e.g., `<SkinName> (Classic)` and `<SkinName> (Slim)`).
- **Model Selection Flags**: Add a `--classic` flag and update `--slim` to allow users to optionally restrict the pack to a single model if desired (e.g. `--classic` for only classic, `--slim` for only slim). If neither is specified (or if `--both` is specified), both models are included.
- **Verifier Support**: Update the Bedrock pack verification script to validate all skin entries in `skins.json` when multiple skins are defined.
- **Automated GitHub Release CI/CD Workflow**: Add a GitHub Actions workflow triggered on release tag push (`v*`) that compiles optimized Linux and Windows binaries and publishes them directly to GitHub release assets.

## Capabilities

### New Capabilities
- `release-workflow`: Automated GitHub Actions release pipeline building cross-platform binaries (Linux and Windows amd64) and attaching them as release assets upon tag push.

### Modified Capabilities
- `pack-conversion`: Update `Bedrock Skin Metadata Generation` to support generating multiple skin entries (both classic and slim) in `skins.json` sharing the same texture, with corresponding localized names in `texts/en_US.lang`.
- `cli`: Update `Skin Model Geometry Flag` to document default dual-model generation and `--classic` / `--slim` filtering options.

## Impact

- **`internal/bedrock`**:
  - Update `GenerateSkinsJSON` to accept model mode (`ModelModeBoth`, `ModelModeClassic`, `ModelModeSlim`) or skin model list, and construct one or two `SkinEntry` records.
  - Update `GenerateLang` to generate localized strings for all defined skin entries (e.g. `skin.<pack>.<name>_classic` and `skin.<pack>.<name>_slim`).
- **`internal/converter`**:
  - Update `Options` and `Convert` to support model selection (`both` as default, `classic`, `slim`).
  - Update `Result` to reflect the generated model configuration.
- **`cmd/png-to-mcpack`**:
  - Update CLI flags (`--classic`, `--slim`) and usage documentation to reflect the default dual-model behavior.
- **`.agents/skills/bedrock-skin-pack-verifier`**:
  - Ensure the verification script verifies geometry and texture links across all skins in `skins.json`.
- **`.github/workflows/release.yml`**:
  - New GitHub Actions workflow executing on `push.tags: ['v*']` to build and publish release binaries.
- **Dependencies**: Zero external dependencies (Go standard library only).
