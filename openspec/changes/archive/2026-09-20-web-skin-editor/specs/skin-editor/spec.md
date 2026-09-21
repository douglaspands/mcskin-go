# Spec Delta: skin-editor

## ADDED Requirements

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

## MODIFIED Requirements

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
