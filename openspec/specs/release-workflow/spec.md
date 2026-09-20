# release-workflow Specification

## Purpose
Automates the compilation, packaging, and publishing of cross-platform executable binaries for Linux and Windows when release tags are pushed to GitHub.

## Requirements

### Requirement: Release Workflow Trigger and Execution
The release workflow SHALL trigger automatically on GitHub Actions whenever a git tag matching version patterns (`v*`) is pushed to the repository.

#### Scenario: Tag push triggers release workflow
- **WHEN** a git tag starting with `v` (e.g., `v1.1.0`) is pushed to the GitHub repository
- **THEN** the GitHub Actions release workflow is initiated

### Requirement: Cross-Platform Binary Compilation
The release workflow SHALL compile stripped, standalone binaries for Linux (`GOOS=linux GOARCH=amd64`), Windows (`GOOS=windows GOARCH=amd64`), and macOS Apple Silicon (`GOOS=darwin GOARCH=arm64`) with `CGO_ENABLED=0`.

#### Scenario: Build Linux and Windows binaries
- **WHEN** the release job executes
- **THEN** `mcskin-linux-amd64` and `mcskin-windows-amd64.exe` are successfully produced

#### Scenario: Build macOS Apple Silicon binary
- **WHEN** the release job executes
- **THEN** a stripped binary targeting `GOOS=darwin GOARCH=arm64` is successfully produced without external C libraries or runtime dependencies

### Requirement: Release Asset Publication
The release workflow SHALL attach the compiled binaries, desktop application bundles, and SHA256 checksums directly to the GitHub Release matching the pushed tag.

#### Scenario: Attach assets to GitHub Release
- **WHEN** binary compilation and checksum generation finish successfully
- **THEN** the workflow attaches the executable binaries and checksum files to the GitHub Release for the tag

#### Scenario: Packaging and publishing macOS App Bundle
- **WHEN** the release job packages macOS release assets
- **THEN** `mcskin_${TAG}_darwin_arm64.zip` is created containing `mcskin.app` (with `Contents/MacOS/mcskin`, `Contents/Info.plist`, and `Contents/Resources/mcskin.icns`) and the standalone CLI binary, and attached to the GitHub Release alongside `dist/checksums.txt`
