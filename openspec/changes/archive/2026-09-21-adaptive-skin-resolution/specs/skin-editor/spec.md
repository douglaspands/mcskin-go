# skin-editor Spec Delta

## MODIFIED Requirements

### Requirement: Local Skin PNG Import and Asynchronous Reader
The editor SHALL provide a local file upload mechanism enabling users to load, inspect, and continue editing existing Minecraft skin PNG textures of any square or 2:1 resolution. Square images with dimensions `> 64x64` (e.g. 128x128, 256x256, 500x500, 512x512, 1024x1024, 2048x2048) SHALL be downsampled client-side via stepped high-fidelity downsampling to `128x128` pixels (preserving HD detail) and initialize the editor in 128x128 HD mode. Square images `<= 64x64` SHALL initialize the editor in `64x64` mode, and rectangular `2:1` images SHALL downsample to `64x32`. Background detection and removal SHALL remain active.

#### Scenario: Uploading an existing skin PNG
- **WHEN** the user clicks "Abrir / Carregar PNG" and selects a valid 64x64, 64x32, or 128x128 PNG file
- **THEN** the file is parsed asynchronously using `FileReader`, validated for dimension and format compliance, loaded onto the 3D humanoid mesh and 2D canvas, and model geometry automatically updates to slim or classic based on arm transparency

#### Scenario: Rejecting an invalid file format or dimension
- **WHEN** the user attempts to load a non-PNG file or a non-image file
- **THEN** a friendly error notification is displayed in `#dockHintStrip` or alert toast, and the existing canvas content is preserved without corruption

#### Scenario: Uploading high-resolution AI skin image (>= 1024px)
- **WHEN** the user uploads a valid PNG image with square dimensions `>= 1024x1024` (e.g. 1024x1024 or 2048x2048)
- **THEN** the image is downsampled client-side via stepped high-fidelity downsampling to `128x128` pixels, preserving HD detail, loaded into the texture canvas and 3D mesh, the editor switches to 128x128 mode, and `#dockHintStrip` confirms successful HD import

#### Scenario: Uploading standard-range AI skin image (< 1024px)
- **WHEN** the user uploads a valid PNG image with square dimensions greater than 64x64 but less than 1024x1024 (e.g. 256x256, 500x500, or 512x512)
- **THEN** the image is downsampled client-side via stepped high-fidelity downsampling to `128x128` pixels, loaded into the editor in 128x128 mode, and model geometry updates automatically

#### Scenario: Prompting for solid background removal on AI images
- **WHEN** an uploaded skin image is fully opaque (alpha 255 throughout) or contains uniform non-transparent color in outer non-UV corner areas
- **THEN** a confirmation dialog opens asking "Detectamos um fundo sólido nesta imagem. Deseja tentar remover o fundo e deixá-lo transparente?"

#### Scenario: User accepts solid background removal
- **WHEN** the user confirms background removal in the dialog
- **THEN** the editor samples background color from corners/edges, floods or clears outer non-UV matching pixels to transparent, preserves humanoid skin features, and renders the cleaned texture

#### Scenario: User declines background removal
- **WHEN** the user cancels or declines background removal in the dialog
- **THEN** the editor loads the downsampled image as-is without altering pixel alpha

## ADDED Requirements

### Requirement: Dynamic Resolution and Grid Synchronization
The 2D pixel editor and 3D raycast painter SHALL dynamically adapt their coordinate calculations, canvas dimensions, grid division overlays, undo/redo buffers, and hover indicator geometry to match the active texture resolution (64x64 or 128x128).

#### Scenario: 2D pixel editor coordinate picking at 128x128
- **WHEN** the user clicks or paints on the 2D sheet canvas while working on a 128x128 texture
- **THEN** the coordinate picker maps pointer positions accurately to discrete 0..127 pixel coordinates, updates the undo buffer for 128x128 data, and draws a 128x128 pixel grid when grid overlay is enabled

#### Scenario: 3D raycast painting and hover box at 128x128
- **WHEN** the user hovers or paints over the 3D mannequin while working on a 128x128 texture
- **THEN** raycasting scales UV coordinates by a factor of 2 (`128/64`), targets the precise 128x128 sub-pixel, scales the 3D hover highlight box to half-size (0.5 unit), and updates the 128x128 texture seamlessly

### Requirement: Editor Export Resolution Selection
When exporting an active skin from the 3D editor (as PNG or `.mcpack`) that is currently in 128x128 resolution, the pre-download confirmation modal SHALL provide an interactive option to export in either 128x128 HD or downsampled 64x64 Standard resolution.

#### Scenario: Exporting 128x128 skin as HD
- **WHEN** the user confirms export of a 128x128 skin with the 128x128 HD option selected
- **THEN** the downloaded PNG or compiled `.mcpack` contains the full 128x128 texture with all painted details preserved

#### Scenario: Exporting 128x128 skin downsampled to 64x64
- **WHEN** the user confirms export of a 128x128 skin with the 64x64 Standard option selected
- **THEN** the client downsamples the texture canvas to 64x64 before downloading the PNG or submitting to `/api/convert` for `.mcpack` generation
