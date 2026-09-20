# Spec Delta

## MODIFIED Requirements

### Requirement: Bedrock Skin Metadata Generation
The system SHALL generate `skins.json` defining skin entries, humanoid geometry (`geometry.humanoid.custom` for classic 4px arms and `geometry.humanoid.customSlim` for slim 3px arms), localization keys, and texture paths. By default, the system SHALL generate both classic and slim skin entries sharing the single texture file, while allowing single-geometry generation when explicitly requested.

#### Scenario: Standard geometry assignment
- **WHEN** a skin is processed with classic-only model configuration
- **THEN** `skins.json` specifies only `geometry.humanoid.custom` for classic 4-pixel arm models

#### Scenario: Slim model geometry assignment
- **WHEN** a skin is processed with slim-only model configuration
- **THEN** `skins.json` specifies only `geometry.humanoid.customSlim` for 3-pixel arm models

#### Scenario: Default dual-model generation
- **WHEN** a skin is processed without restricting model flags
- **THEN** `skins.json` contains two skin entries (one with `geometry.humanoid.custom` and one with `geometry.humanoid.customSlim`) referencing the same texture file, and `texts/en_US.lang` defines localized names for both variants
