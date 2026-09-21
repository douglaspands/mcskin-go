# Proposal: AI Skin Import, 2D Sheet Editing, Subtle Grid & Windows Trust

## Why

In the 3D skin editor, geometry raycasting cannot reliably reach inner surfaces of the humanoid character (such as inner arm surfaces touching the torso, inner thigh surfaces between legs, neck/chin underside, and shoe soles). Restoring the 2D unfolded texture sheet editor gives users 100% pixel reach and precision for these occluded areas.

Concurrently, users increasingly generate Minecraft skin textures using modern AI image generators (such as ChatGPT/DALL-E, Midjourney, and Stable Diffusion). These models produce correct Minecraft skin layouts, but at high resolutions (e.g., 512x512, 1024x1024, 2048x2048) and frequently with opaque solid backgrounds, which are currently rejected outright by file validation. Allowing the browser to automatically downscale and clean AI skin images enables seamless creation without third-party image manipulation software.

Finally, the existing pixel grid overlay in 3D and 2D appears visually noisy and harsh, while the Windows executable lacks embedded metadata and permission manifests, triggering alarming SmartScreen warnings for non-technical users.

## What Changes

- **2D Sheet Editor & Topbar 3D/2D Toggle**: Add an interactive `[ 🧊 3D | 📜 2D ]` view mode segmented control directly adjacent to the Steve and Alex model pill in the top action bar. In 2D mode, display `#editor2DCanvas` with real-time bidirectional synchronization with the 3D viewport.
- **Smart AI Skin Downsampling (Resolution Option C)**:
  - Automatically detect square AI images: images `>= 1024x1024` are downsampled to `128x128` (Bedrock HD) for maximum visual fidelity; square images `< 1024x1024` are downsampled to `64x64` (universal standard).
  - Rectangular `2:1` images (e.g., `1024x512`) are downsampled to `64x32` (classic legacy).
  - Downsampling executes client-side via HTML5 Canvas with high-fidelity interpolation, preserving zero-dependency air-gapped backend invariants.
- **AI Solid Background Removal Confirmation**: When an imported skin image lacks alpha transparency or has uniform opaque corners, prompt the user with a friendly dialog asking whether to attempt automatic background removal (sampling non-UV background areas and converting them to transparent alpha).
- **Subtle Hairline Grid Styling (Option 1 + 2)**:
  - Upgrade the 3D texture overlay to use a subtle charcoal/shadow hairline (`rgba(0, 0, 0, 0.10)`) at 16x scale, eliminating the harsh white "cage/spiderweb" effect and reducing line thickness to ~6% of pixel width.
  - Clean up the 2D sheet canvas by removing aggressive cyan overlays and yellow text labels, keeping only a delicate, clean pixel grid.
- **Windows Executable Trust & Manifest Enhancements**:
  - Embed a Windows resource file (`.syso`) containing `VERSIONINFO` metadata (product name, version, author, description) and an official Minecraft pixel-art application icon.
  - Embed an application manifest with `<requestedExecutionLevel level="asInvoker"/>` ensuring Windows Defender SmartScreen recognizes that the executable requires no administrative privileges.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `skin-editor`: Add 2D unfolded sheet view mode toggle beside Steve/Alex, smart AI image downsampling, background removal confirmation dialog, and subtle 16x hairline grid rendering.
- `pack-conversion`: Enable browser dropzone upload and converter workflow to auto-adjust high-resolution AI skin textures into valid Bedrock resolutions before conversion.
- `cli`: Add Windows resource metadata compilation (`VERSIONINFO`, app icon, `asInvoker` manifest) into `mcskin.exe`.

## Impact

- **Frontend**:
  - `internal/web/static/index.html`: Add `#viewModeToggleGroup` (`#btnMode3D`, `#btnMode2D`) in topbar and `#wrapper2D` inside `#stage3D`.
  - `internal/web/static/js/palette.js`: Wire 3D/2D toggle state, element visibility, and render triggers.
  - `internal/web/static/js/editor-file-loader.js`: Add AI resolution auto-downsampling, aspect ratio detection, and background transparency sampling.
  - `internal/web/static/js/editor3d.js`: Update `buildGridOverlayCanvas` to 16x scale with subtle shadow stroke.
  - `internal/web/static/js/editor2d.js`: Refine `render2DSheet` grid rendering and remove noisy text/cyan rectangles while remaining within the 300-line / 15 KB Token Guardian budget.
  - `internal/web/static/js/converter.js`: Support auto-downscaled AI PNG uploads in the dropzone.
  - `internal/web/static/style.css`: Add styles for the 3D/2D toggle pill and `#wrapper2D` layout.
- **Backend & Build Toolchain**:
  - `Makefile`: Add Windows resource generation (`rsrc` or `windres` step) for `build-windows`.
  - Zero changes to Go standard library runtime invariants and zero new third-party dependencies.
