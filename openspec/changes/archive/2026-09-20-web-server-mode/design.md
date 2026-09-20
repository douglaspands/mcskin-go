# Design & System Design Specification

## Context

`mcskin` is a fast, zero-dependency, cross-platform tool designed to **facilitate the creation, update, and installation of skins in Minecraft Bedrock**, with a primary focus on **smartphones and tablets (iPads, Android phones, and tablets)**.
While CLI usage is ideal for developers and automated headless pipelines, it creates high friction for children, casual players, and mobile players who play on touch devices and do not interact via terminal.
To make the tool widely accessible and seamless for mobile users, we introduced an embedded local web server mode ("CRIE SKINS LEGAIS") with instant local network sharing via offline QR code, touch-friendly UI (64px+ buttons), automatic browser launching on Windows double-click, and in-memory conversion for direct 1-touch `.mcpack` installation on mobile devices.

This document defines both the technical implementation of `web-server-mode` and the **universal System Design Blueprint** that all current and future features in `mcskin` must follow.

See `proposal.md` for background and user stories.

---

## Goals / Non-Goals

**Goals:**
- Provide a zero-dependency, self-contained HTTP web server embedded directly in the `mcskin` binary using Go standard library (`net/http`, `embed`).
- Enable seamless Windows double-click execution: running `mcskin.exe` without CLI parameters automatically starts the web server and opens the default browser to `http://localhost:8080`.
- Present a modern, playful, kid-friendly Minecraft-themed UI ("CRIE SKINS LEGAIS") in Portuguese, with large touch targets (64px+), visual feedback, and responsiveness on tablets and smartphones.
- Support real-time texture preview and model selection (Ambos / Steve 4px / Alex 3px).
- Provide in-browser upload and 1-click download of the generated `.mcpack` package.
- Display a local Wi-Fi QR Code and network URL generated offline with zero external network requests, allowing mobile devices on the same Wi-Fi network to scan and connect instantly.
- Maintain 100% mocked, isolated unit tests with zero network, disk, or OS process side-effects in unit test suites.
- Formalize canonical System Design invariants for all subsequent features.

**Non-Goals:**
- External internet hosting, cloud synchronization, or remote telemetry.
- Third-party NPM, CSS framework, or external Go module dependencies.
- User account management, persistent database storage, or multi-user access controls.

---

## Package Architecture & Component Breakdown

The codebase enforces strict layered boundaries and unidirectional dependencies:

```
cmd/mcskin/
  main.go                     # Entrypoint: flag parsing, OS detection, execution dispatching (zero domain logic)
  main_test.go                # Unit tests for CLI flag parsing and dispatch logic

internal/
  skin/                       # Pure Domain: image decoding, 64x64/128x128 RGBA validation, aspect ratios
    skin.go
    skin_test.go
  bedrock/                    # Pure Domain: Bedrock schemas, manifest.json, skins.json, RFC-4122 UUIDv4, en_US.lang
    manifest.go
    uuid.go
    manifest_test.go
    uuid_test.go
  pack/                       # Pure Domain: zip archive packaging stream writing into .mcpack format
    pack.go
    pack_test.go
  converter/                  # Orchestration: couples skin validation, bedrock manifest, and packaging
    converter.go              # Exposes Convert() for files and ConvertBytes() for in-memory byte streams
    converter_test.go
  web/                        # Transport & Web Application: self-contained HTTP server and static assets
    server.go                 # HTTP server lifecycle, routing, and REST endpoints (/api/convert, /api/info)
    server_test.go            # 100% mocked unit tests using net/http/httptest
    network.go                # LAN IPv4 detection and URL resolution helper
    network_test.go           # Unit tests for network interface parsing
    browser.go                # Cross-platform default browser opener abstraction
    browser_test.go           # Unit tests for browser opener command resolution
    static.go                 # embed.FS wrapper for web assets
    static/
      index.html              # "CRIE SKINS LEGAIS" Minecraft-themed interface
      style.css               # High-contrast Minecraft block aesthetic with pixel art styling
      app.js                  # Client logic: drag-and-drop, preview, conversion API call, QR modal
      qrcode.js               # Standalone, dependency-free client-side SVG QR code generator
```

---

## Canonical System Design Patterns for Future Features

Every future feature, endpoint, or engine enhancement **MUST** adhere to the following 8 architectural invariants:

### 1. Hexagonal Layering & Dependency Hierarchy
- **Entrypoints (`cmd/`)**: Responsible solely for argument parsing, OS/environment detection, and routing control flow. Must contain zero business or conversion logic.
- **Orchestration (`internal/converter`, `internal/web`)**: Coordinates domain modules, manages stream I/O, maps HTTP/CLI parameters to domain types, and returns domain result structs.
- **Core Domain (`internal/skin`, `internal/bedrock`, `internal/pack`)**: Completely independent, stateless domain logic. Core domain packages must NEVER import `cmd/` or `internal/web/`.

### 2. Zero External Dependencies Contract (Standard Library Purity)
- The application runtime MUST rely strictly on the Go standard library (`image/png`, `archive/zip`, `crypto/rand`, `encoding/json`, `net/http`, `embed`, `path/filepath`).
- External Go modules in `go.mod`, npm/node dependencies, and external CDN scripts/fonts are strictly prohibited.
- Complete air-gapped execution: the application must remain 100% functional without internet connectivity.

### 3. In-Memory First & Stream-Based Data Pipeline
- All processing pipelines must be designed around `io.Reader`, `io.Writer`, and `[]byte` in-memory buffers (e.g., `ConvertBytes`).
- Avoid writing transient scratch files to disk. Persistent disk writes should only occur when saving a finalized user output file. This guarantees thread-safety, zero disk permission issues, and eliminates cleanup failure modes.

### 4. Cross-Platform Interoperability Matrix
- **ZIP/MCPack Path Normalization**: Entry paths in `.mcpack` zip archives must ALWAYS be formatted using `filepath.ToSlash()` to ensure Minecraft Bedrock engine compatibility across Windows, Android, iOS, and consoles.
- **OS Command Abstractions**: Platform-specific logic (such as browser opening or file associations) must be injected via function types or interfaces to allow 100% mocked unit testing.
- **Dual Invocation UX**: Provide intuitive behavior across operating systems:
  - Windows: Double-click launch defaults to interactive web server mode.
  - Linux/POSIX: CLI flag conventions (`--web`, `-w`, `--help`) are strictly preserved.

### 5. Bedrock Format & Cryptographic Invariants
- Manifest headers and module instances must use distinct RFC-4122 UUIDv4 values generated via cryptographically secure pseudo-randomness (`crypto/rand`).
- Bedrock `manifest.json` must adhere to `format_version: 2`.
- Default to dual-geometry generation (`geometry.humanoid.custom` for 4px Steve arms and `geometry.humanoid.customSlim` for 3px Alex arms) sharing a single texture to ensure immediate compatibility with all player avatars.

### 6. Kid-Friendly (6+) Minecraft UI/UX Design System
- **Visual Aesthetic**: Blocky Minecraft palette (dirt `#3c2714`, grass green `#4CAF50`, obsidian `#1b122c`, stone borders, tactile pressable buttons).
- **Accessibility & Touch**: Giant touch targets (minimum 48x48px, recommended 64px+) suitable for small children on touchscreens.
- **Encouraging Microcopy**: Clear Portuguese language phrasing ("CRIE SKINS LEGAIS", "Arraste sua skin aqui", "Baixar Pacote MCPack!").
- **Offline Sensory Feedback**: Real-time canvas pixel preview, Web Audio API sound synthesis (zero external audio assets), and offline SVG QR code with quiet zones and zoom modal for camera scan reliability.

### 7. Strict TDD Protocol & 100% Mocked Isolation
- Adhere to the RED -> GREEN -> REFACTOR development cycle.
- Pure unit tests MUST NOT perform real network requests, bind open network sockets, write to persistent disk outside transient `t.TempDir()`, or invoke external operating system processes.
- All external dependencies (HTTP clients, file systems, command runners, IP interfaces) must be fully mocked using in-memory constructs (`httptest.ResponseRecorder`, `bytes.Buffer`, mock closures).

### 8. AI Agent Governance & Execution Bounds
- Follow the defined state graph: `[Plan: OpenSpec] -> [TDD: RED] -> [Implement: GREEN] -> [Verify: go test] -> [PO/QA Review: feature-qa-reviewer] -> [Archive: Squash Merge]`.
- Bounded repair loops: Maximum 3 iterations (`max_attempts = 3`) per failing test. Halt execution immediately upon 2 identical errors without new diagnostic data.
- Strict workspace confinement to repository root with zero privilege escalation (`sudo`/`su`).

---

## Decisions & Rationale

### 1. In-Memory Conversion (`ConvertBytes`) vs. Filesystem Temp Files
- **Decision**: Add `converter.ConvertBytes(skinName string, textureData []byte, model bedrock.ModelMode) ([]byte, error)` to produce the `.mcpack` zip archive entirely in-memory using `bytes.Buffer`.
- **Rationale**: Web uploads should not write unnecessary intermediate temporary files to persistent disk. In-memory conversion eliminates race conditions, disk permission issues, and disk cleanup requirements.
- **Alternatives Considered**: Writing uploaded files to `os.TempDir()` and calling existing `converter.Convert()`. Rejected due to disk I/O overhead and transient file leakage.

### 2. Zero-Dependency Offline QR Code Rendering
- **Decision**: Embed a compact, standalone pure JavaScript SVG QR code generator in `internal/web/static/qrcode.js` that renders locally in the browser with an ISO standard 4-module quiet zone and zoom modal.
- **Rationale**: Keeps the Go binary completely dependency-free, avoids external CDN calls (strict air-gapped security), and allows mobile devices with lower-resolution tablet cameras to scan easily.
- **Alternatives Considered**: External QR code API (strictly rejected due to offline requirement); server-side Go PNG generator (added unnecessary binary bloat).

### 3. Windows Double-Click Zero-Argument Detection
- **Decision**: In `cmd/mcskin/main.go`, check `runtime.GOOS == "windows" && len(args) == 0`. When true, default to running web server mode on port 8080 and launching the default browser. On non-Windows platforms (Linux/macOS), running with zero arguments retains CLI usage display and exit code 1.
- **Rationale**: Windows users naturally double-click `.exe` files from File Explorer. Providing web mode by default on Windows eliminates the "flash and close" CLI window confusion.
- **Alternatives Considered**: Defaulting to web mode on all operating systems when no arguments are provided. Rejected to preserve POSIX CLI script expectations.

### 4. Cross-Platform Browser Launching Abstraction
- **Decision**: Implement `OpenBrowser(url string)` using an injectable command runner function:
  - Windows: `cmd.exe /c start <url>`.
  - Linux: `xdg-open <url>`.
  - macOS: `open <url>`.
- **Rationale**: Provides automatic browser opening without external libraries while enabling 100% mocked testing through an injectable executor.

### 5. UI/UX Design for Children Aged 6+ ("CRIE SKINS LEGAIS")
- **Decision**:
  - Playful, high-contrast Minecraft block aesthetic with responsive layout.
  - Clear Portuguese instructions with cheerful feedback.
  - Visual model selector with preview cards:
    - **Ambos (Recomendado)**: "Funciona para todos!"
    - **Steve (Clássico / 4px)**: "Braços normais"
    - **Alex (Fino / 3px)**: "Braços finos"
  - Large interactive drag-and-drop dropzone with instant canvas pixelated skin preview.
  - Prominent QR Code card with zoom modal for tablet/phone camera scanning.
  - Audio/Visual celebration cue on successful conversion using Web Audio API synthesis.

---

## TDD Test Sequence & Isolation Strategy

1. **RED Phase 1: `internal/converter` In-Memory Conversion**
   - Test: `TestConvertBytes_Success`, `TestConvertBytes_InvalidPNG`, `TestConvertBytes_Dimensions`.
   - Mock: In-memory `bytes.Buffer`, mock RGBA image buffers. Zero disk access.
2. **RED Phase 2: `internal/web` Network & Info Endpoints**
   - Test: `TestResolveNetworkURLs`, `TestHandleInfo`.
   - Mock: Inject mock interface address provider.
3. **RED Phase 3: `internal/web` Server Routes & Conversion Handler**
   - Test: `TestServeIndex`, `TestServeStatic`, `TestConvertEndpoint_Success`, `TestConvertEndpoint_InvalidInput`.
   - Mock: `httptest.NewRecorder()`, `httptest.NewRequest()`, multipart form buffer in memory.
4. **RED Phase 4: `internal/web` Browser Opener**
   - Test: `TestOpenBrowser_CommandResolution`.
   - Mock: Inject mock command executor verifying arguments without running external processes.
5. **RED Phase 5: `cmd/mcskin` CLI Web Flag & Windows Fallback**
   - Test: `TestRun_WebFlag`, `TestRun_WindowsNoArgsDispatch`.
   - Mock: Mock stdout/stderr buffers, mock web runner function.

---

## AI Agent Governance & Loop Limits

- **State Transitions**: `[Plan: OpenSpec] -> [TDD: RED] -> [Implement: GREEN] -> [Verify: go test] -> [PO/QA Review: feature-qa-reviewer] -> [Archive: Squash Merge]`.
- **Loop Limits**: Maximum 3 iterations per failing test. If an identical failure repeats without progress across 2 attempts, halt and escalate.
- **Air-Gapped Execution**: All unit tests run offline in-memory. No network listeners bind external interfaces during unit tests.

---

## Risks / Trade-offs

- **[Risk] Port 8080 collision**: Port 8080 might already be in use by another local development server.
  → **Mitigation**: Implement automatic port fallback or allow `--port` override.
- **[Risk] Multiple network interfaces (e.g., Docker, VPN, VirtualBox)**: `/api/info` might pick an internal virtual IP instead of home Wi-Fi.
  → **Mitigation**: Filter out loopback (`127.0.0.1`), link-local (`169.254.x.x`), and prioritize standard private IPv4 subnets (`192.168.x.x`, `10.x.x.x`, `172.16-31.x.x`).
- **[Risk] Browser auto-launch failure in headless environments (e.g. CI/CD or SSH)**:
  → **Mitigation**: Treat browser launch errors as non-fatal warnings logged to stdout/stderr; provide `--no-browser` flag for headless execution.
