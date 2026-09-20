# Proposal

## Why

As `mcskin` expanded to include a 3D Web Editor and packaging pipeline, frontend code grew into monolithic files (`app.js` with 1,786 lines and `style.css` with 1,616 lines), causing massive token consumption (15,000–30,000 tokens per interaction) for AI assistants (Google Antigravity and Anthropic Claude) and cognitive overload for human maintainers. Simultaneously, desktop users on Apple Silicon (macOS M-series chips) lack native binaries, users lack desktop icons and frictionless double-click web launching, and there is no discrete in-browser button to safely shut down the local server. Now is the ideal moment to modularize the codebase, introduce token-budget governance ensuring new features are born optimized, support macOS Apple Silicon natively with packaged desktop assets, and provide safe in-browser shutdown.

## What Changes

- **Token Economy & Frontend Refactoring**: Modularize the monolithic `internal/web/static/app.js` and `style.css` into distinct, single-responsibility ES6 modules (`converter.js`, `editor3d.js`, `editor2d.js`, `palette.js`, `network.js`, `shutdown.js`, `app.js`), each under 300 lines. Isolate vendor libraries (`three.min.js`, `qrcode.js`) into `vendor/`.
- **Zero-Friction Token Governance ("Nascem Otimizadas")**: Establish rigid OpenSpec rules and harness guidelines enforcing a 300-line limit per file for all future features, slice-first file reading, and subagent offloading for testing and exploration.
- **Human-Readable Architecture**: Ensure all refactored modules have clear semantic function names, JSDoc comments, and Go docstrings so human developers can effortlessly inspect and understand any part of the system.
- **macOS Apple Silicon Support (`darwin/arm64`)**: Add native compilation targets in `Makefile` and GitHub Actions for Apple Silicon Macs (M1/M2/M3/M4).
- **Desktop Application Packaging & Double-Click Launch**:
  - Associate a custom project icon (Minecraft-themed pickaxe and skin block) across platforms (`.ico` on Windows, `.icns` on macOS).
  - Package macOS release as a native `.app` bundle (`mcskin.app` with `Info.plist`, `MacOS/mcskin`, and `Resources/mcskin.icns`).
  - Default execution with zero arguments on Windows and macOS to automatically start the web server on port 8080 and open the default web browser.
- **Discrete Web Server Shutdown**:
  - Add `POST /api/shutdown` endpoint with graceful HTTP server termination in Go.
  - Add a discreet, child-friendly shutdown button in the web UI footer/header with a confirmation modal ("Deseja realmente desligar o servidor local?") and friendly goodbye feedback to avoid accidental shutdowns.
- **GitHub Release Automation for macOS**:
  - Update `.github/workflows/release.yml` to compile `darwin/arm64`, build the `mcskin.app` bundle and standalone CLI, package into `dist/mcskin_${TAG}_darwin_arm64.zip`, and publish checksums to GitHub Releases.

## Capabilities

### New Capabilities
- `token-optimization`: Formalizes token budget governance, module size limits (< 300 lines), compact test execution, and subagent offloading guidelines across Google Antigravity and Anthropic Claude harnesses.

### Modified Capabilities
- `cli`: Expand zero-argument behavior to launch the web server and open the browser on macOS (`darwin`) and desktop environments, not just Windows.
- `web-server`: Add discrete web shutdown button with confirmation modal, `POST /api/shutdown` graceful termination, and modular ES6 architecture (< 300 lines per file).
- `release-workflow`: Add macOS Apple Silicon (`darwin/arm64`) compilation, `.app` bundle packaging, and release asset upload to GitHub Actions.

## Impact

- **Affected Code**: `cmd/mcskin/main.go`, `internal/web/server.go`, `internal/web/static/`, `Makefile`, `.github/workflows/release.yml`, `openspec/config.yaml`, `AGENTS.md`, `CLAUDE.md`.
- **Dependencies**: Zero external Go dependencies preserved (standard library only). Browser uses native ES6 modules without bundling tools.
- **APIs**: New HTTP endpoint `POST /api/shutdown`.
- **Platform Support**: Linux amd64, Windows amd64, and macOS arm64.
