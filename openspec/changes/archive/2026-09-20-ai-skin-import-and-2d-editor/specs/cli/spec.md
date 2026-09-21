# Spec Delta: cli

## ADDED Requirements

### Requirement: Windows Executable Resource Metadata and Manifest Embedding
The Windows executable build (`bin/mcskin.exe`) SHALL embed a Windows resource object (`.syso`) containing `VERSIONINFO` metadata (product name, description, version, copyright), a dedicated application icon, and an embedded application manifest specifying execution level `asInvoker` without administrative elevation requirements.

#### Scenario: Compiling Windows binary with embedded resources
- **WHEN** the Windows binary is built via `make build-windows`
- **THEN** `bin/mcskin.exe` includes embedded `VERSIONINFO`, application icon, and `<requestedExecutionLevel level="asInvoker"/>` manifest in its PE resource section

#### Scenario: Inspecting executable properties on Windows
- **WHEN** the user inspects file properties of `mcskin.exe` on Windows
- **THEN** the Details tab displays product name `mcskin`, file description, current version, and verified invoker privileges
