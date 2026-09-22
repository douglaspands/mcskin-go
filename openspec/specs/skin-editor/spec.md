# skin-editor Specification

## Purpose
Provides an embedded, child-friendly 3D and 2D unwrapped Minecraft skin editor for PCs, tablets, and smartphones, supporting layer toggles, quick palettes, touch controls, PNG import/export, and direct .mcpack generation.

## Requirements

### Requirement: Interactive 3D Viewport and Painting
The editor SHALL provide an interactive 3D character viewport rendered with an embedded, zero-external-network 3D engine, supporting direct face painting via raycasting, dynamic camera target focusing per body part, and quick orientation snap controls.

#### Scenario: Painting on 3D character mesh
- **WHEN** the user taps or clicks a visible pixel of the 3D model in Paint mode
- **THEN** the touched pixel on the active texture layer updates with the selected color and the mesh texture refreshes immediately

#### Scenario: Quick orientation camera snapping
- **WHEN** the user clicks a quick orientation button (Frente, Costas, Lado Esquerdo, Lado Direito, Cima, Baixo)
- **THEN** the camera animates or snaps to that perspective

#### Scenario: Pixel-accurate rendering and picking
- **WHEN** the 3D viewport renders the texture or the user paints via raycasting, at any zoom or focused target
- **THEN** render resolution accounts for device pixel ratio and nearest-neighbor sampling, so each texture pixel appears as one sharp, correctly aligned square that matches the point painted under the pointer

#### Scenario: Focusing camera on specific body part
- **WHEN** the user selects a body part (Head, Torso, Left/Right Arm, Left/Right Leg) to focus
- **THEN** the camera shifts its target to that part and zooms in for precision painting without clipping it outside the viewport

### Requirement: Zoom Controls for Precision Painting
The editor SHALL provide compact, floating vertical zoom controls for the 3D viewport and zoom controls for the 2D unwrapped sheet (`#wrapper2D`), maximizing usable viewport space while allowing the user to magnify, pan, and recenter the view precisely.

#### Scenario: Zooming the 3D viewport
- **WHEN** the user taps floating `🔍+`/`🔍−`, scrolls the wheel, or pinches over the 3D viewport
- **THEN** camera distance changes smoothly within a clamped min/max range, without clipping through the model or reversing orientation

#### Scenario: Zooming the 2D unwrapped sheet
- **WHEN** the user presses the zoom +/- buttons, scrolls the wheel, or pinches over the 2D sheet
- **THEN** sheet magnification changes inside a scrollable container while every texture pixel keeps rendering as one correctly aligned square

#### Scenario: Resetting camera to full-body view
- **WHEN** the user taps the floating `⟲` (Reset) button
- **THEN** the camera target resets to whole-body center (Y=4), distance resets (zoom=50), part isolation clears, and default orientation returns

#### Scenario: Pan navigation on a magnified 2D sheet
- **WHEN** the 2D sheet is zoomed above 1x and the user two-finger-drags (touch) or mouse-drags (desktop)
- **THEN** the sheet pans smoothly to reveal occluded regions without triggering accidental painting

#### Scenario: Recentering the 2D sheet
- **WHEN** the user clicks the recenter button (`btnZoom2DReset` / `⟲`) on the 2D stage
- **THEN** the sheet scale resets to 1x and pan offsets center immediately

#### Scenario: Single-finger pixel painting on 2D sheet
- **WHEN** the user paints with one finger or the primary mouse button on the 2D sheet, at any zoom level
- **THEN** pixels are accurately painted at the exact touched coordinates

### Requirement: Pixel Grid Line Toggle
The editor SHALL provide a single toggle showing or hiding subtle photography-style pixel alignment guide lines on both the 3D viewport and 2D sheet using a translucent dark stroke (`rgba(0, 0, 0, 0.10)`) at 16x upscale, avoiding harsh white "cage" artifacts on dark skin colors and keeping line thickness at ~6% of pixel width.

#### Scenario: Enabling the pixel grid
- **WHEN** the user clicks the grid toggle while off
- **THEN** ultra-subtle guide lines (~10-12% opacity) draw along pixel boundaries on the 2D sheet and 3D model texture, without obscuring skin pixels

#### Scenario: Disabling the pixel grid
- **WHEN** the user clicks the grid toggle while on
- **THEN** the guide lines are removed from both views immediately

#### Scenario: Precise grid cell alignment and hover highlight
- **WHEN** the user hovers or clicks a visible grid cell on the 3D model or 2D sheet while the grid is active
- **THEN** a reticle or highlight outlines the exact cell, and painting stays strictly within that cell's bounds

### Requirement: Fullscreen Editing Mode
The editor SHALL allow expanding into fullscreen to maximize drawing space on any device, with the toggle in the navigation drawer footer immediately above the server shutdown button, and an exit control always reachable while fullscreen is active.

#### Scenario: Entering fullscreen
- **WHEN** the user clicks the fullscreen toggle
- **THEN** fullscreen is requested on the editor container, hiding non-essential chrome so the 3D viewport and 2D sheet occupy maximum screen space

#### Scenario: Exiting fullscreen
- **WHEN** the user clicks the toggle again, presses Esc, or the browser exits fullscreen for any reason
- **THEN** the editor detects the change and restores normal layout without losing texture or tool state

#### Scenario: Mobile header fullscreen toggle placement
- **WHEN** viewing on mobile or tablet widths
- **THEN** the fullscreen toggle renders inside the top header bar, 1-tap accessible

#### Scenario: Exit control remains reachable inside fullscreen on mobile
- **WHEN** the editor is in fullscreen on a mobile/tablet viewport
- **THEN** fullscreen is requested on the whole document (not a sub-element), so the header toggle that opened it stays reachable to exit, on every viewport width

#### Scenario: Drawer footer fullscreen toggle placement
- **WHEN** viewing the app drawer or desktop sidebar menu
- **THEN** the fullscreen toggle sits inside the drawer footer immediately above the shutdown button

### Requirement: Unwrapped 2D Sheet Painting Mode
The editor SHALL provide an unwrapped 2D texture sheet view (`#editor2DCanvas`) and a `[ 🧊 3D | 📜 2D ]` segmented control in the top options bar next to the Steve/Alex model toggle, allowing instant switching between the 3D viewport and 2D sheet, enabling precise painting on occluded surfaces (inner arms/legs, chin underside, shoe soles) with bidirectional real-time synchronization.

#### Scenario: Switching to 2D unwrapped sheet view
- **WHEN** the user taps `#btnMode2D` in the top options bar
- **THEN** `#btnMode2D` becomes active, `#characterWorld`, the mannequin widget, floating pill, and 3D zoom controls hide, `#wrapper2D` displays with `#editor2DCanvas` fitted to viewport, and `#dockHintStrip` updates for 2D editing

#### Scenario: Pixel-accurate grid at any zoom level
- **WHEN** the 2D sheet renders, at default size or zoomed
- **THEN** each grid square corresponds to exactly one texture pixel with lines on pixel boundaries, so a tap always paints the pixel visually under the pointer

#### Scenario: Toggling from 2D back to 3D view mode
- **WHEN** the user taps `#btnMode3D` in the top options bar
- **THEN** `#btnMode3D` becomes active, `#wrapper2D` hides, `#characterWorld` and 3D controls restore reflecting all 2D-mode edits, and `#dockHintStrip` updates for 3D editing

#### Scenario: Painting occluded surfaces on the 2D sheet
- **WHEN** the user selects a tool (Pencil, Bucket, Recolor, Eraser) and paints any UV coordinate on the 2D sheet
- **THEN** the pixel paints on `textureCanvas`, pushes to the undo stack, and instantly syncs to the 3D texture

### Requirement: Child-Friendly Touch Ergonomics and Drawing Tools
The editor SHALL provide touch-optimized controls for children aged 6+, including a "Pintar" vs "Girar" mode switch (floating pill centered atop the 3D stage, per `docs/prototypes/web-skin-editor-prototype.html`), drawing tools in a uniform bottom tool dock, Minecraft-themed quick palettes via a color bottom sheet, streamlined mobile gesture rotation with discrete height/zoom adjustments, and hybrid two-finger rotation/pinch within paint mode.

#### Scenario: Touch gesture differentiation
- **WHEN** the user is in "Pintar" mode on a touchscreen
- **THEN** single-finger drags draw pixels without orbiting the camera

#### Scenario: Camera orbit in rotation mode
- **WHEN** the user is in "Girar" mode on a touchscreen
- **THEN** single-finger drags orbit the camera without modifying texture pixels

#### Scenario: Drawing tools and history
- **WHEN** the user activates Pencil, Bucket (flood fill), Trocar (replace every pixel of the clicked color anywhere in the texture), Eraser, Undo, or Redo
- **THEN** the operation executes correctly with Web Audio click feedback
- **Note**: the Eyedropper tool from the prior revision is intentionally dropped from the bottom dock's 6-slot layout, per the reference prototype and explicit user confirmation trading it off against dock uniformity.

#### Scenario: Mobile viewport rotation without arrow turn buttons
- **WHEN** the user interacts with the 3D viewport on mobile devices
- **THEN** redundant on-screen arrow buttons are omitted, and single-touch drags in "Girar" mode orbit the model in all directions

#### Scenario: Desktop stage vertical height and zoom adjustments
- **WHEN** operating on desktop screens
- **THEN** floating controls for model height (Subir/Descer) and camera zoom (+/-) stay available on the stage perimeter without obscuring the canvas

#### Scenario: Hybrid two-finger rotation and pinch in "Pintar" mode
- **WHEN** "Pintar" mode is active and the user touches the 3D stage with two fingers
- **THEN** two-finger dragging rotates and pinching zooms the character, while single-finger touches keep painting precisely

### Requirement: Body Part Isolation and Layer Management
The editor SHALL permit switching between the base body layer and the 3D overlay layer via a single cycling control in the bottom tool dock, showing the active layer's icon and name, and focusing specific parts via the interactive 2D paper doll mannequin widget.

#### Scenario: Hiding body parts to paint inner surfaces
- **WHEN** the user interacts with the editor layout
- **THEN** per-part visibility toggling is retired in favor of direct camera focusing and the streamlined bottom tool dock, per the reference prototype

#### Scenario: Layer toggling
- **WHEN** the user taps the "Camada" dock button
- **THEN** the active layer alternates between "Base" (👕) and "3D" (🧥), and subsequent painting applies to the new layer

#### Scenario: 1-Tap focusing via interactive 2D mannequin widget
- **WHEN** the user clicks a body part (Cabeça, Tronco, Braço D, Braço E, Perna D, Perna E) on the floating 2D mannequin widget
- **THEN** the 3D camera centers on that part and zooms to an optimal painting perspective

### Requirement: Starter Templates and Multi-Format Support
The editor SHALL provide 1-click starter templates (Steve, Alex, Blank canvas) with complete UV face coverage and solid base body geometry, and support 64x64, 64x32 classic, and 128x128 HD textures, plus transparency/glass mode.

#### Scenario: Loading starter templates
- **WHEN** the user selects the Steve, Alex, or Blank template
- **THEN** all cuboid faces — neck, shoulder tops, palm bottoms, shoe sides and soles — initialize with solid pixels, so the humanoid has no hollow voids from any angle

#### Scenario: Classic 64x32 editing mode
- **WHEN** 64x32 classic mode is active
- **THEN** the canvas resizes to 64x32, right-side limb painting mirrors to left-side limbs, and outer body layers disable per legacy skin rules

### Requirement: PNG File Transport and Direct MCPack Generation
The editor SHALL prompt users to confirm or edit a unique skin name prior to downloading, pre-filling a time-based suggestion or the uploaded image's name, and enable exporting the active skin as a PNG file or compiling a ready-to-import `.mcpack` package using that confirmed name.

#### Scenario: Exporting skin as PNG
- **WHEN** the user confirms the skin name and requests a PNG download
- **THEN** the browser downloads a valid PNG of the active texture named `<skinName>.png`

#### Scenario: Direct Bedrock package generation
- **WHEN** the user confirms the skin name and requests `.mcpack` creation
- **THEN** the editor submits the texture and name to `/api/convert` and downloads `<skinName>.mcpack` with matching metadata

#### Scenario: Pre-download skin naming confirmation
- **WHEN** the user clicks "Baixar Skin (PNG)" or "Criar Pacote .mcpack"
- **THEN** a naming modal opens pre-filled with a time-based suggestion (e.g. `skin_YYYYMMDD_HHMM`) for new skins or the original filename for uploaded skins, allowing confirm or edit before download

### Requirement: Zero-Scroll Full-Viewport Viewport Layout
The 3D skin editor SHALL enforce a zero-scroll viewport constrained strictly to `100dvh` (and `100vh` fallback) across desktop, tablet, and mobile browsers, preventing vertical document scrolling while editing.

#### Scenario: Full-viewport layout constraint on mobile devices
- **WHEN** the user opens the editor on a mobile device or small screen
- **THEN** the app fits within `100dvh`, the 3D canvas flexes to occupy remaining vertical space, and the window cannot scroll vertically

#### Scenario: Dynamic canvas flexbox sizing
- **WHEN** the window or device orientation changes
- **THEN** `.immersive-3d-stage` recalculates its rendered dimensions to fill available flex space without overflow or scrollbars

### Requirement: Contextual Dynamic Dock Hint Strip
The editor SHALL provide a persistent single-line hint strip (`#dockHintStrip`) docked below the top action bar and above the drawing stage and bottom tool dock, showing contextual guidance when hovering or interacting with controls, matching `docs/prototypes/web-skin-editor-prototype.html`.

#### Scenario: Hovering a tool or control on desktop
- **WHEN** the user hovers any bottom-dock button, camera mode switcher, layer toggle, or mannequin part
- **THEN** `#dockHintStrip` updates immediately with a friendly Portuguese description of that control's function

#### Scenario: Interacting with tools on touch devices
- **WHEN** the user taps a tool or toggles an option on a touchscreen device
- **THEN** `#dockHintStrip` updates to reflect the active selection and its guidance

#### Scenario: Restoring default hint state
- **WHEN** the pointer leaves a hinted control or the user finishes selecting an action
- **THEN** `#dockHintStrip` reverts to the default prompt ("Toque ou clique em uma ferramenta para começar a pintar!")

### Requirement: Editor Navigation Submenu for File Actions
The application navigation menu (desktop sidebar and mobile drawer) SHALL host an expandable/collapsible submenu nested under "🎨 Criador de Skins 3D", providing direct access to core editor file operations.

#### Scenario: Accessing editor submenu items
- **WHEN** the user views the navigation menu on the skin editor screen
- **THEN** a connected sub-tree shows "Nova Skin", "Abrir / Carregar PNG", "Salvar Imagem PNG", and "Baixar .mcpack"

#### Scenario: Collapsing and expanding the editor submenu
- **WHEN** the user toggles the chevron on "🎨 Criador de Skins 3D"
- **THEN** the submenu collapses or expands smoothly, preserving active editor state and syncing between desktop sidebar and mobile drawer

### Requirement: Preset Selection Modal ("Nova Skin")
The editor SHALL provide a modal triggered by "Nova Skin" allowing initialization of a new skin canvas from curated presets (Steve Classic 4px, Alex Slim 3px, or Blank Canvas) with full UV face coverage.

#### Scenario: Opening the new skin modal
- **WHEN** the user clicks "Nova Skin" in the editor submenu
- **THEN** a modal opens with choices for Steve (4px arms), Alex (3px arms), and Tela em Branco (Blank canvas)

#### Scenario: Selecting a preset template
- **WHEN** the user confirms Steve, Alex, or Blank canvas
- **THEN** the canvas resets with the chosen preset, 3D geometry updates to match arm dimensions (4px Steve/Blank, 3px Alex), undo history initializes, and the modal closes

#### Scenario: Canceling preset selection
- **WHEN** the user clicks cancel or clicks outside the modal
- **THEN** the modal closes without altering the current texture or drawing progress

### Requirement: Local Skin PNG Import and Asynchronous Reader
The editor SHALL provide local file upload enabling users to load, inspect, and continue editing existing Minecraft skin PNG textures of any square or 2:1 resolution. Square images `> 64x64` (e.g. 128x128, 256x256, 500x500, 512x512, 1024x1024, 2048x2048) SHALL downsample client-side via stepped high-fidelity downsampling to `128x128` (preserving HD detail) and initialize 128x128 HD mode. Square images `<= 64x64` SHALL initialize `64x64` mode, and rectangular `2:1` images SHALL downsample to `64x32`. Background detection and removal SHALL remain active.

#### Scenario: Uploading an existing skin PNG
- **WHEN** the user clicks "Abrir / Carregar PNG" and selects a valid 64x64, 64x32, or 128x128 PNG
- **THEN** the file parses asynchronously via `FileReader`, validates dimension/format, loads onto the 3D mesh and 2D canvas, and geometry auto-updates slim or classic based on arm transparency

#### Scenario: Rejecting an invalid file format or dimension
- **WHEN** the user attempts to load a non-PNG or non-image file
- **THEN** a friendly error shows in `#dockHintStrip` or an alert toast, and existing canvas content is preserved without corruption

#### Scenario: Uploading high-resolution AI skin image (>= 1024px)
- **WHEN** the user uploads a valid square PNG `>= 1024x1024` (e.g. 1024x1024 or 2048x2048)
- **THEN** it downsamples client-side via stepped high-fidelity downsampling to `128x128`, preserving HD detail, loads into the texture canvas and 3D mesh, the editor switches to 128x128 mode, and `#dockHintStrip` confirms successful HD import

#### Scenario: Uploading standard-range AI skin image (< 1024px)
- **WHEN** the user uploads a valid square PNG greater than 64x64 but less than 1024x1024 (e.g. 256x256, 500x500, 512x512)
- **THEN** it downsamples client-side via stepped high-fidelity downsampling to `128x128`, loads in 128x128 mode, and geometry updates automatically

#### Scenario: Prompting for solid background removal on AI images
- **WHEN** an uploaded image is fully opaque (alpha 255 throughout) or has uniform non-transparent color in outer non-UV corner areas
- **THEN** a confirmation dialog asks "Detectamos um fundo sólido nesta imagem. Deseja tentar remover o fundo e deixá-lo transparente?"

#### Scenario: User accepts solid background removal
- **WHEN** the user confirms background removal in the dialog
- **THEN** the editor samples background color from corners/edges, clears matching outer non-UV pixels to transparent, preserves humanoid features, and renders the cleaned texture

#### Scenario: User declines background removal
- **WHEN** the user cancels or declines background removal
- **THEN** the editor loads the downsampled image as-is without altering pixel alpha

### Requirement: Dynamic Resolution and Grid Synchronization
The 2D pixel editor and 3D raycast painter SHALL dynamically adapt coordinate calculations, canvas dimensions, grid overlays, undo/redo buffers, and hover indicator geometry to the active texture resolution (64x64 or 128x128).

#### Scenario: 2D pixel editor coordinate picking at 128x128
- **WHEN** the user clicks or paints on the 2D sheet while working on a 128x128 texture
- **THEN** the coordinate picker maps pointer positions to discrete 0..127 coordinates, updates the 128x128 undo buffer, and draws a 128x128 grid when overlay is enabled

#### Scenario: 3D raycast painting and hover box at 128x128
- **WHEN** the user hovers or paints over the mannequin while working on a 128x128 texture
- **THEN** raycasting scales UV coordinates by 2 (`128/64`), targets the precise sub-pixel, scales the hover highlight box to half-size (0.5 unit), and updates the 128x128 texture seamlessly

### Requirement: Editor Export Resolution Selection
When exporting an active 128x128-resolution skin from the 3D editor (as PNG or `.mcpack`), the pre-download confirmation modal SHALL provide an interactive option to export in either 128x128 HD or downsampled 64x64 Standard resolution.

#### Scenario: Exporting 128x128 skin as HD
- **WHEN** the user confirms export with the 128x128 HD option
- **THEN** the downloaded PNG or `.mcpack` contains the full 128x128 texture with all painted details preserved

#### Scenario: Exporting 128x128 skin downsampled to 64x64
- **WHEN** the user confirms export with the 64x64 Standard option
- **THEN** the client downsamples the canvas to 64x64 before downloading the PNG or submitting to `/api/convert` for `.mcpack` generation
