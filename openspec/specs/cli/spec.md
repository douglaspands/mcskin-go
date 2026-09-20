# cli Specification

## Purpose
Provides a cross-platform command-line interface for converting PNG skins to Bedrock `.mcpack` archives on both Linux and Windows operating systems.

## Requirements

### Requirement: CLI Argument Parsing and File Input
The CLI SHALL accept a file path pointing to an input PNG skin as a positional argument or via a dedicated flag (`--input` / `-i`), OR launch the web server when invoked with `--web` or when executed with zero arguments on Windows, macOS (`darwin`), or graphical desktop environments.

#### Scenario: Positional argument input
- **WHEN** the user executes `mcskin path/to/skin.png`
- **THEN** the CLI processes the specified file and initiates the conversion workflow

#### Scenario: Missing input argument
- **WHEN** executed on Linux or non-Windows without arguments or input flags
- **THEN** the CLI displays usage instructions and exits with a non-zero status code

#### Scenario: Windows zero arguments execution
- **WHEN** the executable is run on Windows with zero arguments (such as double-clicking from File Explorer)
- **THEN** the CLI automatically starts the web server mode on the default port and opens the default web browser to the application page

#### Scenario: macOS zero arguments execution (Double-Click Launch)
- **WHEN** the executable or .app bundle is launched on macOS (`darwin`) with zero arguments (such as double-clicking from Finder)
- **THEN** the CLI automatically starts the web server mode on the default port and opens the default web browser to the application page

### Requirement: Web Server CLI Flags
The CLI SHALL accept a `--web` (or `-w`) flag to start the embedded web server, with optional `--port` (or `-p`) specifying the listening port and `--no-browser` to prevent automatic browser launch.

#### Scenario: Explicit web mode flag
- **WHEN** the user executes `mcskin --web`
- **THEN** the CLI starts the embedded web server and opens the default web browser unless `--no-browser` is specified

#### Scenario: Custom port specification
- **WHEN** the user executes `mcskin --web --port 9090`
- **THEN** the CLI starts the embedded web server on port 9090

#### Scenario: Headless or no-browser flag
- **WHEN** the user executes `mcskin --web --no-browser`
- **THEN** the CLI starts the embedded web server without invoking system browser launcher

### Requirement: Cross-Platform File Path Resolution
The CLI SHALL correctly resolve and process file paths across both Windows (including backslash separators and drive letters) and Linux operating systems.

#### Scenario: Windows path resolution
- **WHEN** executed on Windows with a path such as `.\files\skin.png` or `C:\Users\user\skin.png`
- **THEN** the path is normalized and processed identically to POSIX paths

#### Scenario: Linux path resolution
- **WHEN** executed on Linux with relative or absolute paths like `./files/skin.png`
- **THEN** the path is normalized and processed without errors

### Requirement: Skin Model Geometry Flag
The CLI SHALL support model selection flags (`--classic`, `--slim`, and `--both`) controlling whether the generated `.mcpack` contains classic (4px arms), slim (3px arms), or both skin models, defaulting to generating both models in the pack.

#### Scenario: Default geometry flag
- **WHEN** no model restriction flag is supplied
- **THEN** the CLI configures the output skin pack to include both classic and slim humanoid geometries

#### Scenario: Explicit slim flag
- **WHEN** the `--slim` flag is provided
- **THEN** the CLI configures the output skin pack with slim humanoid geometry only

#### Scenario: Explicit classic flag
- **WHEN** the `--classic` flag is provided
- **THEN** the CLI configures the output skin pack with classic humanoid geometry only

#### Scenario: Mutually exclusive flags
- **WHEN** both `--classic` and `--slim` flags are provided simultaneously
- **THEN** the CLI reports a command-line syntax error and exits with code 1

### Requirement: Process Exit Codes and Status Output
The CLI SHALL exit with code 0 upon successful conversion while outputting the generated `.mcpack` path and size, and exit with code 1 upon error with actionable error descriptions printed to stderr.

#### Scenario: Successful execution reporting
- **WHEN** conversion succeeds
- **THEN** the process prints a success message containing the destination file path and terminates with exit code 0

#### Scenario: Error execution reporting
- **WHEN** conversion fails due to missing file, invalid PNG, or permission errors
- **THEN** the process prints a descriptive error to standard error and terminates with exit code 1
