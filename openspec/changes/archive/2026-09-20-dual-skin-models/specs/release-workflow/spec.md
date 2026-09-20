# Spec Delta

## Purpose

Automates the compilation, packaging, and publishing of cross-platform executable binaries for Linux and Windows when release tags are pushed to GitHub.

## ADDED Requirements

### Requirement: Release Workflow Trigger and Execution
The release workflow SHALL trigger automatically on GitHub Actions whenever a git tag matching version patterns (`v*`) is pushed to the repository.

#### Scenario: Tag push triggers release workflow
- **WHEN** a git tag starting with `v` (e.g., `v1.1.0`) is pushed to the GitHub repository
- **THEN** the GitHub Actions release workflow is initiated

### Requirement: Cross-Platform Binary Compilation
The release workflow SHALL compile stripped, standalone binaries for both Linux (`GOOS=linux GOARCH=amd64`) and Windows (`GOOS=windows GOARCH=amd64`) with `CGO_ENABLED=0`.

#### Scenario: Build Linux and Windows binaries
- **WHEN** the release job executes
- **THEN** `png-to-mcpack-linux-amd64` and `png-to-mcpack-windows-amd64.exe` are successfully produced

### Requirement: Release Asset Publication
The release workflow SHALL attach the compiled binaries and SHA256 checksums directly to the GitHub Release matching the pushed tag.

#### Scenario: Attach assets to GitHub Release
- **WHEN** binary compilation and checksum generation finish successfully
- **THEN** the workflow attaches the executable binaries and checksum files to the GitHub Release for the tag
