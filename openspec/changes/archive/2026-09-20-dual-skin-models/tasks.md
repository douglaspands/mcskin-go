# Tasks

## 1. Bedrock Metadata Layer (TDD Red & Green)

- [x] 1.1 Write failing unit tests in `internal/bedrock/manifest_test.go` for dual-model `skins.json` generation and dual-variant localization in `texts/en_US.lang`, and verify RED (`go test -v -run TestGenerateSkinsJSON ./internal/bedrock/...`)
- [x] 1.2 Implement `ModelMode` constants and update `GenerateSkinsJSON` in `internal/bedrock/manifest.go` to construct both classic and slim `SkinEntry` objects when mode is `both`, and verify GREEN (`go test -v -run TestGenerateSkinsJSON ./internal/bedrock/...`)
- [x] 1.3 Update `GenerateLang` in `internal/bedrock/manifest.go` to output localized strings for both variants, and verify GREEN (`go test -v -run TestGenerateLang ./internal/bedrock/...`)

## 2. Converter Layer (TDD Red & Green)

- [x] 2.1 Write failing unit tests in `internal/converter/converter_test.go` asserting default dual-model pack generation and model override options, and verify RED (`go test -v -run TestConvert ./internal/converter/...`)
- [x] 2.2 Update `converter.Options` and `converter.Convert` in `internal/converter/converter.go` to default to `ModelModeBoth` and wire through metadata generators, and verify GREEN (`go test -v -run TestConvert ./internal/converter/...`)

## 3. CLI Layer (TDD Red & Green)

- [x] 3.1 Write failing CLI tests in `cmd/png-to-mcpack/main_test.go` covering default dual-model execution, `--classic`, `--slim`, `--both`, and mutually exclusive flags error handling, and verify RED (`go test -v ./cmd/png-to-mcpack/...`)
- [x] 3.2 Update CLI flag parsing and usage text in `cmd/png-to-mcpack/main.go` to support `--classic`, `--slim`, `--both`, and mutual exclusion validation, and verify GREEN (`go test -v ./cmd/png-to-mcpack/...`)

## 4. Verifier Skill & End-to-End Verification

- [x] 4.1 Update the verification script in `.agents/skills/bedrock-skin-pack-verifier/scripts/verify-mcpack.py` to validate multiple skin entries in `skins.json`, and verify with dual-model pack inspection
- [x] 4.2 Run complete regression test suite (`go test ./...`) and build verification (`go build ./...`) to ensure all packages pass cleanly

## 5. GitHub Actions Release Workflow

- [x] 5.1 Create `.github/workflows/release.yml` with tag push trigger (`v*`), permissions, test run, cross-platform build (Linux & Windows amd64), checksum generation, and release asset upload
- [x] 5.2 Validate GitHub Actions workflow YAML syntax and verify local cross-compilation commands match the workflow definition
