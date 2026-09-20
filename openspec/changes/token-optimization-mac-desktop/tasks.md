# Tasks

## 1. Backend TDD: Server Shutdown & CLI Launch (Red & Green)

- [ ] 1.1 Write failing tests in `internal/web/shutdown_test.go` verifying that `POST /api/shutdown` responds with status 200 and initiates server termination, and non-POST methods return 405 (RED Phase)
- [ ] 1.2 Implement `internal/web/shutdown.go` and wire the `/api/shutdown` route into `internal/web/server.go`, verifying all tests in `internal/web` pass (GREEN Phase)
- [ ] 1.3 Write failing unit tests in `cmd/mcskin/main_test.go` verifying that running with zero arguments on `darwin` launches the web server and opens the browser (RED Phase)
- [ ] 1.4 Update `cmd/mcskin/main.go` to dispatch `webServerRunner` when `len(args) == 0` on `darwin`, verifying `go test ./cmd/mcskin` passes (GREEN Phase)

## 2. Frontend Refactoring: Modularization & Shutdown UI (< 300 lines/file)

- [ ] 2.1 Move third-party libraries into `internal/web/static/vendor/` (`three.min.js`, `qrcode.js`) and update script imports
- [ ] 2.2 Create discrete shutdown module `internal/web/static/js/shutdown.js` (< 100 lines) with Minecraft-themed confirmation modal and update `index.html` and `style.css`
- [ ] 2.3 Modularize skin pack conversion logic into `internal/web/static/js/converter.js` (< 250 lines) with comprehensive JSDoc documentation
- [ ] 2.4 Modularize 3D preview and WebGL rendering into `internal/web/static/js/editor3d.js` (< 280 lines) with comprehensive JSDoc documentation
- [ ] 2.5 Modularize 2D pixel editor and zoom controls into `internal/web/static/js/editor2d.js` (< 250 lines) with comprehensive JSDoc documentation
- [ ] 2.6 Modularize Minecraft color palette and history into `internal/web/static/js/palette.js` (< 200 lines) with comprehensive JSDoc documentation
- [ ] 2.7 Modularize Wi-Fi network and QR code presentation into `internal/web/static/js/network.js` (< 120 lines) with comprehensive JSDoc documentation
- [ ] 2.8 Refactor `internal/web/static/js/app.js` (< 100 lines) to orchestrate tab switching and module initialization using native ES6 imports, verifying in-browser execution with zero console errors

## 3. macOS Apple Silicon Compilation, Packaging & Desktop Icons

- [ ] 3.1 Generate project icon assets (`mcskin.ico`, `mcskin.png`, and `mcskin.icns`) with Minecraft-themed pickaxe and skin block design
- [ ] 3.2 Add `build-darwin-arm64` and `build-all` targets to `Makefile`, verifying cross-compilation produces a valid Mach-O 64-bit arm64 binary
- [ ] 3.3 Create packaging script `scripts/package-mac-app.sh` generating `mcskin.app` bundle structure (`Contents/MacOS/mcskin`, `Contents/Info.plist`, `Contents/Resources/mcskin.icns`)
- [ ] 3.4 Update `.github/workflows/release.yml` to compile `darwin/arm64`, build the `mcskin.app` bundle and standalone CLI, package into `dist/mcskin_${TAG}_darwin_arm64.zip`, and publish checksums

## 4. Token Optimization Tooling & Governance Integration

- [ ] 4.1 Create compact test runner script `scripts/test-compact.sh` (silent on PASS, concise diffs on FAIL) and register in `.agents/scripts/command-gate.py`
- [ ] 4.2 Create skill `.agents/skills/token-guardian/SKILL.md` defining file size limits (< 300 lines) and context budget inspection guidelines
- [ ] 4.3 Update `openspec/config.yaml`, `AGENTS.md`, and `CLAUDE.md` to establish token economy directives ensuring all future features are born modularized

## 5. Verification & Quality Assurance

- [ ] 5.1 Execute full test suite `go test ./...` and `go vet ./...` to verify zero regressions across all packages
- [ ] 5.2 Validate OpenSpec change integrity via `openspec validate token-optimization-mac-desktop`
