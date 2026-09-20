# skin-editor Specification

## Purpose
Provides an embedded, child-friendly 3D and 2D unwrapped Minecraft skin editor for PCs, tablets, and smartphones, supporting layer toggles, quick palettes, touch controls, PNG import/export, and direct .mcpack generation.

## Requirements

### Requirement: Interactive 3D Viewport and Painting
The editor SHALL provide an interactive 3D character viewport rendered with an embedded, zero-external-network 3D engine, supporting direct face painting via raycasting and quick orientation snap controls.

#### Scenario: Painting on 3D character mesh
- **WHEN** the user taps or clicks on a visible pixel of the 3D model while in Paint mode
- **THEN** the touched pixel on the active texture layer is updated with the selected color and the visual mesh texture refreshes immediately

#### Scenario: Quick orientation camera snapping
- **WHEN** the user clicks any of the quick orientation buttons (Frente, Costas, Lado Esquerdo, Lado Direito, Cima)
- **THEN** the camera animates smoothly or snaps directly to the requested perspective

#### Scenario: Pixel-accurate rendering and picking
- **WHEN** the 3D viewport renders the character texture or the user paints via raycasting, at any zoom level
- **THEN** the canvas render resolution accounts for the device pixel ratio and the texture uses nearest-neighbor sampling, so each texture pixel appears as one sharp, correctly aligned square and the pixel actually painted always matches the square visually under the pointer

### Requirement: Zoom Controls for Precision Painting
The editor SHALL provide zoom controls for both the 3D viewport and the 2D unwrapped sheet, allowing the user to magnify the view enough to see and paint individual texture pixels precisely.

#### Scenario: Zooming the 3D viewport
- **WHEN** the user drags the zoom slider, presses the zoom +/- buttons, scrolls the mouse wheel, or pinches on a touchscreen over the 3D viewport
- **THEN** the camera distance changes smoothly within a clamped min/max range, without clipping through the model or reversing orientation

#### Scenario: Zooming the 2D unwrapped sheet
- **WHEN** the user presses the zoom +/- buttons, scrolls the mouse wheel, or pinches on a touchscreen over the 2D sheet
- **THEN** the sheet magnification increases or decreases inside a scrollable container while every texture pixel keeps rendering as a single, correctly aligned square (no blur, no distortion, no offset between adjacent pixels)

### Requirement: Pixel Grid Line Toggle
The editor SHALL provide a single toggle button that shows or hides pixel-boundary grid lines on both the 3D viewport and the 2D unwrapped sheet, to help the user distinguish and paint individual texture pixels.

#### Scenario: Enabling the pixel grid
- **WHEN** the user clicks the grid toggle button while it is off
- **THEN** thin grid lines are drawn along every texture pixel boundary on the 2D sheet and overlaid on the 3D model's texture, without altering the underlying skin pixel data used for PNG export or `.mcpack` generation

#### Scenario: Disabling the pixel grid
- **WHEN** the user clicks the grid toggle button while it is on
- **THEN** the grid lines are removed from both views immediately, restoring the plain texture display

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
The editor SHALL permit users to toggle visibility for individual body parts and switch between the base body layer and the 3D overlay layer (jacket, sleeves, hat, pants).

#### Scenario: Hiding body parts to paint inner surfaces
- **WHEN** the user toggles off the visibility of the Head or Arms
- **THEN** the selected parts are hidden from the 3D viewport, exposing inner surfaces (e.g. neck, inner arms) for unobstructed painting

#### Scenario: Layer toggling
- **WHEN** the user switches between Base Layer and Outer Layer (Camada 3D)
- **THEN** paint operations apply exclusively to the chosen layer, with outer layer pixels supporting transparency

### Requirement: Starter Templates and Multi-Format Support
The editor SHALL provide 1-click starter templates (Steve, Alex, Blank canvas) and support 64x64, 64x32 classic, and 128x128 HD textures, plus transparency/glass mode.

#### Scenario: Loading starter templates
- **WHEN** the user selects the Steve, Alex, or Blank template
- **THEN** the canvas initializes with the chosen template's texture and geometry (classic 4px arms vs slim 3px arms)

#### Scenario: Classic 64x32 editing mode
- **WHEN** 64x32 classic mode is active
- **THEN** the canvas resizes to 64x32, right-side limb painting mirrors automatically to left-side limbs, and outer body layers are disabled in accordance with legacy skin rules

### Requirement: PNG File Transport and Direct MCPack Generation
The editor SHALL enable importing any standard skin PNG file, exporting the edited skin as a universal PNG file, and generating a ready-to-import `.mcpack` package directly from the editor view.

#### Scenario: Exporting skin as PNG
- **WHEN** the user clicks "Baixar Skin (PNG)"
- **THEN** the browser downloads a valid PNG file containing the active skin texture suitable for cross-device transport

#### Scenario: Direct Bedrock package generation
- **WHEN** the user clicks "Criar Pacote .mcpack"
- **THEN** the editor submits the current texture directly to `/api/convert` and triggers the download of the compiled `.mcpack` package
