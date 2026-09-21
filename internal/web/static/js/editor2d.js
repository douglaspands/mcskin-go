// 2D pixel editor, UV texture templates, zoom controls, undo/redo history

import { playSound } from "./fx.js";
import { buildGridOverlayCanvas, update3DTexture } from "./editor3d.js";
import { bindEditorExports } from "./editor-exporter.js";

export const textureCanvas = document.createElement("canvas");
export const textureCtx = textureCanvas.getContext("2d", { willReadFrequently: true });
export let texW = 64, texH = 64;
textureCanvas.width = texW; textureCanvas.height = texH;

const BASE_2D_CANVAS_SIZE = 512, MIN_ZOOM_2D = 1, MAX_ZOOM_2D = 4, ZOOM_2D_STEP = 0.25;
let zoomFactor2D = 1, panX = 0, panY = 0;
export let gridEnabled = false;

export function update2DTransform() {
  const canvas = document.getElementById("editor2DCanvas");
  if (!canvas) return;
  canvas.style.transform = `translate(${Math.round(panX)}px, ${Math.round(panY)}px) scale(${zoomFactor2D})`;
}
export function reset2DView() { zoomFactor2D = 1; panX = 0; panY = 0; update2DTransform(); }

const MAX_UNDO = 20, undoStack = [], redoStack = [];
let lastPaintedCoord = null;

export function setTextureResolution(w, h) {
  if (texW === w && texH === h && textureCanvas.width === w && textureCanvas.height === h) return;
  texW = w; texH = h; textureCanvas.width = w; textureCanvas.height = h;
  undoStack.length = 0; redoStack.length = 0; lastPaintedCoord = null;
  syncTexture();
}

export const pushUndo = () => {
  redoStack.length = 0; undoStack.push(textureCtx.getImageData(0, 0, texW, texH));
  if (undoStack.length > MAX_UNDO) undoStack.shift();
};
export const undo = () => {
  if (!undoStack.length) return;
  redoStack.push(textureCtx.getImageData(0, 0, texW, texH));
  textureCtx.putImageData(undoStack.pop(), 0, 0); syncTexture(); playSound("click");
};
export const redo = () => {
  if (!redoStack.length) return;
  undoStack.push(textureCtx.getImageData(0, 0, texW, texH));
  textureCtx.putImageData(redoStack.pop(), 0, 0); syncTexture(); playSound("click");
};

export function syncTexture() {
  update3DTexture(gridEnabled ? buildGridOverlayCanvas(textureCanvas, texW, texH) : textureCanvas, texW, texH);
  render2DSheet();
}

export function loadTemplate(type, modelType = "classic") {
  pushUndo();
  textureCtx.clearRect(0, 0, texW, texH);
  const s = Math.max(1, Math.round(texW / 64));
  const fb = (x, y, w, h, col) => { textureCtx.fillStyle = col; textureCtx.fillRect(x * s, y * s, w * s, h * s); };
  const isBlank = type === "blank", isAlex = type === "alex";
  if (type === "steve" || isAlex || isBlank) {
    const skinTone = isBlank ? "#fff" : (isAlex ? "#f1c27d" : "#d39a74"), hair = isBlank ? "#fff" : (isAlex ? "#d35400" : "#462c16"),
      shirt = isBlank ? "#fff" : (isAlex ? "#5da632" : "#0093a8"), pants = isBlank ? "#fff" : (isAlex ? "#4a3c31" : "#2e3e7e"),
      shoes = isBlank ? "#fff" : "#404040", eyeColor = isBlank ? "#fff" : (isAlex ? "#4aa338" : "#2980b9"), armW = modelType === "slim" ? 3 : 4;
    fb(8, 0, 8, 8, hair); fb(16, 0, 8, 8, skinTone); fb(0, 8, 32, 8, hair); fb(8, 8, 8, 8, skinTone); fb(8, 8, 8, 2, hair);
    fb(9, 12, 2, 1, "#fff"); fb(13, 12, 2, 1, "#fff"); fb(10, 12, 1, 1, eyeColor); fb(13, 12, 1, 1, eyeColor); fb(10, 14, 4, 1, isBlank ? "#fff" : (isAlex ? "#c0392b" : "#7d3f28"));
    fb(20, 16, 16, 4, shirt); fb(16, 20, 24, 12, shirt); fb(22, 20, 4, 2, skinTone);
    fb(44, 16, armW, 4, shirt); fb(44 + armW, 16, armW, 4, skinTone);
    fb(40, 20, 4, 4, shirt); fb(44, 20, armW, 4, shirt); fb(44 + armW, 20, 4, 4, shirt); fb(48 + armW, 20, armW, 4, shirt);
    fb(40, 24, 4, 8, skinTone); fb(44, 24, armW, 8, skinTone); fb(44 + armW, 24, 4, 8, skinTone); fb(48 + armW, 24, armW, 8, skinTone);
    fb(4, 16, 4, 4, pants); fb(8, 16, 4, 4, shoes); fb(0, 20, 16, 10, pants);
    fb(0, 30, 4, 2, shoes); fb(4, 30, 4, 2, shoes); fb(8, 30, 4, 2, shoes); fb(12, 30, 4, 2, shoes);
    if (texH >= 64) {
      fb(36, 48, armW, 4, shirt); fb(36 + armW, 48, armW, 4, skinTone);
      fb(32, 52, 4, 4, shirt); fb(36, 52, armW, 4, shirt); fb(36 + armW, 52, 4, 4, shirt); fb(40 + armW, 52, armW, 4, shirt);
      fb(32, 56, 4, 8, skinTone); fb(36, 56, armW, 8, skinTone); fb(36 + armW, 56, 4, 8, skinTone); fb(40 + armW, 56, armW, 8, skinTone);
      fb(20, 48, 4, 4, pants); fb(24, 48, 4, 4, shoes); fb(16, 52, 16, 10, pants); fb(16, 62, 16, 2, shoes);
    }
  }
  syncTexture();
}

export const resetLastPaintedCoord = () => { lastPaintedCoord = null; };

const isBaseUV = (x, y) => {
  const s = texW / 64, hx = x / s, hy = y / s;
  return (hx < 32 && hy < 16) || (hx < 56 && hy >= 16 && hy < 32) || (texH >= 64 * s && hy >= 48 && hy < 64 && hx >= 16 && hx < 48);
};

const parseHex = (hex) => {
  const h = hex.replace("#", ""), n = parseInt(h.length === 3 ? h[0] + h[0] + h[1] + h[1] + h[2] + h[2] : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export function paintPixel(px, py, { currentTool, currentColor, isGlassMode, onPickColor }) {
  if (px < 0 || px >= texW || py < 0 || py >= texH) return;
  if (currentTool === "pipette") {
    const p = textureCtx.getImageData(px, py, 1, 1).data;
    if (p[3] > 10) onPickColor("#" + ((1 << 24) + (p[0] << 16) + (p[1] << 8) + p[2]).toString(16).slice(1));
    return;
  }
  if (currentTool === "bucket") {
    floodFill(px, py, currentColor, isGlassMode ? 128 : 255);
    lastPaintedCoord = null; syncTexture(); playSound("click"); return;
  }
  if (currentTool === "recolor") {
    recolorAll(px, py, currentColor, isGlassMode ? 128 : 255);
    lastPaintedCoord = null; syncTexture(); playSound("click"); return;
  }
  const lp = lastPaintedCoord;
  if (lp?.x === px && lp?.y === py && lp?.tool === currentTool && lp?.color === currentColor && lp?.glass === isGlassMode) return;
  lastPaintedCoord = { x: px, y: py, tool: currentTool, color: currentColor, glass: isGlassMode };

  if (currentTool === "eraser") {
    textureCtx.clearRect(px, py, 1, 1);
  } else {
    const [r, g, b] = parseHex(currentColor);
    textureCtx.fillStyle = isGlassMode ? `rgba(${r},${g},${b},0.5)` : currentColor;
    textureCtx.clearRect(px, py, 1, 1);
    textureCtx.fillRect(px, py, 1, 1);
  }
  syncTexture();
}

function floodFill(startX, startY, hexColor, fillA) {
  const [fillR, fillG, fillB] = parseHex(hexColor), imgData = textureCtx.getImageData(0, 0, texW, texH), data = imgData.data;
  const sIdx = (startY * texW + startX) * 4, sR = data[sIdx], sG = data[sIdx + 1], sB = data[sIdx + 2], sA = data[sIdx + 3], isTrans = sA < 10;
  if (!isTrans && sR === fillR && sG === fillG && sB === fillB && sA === fillA) return;
  const matches = (pIdx, x, y) => isTrans ? (data[pIdx + 3] < 10 && isBaseUV(x, y)) : (data[pIdx + 3] >= 10 && data[pIdx] === sR && data[pIdx + 1] === sG && data[pIdx + 2] === sB);
  const queue = [[startX, startY]], visited = new Uint8Array(texW * texH);
  while (queue.length > 0) {
    const [x, y] = queue.pop(), idx = y * texW + x;
    if (visited[idx]) continue;
    visited[idx] = 1;
    const pIdx = idx * 4;
    if (matches(pIdx, x, y)) {
      data[pIdx] = fillR; data[pIdx + 1] = fillG; data[pIdx + 2] = fillB; data[pIdx + 3] = fillA;
      if (x > 0) queue.push([x - 1, y]); if (x < texW - 1) queue.push([x + 1, y]);
      if (y > 0) queue.push([y - 1, y]); if (y < texH - 1) queue.push([y + 1, y]);
    }
  }
  textureCtx.putImageData(imgData, 0, 0);
}

function recolorAll(startX, startY, hexColor, fillA) {
  const [fillR, fillG, fillB] = parseHex(hexColor), imgData = textureCtx.getImageData(0, 0, texW, texH), data = imgData.data;
  const sIdx = (startY * texW + startX) * 4, sR = data[sIdx], sG = data[sIdx + 1], sB = data[sIdx + 2], sA = data[sIdx + 3], isTrans = sA < 10;
  if (!isTrans && sR === fillR && sG === fillG && sB === fillB && sA === fillA) return;
  for (let i = 0; i < data.length; i += 4) {
    const pIdx = i / 4, px = pIdx % texW, py = (pIdx / texW) | 0;
    const match = isTrans ? (data[i + 3] < 10 && isBaseUV(px, py)) : (data[i + 3] >= 10 && data[i] === sR && data[i + 1] === sG && data[i + 2] === sB);
    if (match) { data[i] = fillR; data[i + 1] = fillG; data[i + 2] = fillB; data[i + 3] = fillA; }
  }
  textureCtx.putImageData(imgData, 0, 0);
}

/**
 * Renders the 2D unfolded skin sheet canvas.
 */
export function render2DSheet() {
  const canvas = document.getElementById("editor2DCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d"), scale = BASE_2D_CANVAS_SIZE / texW;
  const cW = BASE_2D_CANVAS_SIZE, cH = Math.round(texH * scale);
  if (canvas.width !== cW || canvas.height !== cH) { canvas.width = cW; canvas.height = cH; }
  ctx.clearRect(0, 0, cW, cH); ctx.imageSmoothingEnabled = false;

  for (let y = 0; y < texH; y++) {
    for (let x = 0; x < texW; x++) { ctx.fillStyle = ((x + y) % 2 === 0) ? "#1f1f1f" : "#282828"; ctx.fillRect(x * scale, y * scale, scale, scale); }
  }
  ctx.drawImage(textureCanvas, 0, 0, texW, texH, 0, 0, cW, cH);
  if (gridEnabled) {
    ctx.strokeStyle = "rgba(0, 0, 0, 0.10)"; ctx.lineWidth = 1;
    for (let gx = 0; gx <= texW; gx++) { const lx = Math.round(gx * scale) + 0.5; ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, cH); ctx.stroke(); }
    for (let gy = 0; gy <= texH; gy++) { const ly = Math.round(gy * scale) + 0.5; ctx.beginPath(); ctx.moveTo(0, ly); ctx.lineTo(cW, ly); ctx.stroke(); }
  }
  update2DTransform();
}

export function initEditor2D({ getToolState, onPickColor }) {
  const on = (id, evt, fn) => document.getElementById(id)?.addEventListener(evt, fn);
  const canvas = document.getElementById("editor2DCanvas");
  if (canvas) {
    const setZoom = (z) => {
      zoomFactor2D = Math.max(MIN_ZOOM_2D, Math.min(MAX_ZOOM_2D, Math.round(z * 100) / 100));
      const s = document.getElementById("zoom2DSlider"); if (s) s.value = zoomFactor2D;
      update2DTransform();
    };
    on("zoom2DSlider", "input", (e) => setZoom(parseFloat(e.target.value)));
    on("btnZoom2DIn", "click", () => { setZoom(zoomFactor2D + ZOOM_2D_STEP); playSound("click"); });
    on("btnZoom2DOut", "click", () => { setZoom(zoomFactor2D - ZOOM_2D_STEP); playSound("click"); });
    on("btnZoom2DReset", "click", () => { reset2DView(); playSound("click"); });

    const wrapper = document.getElementById("wrapper2D");
    wrapper?.addEventListener("wheel", (e) => {
      e.stopPropagation(); e.preventDefault();
      setZoom(zoomFactor2D + (e.deltaY < 0 ? ZOOM_2D_STEP : -ZOOM_2D_STEP));
    }, { passive: false });

    let isDrawing = false, isPanning = false, panStartX = 0, panStartY = 0, startPanX = 0, startPanY = 0;
    const getCoord = (e) => {
      const rect = canvas.getBoundingClientRect();
      const cx = e.touches ? e.touches[0].clientX : e.clientX, cy = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: Math.floor(((cx - rect.left) / rect.width) * texW), y: Math.floor(((cy - rect.top) / rect.height) * texH) };
    };

    const handleStart = (e) => { isDrawing = true; lastPaintedCoord = null; pushUndo(); const { x, y } = getCoord(e); paintPixel(x, y, { ...getToolState(), onPickColor }); };
    const handleMove = (e) => { if (isDrawing) { const { x, y } = getCoord(e); paintPixel(x, y, { ...getToolState(), onPickColor }); } };
    const handleEnd = () => { isDrawing = false; lastPaintedCoord = null; };
    const startPan = (cx, cy) => { isPanning = true; panStartX = cx; panStartY = cy; startPanX = panX; startPanY = panY; };

    canvas.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      const isRotate = getToolState().touchMode === "rotate";
      if (isRotate || e.button === 1 || e.button === 2 || e.shiftKey || e.altKey) {
        startPan(e.clientX, e.clientY); e.preventDefault(); return;
      }
      handleStart(e);
    });
    wrapper?.addEventListener("mousedown", (e) => {
      if (e.target !== canvas) { e.stopPropagation(); startPan(e.clientX, e.clientY); }
    });

    window.addEventListener("mousemove", (e) => {
      if (isPanning) { panX = startPanX + (e.clientX - panStartX); panY = startPanY + (e.clientY - panStartY); update2DTransform(); return; }
      handleMove(e);
    });
    window.addEventListener("mouseup", () => { isPanning = false; handleEnd(); });
    canvas.addEventListener("contextmenu", (e) => { e.stopPropagation(); e.preventDefault(); });

    let touchMode2D = "none", initDist = 0, initMidX = 0, initMidY = 0, initZ = 1, initPX = 0, initPY = 0;
    canvas.addEventListener("touchstart", (e) => {
      e.stopPropagation(); if (e.cancelable) e.preventDefault();
      const isRotate = getToolState().touchMode === "rotate";
      if (e.touches.length === 1) {
        if (isRotate) { touchMode2D = "pan"; startPan(e.touches[0].clientX, e.touches[0].clientY); }
        else { touchMode2D = "draw"; handleStart(e); }
      } else if (e.touches.length >= 2) {
        touchMode2D = "gesture"; isDrawing = false; lastPaintedCoord = null;
        const [t0, t1] = e.touches;
        initDist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY) || 1;
        initMidX = (t0.clientX + t1.clientX) / 2; initMidY = (t0.clientY + t1.clientY) / 2;
        initZ = zoomFactor2D; initPX = panX; initPY = panY;
      }
    }, { passive: false });

    wrapper?.addEventListener("touchstart", (e) => {
      if (e.target !== canvas) {
        e.stopPropagation();
        if (e.touches.length === 1) { touchMode2D = "pan"; startPan(e.touches[0].clientX, e.touches[0].clientY); }
      }
    }, { passive: false });

    const handleTouchMove = (e) => {
      e.stopPropagation(); if (e.cancelable) e.preventDefault();
      if (e.touches.length === 1) {
        if (touchMode2D === "pan") {
          panX = startPanX + (e.touches[0].clientX - panStartX);
          panY = startPanY + (e.touches[0].clientY - panStartY);
          update2DTransform();
        } else if (touchMode2D === "draw") handleMove(e);
      } else if (e.touches.length >= 2 && touchMode2D === "gesture") {
        const [t0, t1] = e.touches, dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY) || 1;
        zoomFactor2D = Math.max(MIN_ZOOM_2D, Math.min(MAX_ZOOM_2D, Math.round((initZ * (dist / initDist)) * 100) / 100));
        panX = initPX + ((t0.clientX + t1.clientX) / 2 - initMidX);
        panY = initPY + ((t0.clientY + t1.clientY) / 2 - initMidY);
        update2DTransform();
      }
    };
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    wrapper?.addEventListener("touchmove", (e) => { if (e.target !== canvas) handleTouchMove(e); }, { passive: false });

    const handleTouchEnd = (e) => {
      e.stopPropagation();
      if (e.touches.length === 0) { touchMode2D = "none"; isPanning = false; handleEnd(); }
      else if (e.touches.length === 1 && touchMode2D === "gesture") { touchMode2D = "none"; }
    };
    canvas.addEventListener("touchend", handleTouchEnd);
    wrapper?.addEventListener("touchend", (e) => { if (e.target !== canvas) handleTouchEnd(e); });
  }
  on("btnToggleGrid", "click", () => {
    gridEnabled = !gridEnabled;
    document.getElementById("btnToggleGrid")?.classList.toggle("active", gridEnabled);
    syncTexture(); playSound("click");
  });
  ["btnUndo", "btnUndoIcon"].forEach((id) => on(id, "click", undo));
  ["btnRedo", "btnRedoIcon"].forEach((id) => on(id, "click", redo));

  bindEditorExports({ textureCanvas, getTexW: () => texW, getToolState });
}
