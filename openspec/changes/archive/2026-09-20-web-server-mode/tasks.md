# Tasks

## 1. Converter In-Memory Processing (TDD Red & Green)

- [x] 1.1 Write failing unit tests in `internal/converter/converter_test.go` for in-memory byte conversion `ConvertBytes`, verifying test failure (RED) with `go test -run TestConvertBytes ./internal/converter/...`
- [x] 1.2 Implement `ConvertBytes` in `internal/converter/converter.go` supporting in-memory `.mcpack` generation from raw PNG bytes and verify tests pass (GREEN) with `go test -run TestConvertBytes ./internal/converter/...`

## 2. Web Network and Browser Utilities (TDD Red & Green)

- [x] 2.1 Write failing unit tests in `internal/web/network_test.go` for LAN IPv4 detection and network URL formatting, verifying test failure (RED) with `go test ./internal/web/...`
- [x] 2.2 Implement LAN IP discovery and URL resolution in `internal/web/network.go` and verify tests pass (GREEN) with `go test -run TestNetwork ./internal/web/...`
- [x] 2.3 Write failing unit tests in `internal/web/browser_test.go` for cross-platform browser opening command resolution, verifying test failure (RED) with `go test ./internal/web/...`
- [x] 2.4 Implement `OpenBrowser` command abstraction in `internal/web/browser.go` and verify tests pass (GREEN) with `go test -run TestBrowser ./internal/web/...`

## 3. Web Server Endpoints & In-Memory Handlers (TDD Red & Green)

- [x] 3.1 Write failing unit tests in `internal/web/server_test.go` for `/api/info`, `/api/convert`, and static asset serving using `net/http/httptest`, verifying test failure (RED) with `go test ./internal/web/...`
- [x] 3.2 Implement HTTP server routing, JSON info endpoint, and multipart conversion handler in `internal/web/server.go`, verifying tests pass (GREEN) with `go test -run TestServer ./internal/web/...`

## 4. "CRIE SKINS LEGAIS" Minecraft Web Frontend

- [x] 4.1 Create kid-friendly Minecraft-themed HTML structure in `internal/web/static/index.html` featuring "CRIE SKINS LEGAIS", upload dropzone, model selector, download trigger, and QR code card
- [x] 4.2 Create responsive CSS in `internal/web/static/style.css` with playful Minecraft block aesthetics, high-contrast touch targets, and mobile/tablet responsive layouts
- [x] 4.3 Create dependency-free offline QR code generator in `internal/web/static/qrcode.js` and client application logic in `internal/web/static/app.js` for instant canvas preview, conversion API calls, and automatic `.mcpack` download
- [x] 4.4 Embed static assets into Go package using `embed.FS` and verify embedded asset delivery with `go test -run TestServeStatic ./internal/web/...`

## 5. CLI Web Server Flags & Windows Double-Click Integration

- [x] 5.1 Write failing unit tests in `cmd/mcskin/main_test.go` verifying `--web`, `--port`, `--no-browser`, and Windows zero-argument fallback execution, verifying test failure (RED) with `go test ./cmd/mcskin/...`
- [x] 5.2 Implement CLI flag handling and Windows double-click zero-argument dispatch in `cmd/mcskin/main.go`, verifying tests pass (GREEN) with `go test -run TestRun ./cmd/mcskin/...`

## 6. Verification & Build

- [x] 6.1 Execute full test suite (`go test -v ./...`) and Go static analysis (`go vet ./...`) verifying 100% mocked isolation and zero failures
- [x] 6.2 Build Linux and Windows binaries (`go build -o bin/mcskin ./cmd/mcskin`) verifying zero external dependencies and successful compilation
