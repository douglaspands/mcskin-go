# pack-conversion Specification Delta

## MODIFIED Requirements

### Requirement: PNG Image Validation
The system SHALL validate that the input file is a valid PNG image matching supported Minecraft skin dimensions (64x64, 64x32 classic legacy, or 128x128 pixels) and 8-bit RGBA color format.

#### Scenario: Valid 64x32 classic skin PNG
- **WHEN** an input file is a valid 64x32 RGBA PNG image
- **THEN** the system successfully reads and validates the texture data without errors

#### Scenario: Valid 64x64 skin PNG
- **WHEN** an input file is a valid 64x64 RGBA PNG image
- **THEN** the system successfully reads and validates the texture data without errors

#### Scenario: Non-PNG or corrupt file
- **WHEN** an input file is not a valid PNG image or contains corrupted headers
- **THEN** the system rejects the file and returns a descriptive validation error

#### Scenario: Unsupported image dimensions
- **WHEN** an input PNG has dimensions different from supported Minecraft skin dimensions (e.g. 100x100 pixels)
- **THEN** the system rejects the image with an invalid dimensions error message
