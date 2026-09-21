# Spec Delta: skin-editor

## MODIFIED Requirements

### Requirement: Zoom Controls for Precision Painting
The editor SHALL provide compact, floating vertical zoom controls for the 3D viewport and zoom controls for the 2D unwrapped sheet (`#wrapper2D`), maximizing usable viewport space while allowing the user to magnify, pan, and recenter the view precisely.

#### Scenario: Zooming the 3D viewport
- **WHEN** the user taps the floating vertical `🔍+` (Zoom In), `🔍−` (Zoom Out), scrolls the mouse wheel, or pinches on a touchscreen over the 3D viewport
- **THEN** the camera distance changes smoothly within a clamped min/max range, without clipping through the model or reversing orientation

#### Scenario: Zooming the 2D unwrapped sheet
- **WHEN** the user presses the zoom +/- buttons, scrolls the mouse wheel, or pinches on a touchscreen over the 2D sheet
- **THEN** the sheet magnification increases or decreases inside a scrollable container while every texture pixel keeps rendering as a single, correctly aligned square (no blur, no distortion, no offset between adjacent pixels)

#### Scenario: Resetting camera to full-body view
- **WHEN** the user taps the floating vertical `⟲` (Reset) button
- **THEN** the camera resets its target to the whole-body center (Y=4), restores default camera distance (zoom=50), clears any single-part isolation focus, and returns to the default orientation

#### Scenario: Pan navigation on a magnified 2D sheet
- **WHEN** the 2D sheet is zoomed above 1x scale and the user drags with two fingers on touch, or drags with the mouse on desktop
- **THEN** the texture sheet pans smoothly to reveal occluded pixel regions without triggering accidental pixel painting

#### Scenario: Recentering the 2D sheet
- **WHEN** the user clicks or taps the recenter button (`btnZoom2DReset` / `⟲`) on the 2D stage
- **THEN** the 2D sheet scale resets immediately to 1x and pan offsets are centered

#### Scenario: Single-finger pixel painting on 2D sheet
- **WHEN** the user interacts with 1 finger or primary mouse button on the 2D sheet at any zoom level
- **THEN** pixels are accurately painted or recolored at the exact touched coordinates

### Requirement: Fullscreen Editing Mode
The editor SHALL allow the user to expand the editor into fullscreen to maximize available drawing space on any device, with the toggle accessible in the navigation drawer footer immediately above the server shutdown button, and with an exit control always reachable while fullscreen is active regardless of viewport width.

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

#### Scenario: Drawer footer fullscreen toggle placement
- **WHEN** viewing the application drawer or desktop sidebar menu
- **THEN** the fullscreen toggle button is positioned prominently inside the drawer footer immediately above the shutdown button

### Requirement: Child-Friendly Touch Ergonomics and Drawing Tools
The editor SHALL provide touch-optimized controls designed for children aged 6 and older, including a dedicated "Pintar" vs "Girar" mode switch (presented as a floating pill centered atop the 3D stage, per `docs/prototypes/web-skin-editor-prototype.html`), essential drawing tools grouped in a uniform bottom tool dock, Minecraft-themed quick palettes reachable from a color bottom sheet, and streamlined gesture rotation on mobile while retaining discrete height and zoom adjustments, and supporting hybrid two-finger rotation and pinch within paint mode.

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

#### Scenario: Hybrid two-finger rotation and pinch in "Pintar" mode
- **WHEN** the "Pintar" mode is active and the user touches the 3D stage with two fingers
- **THEN** two-finger dragging rotates the 3D character and two-finger pinching zooms the character, while single-finger touches continue to paint individual pixels with precision
