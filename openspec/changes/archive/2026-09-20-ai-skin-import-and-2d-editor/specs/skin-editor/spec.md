# Spec Delta: skin-editor

## MODIFIED Requirements

### Requirement: Pixel Grid Line Toggle
The editor SHALL provide a single toggle button that shows or hides subtle photography-style pixel alignment guide lines on both the 3D viewport and the 2D unwrapped sheet using a delicate translucent dark shadow stroke (`rgba(0, 0, 0, 0.10)`) rendered at 16x upscale scale, preventing harsh white "cage" visual artifacts on dark skin colors and keeping line thickness at ~6% of pixel width, while presenting a clean 2D canvas free of obtrusive neon overlays.

#### Scenario: Enabling the pixel grid
- **WHEN** the user clicks the grid toggle button while it is off
- **THEN** ultra-subtle, non-intrusive guide lines (low opacity, ~10-12%) are drawn along pixel boundaries on the 2D sheet and overlaid on the 3D model's texture, providing clear visual alignment support without darkening or obscuring skin pixels

#### Scenario: Disabling the pixel grid
- **WHEN** the user clicks the grid toggle button while it is on
- **THEN** the guide lines are removed from both views immediately, restoring the plain texture display

#### Scenario: Precise grid cell alignment and hover highlight
- **WHEN** the user hovers or clicks within any visible grid cell on the 3D model or 2D sheet while the grid is active
- **THEN** a visual reticle or subtle highlight outlines the exact targeted grid cell, and painting applies strictly within that cell's pixel bounds without spilling into adjacent pixels

### Requirement: Unwrapped 2D Sheet Painting Mode
The editor SHALL provide an unwrapped 2D texture sheet view (`#editor2DCanvas`) and a dedicated `[ 🧊 3D | 📜 2D ]` view mode segmented control placed in the top options bar immediately adjacent to the Steve and Alex model toggle pill, allowing instantaneous switching between the 3D character viewport and the 2D unfolded texture sheet canvas, enabling precise painting on occluded body parts (including inner arm surfaces touching the torso, inner leg surfaces, chin underside, and shoe soles) with bidirectional real-time texture synchronization.

#### Scenario: Switching to 2D unwrapped sheet view
- **WHEN** the user clicks or taps `#btnMode2D` in the top options bar
- **THEN** `#btnMode2D` receives the active state, `#characterWorld`, the mannequin focus widget, floating rotate/paint pill, and 3D zoom controls are hidden, `#wrapper2D` is displayed with `#editor2DCanvas` fitted into the viewport, and `#dockHintStrip` updates to describe 2D sheet editing

#### Scenario: Pixel-accurate grid at any zoom level
- **WHEN** the 2D sheet is rendered, whether at default size or zoomed in
- **THEN** each rendered grid square corresponds to exactly one texture pixel with grid lines drawn precisely on pixel boundaries, so a tap or click always paints the pixel visually under the pointer

#### Scenario: Toggling from 2D back to 3D view mode
- **WHEN** the user clicks or taps `#btnMode3D` in the top options bar
- **THEN** `#btnMode3D` receives the active state, `#wrapper2D` is hidden, `#characterWorld` and 3D controls are restored, the 3D mannequin immediately reflects all modifications painted in 2D mode, and `#dockHintStrip` updates to describe 3D editing

#### Scenario: Painting occluded surfaces on the 2D sheet
- **WHEN** the user selects a tool (Pencil, Bucket, Recolor, Eraser) and paints on any UV coordinate of the 2D sheet
- **THEN** the pixel is painted on `textureCanvas`, added to the undo stack, and instantly synchronized with the 3D texture

### Requirement: Local Skin PNG Import and Asynchronous Reader
The editor SHALL provide a local file upload mechanism enabling users to load, inspect, and continue editing existing Minecraft skin PNG textures, and automatically detecting and downsampling high-resolution AI-generated skin textures: square images `>= 1024x1024` downsample to `128x128` (HD Bedrock), square images `< 1024x1024` downsample to `64x64`, and rectangular `2:1` images downsample to `64x32`. Additionally, when an uploaded image lacks alpha transparency or contains uniform opaque background borders, the editor SHALL prompt the user to confirm whether to attempt automatic background removal.

#### Scenario: Uploading an existing skin PNG
- **WHEN** the user clicks "Abrir / Carregar PNG" and selects a valid 64x64, 64x32, or 128x128 PNG file
- **THEN** the file is parsed asynchronously using `FileReader`, validated for dimension and format compliance, loaded onto the 3D humanoid mesh and 2D canvas, and model geometry automatically updates to slim or classic based on arm transparency

#### Scenario: Rejecting an invalid file format or dimension
- **WHEN** the user attempts to load a non-PNG file or a PNG with invalid dimensions (e.g. 500x500)
- **THEN** a friendly error notification is displayed in `#dockHintStrip` or alert toast, and the existing canvas content is preserved without corruption

#### Scenario: Uploading high-resolution AI skin image (>= 1024px)
- **WHEN** the user uploads a valid PNG image with square dimensions `>= 1024x1024` (e.g. 1024x1024 or 2048x2048)
- **THEN** the image is downsampled client-side via HTML5 canvas to `128x128` pixels, preserving HD detail, loaded into the texture canvas and 3D mesh, and `#dockHintStrip` confirms successful HD import

#### Scenario: Uploading standard-range AI skin image (< 1024px)
- **WHEN** the user uploads a valid PNG image with square dimensions greater than 128x128 but less than 1024x1024 (e.g. 512x512)
- **THEN** the image is downsampled client-side to `64x64` pixels, loaded into the editor, and model geometry updates automatically

#### Scenario: Prompting for solid background removal on AI images
- **WHEN** an uploaded skin image is fully opaque (alpha 255 throughout) or contains uniform non-transparent color in outer non-UV corner areas
- **THEN** a confirmation dialog opens asking "Detectamos um fundo sólido nesta imagem. Deseja tentar remover o fundo e deixá-lo transparente?"

#### Scenario: User confirms background removal
- **WHEN** the user chooses to remove the background
- **THEN** the detected background color sampled from non-UV regions is converted to transparent alpha (`a = 0`), the texture updates, and changes are recorded in the undo stack

#### Scenario: User declines background removal
- **WHEN** the user declines background removal
- **THEN** the downsampled image is loaded with its original pixel colors preserved intact
