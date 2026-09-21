# mcskin

<p align="center">
  <a href="README.md">Português (Brasil)</a> • <b>English</b> • <a href="README.es.md">Español</a>
</p>

> **Create and install Minecraft Bedrock skins right in your browser — zero ads, no sign-up, 100% safe for kids.** A lightweight 3D/2D editor and converter that runs on your home computer and connects to phones and tablets on the same Wi-Fi network via QR Code.

[![Recommended Age](https://img.shields.io/badge/kids-6%2B%20years-orange.svg)]()
[![Zero Ads](https://img.shields.io/badge/ads-zero-brightgreen.svg)]()
[![Local Network](https://img.shields.io/badge/privacy-100%25%20local%20network-success.svg)]()
[![Bedrock Format](https://img.shields.io/badge/bedrock-.mcpack%20official-blueviolet.svg)]()
[![Go Version](https://img.shields.io/badge/go-1.25%2B-blue.svg)](https://golang.org)
[![Platforms](https://img.shields.io/badge/platforms-windows%20%7C%20linux-lightgrey.svg)]()
[![Zero Dependencies](https://img.shields.io/badge/dependencies-zero-brightgreen.svg)]()
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## 💡 Why was `mcskin` created?

Most skin websites on the internet are traps for a 6-year-old child who just wants to customize their character: flashing ads everywhere, deceptive download buttons attempting to install malware, mandatory account creation, and clunky interfaces that are frustrating to touch.

**`mcskin`** was built to bring peace of mind to parents and pure creative joy to children:

| What happens on typical websites? | How is it in `mcskin`? |
| :--- | :--- |
| ❌ **Invasive ads**, flashing banners, and video pop-ups | ✅ **Zero ads**: clean, silent screen 100% focused on creativity |
| ❌ **Fake "Download" buttons** leading to malware and viruses | ✅ **1 safe click**: generates official `.mcpack` files directly on your machine |
| ❌ **Mandatory sign-ups**, logins, email, or personal data | ✅ **No accounts or passwords**: total anonymity and family data privacy |
| ❌ **Tiny buttons** and fiddly menus for small fingers | ✅ **Designed for kids (6+)**: large buttons (64px+) and forgiving touch controls |
| ❌ **Complicated transfers** using USB cables, flash drives, or emails | ✅ **Instant QR Code connection**: phones and tablets open it via local Wi-Fi |
| ❌ **Incompatible skins** with broken arm models in-game | ✅ **Official Bedrock Dual-Model**: automatically outputs Steve (4px) and Alex (3px) |

---

## 🚀 Get Started in 3 Simple Steps

No need to install anything from the App Store or Google Play, and no server configuration required:

```
 [1. Start on PC]   ───────>   [2. Connect Phone/Tablet]   ───────>   [3. Paint and Play!]
 Double-click executable       Point camera at QR Code                 Draw skin and open in
 (opens local browser)         (opens directly in browser)             Minecraft with 1 tap
```

### 1️⃣ Start on Your Computer
- **On Windows**: Double-click `mcskin.exe`. The browser opens automatically to *"CREATE COOL SKINS"*.
- **On Linux / macOS**: Run in your terminal:
  ```bash
  ./bin/mcskin --web
  ```

### 2️⃣ Connect a Tablet or Phone (Optional)
- Point your mobile device's camera at the **QR Code** displayed on the computer screen.
- The editor opens instantly in the mobile browser, connected through your home Wi-Fi network. No cables, no Bluetooth, and nothing to install!

### 3️⃣ Paint and Play!
- Pick colors and paint freely on the 3D model or 2D unwrapped sheet.
- When finished, click **"Download Bedrock Pack (.mcpack)"** and tap **"Open with Minecraft"**. Your skin is immediately available in the game's Dressing Room!

---

## 🎨 Web Interface Showcase — "CREATE COOL SKINS"

The editor was designed with a dedicated focus on child ergonomics, ensuring young creators can express themselves without frustration.

<p align="center">
  <img src="docs/screenshots/editor-3d-redesign-desktop.jpg" alt="3D Editor with zero-scroll immersive layout, tool dock, and top bar" width="760"><br>
  <sub><b>Immersive 3D Editor</b>: fits the screen with zero vertical scrolling, easy-to-reach bottom dock, vibrant colors, Wi-Fi QR Code, and streamlined view controls.</sub>
</p>

<p align="center">
  <img src="docs/screenshots/editor-2d-folha-grade.jpg" alt="2D Editor with unwrapped texture sheet and subtle grid" width="460">
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="docs/screenshots/editor-mobile-drawer.jpg" alt="Mobile sliding drawer navigation on phone" width="230">
</p>
<p align="center"><sub><b>Left</b>: 2D unwrapped mode with precision grid and zoom to reach hidden folds. <b>Right</b>: sliding drawer navigation on phone/tablet.</sub></p>

<p align="center">
  <img src="docs/screenshots/editor-nova-skin-modal.jpg" alt="New Skin Modal with Steve, Alex, and Blank options" width="360"><br>
  <sub><b>New Skin Modal</b>: intuitive starting point for Classic Steve (4px), Slim Alex (3px), or Blank canvas.</sub>
</p>

### Kid-Friendly Design Highlights:

- 🧒 **Large Buttons (64px+) & Generous Hit Areas**: No tiny buttons that cause accidental clicks. Tools and palettes are optimized for touchscreens.
- 🔄/🖌️ **"Paint" vs. "Rotate" Mode Switch**: A safety lock that prevents accidental drawing when orbiting the camera, and prevents accidental spinning when trying to paint fine details.
- 📐 **100dvh Immersive Layout (Zero Scrolling)**: The entire interface adapts to the device screen, eliminating jarring scrollbars.
- 🧊/📜 **Integrated 3D & 2D Switching**: Switch with 1 tap between the interactive 3D character and the 2D unwrapped sheet to reach inner arms and hidden textures with pinpoint accuracy.
- 🤖 **Smart AI Skin Import**: Load images generated by ChatGPT, Midjourney, DALL-E, or Bing at any resolution — the system resamples and preserves crisp pixel alignment automatically.
- 🪄 **1-Tap Solid Background Removal**: Detects whether an image has a solid background and offers automatic removal without requiring parents to edit masks.
- 🔲 **Subtle Precision Grid**: Hairline 16x reference lines with a soft drop shadow make every pixel distinct without cluttering the skin's look.
- 🔊 **Playful Sound Effects**: Authentic level-up audio rewards the moment a child completes and downloads their creation.

---

### 📦 Quick Converter (for existing PNG skins)

If your child already has a skin image ready, there is no need to draw from scratch:

<p align="center">
  <img src="docs/screenshots/conversor-skin.png" alt="Skin Converter screen with dropzone and QR code" width="720"><br>
  <sub><b>Quick Converter</b>: drag and drop a PNG or AI image, set the pack name, and scan the QR code on a tablet to install in Minecraft Bedrock.</sub>
</p>

---

## 🎮 How to Equip the Skin in Minecraft Bedrock

After downloading the `.mcpack` file, equipping it in the game is effortless:

### On Windows 10 / 11:
1. **Double-click** the downloaded `.mcpack` file.
2. Minecraft launches automatically and shows: `Import started...` followed by `Skin pack imported successfully`.

### On Mobile or Tablet (Android / iOS / iPadOS):
1. Download the `.mcpack` in the mobile browser.
2. Tap the download notification and select **"Open with Minecraft"** (or open the file via your *Files* / *Downloads* app).

### Inside the Game (Dressing Room):
1. On Minecraft's home screen, open the **Dressing Room**.
2. Tap the hanger icon (**Classic Skins**).
3. Find your skin pack.
4. By default, `mcskin` generates both official Bedrock models:
   - **`<Name> (Classic)`**: standard 4-pixel arms (Steve).
   - **`<Name> (Slim)`**: slender 3-pixel arms (Alex).
5. Pick your preferred variant and tap **Equip**!

---

## 💻 Command Line Usage (CLI)

For power users, server administrators, and developers, `mcskin` includes a fast, standalone CLI mode:

```bash
mcskin [options] <path/to/skin.png>
```

### Options Reference

| Option | Description |
| :--- | :--- |
| *(no flag)* | **Default:** Generates both models (Classic 4px and Slim 3px) in the same `.mcpack`. |
| `--both` | Explicitly forces inclusion of both models (Classic and Slim). |
| `--classic` | Restricts output to the classic model only (4px arms / Steve). |
| `--slim` | Restricts output to the slim model only (3px arms / Alex). |
| `--force` | Overwrites existing output `.mcpack` file if present (default: `true`). |
| `-i`, `--input` | Specifies the input PNG path via named argument. |
| `-w`, `--web` | Starts the embedded web server hosting Converter and 3D/2D Editor. |
| `-p`, `--port` | Sets the web server port (default: `8080`). Used with `--web`. |
| `--no-browser` | In web mode, prevents automatic launch of the default web browser. |
| `-v`, `--version` | Prints executable version, git commit hash, and build timestamp. |
| `-h`, `--help` | Prints CLI usage help and available flags. |

> *Note: `--classic` and `--slim` flags are mutually exclusive.*

### CLI Examples

```bash
# Default conversion generating both models (Steve and Alex):
./bin/mcskin my_skins/warrior.png
# -> Produces: my_skins/warrior.mcpack

# Restrict to classic Steve model (4px):
./bin/mcskin --classic my_skins/steve_custom.png

# Restrict to slim Alex model (3px):
./bin/mcskin --slim my_skins/alex_custom.png

# Launch web server on custom port without opening browser:
./bin/mcskin --web --port 9090 --no-browser
```

---

## 📦 Technical Structure of the `.mcpack` Archive

The generated `.mcpack` is a standardized ZIP archive fully compliant with Minecraft Bedrock skin pack schemas:

```text
[skin_name].mcpack
├── manifest.json       # Manifest with unique RFC-4122 UUIDv4 identifiers
├── skins.json          # Skin registry and geometry mappings (classic & slim)
├── texts/
│   └── en_US.lang      # Localization keys for in-game skin names
└── [skin_name].png     # Shared texture image located at pack root
```

### Technical PNG Requirements:
- **Format**: Valid PNG (RGBA).
- **Supported dimensions**:
  - `64x64` pixels (modern Minecraft standard).
  - `128x128` pixels (HD high-resolution skins supported by Bedrock).
  - `64x32` pixels (legacy pre-1.8 skin format).

---

## 📥 Official Release Downloads (CI/CD)

Pre-built standalone binaries are compiled via GitHub Actions ([`.github/workflows/release.yml`](.github/workflows/release.yml)) on every release:

- **Windows (`amd64`)**: `mcskin_<tag>_windows_amd64.zip` with embedded high-resolution icons and trust manifest (`mcskin.exe`).
- **Linux (`amd64`)**: `mcskin_<tag>_linux_amd64.tar.gz` with static binary and documentation.
- **Integrity**: `checksums.txt` with SHA-256 hashes for all release artifacts.

Visit the **[GitHub Releases Page](https://github.com/douglaspands/mcskin/releases)** to download the latest release.

---

## 🛠️ Developer Guide

This section is for contributors compiling from source, running tests, or building releases.

### Prerequisites
- [Go](https://go.dev/dl/) 1.25 or later.
- Git.
- `make` (optional, for build shortcuts).

### Building with Makefile

```bash
# Build Linux and Windows binaries into bin/ with version metadata:
make build

# Build for Linux (amd64):
make build-linux

# Build for Windows (.exe with embedded manifest):
make build-windows

# Run all unit tests:
make test

# Run official linter (go vet):
make lint

# Clean build artifacts:
make clean
```

### Test-Driven Development (TDD) & In-Memory Isolation
The project enforces strict **TDD** and **100% in-memory unit test isolation**:

```bash
# Run compact test suite (silent on success):
./scripts/test-compact.sh

# Run package-specific tests:
go test -v ./internal/bedrock/...
go test -v ./internal/converter/...
go test -v ./internal/skin/...
go test -v ./internal/pack/...
go test -v ./cmd/mcskin/...
```

> **Isolation Invariant**: Pure unit tests are 100% mocked in memory (`bytes.Buffer`, `bytes.Reader`). Unit tests never make outbound network requests or write to disk outside ephemeral test directories (`t.TempDir()`).

### Verifying `.mcpack` Compliance
To inspect JSON schemas, UUIDv4 uniqueness, and texture dimensions of any generated pack:

```bash
python3 .agents/skills/bedrock-skin-pack-verifier/scripts/verify-mcpack.py path/to/skin.mcpack
```

---

## 📄 License

This project is licensed under the terms of the [MIT License](LICENSE). It is free and open-source for personal, educational, and commercial use.
