# cli Specification Delta

## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: CLI Argument Parsing and File Input
The CLI SHALL accept a file path pointing to an input PNG skin as a positional argument or via a dedicated flag (`--input` / `-i`), OR launch the web server when invoked with `--web` or when executed with zero arguments on Windows.

#### Scenario: Positional argument input
- **WHEN** the user executes `mcskin path/to/skin.png`
- **THEN** the CLI processes the specified file and initiates the conversion workflow

#### Scenario: Missing input argument
- **WHEN** executed on Linux or non-Windows without arguments or input flags
- **THEN** the CLI displays usage instructions and exits with a non-zero status code

#### Scenario: Windows zero arguments execution
- **WHEN** the executable is run on Windows with zero arguments (such as double-clicking from File Explorer)
- **THEN** the CLI automatically starts the web server mode on the default port and opens the default web browser to the application page
