# Spec Delta: cli

## MODIFIED Requirements

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
