# Proposal: Web Skin Editor UI and Zero-Scroll Layout

## Why

The current web skin editor and converter interfaces suffer from vertical layout overflow on touch and desktop viewports, requiring awkward vertical scrolling to reach drawing tools, color palettes, and file actions. Additionally, file actions (creating a new skin, opening/uploading an existing PNG, saving, and downloading `.mcpack`) were disconnected or missing from the main navigation, and mobile controls contained redundant orientation buttons that crowded the viewport. 

Redesigning the web interface with a zero-scroll `100dvh` flexbox pipeline, nesting editor actions into a friendly navigation submenu, providing a dynamic docked contextual hint strip, and streamlining mobile touch gestures provides an intuitive, friction-free creative experience optimized for children aged 6+ and adults alike.

## What Changes

- **Zero-Scroll Full-Viewport Layout (`100dvh`)**: Restructure the application DOM and CSS into an unbroken vertical flex pipeline (`body`, `.viewport-container`, `.app-root`, `.desktop-layout-split`, `.main-workspace-content`, and `.editor-container` with `flex: 1; min-height: 0; overflow: hidden;`). The 3D stage (`.immersive-3d-stage`) dynamically flexes to occupy available vertical space without introducing body scrollbars.
- **Dynamic Contextual Dock Hint Strip (`#dockHintStrip`)**: Integrate a persistent, discreet hint strip docked directly above the uniform bottom tool dock (`.editor-bottom-dock`) that updates dynamically on hover/pointer enter (desktop) and tap/focus (mobile) across tools, model switches, grid toggles, and mannequin interactions.
- **Nested Navigation Submenu for Editor File Actions**: Introduce a visual tree-connected submenu under the "🎨 Criador de Skins 3D" navigation item (in both the desktop sidebar and mobile drawer) containing:
  - `Nova Skin` (opens preset selection modal)
  - `Abrir / Carregar PNG` (triggers local PNG file picker)
  - `Salvar Imagem PNG` (exports current canvas as `.png`)
  - `Baixar .mcpack` (compiles and downloads `.mcpack` package)
- **"Nova Skin" Preset Selection Modal**: Provide an accessible dialog offering Steve (Classic 4px), Alex (Slim 3px), and Blank Canvas templates with instant canvas reset and UV face completeness.
- **Local PNG Upload & Inspection (`FileReader`)**: Enable asynchronous loading of existing skin PNG files directly into the editor canvas with dimension verification (64x64, 64x32, 128x128) and model auto-detection.
- **Streamlined Desktop and Mobile Ergonomics**:
  - Remove redundant directional arrow buttons on mobile/tablet in favor of standard touch orbit/pan gesture controls.
  - Retain discrete vertical height adjustment (`Subir / Descer`) and zoom controls on desktop stage overlays.
  - Position fullscreen toggle in main header for mobile/tablet to conserve workspace chrome.
  - Align desktop sidebar to the right side for ergonomic consistency with mobile drawer swipe patterns.
- **Responsive Converter Layout & Favicon Identity**:
  - Refactor the Converter screen to use an adaptable 2-column layout on wide viewports, eliminating excess whitespace.
  - Correct alignment of the Wi-Fi IP display and copy button.
  - Serve `assets/mcskin.png` as the application favicon (`/favicon.ico` / `<link rel="icon">`) to unify app branding.

## Capabilities

### New Capabilities
<!-- None: This proposal refines and extends existing web application capabilities. -->

### Modified Capabilities
- `skin-editor`: Extend requirements with zero-scroll viewport geometry, docked contextual hint strip, navigation submenu file actions, "Nova Skin" modal, local PNG file upload/reader, and streamlined gesture ergonomics.
- `web-server`: Extend requirements with responsive 2-column converter layout, corrected LAN IP display layout, and embedded favicon delivery.

## Impact

- **Frontend Assets**: Updates to `internal/web/static/index.html`, `internal/web/static/css/style.css`, and modular JavaScript files in `internal/web/static/js/` (adhering to the < 300 lines / 15 KB modularity limit).
- **Backend Handlers**: Minor addition to `internal/web/server.go` to serve `/favicon.ico` or map `/assets/mcskin.png`.
- **Zero External Dependencies**: All UI components, file readers, and CSS layouts use vanilla Web standards (ES6 modules, CSS flexbox/grid, HTML5 FileReader) with zero third-party dependencies.
- **Tests**: Unit tests for web server static routing, prototype validation, and frontend module contracts.
