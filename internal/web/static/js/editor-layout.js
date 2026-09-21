/**
 * @file editor-layout.js
 * @description Dynamic 3D stage sizing (ResizeObserver/visualViewport) and
 * reactive #dockHintStrip guidance.
 */

import { t } from "./i18n.js";

const DEFAULT_HINT_KEY = "hint_default";

const HINTS = {
  toolPencil: { icon: "🖌️", key: "hint_pencil", badgeKey: "badge_paint" },
  toolBucket: { icon: "🪣", key: "hint_bucket", badgeKey: "badge_fill" },
  toolRecolor: { icon: "🔄", key: "hint_recolor", badgeKey: "badge_recolor" },
  toolEraser: { icon: "🧹", key: "hint_eraser", badgeKey: "badge_erase" },
  toolColorPicker: { icon: "🎨", key: "hint_color_picker", badgeKey: "badge_colors" },
  btnUndo: { icon: "↩️", key: "hint_undo", badgeKey: "badge_undo" },
  btnRedo: { icon: "↪️", key: "hint_redo", badgeKey: "badge_redo" },
  btnToggleGrid: { icon: "▦", key: "hint_grid", badgeKey: "badge_grid" },
  btnHeaderFullscreen: { icon: "⛶", key: "hint_fullscreen", badgeKey: "badge_fullscreen" },
  btnSideFullscreen: { icon: "⛶", key: "hint_fullscreen", badgeKey: "badge_fullscreen" },
  btnTouchPaint: { icon: "🖌️", key: "hint_paint", badgeKey: "badge_paint" },
  btnTouchRotate: { icon: "🖐️", key: "hint_rotate", badgeKey: "badge_rotate" },
  btnZoom3DIn: { icon: "🔍+", key: "hint_zoom_in", badgeKey: "badge_zoom" },
  btnZoom3DOut: { icon: "🔍−", key: "hint_zoom_out", badgeKey: "badge_zoom" },
  btnZoom3DReset: { icon: "⟲", key: "hint_zoom_reset", badgeKey: "badge_recenter" },
  btnPanUp: { icon: "▲", key: "hint_pan_up", badgeKey: "badge_move" },
  btnPanDown: { icon: "▼", key: "hint_pan_down", badgeKey: "badge_move" },
  btnMode3D: { icon: "🧊", key: "hint_mode_3d", badgeKey: "badge_mode_3d" },
  btnMode2D: { icon: "📜", key: "hint_mode_2d", badgeKey: "badge_mode_2d" },
  btnZoom2DIn: { icon: "🔍+", key: "hint_zoom_2d_in", badgeKey: "badge_zoom" },
  btnZoom2DOut: { icon: "🔍−", key: "hint_zoom_2d_out", badgeKey: "badge_zoom" },
  btnZoom2DReset: { icon: "⟲", key: "hint_zoom_2d_reset", badgeKey: "badge_recenter" },
};

const MANNEQUIN_HINTS = {
  head: { icon: "👤", key: "part_head" },
  torso: { icon: "👕", key: "part_torso" },
  rightArm: { icon: "💪", key: "part_right_arm" },
  leftArm: { icon: "💪", key: "part_left_arm" },
  rightLeg: { icon: "🦵", key: "part_right_leg" },
  leftLeg: { icon: "🦵", key: "part_left_leg" },
};

/**
 * Sets #dockHintStrip's text, icon, and badge with highlight animation.
 * @param {string} text
 * @param {string} [icon]
 * @param {string} [badge]
 */
export function setDockHint(text, icon = "💡", badge = "Dica") {
  const strip = document.getElementById("dockHintStrip");
  const textEl = document.getElementById("dockHintText");
  const iconEl = document.getElementById("dockHintIcon");
  const badgeEl = document.getElementById("dockHintBadge");

  if (!strip || !textEl) return;
  textEl.textContent = text || t(DEFAULT_HINT_KEY);
  if (iconEl && icon) iconEl.textContent = icon;
  if (badgeEl && badge) badgeEl.textContent = badge;

  strip.classList.remove("highlight");
  void strip.offsetWidth;
  strip.classList.add("highlight");
}

/** @private */
function resolveHint(el) {
  const target = el?.closest?.("[id], [data-mannequin-part]");
  if (!target) return null;
  if (target.id && HINTS[target.id]) {
    const h = HINTS[target.id];
    return { icon: h.icon, text: t(h.key), badge: t(h.badgeKey) };
  }
  if (target.dataset.mannequinPart && MANNEQUIN_HINTS[target.dataset.mannequinPart]) {
    const m = MANNEQUIN_HINTS[target.dataset.mannequinPart];
    const part = t(m.key);
    return { icon: m.icon, text: `${t("focus_label")}: ${part}`, badge: part };
  }
  return null;
}

/** @private */
function bindDockHints() {
  const root = document.querySelector(".editor-container");
  if (!root) return;

  root.addEventListener("pointerenter", (e) => {
    const hint = resolveHint(e.target);
    if (hint) setDockHint(hint.text, hint.icon, hint.badge);
  }, true);

  root.addEventListener("pointerleave", (e) => {
    if (resolveHint(e.target)) setDockHint(t(DEFAULT_HINT_KEY), "🖌️", t("badge_paint"));
  }, true);

  root.addEventListener("pointerup", (e) => {
    const hint = resolveHint(e.target);
    if (hint) setDockHint(hint.text, hint.icon, hint.badge);
  });

  window.addEventListener("mcskin:langchange", () => {
    setDockHint(t(DEFAULT_HINT_KEY), "🖌️", t("badge_paint"));
  });
}

/** @private */
function bindStageResize(getViewport3D) {
  const stage = document.querySelector(".immersive-3d-stage") || document.querySelector(".editor-stage");
  if (!stage) return;

  let pending = false;
  const scheduleRender = () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      getViewport3D()?.render();
    });
  };

  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(scheduleRender).observe(stage);
  }
  window.addEventListener("orientationchange", scheduleRender);
  window.visualViewport?.addEventListener("resize", scheduleRender);
}

/**
 * Initializes editor layout reactivity: dynamic stage sizing and dock hint strip guidance.
 * @param {object} opts
 * @param {Function} opts.getViewport3D - Returns the active 3D viewport instance.
 */
export function initEditorLayout({ getViewport3D }) {
  bindDockHints();
  bindStageResize(getViewport3D);
}
