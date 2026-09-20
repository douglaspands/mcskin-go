# Proposal: Improve 3D Skin Editor (Focus, Mannequin, Closed Model, Subtle Grid, Vertical Zoom, Grid Precision, Skin Naming)

## Why
When editing Minecraft skins in the embedded web editor, users (especially children on Android/touch devices) need to focus directly on specific body parts (such as the face/head) rather than only zooming into the center of the body (waist/chest). In addition, the 3D model currently exhibits hollow voids (missing neck, shoulder tops, palm bottoms, and shoe sides in starter templates), the pixel grid overlay is harsh and aggressively dark (35-45% black lines covering 25% of pixel area), the zoom slider occupies significant vertical layout space below the canvas, pixel painting can occasionally deviate from visual grid boundaries, and downloads overwrite previous skins on Android due to hardcoded filenames (`skin_classic_64x64.png` and `skin_customizada_classic.mcpack`).

Adding dynamic camera body-part focusing, an interactive 2D mannequin widget (NovaSkin-style paper doll), complete 100% template UV face coverage, a subtle photography-style alignment grid, pixel-perfect snap with visual hover highlight, floating vertical zoom/reset controls, and a pre-download skin naming modal with timestamp suggestions or preserved upload filenames will significantly enhance precision, child ergonomics, and mobile asset management.

## What Changes
- **Body-Part Camera Focusing & Dynamic Target**: The 3D viewport camera supports shifting its target (`targetY`) to specific body parts (Head/Face at Y=16, Torso at Y=6, Arms at Y=6, Legs at Y=-6, Whole Body at Y=4) with smooth zoom transitions, enabling focused painting on face and limbs.
- **Interactive 2D Paper Doll Mannequin Widget**: A compact 2D character mannequin widget placed floating in the bottom-left corner of the 3D viewport, enabling 1-tap focusing on the clicked body part (Head, Torso, Left/Right Arm, Left/Right Leg) and resetting to full body.
- **Consistent & Completely Closed 3D Humanoid Model**: Fix all missing faces in starter templates (`steve`, `alex`, `blank` in `loadTemplate`) — including head bottom/neck, shoulder tops, palm bottoms, shoe sides, and shoe soles — and guarantee solid base body rendering without transparent gaps or hollow artifacts.
- **Subtle Photography-Style Alignment Grid**: Transform the heavy dark pixel grid (which previously drew 35-45% black borders on every pixel) into ultra-subtle, non-intrusive photography-style alignment guide lines (~10-12% opacity) that aid pixel alignment without darkening the texture.
- **Pixel-Perfect Grid Precision & Hover Highlight**: Ensure strict mathematical alignment between pointer coordinates, visual grid cells, and texture pixels so that clicking within a grid cell always paints that exact pixel without drift or adjacent spilling, accompanied by a visual hover highlight reticle indicating the targeted grid square.
- **Floating Vertical Zoom & Reset Controls**: Replace the horizontal slider bar below the 3D canvas with a compact floating vertical button stack on the right side of the viewport: `🔍+` (Zoom In), `⟲` (Reset / Recenter to full body), and `🔍−` (Zoom Out), freeing up vertical space for the canvas.
- **Pre-Download Skin Naming Modal**: An interactive modal prompt displayed before downloading PNG or compiling `.mcpack`, pre-filled with a time-based suggestion (e.g. `skin_YYYYMMDD_HHMM`) or the preserved filename of an uploaded image, allowing users to confirm or edit the skin name so files can be easily located on Android without overwriting previous downloads.

## Capabilities

### Modified Capabilities
- `skin-editor`: Updates requirements for the 3D viewport camera targeting, adds interactive 2D mannequin widget for body part focusing, replaces the horizontal zoom slider with floating vertical controls (including instant reset), softens the pixel grid to subtle photography guide lines, enforces strict pixel-perfect grid alignment with hover highlights, guarantees 100% complete, non-hollow starter templates and base layer geometry, and adds skin naming confirmation before file downloads.

## Impact
- **Web UI & Embedded Scripts**:
  - `internal/web/static/three.min.js`: Camera target vector support (`targetY`, `targetX`), focus preset methods (`focusPart`), reset camera method, precise AABB raycast face picking via `tmin`, pixel hover highlight, and solid base layer shader handling.
  - `internal/web/static/app.js`: Complete UV coverage in `loadTemplate` (neck, shoulders, hands, shoe sides, soles), updated grid overlay rendering (`buildGridOverlayCanvas` and `render2DSheet`) with subtle photography-style lines, interactive 2D mannequin widget handlers, vertical zoom/reset event bindings, upload filename retention, and pre-download skin naming modal workflow.
  - `internal/web/static/index.html`: Removal of bottom horizontal zoom slider, addition of floating vertical zoom stack (`🔍+`, `⟲`, `🔍−`), floating 2D mannequin widget, and skin naming confirmation modal.
  - `internal/web/static/style.css`: Styling for the floating 2D mannequin widget, vertical zoom button pill, and skin naming modal dialog.
- **Backend / Go code**: `internal/web/server.go` already accepts `name` in `/api/convert`; existing server tests will be extended to verify custom named `.mcpack` and PNG packaging. Zero external dependencies maintained.
