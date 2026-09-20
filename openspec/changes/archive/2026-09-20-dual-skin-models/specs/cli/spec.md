# Spec Delta

## MODIFIED Requirements

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
