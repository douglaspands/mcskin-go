# png-to-mcpack

> Fast, lightweight, zero-dependency CLI tool in Go to convert Minecraft skin PNG textures into ready-to-import Minecraft Bedrock `.mcpack` skin packs.

[![CI](https://github.com/douglas/png-to-mcpack/actions/workflows/ci.yml/badge.svg)](https://github.com/douglas/png-to-mcpack/actions/workflows/ci.yml)
[![Go Version](https://img.shields.io/badge/go-1.25%2B-blue.svg)](https://golang.org)
[![Platform](https://img.shields.io/badge/platform-linux%20%7C%20windows-lightgrey.svg)]()
[![Zero Dependencies](https://img.shields.io/badge/dependencies-zero-brightgreen.svg)]()

---

## Features

- **Zero Runtime Dependencies**: Developed strictly using the Go standard library (`image/png`, `archive/zip`, `crypto/rand`, `encoding/json`, `path/filepath`). No third-party modules or external dependencies.
- **Deterministic Same-Directory Output**: Automatically creates the `.mcpack` directly in the source folder matching the input PNG basename (e.g. `files/my-skin.png` -> `files/my-skin.mcpack`).
- **Compliant Bedrock Packaging**: Assembles RFC-4122 UUIDv4 identifiers, `manifest.json` (format version 2), `skins.json`, and `texts/en_US.lang`.
- **Model Geometry Support**: Supports standard Classic Steve (4px arms) and Slim Alex (3px arms) via the `--slim` flag.
- **Cross-Platform**: Compiles into native standalone binaries for **Linux** and **Windows** (`amd64`).
- **AI Agent-Governed**: Pre-configured with OpenSpec lifecycle tracking, Graph/Loop engineering guardrails, and universal AI harness compatibility (`AGENTS.md`).

---

## Installation & Building

### Prerequisites
- [Go](https://go.dev/dl/) 1.25 or later.

### Build with Make

```bash
# Build both Linux and Windows binaries into bin/
make build

# Run test suite
make test

# Run linter
make lint

# Clean build artifacts
make clean
```

### Manual Cross-Compilation

```bash
# Linux amd64
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o bin/png-to-mcpack ./cmd/png-to-mcpack

# Windows amd64
CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -ldflags="-s -w" -o bin/png-to-mcpack.exe ./cmd/png-to-mcpack
```

---

## Usage

```text
Usage: png-to-mcpack [options] <path/to/skin.png>

Options:
  --slim          Configure skin with slim humanoid geometry (3px arms / Alex)
  --force         Overwrite existing .mcpack output file (default true)
  -i, --input     Path to input PNG skin file
  -h, --help      Display help message
```

### Examples

#### 1. Basic Conversion (Classic Model)
```bash
./bin/png-to-mcpack path/to/steve_skin.png
```
*Output created at `path/to/steve_skin.mcpack`.*

#### 2. Slim Model (Alex)
```bash
./bin/png-to-mcpack --slim path/to/alex_skin.png
```

#### 3. Windows Execution
```cmd
bin\png-to-mcpack.exe C:\Users\Douglas\Pictures\custom_skin.png
```

---

## Bedrock Skin Pack Architecture

The generated `.mcpack` is a standard ZIP archive containing:

```
[skin_name].mcpack
├── manifest.json       # Bedrock pack header & module with RFC-4122 UUIDv4s
├── skins.json          # Skin registration and humanoid geometry definition
├── texts/
│   └── en_US.lang      # Localization keys for skin pack and skin name
└── [skin_name].png     # Skin texture (64x64 or 128x128 RGBA)
```

---

## Importing into Minecraft Bedrock

1. **Windows 10/11**: Double-click the generated `.mcpack` file. Minecraft Bedrock will open automatically and display `Import Started...` followed by `Successfully imported skin pack`.
2. **Android / iOS**: Share or transfer the `.mcpack` file to your mobile device and open it with Minecraft.
3. **In-game Activation**:
   - Go to **Dressing Room** > **Classic Skins** (hanger icon).
   - Find the newly imported skin pack in your list of owned skin packs and equip your skin!

---

## Development & AI Harness Guidelines

This repository follows rigorous software engineering practices:
- **Test-Driven Development (TDD)**: Test suites are written and verified failing (RED) prior to implementing application code (GREEN).
- **Universal AI Agent Harness Support**: All autonomous agents (Antigravity, Claude Code, Cursor, Copilot, Cline, Devin) are guided by [`AGENTS.md`](AGENTS.md) and [`.agents/governance.md`](.agents/governance.md).
- **OpenSpec Feature Lifecycle**: All architectural changes and feature developments follow the OpenSpec specification-driven workflow (`/opsx-propose`, `/opsx-apply`, `/opsx-archive`).

---

## License

MIT License. Free for personal and commercial use.
