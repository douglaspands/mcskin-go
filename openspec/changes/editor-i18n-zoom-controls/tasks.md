# Tasks: editor-i18n-zoom-controls

## 1. Backend TDD: Environment Variables & Feature Gating (`MCSKIN_ENABLE_QR`, `MCSKIN_ENABLE_SHUTDOWN`)

- [x] 1.1 RED: Write unit tests in `internal/web/server_test.go` and `internal/web/network_test.go` asserting `ServerInfo.EnableQR`, `ServerInfo.EnableShutdown`, `/api/info` serialization, and 403 Forbidden on `/api/shutdown` when disabled
      <!-- model: flash (AGY, High) / sonnet (Claude, High) | signal: unit test writing with mocked HTTP requests | wave: 1 -->

- [x] 1.2 GREEN: Implement `Config.EnableQR`, `Config.EnableShutdown` and `ServerInfo` updates in `internal/web/server.go` and `internal/web/network.go`, enforcing 403 on disabled shutdown
      <!-- model: flash (AGY, High) / sonnet (Claude, High) | signal: Go server and network handler logic | wave: 2 -->

- [x] 1.3 GREEN: Implement environment variable reading in `cmd/mcskin/main.go` for `MCSKIN_ENABLE_QR` and `MCSKIN_ENABLE_SHUTDOWN` and pass them to `webServerRunner`
      <!-- model: flash (AGY, High) / sonnet (Claude, High) | signal: CLI flag and env var parsing | wave: 2 -->

- [x] 1.4 REFACTOR: Verify that all Go packages pass tests with `./scripts/test-compact.sh`
      <!-- model: flash (AGY, High) / sonnet (Claude, High) | signal: test runner verification | wave: 3 -->

## 2. Frontend i18n Engine & Language Switcher (`pt-BR`, `es`, `en`)

- [x] 2.1 Implement `internal/web/static/js/i18n.js` (< 300 lines) with translation dictionaries (`pt-BR`, `es`, `en`), fallback to `en`, `t(key)` helper, and `applyTranslations()` for `data-i18n` and `data-i18n-attr`
      <!-- model: flash (AGY, High) / sonnet (Claude, High) | signal: standalone ES6 translation module | wave: 1 -->

- [x] 2.2 Wire automatic browser/OS language detection and `localStorage` persistence in `i18n.js` and `app.js`
      <!-- model: flash (AGY, High) / sonnet (Claude, High) | signal: app initialization integration | wave: 2 -->

- [x] 2.3 Add discrete language segmented control `[ PT | EN | ES ]` in `internal/web/static/index.html` navigation drawer and add `data-i18n` attributes across interface elements
      <!-- model: flash (AGY, High) / sonnet (Claude, High) | signal: HTML markup and declarative i18n bindings | wave: 3 -->

- [x] 2.4 Update dynamic hint strings and notifications in `editor-layout.js`, `converter.js`, `editor-menu.js`, `palette.js`, and `shutdown.js` to use `t(key)`
      <!-- model: flash (AGY, High) / sonnet (Claude, High) | signal: frontend JavaScript message internationalization | wave: 3 -->

## 3. Editor 2D Zoom, Pan, Pinch & Recenter

- [x] 3.1 Implement visual vertical controls for 2D (`btnZoom2DIn`, `btnZoom2DOut`, `btnZoom2DReset` / `⟲`) in `internal/web/static/index.html` and `style.css`
      <!-- model: flash (AGY, High) / sonnet (Claude, High) | signal: HTML markup and CSS layout for 2D HUD | wave: 2 -->

- [x] 3.2 Update `internal/web/static/js/editor2d.js` to implement zoom scaling, drag-to-pan, touch pinch-to-zoom, and recentering while maintaining exact coordinate hit mapping via `getBoundingClientRect()`
      <!-- model: flash (AGY, High) / sonnet (Claude, High) | signal: 2D canvas transformation and gesture handling | wave: 3 -->

- [x] 3.3 Update `palette.js` to display the 2D zoom controls when switching to `2d` mode and hide them when in `3d` mode
      <!-- model: flash (AGY, High) / sonnet (Claude, High) | signal: view mode switching integration | wave: 3 -->

## 4. Editor 3D Hybrid Two-Finger Touch Interaction

- [x] 4.1 Update `internal/web/static/js/editor3d.js` to support simultaneous 2-finger rotation and pinch-to-zoom even while `Pintar` mode is active, while preserving 1-finger precision painting
      <!-- model: flash (AGY, High) / sonnet (Claude, High) | signal: touch event gesture disambiguation in 3D | wave: 2 -->

- [x] 4.2 Verify touch gestures in `editor3d.js` maintain backward compatibility with single-finger rotate in `Girar` mode
      <!-- model: flash (AGY, High) / sonnet (Claude, High) | signal: manual/automated gesture verification | wave: 3 -->

## 5. Drawer Footer Layout & Reactive Feature Visibility

- [x] 5.1 Relocate `#btnHeaderFullscreen` to `drawer-footer` in `internal/web/static/index.html` directly above `#drawerBtnShutdown`, styling it with Minecraft drawer button aesthetics
      <!-- model: flash (AGY, High) / sonnet (Claude, High) | signal: DOM repositioning and CSS styling | wave: 3 -->

- [x] 5.2 Update `internal/web/static/js/network.js` and `internal/web/static/js/shutdown.js` to read `/api/info` flags and conditionally hide the QR Code card/modal triggers and shutdown button when disabled
      <!-- model: flash (AGY, High) / sonnet (Claude, High) | signal: client-side feature toggle visibility logic | wave: 3 -->

## 6. Documentation Multilingual Expansion & Motivation Update

- [x] 6.1 Update `README.md` (pt-BR) with language header bar and enhanced emphasis on safe child ergonomics (6+), zero ads, and local Wi-Fi QR Code connectivity
      <!-- model: flash (AGY, High) / sonnet (Claude, High) | signal: Markdown documentation update | wave: 1 -->

- [x] 6.2 Create `README.en.md` with complete English documentation, child-friendly motivation table, and feature showcase
      <!-- model: flash (AGY, High) / sonnet (Claude, High) | signal: English Markdown translation and writing | wave: 1 -->

- [x] 6.3 Create `README.es.md` with complete Spanish documentation, child-friendly motivation table, and feature showcase
      <!-- model: flash (AGY, High) / sonnet (Claude, High) | signal: Spanish Markdown translation and writing | wave: 1 -->

## 7. Verification & Regression Gate

- [x] 7.1 Verify token guardian and file size boundaries (`< 300 lines / 15 KB`) across all modified source files in `cmd/`, `internal/`, and `internal/web/static/js/`
      <!-- model: flash (AGY, High) / sonnet (Claude, High) | signal: token guardian file size inspection | wave: 4 -->

- [x] 7.2 Run full regression suite `./scripts/run-regression-suite.sh` and verify all 7 phases pass cleanly
      <!-- model: flash (AGY, High) / sonnet (Claude, High) | signal: full test runner execution | wave: 4 -->

## Model Selection Summary

| Task | Tier | Model (AGY) | Model (Claude, `Agent` dispatch) | Signal |
|---|---|---|---|---|
| 1.1 Backend unit tests | mid | flash (High) | sonnet (High) | 1-file TDD Go test writing |
| 1.2 Backend server/network | mid | flash (High) | sonnet (High) | 2-file Go server logic |
| 1.3 Backend main.go flags/env | mid | flash (High) | sonnet (High) | 1-file CLI env var parsing |
| 1.4 Test runner check | mid | flash (High) | sonnet (High) | compact test script run |
| 2.1 i18n module creation | mid | flash (High) | sonnet (High) | new ES6 module implementation |
| 2.2 i18n app integration | mid | flash (High) | sonnet (High) | app lifecycle integration |
| 2.3 i18n DOM bindings | mid | flash (High) | sonnet (High) | HTML template markup & classes |
| 2.4 JS dynamic hint i18n | mid | flash (High) | sonnet (High) | string catalog extraction |
| 3.1 2D zoom HUD layout | mid | flash (High) | sonnet (High) | HTML/CSS visual HUD controls |
| 3.2 2D canvas gestures & pan | mid | flash (High) | sonnet (High) | 2D canvas coordinate math |
| 3.3 2D view mode toggle | mid | flash (High) | sonnet (High) | palette/editor mode sync |
| 4.1 3D hybrid touch gestures | mid | flash (High) | sonnet (High) | Three.js touch raycast handling |
| 4.2 3D gesture verification | mid | flash (High) | sonnet (High) | gesture regression verification |
| 5.1 Fullscreen button relocation| mid | flash (High) | sonnet (High) | drawer footer reorganization |
| 5.2 Conditional feature toggles| mid | flash (High) | sonnet (High) | client-side reactive gating |
| 6.1 README.md pt-BR update | mid | flash (High) | sonnet (High) | Markdown documentation |
| 6.2 README.en.md creation | mid | flash (High) | sonnet (High) | Markdown translation & docs |
| 6.3 README.es.md creation | mid | flash (High) | sonnet (High) | Markdown translation & docs |
| 7.1 Token guardian audit | mid | flash (High) | sonnet (High) | budget size verification |
| 7.2 Full regression suite | mid | flash (High) | sonnet (High) | end-to-end 7-phase regression |

> Generated by `model-selection` skill. Standardized on `flash` (Antigravity) and `sonnet` (Claude Code) in High Effort Mode across all tasks. Update outcomes in `.agents/model-log.md` after apply.

## Parallelization Plan

| Wave | Tasks | Parallel-safe because |
|---|---|---|
| 1 | 1.1, 2.1, 6.1, 6.2, 6.3 | Disjoint files: Go tests (`server_test.go`), new JS module (`i18n.js`), and Markdown files (`README*.md`) have zero file overlap or shared state. |
| 2 | 1.2, 1.3, 2.2, 3.1, 4.1 | Disjoint files: Go implementation (`server.go`, `network.go`, `main.go`), app entrypoint (`app.js`), 2D markup (`index.html`/`style.css`), and 3D gestures (`editor3d.js`). |
| 3 | 1.4, 2.3, 2.4, 3.2, 3.3, 4.2, 5.1, 5.2 | Integrates modules validated in Wave 2 across the frontend scripts. |
| 4 | 7.1, 7.2 | Final holistic verification and 7-phase regression gate. |

> Generated by the `model-selection` skill's graph-engineering pass. Antigravity: dispatch each wave's tasks as parallel subagents. Claude Code: batch each wave's `Agent` tool calls into one message.
