# Tasks: Skin Editor & Classic 64x32 Support

## 1. Backend TDD: Classic 64x32 Skin Support

- [x] 1.1 [RED] Write unit tests in `internal/skin/skin_test.go` expecting valid 64x32 PNG images to pass validation, and verify test fails (`go test -run TestValidate_64x32 ./internal/skin/...`)
- [x] 1.2 [GREEN] Update `internal/skin/skin.go` to accept 64x32 dimensions alongside 64x64 and 128x128, and verify unit tests pass (`go test ./internal/skin/...`)
- [x] 1.3 [RED] Add test in `internal/converter/converter_test.go` verifying end-to-end `.mcpack` creation from a 64x32 skin PNG, and verify test behavior
- [x] 1.4 [GREEN] Ensure `internal/bedrock` and `internal/converter` generate valid Bedrock manifests and skin entries for 64x32 textures, and verify all converter tests pass (`go test ./internal/converter/...`)
- [x] 1.5 [TDD] Add test in `internal/web/server_test.go` verifying that `/api/convert` handles multipart uploads of 64x32 skins and returns HTTP 200 with valid `.mcpack`, and verify test passes (`go test ./internal/web/...`)

## 2. Frontend: Multi-Screen Tabbed Navigation & Assets

- [x] 2.1 Vendor a lightweight minified Three.js library in `internal/web/static/three.min.js` (100% offline, zero external CDN) and verify static embed compilation with `go build ./cmd/mcskin`
- [x] 2.2 Update `internal/web/static/index.html` and `style.css` to add the top navigation menu (`[ 📦 Conversor ]` vs `[ 🎨 Criador 3D ]`) with SPA tab switching, and verify screens toggle cleanly without page reloads
- [x] 2.3 Update the existing Converter view in `index.html` and `app.js` to display 64x32 support in the dropzone and properly preview 64x32 skins with mirrored limbs

## 3. Frontend: 3D & 2D Skin Editor Implementation

- [x] 3.1 Implement Texture State Engine and 2D Unwrapped Sheet view with labeled body sections (Cabeça, Tronco, Braços, Pernas) and verify pixel editing on the 2D canvas
- [x] 3.2 Implement interactive 3D humanoid viewport using embedded Three.js, with raycaster face painting and quick orientation snap buttons (Frente, Costas, Lado E, Lado D, Cima)
- [x] 3.3 Implement kid-friendly ergonomics: "Pintar" vs "Girar" touch mode toggle, quick Minecraft color palette, drawing tools (Lápis, Balde, Borracha, Conta-gotas), 8-bit sound effects, and bounded Undo/Redo stack
- [x] 3.4 Implement Body Part Isolation toggles (Head, Torso, Arms, Legs) and Layer toggles (Base Body vs 3D Outer Layer) with alpha/transparency support
- [x] 3.5 Implement 1-click starter templates (Steve 4px, Alex 3px, Blank canvas) and resolution modes (64x64, 64x32 classic with mirrored painting, 128x128 HD)
- [x] 3.6 Implement PNG file import/export ("Baixar Skin PNG") and direct 1-click Bedrock `.mcpack` package generation calling `/api/convert`

## 4. Verification & QA Review

- [x] 4.1 Run the full Go test suite (`go test -v ./...`), check for formatting and lints (`go vet ./...`), and verify clean compilation for Linux and Windows (`go build ./cmd/mcskin`)
- [x] 4.2 Execute the automated PO/QA reviewer skill (`feature-qa-reviewer`) to evaluate Bedrock `.mcpack` compliance, child usability (6+), touch responsiveness, and classic 64x32 compatibility

## 5. Frontend: Fullscreen, Zoom & Pixel-Accurate Rendering Fix

- [x] 5.1 Add a fullscreen toggle button to the editor topbar in `index.html`; implement `requestFullscreen`/`exitFullscreen` with vendor-prefix and CSS-overlay fallback in `app.js`, and verify entering/exiting (button, Esc, and browser-triggered exit) preserves the current texture and tool state
- [x] 5.2 Expose `Viewport.prototype.zoom` (`three.min.js`) via zoom +/- buttons, mouse wheel, and touch pinch handlers in `app.js`, clamped to a min/max distance; verify the camera zooms smoothly without clipping through the model
- [x] 5.3 Add a `zoomFactor` to `render2DSheet()` in `app.js` driven by zoom +/- buttons, wheel, and pinch gestures, re-rendering the 2D canvas inside the scrollable `.canvas-2d-container`; verify every texture pixel remains a single, correctly aligned square at all zoom levels
- [x] 5.4 Resize the WebGL canvas backing store to a clamped `devicePixelRatio` (updating `gl.viewport` and projection aspect ratio) in `three.min.js`/`app.js`; verify raycaster-picked pixels visually match the rendered square at default and zoomed-in levels on both standard and HiDPI displays
- [x] 5.5 Manual QA pass on desktop and touch devices confirming: fullscreen toggle works end-to-end, 3D and 2D zoom are smooth and bounded, and painted pixels align 1:1 with the texture grid with no blur or offset

## 6. Frontend: Pixel Grid Line Toggle

- [x] 6.1 Add a "Grade de Pixels" toggle button to the editor UI in `index.html`; wire it in `app.js` to a `gridEnabled` state, redrawing `render2DSheet()` and re-syncing the 3D texture on toggle
- [x] 6.2 Draw grid lines on pixel boundaries in `render2DSheet()` (`app.js`) when `gridEnabled` is true, scaled to the current zoom, without altering `textureCanvas`
- [x] 6.3 Build a grid-overlaid display canvas for the 3D viewport (copy of `textureCanvas` plus 1px lines per texel) and pass it to `viewport3D.setTexture()` only when `gridEnabled` is true; verify `textureCanvas` itself stays untouched so PNG export and `.mcpack` generation are unaffected
- [x] 6.4 Manual QA: toggle grid on/off in both 3D and 2D views at multiple zoom levels, and confirm exported PNG/`.mcpack` have no grid lines baked in
