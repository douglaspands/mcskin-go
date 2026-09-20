# Proposal

## Why

Currently, `mcskin` only converts pre-existing PNG skin files into Minecraft Bedrock `.mcpack` packages. Players, especially children (aged 6+), lack an easy, built-in way to create, edit, or customize their skins directly in the browser across PCs, tablets, and smartphones before generating their game pack. Furthermore, players with classic legacy 64x32 skins (Minecraft pre-1.8) are currently blocked because the converter strictly enforces 64x64 or 128x128 dimensions.

By introducing a kid-friendly 3D and 2D skin creator inspired by Nova Skin—paired with native 64x32 classic skin compatibility and a clean tabbed navigation menu—users can seamlessly design, customize, save, and install skins on any device with zero external dependencies.

## What Changes

- **In-Browser Skin Editor**:
  - Interactive 3D character viewport with direct face painting and quick orientation snap buttons (Front, Back, Left, Right, Top).
  - Unwrapped 2D sheet view with labeled body sections (Head, Torso, Arms, Legs) for high-precision pixel art on small screens.
  - Child-friendly touch controls: dedicated "Paint" vs "Rotate" mode toggle to prevent accidental drawing during camera maneuvers on smartphones/tablets.
  - Minecraft-themed quick color palette (Grass, Dirt, Diamond, Gold, Redstone, Coal, Skin tones) plus full color picker.
  - Drawing tools: Pencil, Bucket/Fill, Eraser, Eyedropper, and Undo/Redo history.
  - Body part visibility toggles (isolate Head, Torso, Arms, Legs) and layer toggles (Base Body vs 3D Outer Layer / Jacket / Helmet).
  - Starter templates: Classic Steve (4px arms), Alex (3px arms), and Blank/Clean canvas.
  - Special effects: support for transparency/glass mode (semi-transparent pixels for astronaut visors, slime, glasses).
  - Dual export: "Save PNG" (universal 64x64, 64x32, or 128x128 image for device gallery/transport) and "Create .mcpack" (instant 1-click Bedrock pack generation).
  - Import: "Open Skin" to upload any standard PNG from the device to edit.
- **Multi-Screen Tabbed Navigation**:
  - Minecraft-styled top navbar switching between `[ 📦 Conversor ]` (the existing PNG converter and local Wi-Fi QR code card) and `[ 🎨 Criador 3D ]` (the new editor).
  - Single Page Application (SPA) state retention without page reload.
- **Classic 64x32 Skin Compatibility**:
  - `internal/skin` validation accepts 64x32 PNGs alongside 64x64 and 128x128.
  - `internal/bedrock` generates valid `.mcpack` packages for 64x32 skins with correct humanoid geometry.
  - Web converter and CLI accept 64x32 skins with mirrored limbs preview.

## Capabilities

### New Capabilities
- `skin-editor`: In-browser 3D and 2D unwrapped Minecraft skin editor with kid-friendly touch controls, layer isolation, templates, PNG file transport, and direct `.mcpack` generation.

### Modified Capabilities
- `pack-conversion`: Extend PNG image validation and Bedrock packaging to support classic 64x32 legacy skin dimensions alongside 64x64 and 128x128.
- `web-server`: Add multi-screen navigation menu switching between the converter and editor, and update upload validation and preview to support 64x32 skins.

## Impact

- **Backend**:
  - `internal/skin/skin.go`: Update `Validate` to accept 64x32 dimensions.
  - `internal/bedrock/manifest.go`: Ensure 64x32 skins map correctly to Bedrock geometry.
  - `internal/converter/converter.go`: Support 64x32 pipeline without regression.
- **Frontend / Static Assets**:
  - `internal/web/static/index.html`: Add top navigation header, editor view container, and 64x32 dimension labels.
  - `internal/web/static/style.css`: Add styles for editor canvas, 3D viewport, toolbar, palette, and navigation tabs.
  - `internal/web/static/app.js`: Implement navigation switching, editor state, tools, and direct `/api/convert` dispatch.
  - `internal/web/static/three.min.js`: Embedded offline minified Three.js for 3D skin rendering and raycasting without external CDN dependencies.
- **APIs**:
  - `/api/convert` handles 64x32 PNG multipart uploads natively without API breaking changes.
