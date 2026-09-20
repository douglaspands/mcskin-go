# skin-editor Specification

## Purpose
Provides an embedded, child-friendly 3D and 2D unwrapped Minecraft skin editor for PCs, tablets, and smartphones, supporting layer toggles, quick palettes, touch controls, PNG import/export, and direct .mcpack generation.

## Requirements

### Requirement: Interactive 3D Viewport and Painting
The editor SHALL provide an interactive 3D character viewport rendered with an embedded, zero-external-network 3D engine, supporting direct face painting via raycasting, dynamic camera target focusing per body part, and quick orientation snap controls.

#### Scenario: Painting on 3D character mesh
- **WHEN** the user taps or clicks on a visible pixel of the 3D model while in Paint mode
- **THEN** the touched pixel on the active texture layer is updated with the selected color and the visual mesh texture refreshes immediately

#### Scenario: Quick orientation camera snapping
- **WHEN** the user clicks any of the quick orientation buttons (Frente, Costas, Lado Esquerdo, Lado Direito, Cima, Baixo)
- **THEN** the camera animates smoothly or snaps directly to the requested perspective

#### Scenario: Pixel-accurate rendering and picking
- **WHEN** the 3D viewport renders the character texture or the user paints via raycasting, at any zoom level or focused camera target
- **THEN** the canvas render resolution accounts for the device pixel ratio and the texture uses nearest-neighbor sampling, so each texture pixel appears as one sharp, correctly aligned square and the pixel actually painted always matches the square visually under the pointer

#### Scenario: Focusing camera on specific body part
- **WHEN** the user selects a body part (e.g. Head, Torso, Left/Right Arm, Left/Right Leg) to focus
- **THEN** the 3D camera shifts its vertical and horizontal target center to that specific body part and smoothly zooms in for precision painting without the focused part clipping outside the viewport

### Requirement: Zoom Controls for Precision Painting
The editor SHALL provide compact, floating vertical zoom controls for the 3D viewport and zoom controls for the 2D unwrapped sheet, maximizing usable viewport space while allowing the user to magnify and recenter the view precisely.

#### Scenario: Zooming the 3D viewport
- **WHEN** the user taps the floating vertical `🔍+` (Zoom In), `🔍−` (Zoom Out), scrolls the mouse wheel, or pinches on a touchscreen over the 3D viewport
- **THEN** the camera distance changes smoothly within a clamped min/max range, without clipping through the model or reversing orientation

#### Scenario: Zooming the 2D unwrapped sheet
- **WHEN** the user presses the zoom +/- buttons, scrolls the mouse wheel, or pinches on a touchscreen over the 2D sheet
- **THEN** the sheet magnification increases or decreases inside a scrollable container while every texture pixel keeps rendering as a single, correctly aligned square (no blur, no distortion, no offset between adjacent pixels)

#### Scenario: Resetting camera to full-body view
- **WHEN** the user taps the floating vertical `⟲` (Reset) button
- **THEN** the camera resets its target to the whole-body center (Y=4), restores default camera distance (zoom=50), clears any single-part isolation focus, and returns to the default orientation

### Requirement: Pixel Grid Line Toggle
The editor SHALL provide a single toggle button that shows or hides subtle photography-style pixel alignment guide lines on both the 3D viewport and the 2D unwrapped sheet, ensuring exact mathematical cell alignment and hover visual feedback without darkening the character skin.

#### Scenario: Enabling the pixel grid
- **WHEN** the user clicks the grid toggle button while it is off
- **THEN** ultra-subtle, non-intrusive guide lines (low opacity, ~10-12%) are drawn along pixel boundaries on the 2D sheet and overlaid on the 3D model's texture, providing clear visual alignment support without darkening or obscuring skin pixels

#### Scenario: Disabling the pixel grid
- **WHEN** the user clicks the grid toggle button while it is on
- **THEN** the guide lines are removed from both views immediately, restoring the plain texture display

#### Scenario: Precise grid cell alignment and hover highlight
- **WHEN** the user hovers or clicks within any visible grid cell on the 3D model or 2D sheet while the grid is active
- **THEN** a visual reticle or subtle highlight outlines the exact targeted grid cell, and painting applies strictly within that cell's pixel bounds without spilling into adjacent pixels

### Requirement: Fullscreen Editing Mode
The editor SHALL allow the user to expand the editor into fullscreen to maximize available drawing space on any device.

#### Scenario: Entering fullscreen
- **WHEN** the user clicks the fullscreen toggle button
- **THEN** the editor requests fullscreen on the editor container, hiding non-essential chrome so the 3D viewport and 2D sheet occupy the maximum available screen space

#### Scenario: Exiting fullscreen
- **WHEN** the user clicks the fullscreen toggle again, presses Esc, or the browser exits fullscreen for any reason
- **THEN** the editor detects the fullscreen change and restores the normal layout without losing the current texture or tool state

### Requirement: Unwrapped 2D Sheet Painting Mode
The editor SHALL provide an unwrapped 2D texture sheet view displaying clearly labeled sections (Cabeça, Tronco, Braços, Pernas) for high-precision pixel painting on touchscreens.

#### Scenario: Switching to 2D unwrapped sheet view
- **WHEN** the user selects the 2D Sheet mode tab
- **THEN** the editor renders the magnified 2D pixel grid with labeled body sections, synchronizing all edits bidirectionally with the 3D model

#### Scenario: Pixel-accurate grid at any zoom level
- **WHEN** the 2D sheet is rendered, whether at default size or zoomed in
- **THEN** each rendered grid square corresponds to exactly one texture pixel with grid lines drawn precisely on pixel boundaries, so a tap or click always paints the pixel visually under the pointer

### Requirement: Child-Friendly Touch Ergonomics and Drawing Tools
The editor SHALL provide touch-optimized controls designed for children aged 6 and older, including a dedicated "Pintar" vs "Girar" mode switch, essential drawing tools, and Minecraft-themed quick palettes.

#### Scenario: Touch gesture differentiation
- **WHEN** the user is in "Pintar" mode on a touchscreen
- **THEN** single-finger drags draw pixels on the target surface without orbiting or rotating the camera

#### Scenario: Camera orbit in rotation mode
- **WHEN** the user is in "Girar" mode on a touchscreen
- **THEN** single-finger drags smoothly orbit the camera around the character without modifying texture pixels

#### Scenario: Drawing tools and history
- **WHEN** the user activates Pencil, Bucket (flood fill), Eraser, or Eyedropper, or triggers Undo / Redo
- **THEN** the corresponding tool operation executes correctly with Web Audio click feedback

### Requirement: Body Part Isolation and Layer Management
The editor SHALL permit users to toggle visibility for individual body parts and focus specific parts via an interactive 2D paper doll mannequin widget, as well as switch between the base body layer and the 3D overlay layer.

#### Scenario: Hiding body parts to paint inner surfaces
- **WHEN** the user toggles off the visibility of the Head or Arms via the mannequin widget or sidebar controls
- **THEN** the selected parts are hidden from the 3D viewport, exposing inner surfaces (e.g. neck, inner arms) for unobstructed painting

#### Scenario: Layer toggling
- **WHEN** the user switches between Base Layer and Outer Layer (Camada 3D)
- **THEN** paint operations apply exclusively to the chosen layer, with outer layer pixels supporting transparency

#### Scenario: 1-Tap focusing via interactive 2D mannequin widget
- **WHEN** the user clicks on a body part (Cabeça, Tronco, Braço D, Braço E, Perna D, Perna E) on the floating 2D mannequin widget in the 3D viewport
- **THEN** the 3D camera immediately centers its target on that body part and zooms in to provide an optimal painting perspective for that part

### Requirement: Starter Templates and Multi-Format Support
The editor SHALL provide 1-click starter templates (Steve, Alex, Blank canvas) with 100% complete UV face coverage and solid base body geometry, and support 64x64, 64x32 classic, and 128x128 HD textures, plus transparency/glass mode.

#### Scenario: Loading starter templates
- **WHEN** the user selects the Steve, Alex, or Blank template
- **THEN** all cuboid faces — including neck (bottom of head), shoulder tops, palm bottoms, shoe sides, and shoe soles — are completely initialized with solid pixels, ensuring the 3D humanoid character has no hollow voids or holes when viewed from above, below, or the sides

#### Scenario: Classic 64x32 editing mode
- **WHEN** 64x32 classic mode is active
- **THEN** the canvas resizes to 64x32, right-side limb painting mirrors automatically to left-side limbs, and outer body layers are disabled in accordance with legacy skin rules

### Requirement: PNG File Transport and Direct MCPack Generation
The editor SHALL prompt users to confirm or edit a unique skin name prior to downloading, pre-filling a time-based suggestion or the uploaded image's name, and enable exporting the active skin as a PNG file or compiling a ready-to-import `.mcpack` package using that confirmed name.

#### Scenario: Exporting skin as PNG
- **WHEN** the user confirms the skin name and requests a PNG download
- **THEN** the browser downloads a valid PNG file containing the active skin texture named after the confirmed skin name (e.g. `<skinName>.png`)

#### Scenario: Direct Bedrock package generation
- **WHEN** the user confirms the skin name and requests `.mcpack` creation
- **THEN** the editor submits the texture and confirmed skin name to `/api/convert` and downloads the compiled package named `<skinName>.mcpack` with matching metadata

#### Scenario: Pre-download skin naming confirmation
- **WHEN** the user clicks "Baixar Skin (PNG)" or "Criar Pacote .mcpack"
- **THEN** a naming confirmation modal opens pre-filled with a time-based suggestion (e.g. `skin_YYYYMMDD_HHMM`) for new skins or the original filename (without extension) for uploaded skins, allowing the user to confirm or edit before the download triggers
