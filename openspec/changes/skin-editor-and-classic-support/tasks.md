# Tasks: Skin Editor & Classic 64x32 Support

## 1. Backend TDD: Classic 64x32 Skin Support

- [ ] 1.1 [RED] Write unit tests in `internal/skin/skin_test.go` expecting valid 64x32 PNG images to pass validation, and verify test fails (`go test -run TestValidate_64x32 ./internal/skin/...`)
- [ ] 1.2 [GREEN] Update `internal/skin/skin.go` to accept 64x32 dimensions alongside 64x64 and 128x128, and verify unit tests pass (`go test ./internal/skin/...`)
- [ ] 1.3 [RED] Add test in `internal/converter/converter_test.go` verifying end-to-end `.mcpack` creation from a 64x32 skin PNG, and verify test behavior
- [ ] 1.4 [GREEN] Ensure `internal/bedrock` and `internal/converter` generate valid Bedrock manifests and skin entries for 64x32 textures, and verify all converter tests pass (`go test ./internal/converter/...`)
- [ ] 1.5 [TDD] Add test in `internal/web/server_test.go` verifying that `/api/convert` handles multipart uploads of 64x32 skins and returns HTTP 200 with valid `.mcpack`, and verify test passes (`go test ./internal/web/...`)

## 2. Frontend: Multi-Screen Tabbed Navigation & Assets

- [ ] 2.1 Vendor a lightweight minified Three.js library in `internal/web/static/three.min.js` (100% offline, zero external CDN) and verify static embed compilation with `go build ./cmd/mcskin`
- [ ] 2.2 Update `internal/web/static/index.html` and `style.css` to add the top navigation menu (`[ 📦 Conversor ]` vs `[ 🎨 Criador 3D ]`) with SPA tab switching, and verify screens toggle cleanly without page reloads
- [ ] 2.3 Update the existing Converter view in `index.html` and `app.js` to display 64x32 support in the dropzone and properly preview 64x32 skins with mirrored limbs

## 3. Frontend: 3D & 2D Skin Editor Implementation

- [ ] 3.1 Implement Texture State Engine and 2D Unwrapped Sheet view with labeled body sections (Cabeça, Tronco, Braços, Pernas) and verify pixel editing on the 2D canvas
- [ ] 3.2 Implement interactive 3D humanoid viewport using embedded Three.js, with raycaster face painting and quick orientation snap buttons (Frente, Costas, Lado E, Lado D, Cima)
- [ ] 3.3 Implement kid-friendly ergonomics: "Pintar" vs "Girar" touch mode toggle, quick Minecraft color palette, drawing tools (Lápis, Balde, Borracha, Conta-gotas), 8-bit sound effects, and bounded Undo/Redo stack
- [ ] 3.4 Implement Body Part Isolation toggles (Head, Torso, Arms, Legs) and Layer toggles (Base Body vs 3D Outer Layer) with alpha/transparency support
- [ ] 3.5 Implement 1-click starter templates (Steve 4px, Alex 3px, Blank canvas) and resolution modes (64x64, 64x32 classic with mirrored painting, 128x128 HD)
- [ ] 3.6 Implement PNG file import/export ("Baixar Skin PNG") and direct 1-click Bedrock `.mcpack` package generation calling `/api/convert`

## 4. Verification & QA Review

- [ ] 4.1 Run the full Go test suite (`go test -v ./...`), check for formatting and lints (`go vet ./...`), and verify clean compilation for Linux and Windows (`go build ./cmd/mcskin`)
- [ ] 4.2 Execute the automated PO/QA reviewer skill (`feature-qa-reviewer`) to evaluate Bedrock `.mcpack` compliance, child usability (6+), touch responsiveness, and classic 64x32 compatibility
