# Design: Improve 3D Skin Editor (Focus, Mannequin, Closed Model, Subtle Grid, Vertical Zoom, Precision Grid, Skin Naming)

## Context
See `proposal.md` for motivation. The web editor is an embedded, client-side SPA hosted by Go's standard library HTTP server (`internal/web/`). The 3D renderer (`three.min.js`) is an embedded custom WebGL engine without any third-party frameworks. The skin editing logic resides in `internal/web/static/app.js`.

Constraints:
- Zero external runtime or JavaScript dependencies.
- Must run smoothly on both desktop browsers and mobile touchscreens (smartphones/tablets).
- TDD validation via Go server embedded asset tests (`internal/web/server_test.go`) and frontend unit tests.

## Goals / Non-Goals

**Goals:**
- Provide dynamic camera focusing per body part (`targetY`, `targetX`) in `Skin3D.Viewport`.
- Implement a floating 2D mannequin widget ("bonequinho") in the bottom-left of the 3D viewport for 1-tap body part selection and focusing.
- Provide a floating vertical zoom control (`🔍+`, `⟲`, `🔍−`) in the bottom-right of the 3D viewport, replacing the space-consuming horizontal slider.
- Fill all missing faces in `loadTemplate` (neck, shoulder tops, palm bottoms, shoe sides, shoe soles) and prevent transparent gaps in the base body mesh.
- Replace the 35-45% dark grid with subtle, photography-style alignment guide lines (~10-12% opacity).
- Ensure strict pixel-perfect grid cell alignment without drift, plus a visual hover reticle showing the targeted cell.
- Provide a pre-download skin naming modal (Option A) with time-based default suggestions (`skin_YYYYMMDD_HHMM`) or preserved upload filenames to avoid file collisions on Android.

**Non-Goals:**
- Adding third-party 3D libraries (Three.js or Babylon.js). The custom `Skin3D` engine remains zero-dependency.
- Modifying the Bedrock `.mcpack` zip archive format or Go backend converter architecture.

## Decisions

### 1. Dynamic Camera Target in `Skin3D.Viewport`
- **Decision**: Update `Skin3D.Viewport` to store a 3D target offset `this.target = [0, 4, 0]` (defaults to body center) instead of the hardcoded `[0, -4, 0]`. When calculating `mvMatrix`, translate by `[-this.target[0], -this.target[1], -this.target[2]]`.
- **Target presets**:
  - Head/Face: target `[0, 16, 0]`, zoom `20`
  - Torso: target `[0, 6, 0]`, zoom `24`
  - Right Arm: target `[-6, 6, 0]`, zoom `24`
  - Left Arm: target `[6, 6, 0]`, zoom `24`
  - Legs/Feet: target `[0, -6, 0]`, zoom `26`
  - Whole Body: target `[0, 4, 0]`, zoom `50`
- **Raycasting Synchronization**: The picking ray transformation in `pickPixel()` mirrors the exact model-view matrix translation so that painting raycasts remain 100% accurate at any focused target and zoom level.

### 2. Floating 2D Mannequin Widget (NovaSkin Style)
- **Decision**: Render a compact 2D SVG/HTML mannequin widget overlaid in the bottom-left corner of `#wrapper3D`. Each part (Head, Torso, Arms, Legs) has a distinct clickable hit area. Clicking an area triggers `viewport3D.focusPart(name)`.

### 3. Floating Vertical Zoom Stack with Reset (`🔍+`, `⟲`, `🔍−`)
- **Decision**: Replace the horizontal `#zoom3DControls` bar below the canvas with a vertical floating container (`.zoom-vertical-controls`) positioned at `bottom: 16px; right: 14px;` over the canvas. Include:
  - Top: `🔍+` (Zoom In, step = -4 zoom distance)
  - Center: `⟲` (Reset to full body, zoom = 50, target = [0, 4, 0], default rotation)
  - Bottom: `🔍−` (Zoom Out, step = +4 zoom distance)

### 4. 100% Complete UV Template Coverage & Solid Base Mesh
- **Decision**: Complete all missing faces in `loadTemplate()` in `internal/web/static/app.js`:
  - Head bottom (neck): `fillBox(16, 0, 8, 8, hair/skin)`
  - Right arm top (shoulder): `fillBox(44, 16, armW, 4, shirt)`
  - Right arm bottom (hand): `fillBox(44 + armW, 16, armW, 4, skinTone)`
  - Left arm top (shoulder): `fillBox(36, 48, armW, 4, shirt)`
  - Left arm bottom (hand): `fillBox(36 + armW, 48, armW, 4, skinTone)`
  - Right leg top: `fillBox(4, 16, 4, 4, pants)`
  - Right leg bottom (sole): `fillBox(8, 16, 4, 4, shoes)`
  - Right leg shoe sides: `fillBox(0, 30, 4, 2, shoes)` and `fillBox(8, 30, 4, 2, shoes)`
  - Left leg top: `fillBox(20, 48, 4, 4, pants)`
  - Left leg bottom (sole): `fillBox(24, 48, 4, 4, shoes)`
  - Left leg shoe sides: `fillBox(16, 62, 4, 2, shoes)` and `fillBox(24, 62, 4, 2, shoes)`
  - Blank template: fully covers all UV regions with checker pattern.
  - In `three.min.js`, ensure base layer fragments (`isLayer2 == false`) render with solid fallback color or do not discard empty regions as see-through holes.

### 5. Subtle Photography-Style Alignment Grid & Pixel-Perfect Snapping
- **Decision**: In `buildGridOverlayCanvas()`, change the stroke color from `rgba(0, 0, 0, 0.35)` to `rgba(255, 255, 255, 0.12)` (with subtle contrast on light skins), and increase overlay resolution scale from 4 to 8 for crisp 1px lines.
- **Raycast Face Axis Detection**: In `pickPixel()`, replace the brittle `eps = 0.05` coordinate checks with the exact axis intersection test:
  - The entering face is determined by which ray axis matches `tmin` (`tNearX`, `tNearY`, or `tNearZ`), guaranteeing that glancing angles near edges never map to the wrong face.
- **Canvas 2D Coordinate Normalization**: In `get2DCoord()`, compute coordinates as `Math.floor(((clientX - rect.left) / rect.width) * texW)`, removing any sub-pixel scaling drift.
- **Hover Reticle Highlight**: On `mousemove` over the canvas, calculate the active hovered pixel and render a subtle highlight border over that grid cell, giving users instant visual certainty prior to clicking.

### 6. Pre-Download Skin Naming Modal (Option A)
- **Decision**: Add a modal dialog (`#skinNameModal`) that intercepts both "Baixar Skin (PNG)" and "Criar Pacote .mcpack":
  - **Timestamp Suggestion**: When creating a new skin or editing templates, generate `skin_YYYYMMDD_HHMM` (e.g. `skin_20260920_1414`).
  - **Upload Filename Retention**: When the user uploads a PNG file via `#editorFileInput`, extract `file.name` without extension and store it in `currentSkinName`. The modal pre-fills this existing name.
  - **Confirmation & Sanitization**: The user can accept with 1 tap or edit the name. Names are sanitized to valid Minecraft Bedrock identifiers (`[a-zA-Z0-9_-]`).
  - **Download Trigger**: On confirmation, execute the respective download action with `<skinName>.png` or submit `<skinName>` to `/api/convert` for `<skinName>.mcpack`.

## Risks / Trade-offs

- [Risk]: Changing camera target shifts UV raycasting picking if matrix inversion is misaligned.
  → Mitigation: Use identical `targetX, targetY, targetZ` translation in both `render()` and `pickPixel()` matrices, verified with automated unit tests for raycast picking at different camera targets.
- [Risk]: Touch interactions on floating widgets might bubble up to canvas drawing.
  → Mitigation: Attach `stopPropagation()` and `preventDefault()` on widget pointer/touch events.
- [Risk]: High overlay scale for grid might consume mobile memory.
  → Mitigation: Keep grid canvas limited to max 512x512, which consumes less than 1MB of RAM.
- [Risk]: Modal prompt might interrupt fast repetitive downloads.
  → Mitigation: Pre-fill the name so 1 click on "Confirmar e Baixar" (or pressing Enter) immediately proceeds without extra typing.

## Package Architecture & Dependencies
- Go standard library only: `embed.FS` serves `internal/web/static/`.
- Frontend assets: vanilla JavaScript (`app.js`, `three.min.js`), CSS (`style.css`), HTML (`index.html`).

## TDD Test Execution Sequence
1. **Red Phase**:
   - Write tests in `internal/web/server_test.go` asserting HTML contains the floating mannequin widget, vertical zoom buttons, skin naming modal, and that `three.min.js` and `app.js` export target focusing, complete templates, grid precision raycasting, and naming workflows.
   - Run `go test -v ./internal/web/...` and verify failure.
2. **Green Phase**:
   - Implement `focusPart`, `targetY`, axis-based face picking, and reset in `three.min.js`.
   - Update `app.js` with complete template UVs, photography grid, hover highlight, upload filename retention, and naming modal.
   - Update `index.html` and `style.css` with floating mannequin, vertical zoom buttons, and naming modal dialog.
   - Run `go test -v ./internal/web/...` and verify all tests pass.
3. **Refactor Phase**:
   - Verify linting, cross-platform assets, and visual responsiveness on mobile viewports.

## AI Agent Governance & Loop Limits
- Maximum 3 test-fix attempts (`max_attempts = 3`).
- Halt immediately if identical errors repeat across 2 attempts.
- Air-gapped execution: no outbound network requests.
