# Proposal: Adaptive Skin Resolution and High-Fidelity Downsampling

## Why

Minecraft skin textures downloaded from the internet, AI image generators, or community texture sites often come in resolutions larger than standard Minecraft specifications (e.g. 512x512, 1024x1024, 256x256, or arbitrary square dimensions). Currently, Minecraft Bedrock strictly supports a maximum resolution of 128x128 pixels for skin packs. In the current application, 512x512 skins are aggressively downscaled to 64x64 (discarding 75% of potential HD detail), non-power-of-two dimensions are rejected, the 2D and 3D editors are hardcoded to a 64x64 grid regardless of the loaded texture, and users cannot choose their preferred export resolution.

This change introduces adaptive resolution handling: high-resolution textures (> 64x64) are loaded into the editor at 128x128 with multi-step high-fidelity downsampling, standard textures are edited at 64x64, the 2D and 3D editor grids dynamically match the active pixel dimensions, and users can explicitly select whether to export their skin (PNG or .mcpack) as 128x128 (HD Bedrock) or 64x64 (Classic Standard).

## What Changes

- **High-Fidelity Multi-Step Downsampling**: Implement client-side stepped downsampling (e.g. 1024 -> 512 -> 256 -> 128) with alpha boundary protection to prevent edge darkening, aliasing, and detail loss on large AI or community images.
- **Flexible Image Resolution Ingestion**: Accept arbitrary square and 2:1 aspect ratio textures, removing the rigid power-of-two restriction while guiding them to compliant Bedrock standards (128x128 or 64x64 for 1:1, 64x32 for 2:1).
- **Dynamic Editor Resolution & Grid**: Enhance the 2D pixel editor and 3D raycast painter to support dynamic resolution switching (`64x64` or `128x128`), updating coordinates, hover bounds, and grid rendering to match the texture dimensions.
- **User Export Resolution Selection**:
  - In the web converter dropzone: Provide a resolution toggle (`128x128 HD` vs `64x64 Clássico`) when high-resolution textures are uploaded.
  - In the skin editor: Allow choosing between `128x128 HD` and `64x64 Clássico` in the naming/export dialog when working with an HD skin.

## Capabilities

### New Capabilities
*(None; existing capabilities cover conversion and editor workflows).*

### Modified Capabilities
- `pack-conversion`: Update downsampling requirements to support flexible square resolutions, stepped high-fidelity downsampling, and user choice between 128x128 HD and 64x64 Standard packaging.
- `skin-editor`: Update local PNG loading requirements to import high-res skins (> 64x64) directly into 128x128 HD editing mode, dynamically scale 2D and 3D editor grids and raycasting to the active resolution, and allow export resolution selection upon saving.

## Impact

- `internal/web/static/js/editor-file-loader.js`: Multi-step downsampling algorithm, flexible resolution resolution without strict power-of-two limitation.
- `internal/web/static/js/editor2d.js`: Dynamic `texW` and `texH` state setter, resolution-aware 2D grid rendering, zoom calculation, and click coordinate picking.
- `internal/web/static/js/editor3d.js`: Dynamic resolution scaling for raycasting, 3D hover box sizing, and texture synchronization.
- `internal/web/static/js/converter.js`: Resolution toggle UI in the converter panel for high-resolution uploads.
- `internal/web/static/js/app.js`: Resolution state propagation during file upload and template resets.
- Zero external Go dependencies; fully compliant with cross-platform and file size guidelines (< 300 lines per JS module).
