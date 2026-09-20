---
name: web-prototype-scaffold
description: Use when creating a new web screen, UI panel, or HTML prototype for the mcskin web interface, before touching any files.
---

# Web Prototype Scaffold

## Overview

Defines the canonical file layout and minimal boilerplate for any new UI screen or panel in `internal/web/static/`. Apply this scaffold **before** writing a single line of HTML/CSS/JS to eliminate architectural deliberation.

---

## Canonical Directory Structure

```
internal/web/static/
├── index.html              # Single-page shell (do NOT create new .html per screen)
├── style.css               # Global styles + CSS variables (extend, don't duplicate)
├── js/
│   ├── app.js              # Orchestrator — max 120 lines
│   ├── <feature>.js        # One module per screen/concern — max 300 lines / 15 KB
│   └── ...
└── vendor/                 # Third-party libs ONLY (never read into context)
```

> [!IMPORTANT]
> **Never create a second `.html` file.** All screens are panels/tabs inside `index.html`.

---

## New Module Checklist

When adding a new UI module `js/<feature>.js`:

- [ ] File starts with `/** @file <feature>.js\n * @description ... */`
- [ ] Uses `export function init<Feature>() {}` as the entry point
- [ ] Imported and called in `app.js` inside `DOMContentLoaded`
- [ ] Does NOT import from `vendor/` (vendor libs are global via `<script>` in HTML)
- [ ] File stays under **300 lines / 15 KB**

### Minimal Module Template

```js
/**
 * @file <feature>.js
 * @description <Single-sentence purpose>.
 */

/** @type {HTMLElement} */
let _root;

/**
 * Initializes <feature> bindings.
 * @param {Object} opts
 * @param {Function} opts.onAction - Callback for primary action.
 */
export function init<Feature>(opts = {}) {
  _root = document.getElementById('<feature>-root');
  if (!_root) return;
  _bind(opts);
}

/** @private */
function _bind({ onAction }) {
  _root.querySelector('[data-action]')
    ?.addEventListener('click', () => onAction?.());
}
```

---

## HTML Panel Template

Minimal HTML block for a new panel inside `index.html`:

```html
<!-- ── <Feature> Panel ─────────────────────────────── -->
<section id="<feature>-root" class="mc-card" hidden>
  <h2 class="card-title">TÍTULO</h2>
  <!-- content -->
  <button class="btn-minecraft" data-action="primary">AÇÃO</button>
</section>
```

---

## CSS Extension Rules

1. Add new rules **at the bottom** of `style.css`.
2. Reuse existing CSS variables — never hardcode hex values.
3. New component selectors follow pattern `.btn-<feature>` / `.<feature>-<element>`.
4. Mobile-first: wrap desktop overrides in `@media (min-width: 768px)`.

---

## app.js Integration Pattern

```js
// In app.js — inside DOMContentLoaded
import { init<Feature> } from "./<feature>.js";

document.addEventListener("DOMContentLoaded", () => {
  // ... existing inits ...
  init<Feature>({ onAction: () => { /* wire up */ } });
});
```

---

## Token-Saving Rules for the Agent

- **Do NOT read `vendor/` files** — they are global and isolated.
- **Do NOT read `style.css` in full** — use `grep` for specific selectors.
- **Do NOT read all JS modules** — read only the module being modified + `app.js` imports section.
- Run `wc -l js/<feature>.js` before finalizing to verify size budget.
