/**
 * @file editor3d.js
 * @description Manages Three.js 3D viewport, subtle photography grid, camera snap/zoom controls, and 3D mesh interaction.
 */

import { playSound } from "./fx.js";

const GRID_OVERLAY_SCALE = 16;
const ZOOM_3D_STEP = 4;
const PAN_Y_STEP = 4;
const PAN_Y_MIN = -10;
const PAN_Y_MAX = 20;

let viewport3D = null;
let editor3DCanvas = null;
let currentTexW = 64, currentTexH = 64;

/**
 * Builds an upscaled canvas with subtle photography grid overlay for the 3D mannequin.
 * @param {HTMLCanvasElement} textureCanvas - Source skin texture canvas.
 * @param {number} texW - Skin texture width.
 * @param {number} texH - Skin texture height.
 * @returns {HTMLCanvasElement} Upscaled canvas with subtle grid overlay lines.
 */
export function buildGridOverlayCanvas(textureCanvas, texW, texH) {
  const scale = GRID_OVERLAY_SCALE;
  const gridCanvas = document.createElement("canvas");
  gridCanvas.width = texW * scale;
  gridCanvas.height = texH * scale;
  const gCtx = gridCanvas.getContext("2d");
  gCtx.imageSmoothingEnabled = false;
  gCtx.drawImage(textureCanvas, 0, 0, texW, texH, 0, 0, gridCanvas.width, gridCanvas.height);

  gCtx.strokeStyle = "rgba(0, 0, 0, 0.10)";
  gCtx.lineWidth = 1;
  for (let gx = 0; gx <= texW; gx++) {
    const lx = gx * scale + 0.5;
    gCtx.beginPath(); gCtx.moveTo(lx, 0); gCtx.lineTo(lx, gridCanvas.height); gCtx.stroke();
  }
  for (let gy = 0; gy <= texH; gy++) {
    const ly = gy * scale + 0.5;
    gCtx.beginPath(); gCtx.moveTo(0, ly); gCtx.lineTo(gridCanvas.width, ly); gCtx.stroke();
  }
  return gridCanvas;
}

export function getViewport3D() {
  return viewport3D;
}

/**
 * Updates texture rendered on the 3D mannequin.
 * @param {HTMLCanvasElement} canvas - Texture canvas to apply.
 * @param {number} [uvWidth] - Logical skin width.
 * @param {number} [uvHeight] - Logical skin height.
 */
export function update3DTexture(canvas, uvWidth, uvHeight) {
  if (uvWidth) currentTexW = uvWidth;
  if (uvHeight) currentTexH = uvHeight;
  if (viewport3D) {
    viewport3D.setTexture(canvas, 64, currentTexH === 32 ? 32 : 64);
  }
}

/**
 * Sets model type (classic vs slim) on 3D mannequin.
 * @param {'classic'|'slim'} model
 */
export function set3DModel(model) {
  if (viewport3D) {
    if (typeof viewport3D.setModel === "function") viewport3D.setModel(model);
    else { viewport3D.modelType = model; viewport3D._rebuildMeshes?.(); viewport3D.render(); }
  }
}

/**
 * Initializes Three.js 3D viewport, camera controls, mannequin widget, and pointer listeners.
 * @param {object} options
 * @param {Function} options.onPaintPixel - Called when 3D painting occurs (pixelX, pixelY).
 * @param {Function} options.onPushUndo - Called before painting begins.
 * @param {Function} options.getTouchMode - Returns 'paint' | 'rotate'.
 * @param {Function} options.getCurrentLayer - Returns 'base' | 'overlay'.
 */
export function initEditor3D({ onPaintPixel, onPushUndo, onResetCoord, getTouchMode, getCurrentLayer }) {
  editor3DCanvas = document.getElementById("editor3DCanvas");
  if (!editor3DCanvas || !window.Skin3D) return;

  viewport3D = new window.Skin3D.Viewport(editor3DCanvas);

  // Fullscreen handling — fullscreens the whole document (not just the
  // editor card) so the single header toggle button that opened fullscreen
  // stays part of the fullscreen view and remains reachable to exit it,
  // on every viewport width.
  const root = document.documentElement;
  const btnFullscreen = document.getElementById("btnHeaderFullscreen") || document.getElementById("btnDrawerFullscreen") || document.getElementById("btnFullscreenHeader");
  const isFsActive = () => !!(document.fullscreenElement || document.webkitFullscreenElement || root.classList.contains("is-fullscreen-fallback"));

  const onFsChange = () => {
    btnFullscreen?.classList.toggle("active", isFsActive());
    if (btnFullscreen) btnFullscreen.title = isFsActive() ? "Sair da tela cheia" : "Expandir para tela cheia";
    setTimeout(() => { viewport3D?.render(); }, 60);
  };

  btnFullscreen?.addEventListener("click", () => {
    if (isFsActive()) {
      (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);
      root.classList.remove("is-fullscreen-fallback");
    } else {
      const req = root.requestFullscreen || root.webkitRequestFullscreen;
      if (req) req.call(root);
      else root.classList.add("is-fullscreen-fallback");
    }
    onFsChange();
    playSound("click");
  });

  document.addEventListener("fullscreenchange", onFsChange);
  document.addEventListener("webkitfullscreenchange", onFsChange);
  window.addEventListener("resize", () => { viewport3D?.render(); });

  // Floating vertical 3D zoom controls
  const setZoom = (z) => { viewport3D?.setZoom(z); };
  const onBtn = (id, fn) => document.getElementById(id)?.addEventListener("click", (e) => { e.stopPropagation(); fn(); playSound("click"); });
  onBtn("btnZoom3DIn", () => { if (viewport3D) setZoom(viewport3D.zoom - ZOOM_3D_STEP); });
  onBtn("btnZoom3DOut", () => { if (viewport3D) setZoom(viewport3D.zoom + ZOOM_3D_STEP); });
  onBtn("btnZoom3DReset", () => viewport3D?.resetCamera());

  // Discrete vertical height adjustment (Subir / Descer) — shifts camera look-at Y target
  const panY = (delta) => {
    if (!viewport3D) return;
    viewport3D.target[1] = Math.max(PAN_Y_MIN, Math.min(PAN_Y_MAX, viewport3D.target[1] + delta));
    viewport3D.render();
  };
  onBtn("btnPanUp", () => panY(-PAN_Y_STEP));
  onBtn("btnPanDown", () => panY(PAN_Y_STEP));

  // Mannequin Widget body part focusing
  const mannequin = document.getElementById("mannequinWidget");
  mannequin?.querySelectorAll(".mannequin-part").forEach((el) => {
    const handleFocus = (e) => {
      e.stopPropagation(); e.preventDefault();
      const part = el.getAttribute("data-mannequin-part");
      if (viewport3D && part) { viewport3D.focusPart(part); playSound("click"); }
    };
    el.addEventListener("click", handleFocus);
    el.addEventListener("touchend", handleFocus);
  });

  // Snap view buttons
  document.querySelectorAll(".btn-snap").forEach((btn) => {
    btn.addEventListener("click", () => { viewport3D?.snapTo(btn.getAttribute("data-dir")); playSound("click"); });
  });

  // 3D Pointer Events (Mouse, Touch, Pen)
  let isPointerDown = false, lastX = 0, lastY = 0;
  let pinchStartDist = null, pinchStartZoom = null, twoTouchMidX = null, twoTouchMidY = null;

  const stage3D = document.getElementById("stage3D");
  stage3D?.addEventListener("contextmenu", (e) => e.preventDefault());
  editor3DCanvas.addEventListener("contextmenu", (e) => e.preventDefault());

  const is3DActive = () => document.getElementById("characterWorld")?.style.display !== "none";
  const isInteractiveEl = (t) => t?.closest?.("button, .mannequin-widget, .zoom-vertical-controls, .floating-mode-pill, .color-bottom-sheet, .viewport-2d-box, .editor-2d-wrapper, #wrapper2D, #editor2DCanvas");

  const getDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX, dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const onWheel = (e) => {
    if (!is3DActive() || isInteractiveEl(e.target)) return;
    e.preventDefault();
    if (viewport3D) setZoom(viewport3D.zoom + (e.deltaY > 0 ? ZOOM_3D_STEP * 0.6 : -ZOOM_3D_STEP * 0.6));
  };
  editor3DCanvas.addEventListener("wheel", onWheel, { passive: false });
  stage3D?.addEventListener("wheel", onWheel, { passive: false });

  const scaleHit = (hit) => {
    if (!hit) return null;
    const scale = currentTexW / 64;
    return { ...hit, pixelX: Math.round(hit.pixelX * scale), pixelY: Math.round(hit.pixelY * scale), scale };
  };

  const handlePointerStart = (e) => {
    if (!is3DActive() || isInteractiveEl(e.target)) return;
    isPointerDown = true;
    if (onResetCoord) onResetCoord();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    lastX = clientX; lastY = clientY;

    if (getTouchMode() === "paint" && viewport3D) {
      onPushUndo();
      const hit = scaleHit(viewport3D.pickPixel(clientX, clientY, getCurrentLayer() === "overlay"));
      if (hit) {
        viewport3D.setHoverPixel(hit);
        onPaintPixel(hit.pixelX, hit.pixelY);
      }
    }
  };

  const handlePointerMove = (e) => {
    if (!is3DActive() || !isPointerDown) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    if (getTouchMode() === "rotate" && viewport3D) {
      const rect = editor3DCanvas.getBoundingClientRect();
      const dx = clientX - lastX, dy = clientY - lastY;
      lastX = clientX; lastY = clientY;
      if (e.buttons === 2 || e.shiftKey) {
        panY((dy / (rect.height || 1)) * 24);
      } else {
        viewport3D.rotY += (dx / rect.width) * 4.0;
        viewport3D.rotX += (dy / rect.height) * 4.0;
        viewport3D.rotX = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, viewport3D.rotX));
        viewport3D.setHoverPixel(null);
        viewport3D.render();
      }
    } else if (getTouchMode() === "paint" && viewport3D) {
      const hit = scaleHit(viewport3D.pickPixel(clientX, clientY, getCurrentLayer() === "overlay"));
      if (hit) {
        viewport3D.setHoverPixel(hit);
        onPaintPixel(hit.pixelX, hit.pixelY);
      }
    }
  };

  const handlePointerEnd = () => {
    isPointerDown = false;
    if (onResetCoord) onResetCoord();
    viewport3D?.setHoverPixel(null);
  };

  stage3D?.addEventListener("mousedown", handlePointerStart);
  editor3DCanvas.addEventListener("mousedown", handlePointerStart);
  window.addEventListener("mousemove", handlePointerMove);
  window.addEventListener("mouseup", handlePointerEnd);

  editor3DCanvas.addEventListener("mousemove", (e) => {
    if (!is3DActive() || isPointerDown || !viewport3D) return;
    const hit = scaleHit(viewport3D.pickPixel(e.clientX, e.clientY, getCurrentLayer() === "overlay"));
    viewport3D.setHoverPixel(hit);
  });
  editor3DCanvas.addEventListener("mouseleave", () => { viewport3D?.setHoverPixel(null); });

  const onTouchStart = (e) => {
    if (!is3DActive() || isInteractiveEl(e.target)) return;
    if (e.cancelable) e.preventDefault();
    if (e.touches.length === 2) {
      isPointerDown = false;
      pinchStartDist = getDistance(e.touches);
      pinchStartZoom = viewport3D ? viewport3D.zoom : null;
      twoTouchMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      twoTouchMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      return;
    }
    handlePointerStart(e);
  };

  stage3D?.addEventListener("touchstart", onTouchStart, { passive: false });
  editor3DCanvas.addEventListener("touchstart", onTouchStart, { passive: false });

  editor3DCanvas.addEventListener("touchmove", (e) => {
    if (e.cancelable) e.preventDefault();
    if (!is3DActive()) return;
    if (e.touches.length === 2 && viewport3D) {
      if (pinchStartDist && pinchStartZoom !== null) {
        const newDist = getDistance(e.touches);
        if (newDist > 0) setZoom(pinchStartZoom * (pinchStartDist / newDist));
      }
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      if (twoTouchMidX !== null && twoTouchMidY !== null) {
        const rect = editor3DCanvas.getBoundingClientRect();
        const dx = midX - twoTouchMidX;
        const dy = midY - twoTouchMidY;
        viewport3D.rotY += (dx / (rect.width || 1)) * 4.0;
        viewport3D.rotX = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, viewport3D.rotX + (dy / (rect.height || 1)) * 4.0));
        viewport3D.setHoverPixel(null);
        viewport3D.render();
      }
      twoTouchMidX = midX;
      twoTouchMidY = midY;
      return;
    }
    handlePointerMove(e);
  }, { passive: false });

  editor3DCanvas.addEventListener("touchend", (e) => {
    if (e.touches.length < 2) {
      pinchStartDist = null;
      pinchStartZoom = null;
      twoTouchMidX = null;
      twoTouchMidY = null;
    }
    handlePointerEnd();
  });
}
