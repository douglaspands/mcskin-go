---
name: ui-component-library-ref
description: Complete reference for the mcskin Minecraft Bedrock dark theme design system, component classes, button styles, responsive breakpoints, and layout patterns.
---

# UI Component Library & Design System Reference

Quick reference for the `mcskin` Minecraft Bedrock dark theme. Read this **instead of** loading `style.css` or existing HTML/JS modules into context.

---

## 1. Design System Foundations

### Design Principles
- **Minecraft Authenticity**: Beveled stone borders, pixel drop-shadows (`var(--pixel-shadow)`), high-contrast retro palette.
- **Zero Frameworks**: Pure standard CSS and native HTML5 elements. No Tailwind, Bootstrap, or heavy third-party UI libs.
- **Child-Friendly Usability (6+)**: Large touch targets (min 44px on mobile), intuitive visual icons, instant visual feedback.
- **Viewport Confinement**: Strictly full viewport (`100vh` / `100dvh`) with `overflow: hidden` on body — no accidental page-level scrolling.

---

## 2. CSS Custom Properties (`:root`)

Defined in `internal/web/static/style.css`:

### Color Tokens
| Variable | Value | Usage |
|---|---|---|
| `--mc-green` | `#5da632` | Primary Minecraft grass green (action buttons, CTAs) |
| `--mc-green-light` | `#7cd332` | Green top-edge bevel highlight, hover glow |
| `--mc-green-dark` | `#3c6e1e` | Green bottom-edge bevel shadow, pressed state |
| `--mc-gray` | `#4a4a4a` | Neutral stone gray (borders, secondary elements) |
| `--mc-gray-dark` | `#2a2a2a` | Panel background, cards, container fills |
| `--mc-gray-light` | `#8c8c8c` | Subtitles, muted labels, icon outlines |
| `--mc-black` | `#141414` | Deep black outer borders, dark gutters, drop-shadows |
| `--mc-dirt` | `#866043` | Minecraft dirt brown accent |
| `--mc-dirt-dark` | `#573d26` | Dark dirt border |
| `--mc-gold` | `#f5c518` | Gold accents, section headings, active badge icons |
| `--mc-gold-shadow` | `#855b00` | Gold text shadow offset |
| `--mc-diamond` | `#55ffff` | Diamond cyan (info callouts, active highlights, links) |
| `--mc-redstone` | `#ff4757` | Danger / delete / shutdown accents |
| `--mc-text-white` | `#ffffff` | Primary text color |
| `--mc-panel-bg` | `#2a2a2a` | Card & panel background fill |
| `--mc-panel-border` | `#141414` | Dark framing border |
| `--mc-panel-bevel-light` | `#3e3e3e` | Inset light bevel (top/left) |
| `--mc-panel-bevel-dark` | `#1c1c1c` | Inset dark bevel (bottom/right) |

### Typography & Shadow Tokens
| Variable | Value | Usage |
|---|---|---|
| `--font-family` | `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` | Clean legible system font stack |
| `--pixel-shadow` | `3px 3px 0px rgba(0, 0, 0, 0.75)` | Minecraft-style solid pixel drop shadow |

---

## 3. Button Component Hierarchy

All buttons feature crisp pixel borders, inset bevel depth, active press animations (`transform: translateY(2px)`), and `user-select: none`.

### Primary CTA: Giant Green Button
Used for key primary actions (e.g. "CRIAR PACOTE .MCPACK", "Confirmar e Baixar"):
```html
<button type="button" class="btn-minecraft-giant">
  ⚡ CRIAR PACOTE .MCPACK ⚡
</button>
```
- Gradient: `#5da632` to `#3c6e1e`
- Highlight: Inset `2px 2px 0px var(--mc-green-light)`
- Shadow: `var(--pixel-shadow)`

### Secondary & Cancel Buttons (Stone Theme)
Used for secondary actions, dismissing dialogs, and Cancel buttons across all modals:
```html
<!-- Canonical secondary / cancel button -->
<button type="button" class="btn-minecraft-secondary btn-modal-cancel">
  Cancelar
</button>

<!-- Small inline variant -->
<button type="button" class="btn-secondary-sm">
  🔄 Escolher Outra Imagem
</button>
```
- Style: Charcoal stone gradient (`#424242` to `#2a2a2a`), border `2px solid var(--mc-black)`.
- Bevel: Inset `2px 2px 0px #666666`, inset `-2px -2px 0px #1a1a1a`.
- Note: `.proto-btn` is maintained as a backward-compatible alias.

### Modal Confirm Button
Used for positive confirmation inside dialogs:
```html
<button type="button" class="btn-modal-confirm">
  Confirmar
</button>
```

### Discreet HUD Controls (3D Stage)
Translucent stone buttons for viewport pan, zoom, and reset:
```html
<div class="zoom-vertical-controls">
  <button type="button" class="btn-hud-discreet" id="btnZoom3DIn" title="Aumentar Zoom">🔍+</button>
  <button type="button" class="btn-hud-discreet" id="btnZoom3DOut" title="Diminuir Zoom">🔍−</button>
  <div class="hud-divider"></div>
  <button type="button" class="btn-hud-discreet" id="btnPanUp" title="Subir o boneco">▲</button>
  <button type="button" class="btn-hud-discreet" id="btnPanDown" title="Descer o boneco">▼</button>
  <div class="hud-divider"></div>
  <button type="button" class="btn-hud-discreet" id="btnZoom3DReset" title="Recentrar">⟲</button>
</div>
```

### Utility & Navigation Buttons
- `.btn-action-icon`: Square 32x32 / 36x36 action button for undo, redo, close.
- `.btn-toggle-grid`: Pixel grid toggle button (`.active` when enabled).
- `.model-pill-item`: Pill toggle for Steve (`#tplSteve`) vs Alex (`#tplAlex`).
- `.dock-tool-item`: Bottom dock tool buttons (Pencil, Bucket, Recolor, Eraser, Color, Layer).
- `.btn-wifi-copy`: Copy button with `.copied` state transition and icon feedback.

---

## 4. Cards, Containers & Layout Components

### Cards (`.mc-card`)
```html
<section class="mc-card">
  <div class="card-header-row">
    <h2 class="card-title">🎨 1. Imagem da Skin</h2>
    <span class="card-badge">PNG</span>
  </div>
  <!-- card body -->
</section>
```

### Dropzone
```html
<div class="dropzone" id="dropzone">
  <div class="dropzone-icon">✨</div>
  <div class="dropzone-text">Toque para escolher imagem PNG</div>
  <div class="dropzone-hint">ou arraste o arquivo da skin aqui</div>
  <div class="dropzone-specs">Dimensões: 64x64, 64x32 ou 128x128</div>
</div>
```

### QR Code Display Card
Full unclipped QR code container for local network sharing:
```html
<div class="drawer-wifi-card">
  <div class="drawer-wifi-header">
    <span>📶 Celular / Wi-Fi</span>
    <span class="wifi-status-badge">🟢 Online</span>
  </div>
  <div class="drawer-qr-preview" id="sideQrPreview">
    <div id="sideQrcodeCanvas"></div>
  </div>
  <div class="wifi-ip-container">
    <div class="wifi-ip-box" id="sideWifiIp">http://192.168.1.X:8080</div>
    <button type="button" class="btn-wifi-copy" id="btnCopyIpSide">
      <span class="copy-icon-glyph">📋</span>
      <span class="copy-text-label">Copiar Endereço IP</span>
    </button>
  </div>
</div>
```
> [!IMPORTANT]
> `.drawer-qr-preview` uses `140px × 140px`, flexbox center alignment, and `max-width: 100% !important; object-fit: contain;` on inner canvases and images to ensure QR codes are never clipped or distorted.

---

## 5. Modal Dialogs Pattern

Standard Minecraft-styled centered modal with dark backdrop:
```html
<div class="modal-backdrop" id="exampleModal" style="display: none;">
  <div class="modal-card">
    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
      <h3 style="color: var(--mc-gold);">Título do Modal</h3>
      <button type="button" class="btn-action-icon" id="btnCloseExampleModal">✖</button>
    </div>
    <p style="color: #ccc; font-size: 0.85rem; margin: 10px 0;">Mensagem descritiva.</p>
    <div style="display: flex; gap: 8px; width: 100%;">
      <button type="button" class="btn-minecraft-giant" id="btnConfirmExample" style="flex: 1; padding: 8px;">Confirmar</button>
      <button type="button" class="btn-minecraft-secondary btn-modal-cancel" id="btnCancelExample" style="flex: 1; padding: 8px;">Cancelar</button>
    </div>
  </div>
</div>
```

---

## 6. Responsive Layout Breakpoints

The application enforces a strictly responsive, zero-scroll 3-tier layout:

| Tier | Media Query Range | Target Devices | Key Layout Behavior |
|---|---|---|---|
| **Mobile** | `@media (max-width: 640px)` | Smartphones | Single-column view, slide-out drawer menu (`#drawerPanel`), floating mode pill (`🖐️ Girar` vs `🖌️ Pintar`), bottom tool dock, full-screen canvas |
| **Tablet** | `@media (min-width: 641px) and (max-width: 1023px)` | iPads, Android tablets | Max-width 768px constrained viewport, compact header with fullscreen toggle, touch-optimized discreet HUD buttons |
| **Desktop** | `@media (min-width: 1024px)` | Laptops, Desktop monitors | Split layout (`.desktop-layout-split`): main 3D workspace on left, collapsible fast-panel sidebar (`.desktop-sidebar-menu`) on right |

---

## 7. JavaScript Architecture & Module Index

Strict modularization boundary: **No JS file may exceed 300 lines or 15 KB**.

| Module | Purpose | Key Responsibilities & Exports |
|---|---|---|
| `app.js` | Orchestrator & Entrypoint | Tab switching (Converter vs Editor), drawer toggle, mode sync, event wiring |
| `converter.js` | Skin to Pack Pipeline | File dropzone handling, PNG validation, model radio selection, conversion trigger |
| `editor2d.js` | Texture State & Editing | 64x64 RGBA canvas, undo/redo history stack, `recolorAll`, pixel flood, `syncTexture()` |
| `editor3d.js` | 3D Character Viewport | Three.js scene setup, Steve/Alex mesh loader, discreet camera pan/zoom/reset, mannequin focus |
| `editor-file-loader.js` | File I/O for Editor | Loading user skins, preset templates (Steve, Alex, Blank), saving PNGs |
| `editor-layout.js` | Viewport & Layout Management | Viewport sizing, responsive adaptations, fullscreen toggling |
| `editor-menu.js` | Menu & Submenu Actions | Drawer & desktop sidebar navigation, new skin modal, skin naming flow |
| `editor-exporter.js` | Texture Export | `getExportCanvas()` resolution scaling, `bindEditorExports()` PNG download wiring |
| `palette.js` | Color & Tool State | Active tool selection (Pencil, Bucket, Recolor, Eraser), color picker, swatch palette |
| `fx.js` | Audio & Visual FX | Web Audio API sound effects (`playSound`), celebratory confetti particles |
| `network.js` | Network & IP Sharing | Server IP polling, QR Code canvas generation, clipboard copy with feedback |
| `shutdown.js` | Server Lifecycle | Server shutdown dialog confirmation and graceful exit signaling |
| `i18n.js` | Internationalization Core | `SUPPORTED_LANGS` (`pt-BR`/`en`/`es`), `detectLanguage()`, `t()` lookup, `applyTranslations()` |
| `i18n-locales.js` | Translation Strings | `TRANSLATIONS` dictionary consumed by `i18n.js` |
