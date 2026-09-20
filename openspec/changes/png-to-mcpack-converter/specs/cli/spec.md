# Spec Delta

## Purpose

Provides a cross-platform command-line interface for converting PNG skins to Bedrock `.mcpack` archives on both Linux and Windows operating systems.

## ADDED Requirements

### Requirement: CLI Argument Parsing and File Input
The CLI SHALL accept a file path pointing to an input PNG skin as a positional argument or via a dedicated flag (`--input` / `-i`).

#### Scenario: Positional argument input
- **WHEN** the user executes `png-to-mcpack path/to/skin.png`
- **THEN** the CLI processes the specified file and initiates the conversion workflow

#### Scenario: Missing input argument
- **WHEN** the user executes `png-to-mcpack` without arguments or input flags
- **THEN** the CLI displays usage instructions and exits with a non-zero status code

### Requirement: Cross-Platform File Path Resolution
The CLI SHALL correctly resolve and process file paths across both Windows (including backslash separators and drive letters) and Linux operating systems.

#### Scenario: Windows path resolution
- **WHEN** executed on Windows with a path such as `.\files\skin.png` or `C:\Users\user\skin.png`
- **THEN** the path is normalized and processed identically to POSIX paths

#### Scenario: Linux path resolution
- **WHEN** executed on Linux with relative or absolute paths like `./files/skin.png`
- **THEN** the path is normalized and processed without errors

### Requirement: Skin Model Geometry Flag
The CLI SHALL support an optional flag (`--slim` or `--model`) allowing the user to select between classic (Steve, 4px arms) and slim (Alex, 3px arms) skin geometries.

#### Scenario: Default geometry flag
- **WHEN** no geometry flag is supplied
- **THEN** the CLI defaults to classic humanoid geometry

#### Scenario: Explicit slim flag
- **WHEN** the `--slim` flag is provided
- **THEN** the CLI configures the output skin pack with slim humanoid geometry

### Requirement: Process Exit Codes and Status Output
The CLI SHALL exit with code 0 upon successful conversion while outputting the generated `.mcpack` path and size, and exit with code 1 upon error with actionable error descriptions printed to stderr.

#### Scenario: Successful execution reporting
- **WHEN** conversion succeeds
- **THEN** the process prints a success message containing the destination file path and terminates with exit code 0

#### Scenario: Error execution reporting
- **WHEN** conversion fails due to missing file, invalid PNG, or permission errors
- **THEN** the process prints a descriptive error to standard error and terminates with exit code 1
