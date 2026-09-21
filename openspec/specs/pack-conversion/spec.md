# pack-conversion Specification

## Purpose
Enables conversion of PNG Minecraft skin textures into fully compliant Minecraft Bedrock `.mcpack` skin pack archives saved directly alongside the source image.

## Requirements

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

### Requirement: Output Path and Extension Matching
The system SHALL generate the resulting `.mcpack` file in the identical directory as the input `.png` file, using the exact same base filename with only the extension changed from `.png` to `.mcpack`.

#### Scenario: File placement in source directory
- **WHEN** a PNG file located at `files/example-skin.png` is converted
- **THEN** the output archive is created at `files/example-skin.mcpack`

#### Scenario: Existing output file handling
- **WHEN** an output `.mcpack` already exists at the destination path
- **THEN** the system safely overwrites the target file when overwrite is authorized or halts with an error if overwrite is disabled

### Requirement: Bedrock Skin Pack Manifest Generation
The system SHALL generate a valid Bedrock `manifest.json` containing `format_version: 2`, a header with a generated RFC-4122 UUIDv4, and a `skin_pack` module with a separate unique UUIDv4.

#### Scenario: Valid manifest schema and UUID uniqueness
- **WHEN** constructing the manifest for a converted skin
- **THEN** `manifest.json` contains two distinct UUIDv4 values and valid Bedrock skin pack metadata

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

### Requirement: MCPack Archive Packaging
The system SHALL assemble a ZIP-compressed archive with the `.mcpack` file extension containing `manifest.json`, `skins.json`, `texts/en_US.lang`, and the PNG texture file located at the archive root.

#### Scenario: Valid mcpack zip archive creation
- **WHEN** packaging is executed
- **THEN** the resulting `.mcpack` is readable by standard zip tools and contains all required manifest, skin, and texture files without unneeded parent directory nesting

### Requirement: Browser Converter AI Image Pre-processing and Downsampling
The web converter interface SHALL accept PNG skin textures of any square or 2:1 resolution in the file dropzone, automatically apply stepped high-fidelity downsampling with alpha edge preservation, normalize square textures `> 64x64` to `128x128` (with user option to downsample to `64x64`), square textures `<= 64x64` to `64x64`, and `2:1` rectangular textures to `64x32` prior to packaging, and present an interactive 2D character preview matching the active downsampled resolution.

#### Scenario: Dropping high-resolution AI skin onto converter dropzone
- **WHEN** the user selects or drops a PNG with square dimensions greater than 64x64 (e.g. 256x256, 500x500, 512x512, 1024x1024, 2048x2048) into the converter dropzone
- **THEN** the browser executes stepped high-fidelity downsampling client-side, defaults to 128x128 HD, displays the original and adjusted dimensions in `#fileDimsDisplay`, reveals the output resolution selector, renders the character preview, and enables `.mcpack` conversion

#### Scenario: Dropping legacy or rectangular 2:1 texture onto converter dropzone
- **WHEN** the user selects or drops a PNG with rectangular 2:1 aspect ratio (e.g. 128x64, 500x250, 1024x512) into the converter dropzone
- **THEN** the browser downsamples the image client-side to 64x32 legacy classic dimensions, hides the HD resolution selector, and enables `.mcpack` conversion

#### Scenario: Converting downsampled AI skin to .mcpack
- **WHEN** the user initiates `.mcpack` creation for a downsampled skin
- **THEN** the client sends the downsampled PNG blob matching the chosen output resolution to `/api/convert`, which successfully validates and compiles a compliant `.mcpack` skin pack archive on Linux and Windows

### Requirement: Browser Converter Output Resolution Selection
The web converter interface SHALL present an interactive resolution selector whenever an uploaded skin texture has an original resolution greater than 64x64, allowing the user to select whether the generated `.mcpack` should be packaged in 128x128 (HD Bedrock) or 64x64 (Standard Classic) resolution.

#### Scenario: Changing target resolution for high-resolution upload
- **WHEN** a high-resolution skin (> 64x64) is uploaded and the user switches the resolution selector between 128x128 HD and 64x64 Standard
- **THEN** the converter updates the active texture blob to the selected resolution, re-renders the character preview at the chosen resolution, and configures `.mcpack` generation to package the selected dimensions

#### Scenario: Uploading standard 64x64 skin
- **WHEN** a standard 64x64 or 64x32 skin is uploaded
- **THEN** the resolution selector remains hidden and the original texture fidelity is preserved without upscaling


