# Design: AI Skin Import, 2D Sheet Editing, Subtle Grid & Windows Trust

## Context

See `proposal.md` for motivation and background.

The application frontend is structured as modular ES6 files in `internal/web/static/js/`, constrained by Token Guardian (< 300 lines, < 15 KB). The 3D editor uses Three.js while texture pixel storage lives in an offscreen 2D canvas (`textureCanvas`). The Go backend strictly validates 64x64, 64x32, and 128x128 RGBA PNGs.

## Goals / Non-Goals

**Goals:**
- Provide seamless 3D/2D editing switching in the top bar adjacent to the Steve/Alex model selector.
- Downscale high-resolution AI skin textures (512x512, 1024x1024, 2048x2048) in the browser before passing to the editor or converter, maintaining zero server-side dependencies.
- Provide user-confirmed automatic background transparency removal for AI textures with solid backgrounds.
- Deliver an aesthetically subtle, 16x hairline grid overlay (`rgba(0, 0, 0, 0.10)`) in 3D and 2D.
- Embed Windows resource metadata and `asInvoker` application manifest in `bin/mcskin.exe` to foster user trust.

**Non-Goals:**
- Third-party image manipulation libraries on the Go backend (all image scaling and transparency manipulation remain strictly in client-side HTML5 Canvas).
- Changing Bedrock `.mcpack` manifest specifications or server-side PNG dimension rules (the server continues to strictly validate 64x64/128x128/64x32).
- Automatic AI texture generation inside the app (the app imports externally generated AI images).

## Decisions

### Decision 1: Client-Side Canvas Downsampling vs. Server-Side Rescaling
- **Chosen**: Client-side downsampling using HTML5 Canvas (`ctx.drawImage` with `imageSmoothingQuality = "high"`).
- **Rationale**: Keeps the Go backend 100% compliant with the zero-external-dependency rule (`image/png` only). The backend never needs to link heavy image resampling libraries or handle non-standard uploads.
- **Alternatives Considered**: Go-side image resizing using external Go packages (rejected due to zero external dependencies principle).

### Decision 2: Resolution Selection Strategy (Option C)
- **Chosen**:
  - Square images `>= 1024x1024` downsample to `128x128` (Bedrock HD).
  - Square images `< 1024x1024` (e.g. 512x512) downsample to `64x64` (standard).
  - Rectangular `2:1` images (e.g. 1024x512) downsample to `64x32` (classic).
- **Rationale**: High-resolution diffusion model outputs (1024px, 2048px) carry rich detail that shines in Bedrock 128x128 HD, while standard sizes preserve maximum compatibility without user friction.

### Decision 3: Background Removal via Corner & Non-UV Sampling
- **Chosen**: Sample corner pixels (e.g., `(0,0)`, `(0, H-1)`, `(W-1, 0)`) which fall strictly outside Minecraft humanoid UV unwrapped geometry. If uniform color and opaque, display a confirmation prompt. If confirmed, flood/replace matching non-UV pixels with transparent alpha (`rgba(0, 0, 0, 0)`).
- **Rationale**: AI generators almost always place background fill in the empty regions surrounding the skin layout. Prompting the user prevents accidental erasing of intentional skin colors.

### Decision 4: 16x Hairline Shadow Grid Overlay
- **Chosen**: Double `GRID_OVERLAY_SCALE` from 8 to 16, stroke with `rgba(0, 0, 0, 0.10)` on cell borders, and strip neon bounding boxes from `#editor2DCanvas`.
- **Rationale**: Dark subtle lines create a natural bevel groove between Minecraft pixels without the harsh white "spiderweb" effect on dark textures. Scaling to 16x ensures the 1px line occupies only ~6% of pixel width.

### Decision 5: Windows Resource Embedding via `.syso`
- **Chosen**: Generate `mcskin_windows.syso` containing `VERSIONINFO`, `asInvoker` manifest, and app icon, incorporated automatically by `go build` for `windows/amd64`.
- **Rationale**: Standard Go toolchain mechanism for Windows resources without runtime overhead or external dependencies.

## Risks / Trade-offs

- **[Risk] File size budget overflow in `editor2d.js` or `editor-file-loader.js`**
  → *Mitigation*: Keep helper functions discrete; export AI downscaling to `editor-file-loader.js` (currently only 86 lines) and UI wiring to `palette.js`. Check `token-guardian` before completion.
- **[Risk] User declines background removal on solid-background AI images**
  → *Mitigation*: The restored 2D sheet editor allows 1-click cleanup using the existing `Trocar` (Recolor) or `Borracha` (Eraser) tools.

## AI Agent Governance & TDD Sequence

1. **RED**: Add unit tests for downscaling dimensions and file loader detection logic.
2. **GREEN**: Implement 2D view toggle in `palette.js`/`index.html`, AI loader adjustments in `editor-file-loader.js`, subtle grid in `editor3d.js`/`editor2d.js`, and Windows resource files.
3. **VERIFY**: Run `./scripts/run-regression-suite.sh` and verify all 7 phases pass.
