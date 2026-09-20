# Design

## Context

`mcskin` is a zero-dependency Go application with an embedded HTTP server hosting a child-friendly Minecraft Bedrock skin pack converter and 3D editor. See `proposal.md` for motivation. Currently, the frontend is concentrated in a monolithic `app.js` (1,786 lines) and `style.css` (1,616 lines), causing massive token burn for AI agents and high maintenance friction for developers. Furthermore, desktop distribution is limited to Linux and Windows CLI, omitting Apple Silicon Macs (`darwin/arm64`), desktop icons, and in-browser shutdown controls.

## Goals / Non-Goals

**Goals:**
- Modularize frontend JavaScript into cohesive ES6 modules under 300 lines each without adding npm/Node.js dependencies.
- Provide a clean, human-readable codebase with JSDoc documentation and idiomatic Go architecture.
- Enforce token-budget governance ensuring new features are born modularized and token-efficient.
- Support macOS Apple Silicon (`darwin/arm64`) with automated compilation and `mcskin.app` packaging.
- Deliver custom desktop icons (`.ico` for Windows, `.icns` for macOS) and launch web mode upon double-click.
- Add `POST /api/shutdown` with graceful HTTP termination and a discrete, confirmed UI shutdown button.

**Non-Goals:**
- Introducing Node.js, Webpack, Vite, or npm build pipelines (the project strictly adheres to zero external runtime/build dependencies).
- Apple Developer Program code signing or notarization (binaries and bundles remain standard open-source unsigned assets).
- Rewriting the Three.js 3D rendering pipeline from scratch.

## Decisions

### Decision 1: Native Browser ES6 Modules Over Node.js Bundlers
- **Choice**: Structure frontend code into native ES6 modules (`import` / `export`) loaded via `<script type="module" src="/static/js/app.js">`.
- **Rationale**: Keeps the repository 100% free of Node.js/npm dependencies, allows immediate in-browser execution with zero build steps, and allows AI agents and developers to inspect and edit small (~100–250 lines) files.
- **Alternatives Considered**: Webpack/Vite bundler (rejected: violates zero external dependency rule and adds node_modules bloat).

### Decision 2: Graceful Shutdown Pattern with Deferred Execution
- **Choice**: The `/api/shutdown` HTTP handler returns a JSON response (`{"status":"shutting_down"}`) immediately with status 200, then spawns a goroutine that waits 200ms before invoking `server.Shutdown(ctx)`.
- **Rationale**: Ensures the HTTP client receives the complete 200 OK response and can render the goodbye message before the socket closes.
- **Alternatives Considered**: `os.Exit(0)` inside the handler (rejected: drops connection abruptly, causing network error in browser).

### Decision 3: Double-Click Desktop Launch via Zero-Argument Dispatch
- **Choice**: In `cmd/mcskin/main.go`, when `len(args) == 0` and the host OS is `windows` or `darwin`, invoke `webServerRunner(8080, true, stdout, stderr)`.
- **Rationale**: When users double-click an executable or `.app` bundle in Windows Explorer or macOS Finder, no arguments are passed. Starting the web server and launching the default browser provides an effortless GUI experience.
- **Alternatives Considered**: Separate GUI wrapper executable (rejected: adds binary maintenance overhead).

### Decision 4: Cross-Platform macOS Bundle & Icon Packaging
- **Choice**:
  - For Windows: Embed multi-resolution `.ico` icon.
  - For macOS: Generate standard `mcskin.app` directory bundle structure (`Contents/MacOS/mcskin`, `Contents/Info.plist`, `Contents/Resources/mcskin.icns`) packaged into `mcskin_${TAG}_darwin_arm64.zip`.
  - For Web: Serve `/favicon.ico` and `/static/icon.png`.
- **Rationale**: Delivers native look and feel on macOS and Windows without complex third-party desktop frameworks (e.g. Electron/Wails).

### Decision 5: Token Optimization Governance and Subagent Offloading
- **Choice**: Introduce `.agents/skills/token-guardian/` and `scripts/test-compact.sh`, with guidelines in `AGENTS.md`, `CLAUDE.md`, and `openspec/config.yaml` enforcing:
  - File size cap: max 300 lines / 15 KB per file.
  - Silent-on-success test execution.
  - Subagent offloading for testing and investigation loops.
- **Rationale**: Preserves conversational context in Antigravity and maximizes Anthropic prompt cache hits in Claude Code.

## Architecture & Package Structure

```
cmd/mcskin/
  main.go                   (Entrypoint, CLI flags, double-click dispatch)
  main_test.go              (Unit tests for argument handling & web dispatch)
internal/web/
  server.go                 (Router, handler registration, static FS)
  server_test.go            (Endpoint tests including /api/shutdown)
  shutdown.go               (Graceful server shutdown coordination)
  shutdown_test.go          (Unit tests for graceful shutdown)
  browser.go                (Cross-platform browser opener)
  static/
    index.html              (HTML UI with script type=module)
    style.css               (Modular stylesheet)
    vendor/                 (Isolated third-party libraries: three.min.js, qrcode.js)
    js/
      app.js                (Main orchestrator, tab switching < 100 lines)
      converter.js          (File upload, dropzone, mcpack download < 250 lines)
      editor3d.js           (Three.js scene, camera, lights, mesh < 280 lines)
      editor2d.js           (2D pixel canvas, zoom, drawing tools < 250 lines)
      palette.js            (Minecraft colors, custom picker, history < 200 lines)
      network.js            (Wi-Fi URLs, QR code modal < 120 lines)
      shutdown.js           (Discrete button, confirmation modal < 80 lines)
scripts/
  test-compact.sh           (Compact Go test runner: silent on PASS)
  package-mac-app.sh        (Generates mcskin.app bundle structure)
```

## TDD Test Execution Sequence

1. **RED Phase 1**: Write unit tests for `/api/shutdown` endpoint in `internal/web/shutdown_test.go` and verify failure.
2. **GREEN Phase 1**: Implement `internal/web/shutdown.go` and route handler in `internal/web/server.go`. Verify tests pass.
3. **RED Phase 2**: Write unit tests in `cmd/mcskin/main_test.go` verifying zero-argument execution starts web server on `darwin`. Verify failure.
4. **GREEN Phase 2**: Update `cmd/mcskin/main.go` to dispatch web mode on `darwin`. Verify tests pass.
5. **VERIFY Phase**: Test modular frontend, verify macOS compilation (`GOOS=darwin GOARCH=arm64 go build`), and validate GitHub workflow syntax.

## AI Agent Governance & Loop Limits

- Maximum 3 iterations per test/fix loop (`max_attempts = 3`).
- Halt immediately if identical error occurs across 2 consecutive attempts (2-Strike rule).
- Subagents handle localized test execution to avoid polluting parent context.

## Risks / Trade-offs

- **[Risk] Browser caching older monolithic JS** → *Mitigation*: Updated `index.html` loads `/static/js/app.js` with module type; static file server sets appropriate `Cache-Control: no-cache` for development.
- **[Risk] Accidental server shutdown** → *Mitigation*: Modal confirmation dialog with distinct, high-contrast Minecraft buttons prevents accidental clicks.
- **[Risk] macOS Gatekeeper quarantine on downloaded unsigned zip** → *Mitigation*: Document `xattr -cr mcskin.app` in README and release notes.
