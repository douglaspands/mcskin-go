# pack-conversion Spec Delta

## MODIFIED Requirements

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
- **THEN** the client sends the downsampled PNG blob matching the chosen output resolution to `/api/convert`, which successfully validates and compiles a compliant `.mcpack` skin pack archive

## ADDED Requirements

### Requirement: Browser Converter Output Resolution Selection
The web converter interface SHALL present an interactive resolution selector whenever an uploaded skin texture has an original resolution greater than 64x64, allowing the user to select whether the generated `.mcpack` should be packaged in 128x128 (HD Bedrock) or 64x64 (Standard Classic) resolution.

#### Scenario: Changing target resolution for high-resolution upload
- **WHEN** a high-resolution skin (> 64x64) is uploaded and the user switches the resolution selector between 128x128 HD and 64x64 Standard
- **THEN** the converter updates the active texture blob to the selected resolution, re-renders the character preview at the chosen resolution, and configures `.mcpack` generation to package the selected dimensions

#### Scenario: Uploading standard 64x64 skin
- **WHEN** a standard 64x64 or 64x32 skin is uploaded
- **THEN** the resolution selector remains hidden or locked to standard resolution, maintaining the original texture fidelity without upscaling
