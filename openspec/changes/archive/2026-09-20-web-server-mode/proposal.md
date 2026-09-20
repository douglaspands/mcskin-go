# Proposal

## Why

Parents, kids, and educators who play Minecraft Bedrock on mobile devices (tablets, iPads, Android smartphones, consoles) struggle to convert custom PNG skins into `.mcpack` files because the current tool is strictly command-line based. Children as young as 6 want to create and import cool skins easily without opening a terminal, and families want to connect their phones and tablets directly to their home computer to upload textures and download ready-to-play packs.

Introducing a kid-friendly, Minecraft-themed local web server mode ("CRIE SKINS LEGAIS") with automatic browser launching (especially on Windows double-click) and on-screen local Wi-Fi QR codes enables anyone—especially children—to effortlessly convert Minecraft skins into Bedrock `.mcpack` archives directly from computers, tablets, or smartphones.

## What Changes

- Add `--web` / `-w` CLI flag to launch an embedded local HTTP server (Go standard library `net/http`).
- Add `--port` / `-p` CLI flag (defaulting to 8080 or next available port) and `--no-browser` flag to control automated browser opening.
- On Windows systems, executing the binary without CLI arguments (such as double-clicking the executable from File Explorer) automatically starts the web server mode and opens the default web browser.
- Embed a 100% self-contained, offline web application ("CRIE SKINS LEGAIS") using Go `embed.FS`:
  - Visually engaging, modern Minecraft-themed UI with playful block aesthetics, friendly Portuguese typography, and cheerful feedback designed for children aged 6+.
  - Fully responsive layout optimized for touch interaction on tablets and smartphones.
  - Interactive skin upload area (drag-and-drop or camera/gallery selection on mobile).
  - Instant skin texture preview and model selector: Classic (Steve / 4px), Slim (Alex / 3px), or Ambos (Both).
  - Fast in-memory conversion and instant 1-click `.mcpack` download.
- Provide a dynamic QR Code and local network URL display on the page:
  - Automatically detects local LAN IPv4 addresses (`net.InterfaceAddrs`).
  - Renders a clean QR code using a self-contained, dependency-free generator so mobile devices on the same Wi-Fi can scan and open the app instantly.
- Preserve zero external dependencies: implemented exclusively using Go standard library (`net/http`, `embed`, `html/template` or embedded assets, `net`) without external npm or Go modules.

## Capabilities

### New Capabilities
- `web-server`: Embedded HTTP web server and REST API (`/api/convert`, `/api/info`) serving the self-contained "CRIE SKINS LEGAIS" web application with local Wi-Fi QR code generation, browser auto-launching, and responsive UI for tablets and smartphones.

### Modified Capabilities
- `cli`: Extend argument parsing to support `--web`, `--port`, and `--no-browser` flags, and configure default Windows no-argument execution to launch web server mode with automatic browser opening.

## Impact

- CLI entrypoint (`cmd/mcskin/main.go`): detects web mode flags and Windows GUI double-click launches.
- New internal package `internal/web/`: contains HTTP handlers, LAN IP detection, browser opener, and embedded web assets (HTML/CSS/JS/SVG).
- Conversion pipeline (`internal/converter/`): leveraged directly by HTTP conversion endpoints for in-memory or stream-based `.mcpack` creation.
- Zero dependencies: No npm packages or third-party Go modules added; fully air-gapped and self-contained.
