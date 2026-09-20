# Tasks: Improve 3D Skin Editor

## 1. TDD Red Phase: Automated Tests for 3D Editor Improvements

- [ ] 1.1 Add tests in `internal/web/server_test.go` verifying the embedded HTML contains the 2D mannequin widget, floating vertical zoom controls (`🔍+`, `⟲`, `🔍−`), skin naming modal elements (`#skinNameModal`), and does not render the deprecated horizontal slider.
- [ ] 1.2 Add tests in `internal/web/server_test.go` verifying `three.min.js` and `app.js` export camera target focusing (`focusPart`), complete UV templates without missing faces, photography-style grid rendering, axis-based raycasting, and skin naming modal logic.
- [ ] 1.3 Run targeted tests with `go test -v ./internal/web/...` and verify failure (RED phase).

## 2. Green Implementation Phase: 3D Engine, Camera Targeting & Grid Precision

- [ ] 2.1 Update `Skin3D.Viewport` in `internal/web/static/three.min.js` to implement configurable camera target (`target = [0, 4, 0]`), `focusPart(partName)`, `resetCamera()`, and mirror exact matrix translations in `pickPixel()`.
- [ ] 2.2 Update raycast face picking in `three.min.js` using entering axis (`tmin == tNearX/Y/Z`) to guarantee exact grid cell snapping, and eliminate hollow base mesh transparency.
- [ ] 2.3 Implement pixel hover reticle highlight indicating the active targeted grid cell on mousemove.

## 3. Green Implementation Phase: Complete UV Templates & Subtle Photography Grid

- [ ] 3.1 Update `loadTemplate()` in `internal/web/static/app.js` to paint 100% of UV faces for Steve, Alex, and Blank templates (neck bottom, shoulder tops, palm bottoms, shoe sides, and shoe soles).
- [ ] 3.2 Update `buildGridOverlayCanvas()` and `render2DSheet()` in `internal/web/static/app.js` to draw subtle photography-style guide lines (~10-12% opacity) and normalize 2D coordinates with `getBoundingClientRect()`.

## 4. Green Implementation Phase: UI Controls, 2D Mannequin & Skin Naming Modal

- [ ] 4.1 Update `internal/web/static/index.html` to add the floating 2D mannequin widget, floating vertical zoom controls, and the pre-download skin naming modal dialog (`#skinNameModal`).
- [ ] 4.2 Update `internal/web/static/style.css` with responsive styling for the 2D mannequin widget, vertical zoom button stack, and skin naming modal.
- [ ] 4.3 Update `internal/web/static/app.js` to wire click and touch handlers for the 2D mannequin widget (body part focusing) and vertical zoom/reset buttons.
- [ ] 4.4 Update `internal/web/static/app.js` to generate time-based default names (`skin_YYYYMMDD_HHMM`), preserve uploaded filenames from `editorFileInput`, display the naming modal before downloads, and trigger PNG / `.mcpack` downloads with the confirmed name.

## 5. Verification & QA Review

- [ ] 5.1 Run `go test -v ./internal/web/...` and `go test ./...` to verify all tests pass (GREEN phase).
- [ ] 5.2 Build binaries via `make build` and verify embedded assets compile without errors.
- [ ] 5.3 Automatically invoke `feature-qa-reviewer` to validate child usability (6+), 3D camera targeting, closed mesh geometry, photography grid, and naming modal workflow.
