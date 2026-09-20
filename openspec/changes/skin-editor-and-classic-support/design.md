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

### 4. AI Agent Governance & Bounded Execution Loops
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
