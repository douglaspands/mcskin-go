# Spec Delta: pack-conversion

## ADDED Requirements

### Requirement: Browser Converter AI Image Pre-processing and Downsampling
The web converter interface SHALL accept high-resolution PNG skin textures in the file dropzone, automatically downsample square textures `>= 1024px` to `128x128`, square textures `< 1024px` to `64x64`, and `2:1` textures to `64x32` prior to packaging, and present an interactive 2D character preview matching the downsampled resolution.

#### Scenario: Dropping high-resolution AI skin onto converter dropzone
- **WHEN** the user selects or drops a PNG with dimensions exceeding standard sizes (e.g. 2048x2048 or 1024x1024) into the converter dropzone
- **THEN** the browser downsamples the image client-side to compliant dimensions (128x128 for `>= 1024px`, 64x64 otherwise), updates `#fileDimsDisplay` with original and adjusted dimensions, renders the character preview, and enables `.mcpack` conversion

#### Scenario: Converting downsampled AI skin to .mcpack
- **WHEN** the user initiates `.mcpack` creation for a downsampled AI skin
- **THEN** the client sends the downsampled PNG blob to `/api/convert`, which successfully validates and compiles a compliant `.mcpack` skin pack archive
