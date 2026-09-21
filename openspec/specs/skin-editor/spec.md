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
The editor SHALL allow the user to expand the editor into fullscreen to maximize available drawing space on any device, with the toggle prominently accessible in the main header on mobile viewports to conserve toolbar space, and with an exit control always reachable while fullscreen is active regardless of viewport width.

#### Scenario: Entering fullscreen
- **WHEN** the user clicks the fullscreen toggle button
- **THEN** the editor requests fullscreen on the editor container, hiding non-essential chrome so the 3D viewport and 2D sheet occupy the maximum available screen space

#### Scenario: Exiting fullscreen
- **WHEN** the user clicks the fullscreen toggle again, presses Esc, or the browser exits fullscreen for any reason
- **THEN** the editor detects the fullscreen change and restores the normal layout without losing the current texture or tool state

#### Scenario: Mobile header fullscreen toggle placement
- **WHEN** viewing the application on mobile or tablet screen widths
- **THEN** the fullscreen toggle button is rendered inside the top header bar, freeing space in the editor's top action bar while remaining 1-tap accessible

#### Scenario: Exit control remains reachable inside fullscreen on mobile
- **WHEN** the editor is actually in fullscreen on a mobile/tablet viewport
- **THEN** fullscreen is requested on the whole document (not a sub-element), so the single header toggle button that opened fullscreen stays part of the fullscreened view and remains reachable to exit it, on every viewport width

### Requirement: Unwrapped 2D Sheet Painting Mode
The editor SHALL provide an unwrapped 2D texture sheet view displaying clearly labeled sections (Cabeça, Tronco, Braços, Pernas) for high-precision pixel painting on touchscreens.

#### Scenario: Switching to 2D unwrapped sheet view
- **WHEN** the user selects the 2D Sheet mode tab
- **THEN** the editor renders the magnified 2D pixel grid with labeled body sections, synchronizing all edits bidirectionally with the 3D model

#### Scenario: Pixel-accurate grid at any zoom level
- **WHEN** the 2D sheet is rendered, whether at default size or zoomed in
- **THEN** each rendered grid square corresponds to exactly one texture pixel with grid lines drawn precisely on pixel boundaries, so a tap or click always paints the pixel visually under the pointer

### Requirement: Child-Friendly Touch Ergonomics and Drawing Tools
The editor SHALL provide touch-optimized controls designed for children aged 6 and older, including a dedicated "Pintar" vs "Girar" mode switch (presented as a floating pill centered atop the 3D stage, per `docs/prototypes/web-skin-editor-prototype.html`), essential drawing tools grouped in a uniform bottom tool dock, Minecraft-themed quick palettes reachable from a color bottom sheet, and streamlined gesture rotation on mobile while retaining discrete height and zoom adjustments.

#### Scenario: Touch gesture differentiation
- **WHEN** the user is in "Pintar" mode on a touchscreen
- **THEN** single-finger drags draw pixels on the target surface without orbiting or rotating the camera

#### Scenario: Camera orbit in rotation mode
- **WHEN** the user is in "Girar" mode on a touchscreen
- **THEN** single-finger drags smoothly orbit the camera around the character without modifying texture pixels

#### Scenario: Drawing tools and history
- **WHEN** the user activates Pencil, Bucket (flood fill), Trocar (replaces every pixel of the clicked color anywhere in the texture), or Eraser, or triggers Undo / Redo
- **THEN** the corresponding tool operation executes correctly with Web Audio click feedback
- **Note**: the Eyedropper tool from the prior revision of this requirement is intentionally dropped from the bottom dock's 6-slot layout, per the reference prototype and explicit user confirmation trading it off against dock uniformity.

#### Scenario: Mobile viewport rotation without arrow turn buttons
- **WHEN** the user interacts with the 3D viewport on mobile devices
- **THEN** redundant on-screen arrow turn buttons (up, down, left, right) are omitted, and single-touch drags in "Girar" mode smoothly orbit the model in all directions

#### Scenario: Desktop stage vertical height and zoom adjustments
- **WHEN** operating on desktop screens
- **THEN** discrete floating controls for model height adjustment (Subir/Descer) and camera zoom (+/-) remain available on the stage perimeter without obscuring the painting canvas

### Requirement: Body Part Isolation and Layer Management
The editor SHALL permit users to switch between the base body layer and the 3D overlay layer via a single cycling control in the bottom tool dock, showing the active layer's icon and name, and to focus specific parts via the interactive 2D paper doll mannequin widget.

#### Scenario: Hiding body parts to paint inner surfaces
- **WHEN** the user interacts with the editor layout
- **THEN** visibility toggling for individual body parts is retired in favor of direct camera focusing and the streamlined bottom tool dock layout per the reference prototype

#### Scenario: Layer toggling
- **WHEN** the user taps the "Camada" dock button
- **THEN** the active layer alternates between "Base" (👕) and "3D" (🧥), and subsequent painting applies to the newly active layer

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

### Requirement: Zero-Scroll Full-Viewport Viewport Layout
The 3D skin editor SHALL enforce a zero-scroll viewport geometry constrained strictly to `100dvh` (and `100vh` fallback) across desktop, tablet, and mobile browsers, preventing vertical document scrolling while editing.

#### Scenario: Full-viewport layout constraint on mobile devices
- **WHEN** the user opens the 3D skin editor on a mobile device or small screen
- **THEN** the entire application fits within the viewport height (`100dvh`), the 3D viewport canvas flexes dynamically to occupy remaining vertical space, and the browser window cannot be scrolled vertically

#### Scenario: Dynamic canvas flexbox sizing
- **WHEN** the browser window or device orientation changes
- **THEN** the `.immersive-3d-stage` automatically recalculates its rendered dimensions to fill available flex space without overflowing or introducing scrollbars

### Requirement: Contextual Dynamic Dock Hint Strip
The editor SHALL provide a persistent, single-line dynamic hint strip (`#dockHintStrip`) docked directly below the editor's top action bar and above the drawing stage and bottom tool dock, displaying contextual explanations and guidance when hovering or interacting with controls, matching `docs/prototypes/web-skin-editor-prototype.html`.

#### Scenario: Hovering a tool or control on desktop
- **WHEN** the user hovers the mouse pointer over any button in the bottom tool dock, camera mode switcher, layer toggle, or mannequin part
- **THEN** `#dockHintStrip` updates immediately to display a friendly, concise Portuguese description of the hovered item's function

#### Scenario: Interacting with tools on touch devices
- **WHEN** the user taps a tool or toggles an option on a touchscreen device
- **THEN** `#dockHintStrip` updates to reflect the active selection and guidance for using that tool

#### Scenario: Restoring default hint state
- **WHEN** the user pointer leaves a hinted control or finishes selecting an action
- **THEN** `#dockHintStrip` reverts to the default guidance prompt ("Toque ou clique em uma ferramenta para começar a pintar!")

### Requirement: Editor Navigation Submenu for File Actions
The application navigation menu (desktop sidebar and mobile navigation drawer) SHALL host an expandable/collapsible submenu nested under the "🎨 Criador de Skins 3D" navigation item, providing direct access to core editor file operations.

#### Scenario: Accessing editor submenu items
- **WHEN** the user views the navigation menu while on the skin editor screen
- **THEN** a visually connected sub-tree displays options for "Nova Skin", "Abrir / Carregar PNG", "Salvar Imagem PNG", and "Baixar .mcpack"

#### Scenario: Collapsing and expanding the editor submenu
- **WHEN** the user toggles the chevron on the "🎨 Criador de Skins 3D" navigation button
- **THEN** the submenu collapses or expands smoothly, preserving the user's active editor state and syncing state between desktop sidebar and mobile drawer

### Requirement: Preset Selection Modal ("Nova Skin")
The editor SHALL provide a modal dialog triggered by "Nova Skin" that allows the user to initialize a new skin canvas from curated presets (Steve Classic 4px, Alex Slim 3px, or Blank Canvas) with full UV face coverage.

#### Scenario: Opening the new skin modal
- **WHEN** the user clicks or taps "Nova Skin" in the editor submenu
- **THEN** a modal dialog opens presenting choices for Steve (4px arms), Alex (3px arms), and Tela em Branco (Blank canvas)

#### Scenario: Selecting a preset template
- **WHEN** the user confirms selection of Steve, Alex, or Blank canvas
- **THEN** the active editor canvas resets with the chosen preset texture, the 3D geometry updates to match the selected arm dimensions (4px for Steve/Blank, 3px for Alex), undo history initializes, and the modal closes

#### Scenario: Canceling preset selection
- **WHEN** the user clicks cancel or clicks outside the modal
- **THEN** the modal closes without altering the current skin texture or drawing progress

### Requirement: Local Skin PNG Import and Asynchronous Reader
The editor SHALL provide a local file upload mechanism enabling users to load, inspect, and continue editing existing Minecraft skin PNG textures.

#### Scenario: Uploading an existing skin PNG
- **WHEN** the user clicks "Abrir / Carregar PNG" and selects a valid 64x64, 64x32, or 128x128 PNG file
- **THEN** the file is parsed asynchronously using `FileReader`, validated for dimension and format compliance, loaded onto the 3D humanoid mesh and 2D canvas, and model geometry automatically updates to slim or classic based on arm transparency

#### Scenario: Rejecting an invalid file format or dimension
- **WHEN** the user attempts to load a non-PNG file or a PNG with invalid dimensions (e.g. 500x500)
- **THEN** a friendly error notification is displayed in `#dockHintStrip` or alert toast, and the existing canvas content is preserved without corruption

