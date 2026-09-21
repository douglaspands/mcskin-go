# Tasks

## 1. 2D Sheet Editor & 3D/2D View Toggle

- [x] 1.1 Add `#viewModeToggleGroup` (`#btnMode3D` and `#btnMode2D`) to `internal/web/static/index.html` adjacent to the Steve/Alex model toggle pill, and mount `#wrapper2D` with `#editor2DCanvas` inside `#stage3D`.
- [x] 1.2 Wire 3D/2D view toggle event listeners in `internal/web/static/js/palette.js` and update contextual hint descriptions in `internal/web/static/js/editor-layout.js`.
- [x] 1.3 Add CSS styles for `.view-mode-pill-item` and `#wrapper2D` in `internal/web/static/style.css` ensuring full zero-scroll `100dvh` compliance.

## 2. Subtle Hairline Grid Styling

- [x] 2.1 Refactor `buildGridOverlayCanvas` in `internal/web/static/js/editor3d.js` to 16x scale with subtle shadow stroke (`rgba(0, 0, 0, 0.10)`), eliminating harsh white line artifacts.
- [x] 2.2 Refactor `render2DSheet` in `internal/web/static/js/editor2d.js` to render the clean hairline grid and remove heavy cyan boxes and yellow text overlays, ensuring the file stays under 300 lines and 15 KB.

## 3. Smart AI Skin Import & Background Removal

- [x] 3.1 Implement AI resolution detection and high-fidelity canvas downsampling logic in `internal/web/static/js/editor-file-loader.js` (>= 1024px to 128x128 HD, < 1024px to 64x64, 2:1 to 64x32).
- [x] 3.2 Implement solid background detection (corner and non-UV sampling) and user confirmation dialog in `internal/web/static/js/editor-file-loader.js` and `internal/web/static/index.html`.
- [x] 3.3 Integrate downscaled AI image handling into the converter dropzone in `internal/web/static/js/converter.js` and verify character preview renders properly.

## 4. Windows Trust: Resource Metadata & Manifest

- [x] 4.1 Create Windows resource manifest (`manifest.xml`) specifying `<requestedExecutionLevel level="asInvoker"/>` and `VERSIONINFO` metadata for `mcskin.exe`.
- [x] 4.2 Update `Makefile` target `build-windows` to compile and link the Windows resource into `bin/mcskin.exe` without introducing third-party runtime dependencies.

## 5. Verification & QA Review

- [x] 5.1 Run `node --check internal/web/static/js/*.js` and verify zero JavaScript syntax errors.
- [x] 5.2 Run Token Guardian file budget checks to ensure all application files remain under 300 lines and 15 KB.
- [x] 5.3 Execute the accumulated regression suite (`./scripts/run-regression-suite.sh`) and confirm all 7 phases pass.
- [x] 5.4 Execute the `feature-qa-reviewer` protocol to validate all requirements, child usability (6+), and Bedrock `.mcpack` compliance.
