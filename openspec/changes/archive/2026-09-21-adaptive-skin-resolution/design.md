# Design: Adaptive Skin Resolution and High-Fidelity Downsampling

## Context

See `proposal.md` for motivation and background.

Currently:
1. `editor-file-loader.js` strictly requires `isPowerOfTwo` and routes `< 1024` square images to 64x64, rejecting non-power-of-two dimensions (e.g. 500x500).
2. `editor2d.js` maintains static variables `texW = 64, texH = 64`, which limits pixel-grid rendering, coordinate calculation, and undo-history buffers to 64x64.
3. `editor3d.js` and `vendor/three.min.js` raycasting are calibrated for 64x64 UV space without scaling for 128x128 textures.
4. Neither the converter dropzone nor the editor export flow permits the user to toggle or select target resolution between 128x128 (HD Bedrock) and 64x64 (Standard Classic) when starting with a high-resolution texture.

## Goals / Non-Goals

**Goals:**
- Provide a robust multi-step downsampling algorithm client-side (halving dimensions iteratively until reaching target) to minimize aliasing, blur, and dark alpha boundary halos.
- Accept arbitrary square (1:1) and rectangular (2:1) PNG image dimensions, normalizing them to Bedrock-compliant targets (128x128 or 64x64 for square, 64x32 for 2:1).
- Enable dynamic resolution switching in `editor2d.js` and `editor3d.js` (`setTextureResolution(w, h)`), allowing fluid painting on both 64x64 and 128x128 skins with matching grid overlays and accurate raycast hover indicators.
- Provide clear user controls in both the converter dropzone and editor export modal to choose between 128x128 HD and 64x64 Standard when high-resolution textures are detected.

**Non-Goals:**
- Support skin resolutions larger than 128x128 in Bedrock `.mcpack` packages (Minecraft Bedrock engine strictly rejects/corrupts skins > 128x128).
- Conversion or transformation of 3D character wallpaper renders or non-UV flat screenshot graphics (the input must remain an unfolded UV texture map).
- Server-side heavy image processing (all downsampling occurs client-side in the browser via canvas before submitting to `/api/convert`).

## Decisions

### Decision 1: Multi-Step Mipmap-Style Downsampling Pipeline
- **Decision**: When downsampling images larger than target dimensions (e.g. 1024x1024 down to 128x128), downsample iteratively by halves (1024 -> 512 -> 256 -> 128) using high-quality 2D canvas smoothing. Additionally, detect if the source image is an integer-upscaled pixel art (where NxN pixel blocks are uniform), and if so, use `imageSmoothingEnabled = false` (nearest-neighbor) for exact lossless downsampling.
- **Alternatives Considered**:
  - *Direct single-step drawImage*: Causes high-frequency aliasing, jagged lines, and moiré patterns on fine textures.
  - *Server-side Go image processing*: Would require server round-trips and extra memory allocation, whereas the browser canvas performs hardware-accelerated stepped downsampling instantly before upload.

### Decision 2: Dynamic Resolution Architecture for 2D & 3D Editors
- **Decision**:
  - In `editor2d.js`, replace static `texW/texH` constants with a public `setTextureResolution(w, h)` function that resizes `textureCanvas`, clears undo/redo stacks, updates grid step calculations, and scales mouse coordinate mapping: `Math.floor(((clientX - rect.left) / rect.width) * texW)`.
  - In `editor3d.js`, pass a resolution scale factor `scale = texW / 64` (1 for 64, 2 for 128) to the raycasting and hover highlighter. The hover highlight box size adapts from 1.0 unit to `1.0 / scale` (0.5 unit for 128x128).
- **Alternatives Considered**:
  - *Always downsample everything to 64x64 for editing*: Discards user HD artwork and prevents fine detail editing in 128x128.
  - *Fixed 128x128 canvas for all skins (upscaling 64x64)*: Distorts classic pixel art by multiplying pixel count unnecessarily and confusing users wanting to paint classic 64x64 skins.

### Decision 3: User Choice UI in Converter and Editor
- **Decision**:
  - In the web converter (`converter.js`), when a skin `> 64x64` is loaded, display an interactive button group: `[🌟 128x128 (HD Bedrock - Recomendado)]` vs `[🟩 64x64 (Padrão Clássico)]`. Clicking updates the target PNG blob and re-renders the 2D preview.
  - In the editor export modal (`converter.js` / `promptSkinName`), if the current texture is 128x128, display an export radio selection: `(•) 128x128 HD` vs `( ) 64x64 Padrão`. If 64x64 is selected, the client downsamples the texture canvas before downloading the PNG or submitting to `/api/convert`.
- **Alternatives Considered**:
  - *Automatic decision without asking*: Denies user agency when they specifically need standard 64x64 for Java compatibility or server requirements.

## Architecture & Code Boundaries

```
+--------------------------------------------------------------------------+
|                        APPLICATION ARCHITECTURE                          |
+--------------------------------------------------------------------------+

 [ Web UI: Converter & Editor ]
   │
   ├─► editor-file-loader.js:
   │     • resolveTargetDimensions(w, h): supports arbitrary sizes, returns
   │       targetW (128 or 64) and isHighRes flag.
   │     • downsampleImage(img, targetW, targetH): stepped multi-pass downsampling.
   │     • detectPixelArtScale(img): checks if image is an upscaled pixel art.
   │
   ├─► converter.js:
   │     • renderSkinCharacter(img, model, res): scales 2D preview correctly.
   │     • resolution selector UI buttons (#resSelectorContainer).
   │     • exports selected resolution blob to /api/convert.
   │
   ├─► editor2d.js:
   │     • setTextureResolution(w, h): dynamic resolution state.
   │     • resolution-aware grid overlay & coordinate picking.
   │
   ├─► editor3d.js:
   │     • update3DTexture(canvas, w, h).
   │     • UV pickPixel scaling (`hit.pixelX * scale`, `hit.pixelY * scale`).
   │     • Hover highlight scaling (0.5 unit for 128x128).
   │
   └─► app.js:
         • coordinates resolution switching on upload and starter templates.

 [ Go Backend: CLI & API ]
   • internal/skin/skin.go: Validate() continues enforcing Bedrock specs (64x64, 64x32, 128x128).
   • internal/converter/converter.go: ConvertBytes() continues packaging compliant archives.
```

## TDD Test Sequence & Verification Plan

1. **Unit Tests (Red Phase First)**:
   - Verify `editor-file-loader.test.js` (or DOM test harness) handles arbitrary square resolutions:
     - 500x500 -> targets 128x128 or 64x64.
     - 1024x1024 -> targets 128x128 or 64x64.
     - 512x512 -> targets 128x128 or 64x64.
     - 500x250 -> targets 64x32.
   - Verify stepped downsampling maintains image dimensions and non-corrupted alpha channels.
   - Run Go test suite (`./scripts/test-compact.sh` and `go test ./...`) to ensure existing Go backend tests pass without regression.
2. **Implementation (Green Phase)**:
   - Implement `editor-file-loader.js` multi-step downsampling and dimension resolver.
   - Implement `editor2d.js` `setTextureResolution(w, h)` and dynamic grid.
   - Implement `editor3d.js` resolution scaling.
   - Implement `converter.js` resolution selector and export options.
3. **Refactor & Token Boundary Verification**:
   - Verify all modified JS files in `internal/web/static/js/` remain under 300 lines and 15 KB.
4. **PO/QA Review**:
   - Execute `feature-qa-reviewer` persona to test end-to-end user workflows.

## AI Agent Governance & Loop Limits

- Maximum 3 debugging iterations per failing test (`max_attempts = 3`).
- Two-strike halt if identical error repeats without progress.
- Zero external Go dependencies; Go standard library exclusively.
- All files strictly confined to workspace boundary.

## Risks / Trade-offs

- **[Risk]** Stepped canvas downsampling might be slow on extremely large images (e.g. 4096x4096).
  - **Mitigation**: Capping intermediate iterations; 1024x1024 takes only 3 fast sub-canvas draws (< 15ms in modern browsers).
- **[Risk]** 128x128 painting on mobile devices could have smaller touch targets.
  - **Mitigation**: The editor has zoom controls (`MIN_ZOOM_2D` to `MAX_ZOOM_2D` and 3D orbit zoom) allowing users to zoom into specific body parts easily.
