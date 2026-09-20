# Design: Skin Editor & Classic 64x32 Support

## Context

`mcskin` provides a cross-platform CLI and an embedded web server hosting the "CRIE SKINS LEGAIS" UI. Currently, the tool only converts pre-existing 64x64 or 128x128 PNG skins into Minecraft Bedrock `.mcpack` packages. Users on mobile devices and PCs have no native in-browser editor to draw or customize skins, and classic pre-1.8 64x32 skins are rejected by the validator.

See `proposal.md` for motivation and high-level requirements.

## Goals / Non-Goals

**Goals:**
- Provide a kid-friendly (6+) 3D and 2D skin editor directly within the embedded web UI.
- Maintain 100% offline air-gapped execution: zero CDN dependencies, vendoring any required client scripts (such as Three.js) directly inside `internal/web/static/` via Go `embed.FS`.
- Enable seamless tabbed navigation between the existing Converter/QR view and the new Editor view without page reloads.
- Expand backend validation and conversion in `internal/skin`, `internal/bedrock`, and `internal/converter` to support legacy classic 64x32 skins.
- Provide dual export: standard PNG image (for storage/messaging) and direct `.mcpack` package generation (via local `/api/convert`).

**Non-Goals:**
- Complex skeletal bone rigging, keyframe animations, or custom non-humanoid 3D geometries (e.g., horses, mobs).
- Heavy server-side image processing dependencies (maintaining standard library only in Go).
- User accounts, cloud databases, or remote skin gallery servers.

## Decisions

### 1. Package Architecture and Backend Dimension Extension
- **`internal/skin`**: Update `Validate(r io.Reader)` to accept `(64x64, 64x32, 128x128)`.
  * *Rationale*: 64x32 is the official legacy format from Minecraft pre-1.8.
  * *Alternative Considered*: Auto-upscaling 64x32 to 64x64 on ingestion. Rejected for now because Bedrock natively supports 64x32 humanoid textures, preserving original pixel fidelity.
- **`internal/bedrock`**: Ensure `GenerateSkinsJSON` assigns `geometry.humanoid.custom` appropriately for 64x32 skins.
- **`internal/converter`**: Coordinate conversion with unit test isolation.

### 2. Frontend Architecture & Modular Separation
- **Tab Navigation**: Clean SPA container switching between `#viewConverter` and `#viewEditor` using CSS display classes and history hash (`#converter` vs `#editor`).
- **Texture Canvas Buffer**: Single authoritative 2D canvas holding the raw RGBA pixels (64x64, 64x32, or 128x128).
  * 3D Viewport renders a dynamic `THREE.CanvasTexture` updated via `texture.needsUpdate = true`.
  * 2D Unwrapped Grid reads from and writes to the same texture buffer.
- **3D Engine Selection (Embedded Three.js)**:
  * Vendor a minimal, minified Three.js library in `internal/web/static/three.min.js`.
  * *Rationale*: Gives pixel-perfect UV mapping on 3D cube boxes, smooth touch orbit controls, and raycasting for direct face painting.
  * *Alternative Considered*: Hand-coded Canvas 2D isometric projector. Rejected because 3D raycasting and arbitrary rotation provide a vastly superior, Nova Skin-like experience for children.
- **Touch Usability for Children (6+)**:
  * Dual touch mode switch: `[ 🖌️ Pintar ]` vs `[ 🔄 Girar ]` to avoid accidental painting while dragging on tablets.
  * Quick orientation camera presets: `[ Frente ]`, `[ Costas ]`, `[ Lado E ]`, `[ Lado D ]`, `[ Cima ]`.
  * Part isolation toggles: ability to hide Head, Torso, Arms, Legs to paint inner surfaces.
  * Layer switch: Base Layer vs 3D Outer Layer (with transparency/alpha support).

### 3. TDD Test Execution Sequence
Strict adherence to Test-Driven Development:
1. **RED Phase**:
   - Write failing unit tests in `internal/skin/skin_test.go` for 64x32 validation (verifying acceptance of valid 64x32 PNGs).
   - Write failing unit tests in `internal/converter/converter_test.go` for end-to-end 64x32 `.mcpack` generation.
   - Run `go test -run TestValidate_64x32 ./internal/skin/...` and confirm failure.
2. **GREEN Phase**:
   - Update `internal/skin/skin.go` to accept 64x32.
   - Run tests and confirm green.
3. **REFACTOR Phase**:
   - Clean up code, verify formatting with `go fmt ./...` and `go vet ./...`.

### 4. Fullscreen, Zoom, and Pixel-Accurate Rendering
- **Fullscreen**: Use the standard Fullscreen API (`element.requestFullscreen()` / vendor-prefixed fallbacks) on the `.editor-card` container, toggled by a topbar button. Listen for `fullscreenchange` (and `Esc`) to restore the normal layout and re-flow the 3D/2D canvases without losing the in-memory texture buffer or tool state.
- **3D Viewport Zoom**: Expose the existing but currently hardcoded `Viewport.prototype.zoom` (fixed at `42`, no UI control today) through a slider/+/- buttons plus `wheel` and touch pinch handlers, clamped to a sane min/max distance so the camera never clips through the model or inverts.
- **2D Sheet Zoom**: `render2DSheet()` today computes a single fixed `scale = cW / texW` tied to the canvas's hardcoded backing-store width (512px), with no user-adjustable magnification. Introduce a `zoomFactor` that multiplies `scale`, re-rendering into a canvas sized `texW * scale * zoomFactor` inside the already-scrollable `.canvas-2d-container`, keeping `ctx2D.imageSmoothingEnabled = false` and the existing `image-rendering: pixelated` CSS so pixels stay crisp at any zoom level.
- **Pixel-Accuracy Root Cause**: `Viewport._initGL` already sets `TEXTURE_MIN_FILTER`/`TEXTURE_MAG_FILTER` to `gl.NEAREST`, so texture sampling itself is correct. The reported "squares that don't match pixels" comes from (a) no zoom control combined with a small fixed-size canvas, making individual 64x64/64x32/128x128 texture pixels indistinguishable on the rendered model, and (b) the WebGL canvas backing store not accounting for `devicePixelRatio`, so browsers upscale/blur the rendered frame on HiDPI screens. Fix by resizing the canvas backing store to `displayWidth * devicePixelRatio` (updating `gl.viewport` and the projection aspect ratio to match) so rendered squares and raycaster-picked pixels stay aligned 1:1 with the underlying texture at every zoom level.
- **Pixel Grid Toggle**: `textureCanvas` remains the single pristine source of truth read by PNG export (`toDataURL`) and `.mcpack` generation (`toBlob`) — grid lines must never be baked into it. For the 2D sheet, draw grid lines directly on `editor2DCanvas` after the texture blit in `render2DSheet()`, spaced by the current `scale`. For the 3D viewport, build a separate display canvas (skin pixels copied from `textureCanvas` plus 1px grid lines drawn per texel) and feed that to `viewport3D.setTexture()` only when the toggle is on; pass `textureCanvas` directly when it is off.

### 5. AI Agent Governance & Bounded Execution Loops
- **Loop Limits**: Maximum 3 iterations on any test failure or defect remediation (`max_attempts = 3`).
- **Halting**: Stop immediately if an identical failure repeats across 2 consecutive iterations.
- **Automatic QA Trigger**: Upon completing implementation tasks, automatically invoke the `feature-qa-reviewer` persona to evaluate Bedrock `.mcpack` compliance, child ergonomics, and touch responsiveness.

## Risks / Trade-offs

- **[Risk] Touch Event Collision on Mobile Screens**: Children dragging fingers may inadvertently trigger scrolling or page pinch-zoom.
  - *Mitigation*: Apply `touch-action: none;` on the 3D viewport canvas and 2D editor container, and provide the explicit `Pintar` vs `Girar` toggle.
- **[Risk] Memory Leaks from Undo/Redo History**: Unbounded image data history could exhaust memory on low-end mobile devices.
  - *Mitigation*: Cap the undo/redo stack at 20 snapshots using lightweight `ImageData` objects.
- **[Risk] Browser WebGL Incompatibility on Older Hardware**: Some very old devices or embedded webviews might disable WebGL.
  - *Mitigation*: Fallback notification guiding the user to the 2D Unwrapped Sheet mode, which relies exclusively on standard Canvas 2D.
- **[Risk] Fullscreen API Inconsistency Across Browsers/Devices**: Some mobile browsers (notably iOS Safari) restrict or omit the standard Fullscreen API.
  - *Mitigation*: Feature-detect `requestFullscreen` support; when unavailable, fall back to a CSS-only "maximized" layout (fixed-position full-viewport overlay) that still hides non-essential chrome.
- **[Risk] Resizing the WebGL Canvas Backing Store for DPR Regresses Performance on Low-End Devices**: Rendering at full `devicePixelRatio` (e.g. 3x on some phones) increases fragment shader workload.
  - *Mitigation*: Clamp the effective device pixel ratio used for the canvas backing store (e.g. cap at 2x) to balance sharpness and performance.
