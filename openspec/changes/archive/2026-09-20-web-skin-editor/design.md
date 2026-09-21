# Design: Web Skin Editor UI and Zero-Scroll Layout

## Context

The web interface of `mcskin` embeds an interactive 3D skin editor and `.mcpack` converter hosted via Go's standard library `embed.FS` and `net/http`. See [proposal.md](file:///home/douglas/Workspace/minecraft/png-to-mcpack/openspec/changes/web-skin-editor/proposal.md) for background and motivation.

A working reference prototype was developed and tested in `docs/prototypes/web-skin-editor-prototype.html`. This design details how to translate those UX improvements into production code while upholding the strict project invariants: zero external dependencies, modular ES6 files under 300 lines / 15 KB, strict TDD, and cross-platform compatibility.

## Goals / Non-Goals

**Goals:**
- Eliminate vertical scrolling across all screen sizes using a pure CSS flexbox pipeline (`100dvh` / `min-height: 0`).
- Provide an integrated dynamic hint strip docked above the bottom controls (`#dockHintStrip`).
- Nest primary editor file operations ("Nova Skin", "Abrir / Carregar PNG", "Salvar Imagem PNG", "Baixar .mcpack") within an expandable submenu under the editor navigation item.
- Support local skin PNG loading with asynchronous dimension checking and classic/slim arm geometry detection.
- Provide a preset selection modal for Steve, Alex, and Blank canvas.
- Provide a responsive 2-column Converter layout on wide screens and serve `assets/mcskin.png` as `/favicon.ico`.
- Maintain strict modularity where every JavaScript file in `internal/web/static/js/` stays under 300 lines and 15 KB.

**Non-Goals:**
- Introducing Node.js, Webpack, Vite, or any build-time npm dependencies (vanilla native ES6 modules only).
- Altering the core Bedrock converter packaging algorithms in `internal/bedrock/` or `internal/pack/`.
- Cloud persistence or user accounts (all editing remains local and offline).

## Decisions

### 1. Zero-Scroll Flexbox Hierarchy
- **Decision**: Configure root DOM containers (`html`, `body`, `.viewport-container`, `.app-root`, `.desktop-layout-split`, `.main-workspace-content`, `.editor-container`) with `display: flex; flex-direction: column; height: 100%; max-height: 100dvh; overflow: hidden;`. The 3D canvas stage (`.immersive-3d-stage`) receives `flex: 1 1 0; min-height: 200px;` and dynamically stretches to fill available height.
- **Rationale**: Completely prevents browser viewport scrolling, keeping drawing tools, mannequin, and color palettes anchored within sight.
- **Alternatives Considered**: 
  - Fixed pixel heights: Fails across different screen aspect ratios and mobile device orientations.
  - Manual JavaScript window height calculation: Fragile and susceptible to jitter on mobile browser address bar collapse.

### 2. Modular Frontend Architecture (< 300 lines / 15 KB)
- **Decision**: Structure new UI capabilities into discrete, single-responsibility ES6 modules under `internal/web/static/js/`:
  - `editor-layout.js`: Manages viewport dimension listeners, fullscreen toggle delegation, and `#dockHintStrip` reactive updates.
  - `editor-menu.js`: Manages submenu state synchronization between desktop sidebar and mobile drawer, and coordinates the "Nova Skin" modal.
  - `editor-file-loader.js`: Handles asynchronous local PNG loading (`FileReader`), dimension validation (64x64, 64x32, 128x128), and arm transparency detection for model auto-switching.
  - Update `app.js` and `editor-3d.js` to delegate to these specialized modules.
- **Rationale**: Complies with the token budget and codebase maintainability rules ("Nascem Otimizadas") while preserving separation of concerns.
- **Alternatives Considered**: Adding everything to `editor-3d.js` or `app.js`, which would bloat files past 500+ lines and breach size limits.

### 3. Asynchronous Local File Reader Pipeline
- **Decision**: Use HTML5 `<input type="file" accept="image/png">` with `FileReader.readAsDataURL()`, decode into an offscreen HTML Canvas, verify width and height (64x64, 64x32, or 128x128), inspect arm pixel alpha to classify classic vs. slim, and copy image data into the primary texture canvas.
- **Rationale**: 100% client-side, instant feedback, no unnecessary network round-trips.

### 4. Embedded Favicon Route
- **Decision**: Add a dedicated route handler in `internal/web/server.go` for `/favicon.ico` that writes the embedded `assets/mcskin.png` content with Content-Type `image/png`.
- **Rationale**: Eliminates browser 404 noise in terminal logs and displays the application icon in browser tabs.

## Package Architecture & TDD Sequence

```
internal/web/
├── server.go                 # Route registration: /favicon.ico, /api/convert, /api/info, /api/shutdown
├── server_test.go            # Unit tests (100% in-memory mocked HTTP tests for /favicon.ico and routes)
└── static/
    ├── index.html            # Zero-scroll DOM structure, dock hint strip, submenu, modals
    ├── css/style.css         # Flexbox pipeline, 100dvh limits, mobile/desktop responsiveness
    └── js/
        ├── app.js            # Main coordinator
        ├── editor-layout.js  # Zero-scroll & dock hint strip logic (< 300 lines)
        ├── editor-menu.js    # Navigation submenu & preset modal logic (< 300 lines)
        ├── editor-file-loader.js # Asynchronous skin file loading & validation (< 300 lines)
        ├── editor-3d.js      # Three.js stage & mesh controls (< 300 lines)
        └── converter-ui.js   # Multi-column converter & IP clipboard (< 300 lines)
```

### TDD Execution Sequence
1. **RED Phase**: Write Go unit tests in `internal/web/server_test.go` testing GET `/favicon.ico` (expecting 200 OK and `image/png`).
2. **GREEN Phase**: Implement `/favicon.ico` handler in `internal/web/server.go`.
3. **Frontend Integration**: Implement modular CSS and ES6 files based on `docs/prototypes/web-skin-editor-prototype.html`.
4. **Verification**: Run `./scripts/test-compact.sh` and execute `token-guardian` checks to verify all files are < 300 lines and < 15 KB.

### Skills de Suporte (ler antes de cada fase)

| Fase | Skill obrigatória | Motivo |
|---|---|---|
| Antes de qualquer arquivo JS/HTML | `web-prototype-scaffold` | Template canônico de módulo ES6, estrutura de diretório, regras de CSS extension |
| Consultar cores/classes/componentes | `ui-component-library-ref` | Evita ler `style.css` (1739 linhas) — quick-reference de CSS vars e classes |
| Revisões iterativas de frontend | `prototype-iteration-loop` | Governa loop bounded (máx 2 passes), formato de diff compacto |
| Preview local sem servidor Go | `static-server-dev` | Serve `internal/web/static/` na porta 8787 |
| Dispatch de qualquer subagente | `model-selection` | Decision table + log em `.agents/model-log.md` + JSONL benchmark |
| Verificação final de budget | `token-guardian` | `wc -l` < 300 linhas, `stat` < 15 KB por arquivo |

## AI Agent Governance & Loop Limits
- Maximum 3 iterations per failing test (`max_attempts = 3`).
- Halt immediately if identical error occurs across 2 consecutive runs.
- Offline, air-gapped test execution with 30s timeout bounds.

## Risks / Trade-offs

- **[Risk]** Mobile virtual keyboards or dynamic navigation bars distorting viewport layout.
  - **Mitigation**: Use `100dvh` with a `resize` event handler that updates Three.js camera projection and renderer sizing without vertical scrolling.
- **[Risk]** Non-standard skin PNG dimensions uploaded by users (e.g., HD 256x256 or non-power-of-two).
  - **Mitigation**: `editor-file-loader.js` strictly validates width and height, rejecting unsupported sizes with friendly feedback in `#dockHintStrip`.
