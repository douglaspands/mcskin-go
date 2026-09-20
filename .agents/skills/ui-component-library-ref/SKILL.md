---
name: ui-component-library-ref
description: Use when styling, theming, or adding UI components to the mcskin web interface, to avoid reading style.css or existing JS modules from scratch.
---

# UI Component Library Reference

Quick reference for the mcskin Minecraft Bedrock dark theme. Read this **instead of** loading `style.css` or existing modules into context.

---

## CSS Variables (`:root` in `style.css`)

### Colors

| Variable | Hex | Usage |
|---|---|---|
| `--mc-dark-bg` | `#141414` | Page background |
| `--mc-panel-bg` | `#2d2d2d` | Card/panel fill |
| `--mc-panel-border` | `#121212` | Panel outer border |
| `--mc-panel-bevel-light` | `#525252` | Top/left bevel highlight |
| `--mc-panel-bevel-dark` | `#1b1b1b` | Bottom/right bevel shadow |
| `--mc-green-top` | `#5da632` | Primary green (buttons, CTA) |
| `--mc-green-light` | `#7cd332` | Green hover/highlight |
| `--mc-green-dark` | `#325e17` | Green pressed/dark |
| `--mc-gold` | `#fecb00` | Gold accent (titles, warnings) |
| `--mc-gold-shadow` | `#8a6c00` | Gold text shadow |
| `--mc-diamond` | `#4deeea` | Diamond accent (info, links) |
| `--mc-emerald` | `#2ecc71` | Success / confirm |
| `--mc-redstone` | `#ff4757` | Danger / delete |
| `--mc-text-white` | `#f5f5f5` | Body text |
| `--mc-text-gray` | `#b0b0b0` | Secondary/hint text |

### Typography & Effects

| Variable | Value |
|---|---|
| `--font-family` | `'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, Roboto, sans-serif` |
| `--font-pixel` | `'Courier New', Courier, monospace` |
| `--pixel-shadow` | `4px 4px 0px rgba(0,0,0,0.8)` |

---

## Component Classes

### Panels / Cards

```html
<div class="mc-card">
  <h2 class="card-title">TÍTULO</h2>
  <!-- content -->
</div>
```

### Buttons

| Class | Usage |
|---|---|
| `.btn-minecraft` | Primary CTA (green, pixel bevel) |
| `.btn-topbar` | Toolbar/tab toggle button |
| `.btn-template` | Template selector (toggleable with `.active`) |
| `.btn-tool` | Icon tool button (toggleable with `.active`) |
| `.btn-part` | Body part selector (toggleable with `.active`) |
| `.btn-close-modal` | Modal dismiss (top-right X) |
| `.btn-modal-confirm` | Modal confirm (green) |
| `.btn-modal-cancel` | Modal cancel (neutral) |
| `.btn-modal-danger` | Modal destructive action (red) |
| `.btn-copy` | Copy-to-clipboard inline button |

### Forms

```html
<select class="mc-select">...</select>
```

### Modals

```html
<dialog id="<name>-modal">
  <h3 class="modal-title">TÍTULO</h3>
  <p class="modal-hint">Dica ou instrução.</p>
  <button class="btn-close-modal">✕</button>
  <button class="btn-modal-confirm">CONFIRMAR</button>
  <button class="btn-modal-cancel">CANCELAR</button>
</dialog>
```

---

## JS Module Responsibilities (quick index)

| File | Exports / Role |
|---|---|
| `app.js` | Orchestrator, tab switching, `DOMContentLoaded` wiring |
| `converter.js` | File upload, `.mcpack` conversion flow, skin name |
| `editor2d.js` | 2D pixel sheet canvas, undo stack, `syncTexture()` |
| `editor3d.js` | Three.js 3D viewport, model switch (`set3DModel`) |
| `palette.js` | Color picker, tool state (`getToolState`), template load |
| `fx.js` | Sound effects (`playSound`), confetti animation |
| `network.js` | SSE polling, server health check |
| `shutdown.js` | Graceful shutdown modal |

> [!TIP]
> To check a module's exports without reading the whole file: `grep "^export" internal/web/static/js/<module>.js`

---

## Body Background Pattern

The repeating pixel-grid background is defined inline on `body` in `style.css` — do not replicate it on panels. Panels use `var(--mc-panel-bg)` as flat fill.

---

## Responsive Breakpoints

| Breakpoint | Min-width | Target |
|---|---|---|
| Mobile (default) | — | Smartphones, tablets |
| Desktop | `768px` | Larger panels, side-by-side layouts |

Use `@media (min-width: 768px)` for desktop overrides.
