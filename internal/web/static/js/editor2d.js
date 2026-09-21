/**
 * @file editor2d.js
 * @description Manages 2D pixel editor, UV texture templates, zoom controls, and undo/redo history.
 */

import { playSound, launchConfetti } from "./fx.js";
import { buildGridOverlayCanvas, update3DTexture } from "./editor3d.js";
import { promptSkinName } from "./converter.js";

export const textureCanvas = document.createElement("canvas");
export const textureCtx = textureCanvas.getContext("2d", { willReadFrequently: true });
export let texW = 64, texH = 64;
textureCanvas.width = texW; textureCanvas.height = texH;

const BASE_2D_CANVAS_SIZE = 512, MIN_ZOOM_2D = 1, MAX_ZOOM_2D = 4, ZOOM_2D_STEP = 0.5;
let zoomFactor2D = 1;
export let gridEnabled = false;

const MAX_UNDO = 20, undoStack = [], redoStack = [];
let lastPaintedCoord = null;

export const pushUndo = () => {
  redoStack.length = 0;
  undoStack.push(textureCtx.getImageData(0, 0, texW, texH));
  if (undoStack.length > MAX_UNDO) undoStack.shift();
};

export const undo = () => {
  if (!undoStack.length) return;
  redoStack.push(textureCtx.getImageData(0, 0, texW, texH));
  textureCtx.putImageData(undoStack.pop(), 0, 0);
  syncTexture(); playSound("click");
};
export const redo = () => {
  if (!redoStack.length) return;
  undoStack.push(textureCtx.getImageData(0, 0, texW, texH));
  textureCtx.putImageData(redoStack.pop(), 0, 0);
  syncTexture(); playSound("click");
};

export function syncTexture() {
  update3DTexture(gridEnabled ? buildGridOverlayCanvas(textureCanvas, texW, texH) : textureCanvas, texW, texH);
  render2DSheet();
}
/**
 * Loads starter template (Steve, Alex, or Blank) into texture canvas.
 */
export function loadTemplate(type, modelType = "classic") {
  pushUndo();
  textureCtx.clearRect(0, 0, texW, texH);
  const fillBox = (x, y, w, h, col) => { textureCtx.fillStyle = col; textureCtx.fillRect(x, y, w, h); };

  const isBlank = type === "blank";
  if (type === "steve" || type === "alex" || isBlank) {
    const isAlex = type === "alex";
    const skinTone = isBlank ? "#ffffff" : (isAlex ? "#f1c27d" : "#d39a74"), hair = isBlank ? "#ffffff" : (isAlex ? "#d35400" : "#462c16");
    const shirt = isBlank ? "#ffffff" : (isAlex ? "#5da632" : "#0093a8"), pants = isBlank ? "#ffffff" : (isAlex ? "#4a3c31" : "#2e3e7e"), shoes = isBlank ? "#ffffff" : "#404040";
    const eyeColor = isBlank ? "#ffffff" : (isAlex ? "#4aa338" : "#2980b9");

    // Head (top, chin/neck, sides, back, front)
    fillBox(8, 0, 8, 8, hair); fillBox(16, 0, 8, 8, skinTone); fillBox(0, 8, 8, 8, hair); fillBox(16, 8, 8, 8, hair); fillBox(24, 8, 8, 8, hair);
    fillBox(8, 8, 8, 8, skinTone); fillBox(8, 8, 8, 2, hair); fillBox(9, 12, 2, 1, "#ffffff"); fillBox(13, 12, 2, 1, "#ffffff");
    fillBox(10, 12, 1, 1, eyeColor); fillBox(13, 12, 1, 1, eyeColor); fillBox(10, 14, 4, 1, isBlank ? "#ffffff" : (isAlex ? "#c0392b" : "#7d3f28"));

    // Torso (all 6 faces) + neck cutout
    fillBox(20, 16, 8, 4, shirt); fillBox(28, 16, 8, 4, shirt); fillBox(16, 20, 4, 12, shirt); fillBox(20, 20, 8, 12, shirt);
    fillBox(28, 20, 4, 12, shirt); fillBox(32, 20, 8, 12, shirt); fillBox(22, 20, 4, 2, skinTone);

    const armW = modelType === "slim" ? 3 : 4;
    // Right arm: top/bottom, 4 sleeve faces (y=20..24), 4 skin faces (y=24..32)
    fillBox(44, 16, armW, 4, shirt); fillBox(44 + armW, 16, armW, 4, skinTone);
    fillBox(40, 20, 4, 4, shirt); fillBox(44, 20, armW, 4, shirt); fillBox(44 + armW, 20, 4, 4, shirt); fillBox(48 + armW, 20, armW, 4, shirt);
    fillBox(40, 24, 4, 8, skinTone); fillBox(44, 24, armW, 8, skinTone); fillBox(44 + armW, 24, 4, 8, skinTone); fillBox(48 + armW, 24, armW, 8, skinTone);

    // Right leg: top, bottom sole, pants (y=20..30), shoes (y=30..32)
    fillBox(4, 16, 4, 4, pants); fillBox(8, 16, 4, 4, shoes);
    fillBox(0, 20, 4, 10, pants); fillBox(4, 20, 4, 10, pants); fillBox(8, 20, 4, 10, pants); fillBox(12, 20, 4, 10, pants);
    fillBox(0, 30, 4, 2, shoes); fillBox(4, 30, 4, 2, shoes); fillBox(8, 30, 4, 2, shoes); fillBox(12, 30, 4, 2, shoes);

    if (texH >= 64) {
      // Left arm: top/bottom, 4 sleeve faces (y=52..56), 4 skin faces (y=56..64)
      fillBox(36, 48, armW, 4, shirt); fillBox(36 + armW, 48, armW, 4, skinTone);
      fillBox(32, 52, 4, 4, shirt); fillBox(36, 52, armW, 4, shirt); fillBox(36 + armW, 52, 4, 4, shirt); fillBox(40 + armW, 52, armW, 4, shirt);
      fillBox(32, 56, 4, 8, skinTone); fillBox(36, 56, armW, 8, skinTone); fillBox(36 + armW, 56, 4, 8, skinTone); fillBox(40 + armW, 56, armW, 8, skinTone);

      // Left leg: top, bottom sole, pants (y=52..62), shoes (y=62..64)
      fillBox(20, 48, 4, 4, pants); fillBox(24, 48, 4, 4, shoes);
      fillBox(16, 52, 4, 10, pants); fillBox(20, 52, 4, 10, pants); fillBox(24, 52, 4, 10, pants); fillBox(28, 52, 4, 10, pants);
      fillBox(16, 62, 4, 2, shoes); fillBox(20, 62, 4, 2, shoes); fillBox(24, 62, 4, 2, shoes); fillBox(28, 62, 4, 2, shoes);
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

/**
 * Paints or erases a single pixel on the texture.
 */
export function paintPixel(px, py, { currentTool, currentColor, isGlassMode, onPickColor }) {
  if (px < 0 || px >= texW || py < 0 || py >= texH) return;
  if (currentTool === "pipette") {
    const p = textureCtx.getImageData(px, py, 1, 1).data;
    if (p[3] > 10) onPickColor("#" + ((1 << 24) + (p[0] << 16) + (p[1] << 8) + p[2]).toString(16).slice(1));
    return;
  }
  if (currentTool === "bucket") {
    floodFill(px, py, currentColor, isGlassMode ? 128 : 255);
    lastPaintedCoord = null;
    syncTexture(); playSound("click"); return;
  }
  if (currentTool === "recolor") {
    recolorAll(px, py, currentColor, isGlassMode ? 128 : 255);
    lastPaintedCoord = null;
    syncTexture(); playSound("click"); return;
  }
  if (lastPaintedCoord?.x === px && lastPaintedCoord?.y === py &&
      lastPaintedCoord?.tool === currentTool &&
      lastPaintedCoord?.color === currentColor &&
      lastPaintedCoord?.glass === isGlassMode) return;
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
  const [fillR, fillG, fillB] = parseHex(hexColor);
  const imgData = textureCtx.getImageData(0, 0, texW, texH), data = imgData.data;
  const sIdx = (startY * texW + startX) * 4;
  const sR = data[sIdx], sG = data[sIdx + 1], sB = data[sIdx + 2], sA = data[sIdx + 3];
  const isTargetTransparent = sA < 10;
  if (!isTargetTransparent && sR === fillR && sG === fillG && sB === fillB && sA === fillA) return;

  const matches = (pIdx, x, y) => isTargetTransparent
    ? (data[pIdx + 3] < 10 && isBaseUV(x, y))
    : (data[pIdx + 3] >= 10 && data[pIdx] === sR && data[pIdx + 1] === sG && data[pIdx + 2] === sB);

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

/**
 * Replaces every pixel matching the color at (startX, startY) with the given color.
 * Supports replacing transparent / blank pixels with solid colors like white.
 */
function recolorAll(startX, startY, hexColor, fillA) {
  const [fillR, fillG, fillB] = parseHex(hexColor);
  const imgData = textureCtx.getImageData(0, 0, texW, texH), data = imgData.data;
  const sIdx = (startY * texW + startX) * 4;
  const sR = data[sIdx], sG = data[sIdx + 1], sB = data[sIdx + 2], sA = data[sIdx + 3];
  const isTargetTransparent = sA < 10;
  if (!isTargetTransparent && sR === fillR && sG === fillG && sB === fillB && sA === fillA) return;

  for (let i = 0; i < data.length; i += 4) {
    const pIdx = i / 4, px = pIdx % texW, py = (pIdx / texW) | 0;
    if (isTargetTransparent) {
      if (data[i + 3] < 10 && isBaseUV(px, py)) {
        data[i] = fillR; data[i + 1] = fillG; data[i + 2] = fillB; data[i + 3] = fillA;
      }
    } else if (data[i + 3] >= 10 && data[i] === sR && data[i + 1] === sG && data[i + 2] === sB) {
      data[i] = fillR; data[i + 1] = fillG; data[i + 2] = fillB; data[i + 3] = fillA;
    }
  }
  textureCtx.putImageData(imgData, 0, 0);
}

/**
 * Renders the 2D unfolded skin sheet canvas.
 */
export function render2DSheet() {
  const canvas = document.getElementById("editor2DCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d"), scale = (BASE_2D_CANVAS_SIZE / texW) * zoomFactor2D;
  const cW = Math.round(texW * scale), cH = Math.round(texH * scale);
  if (canvas.width !== cW || canvas.height !== cH) { canvas.width = cW; canvas.height = cH; }
  ctx.clearRect(0, 0, cW, cH); ctx.imageSmoothingEnabled = false;

  for (let y = 0; y < texH; y++) {
    for (let x = 0; x < texW; x++) {
      ctx.fillStyle = ((x + y) % 2 === 0) ? "#1f1f1f" : "#282828"; ctx.fillRect(x * scale, y * scale, scale, scale);
    }
  }
  ctx.drawImage(textureCanvas, 0, 0, texW, texH, 0, 0, cW, texH * scale);

  if (gridEnabled) {
    ctx.strokeStyle = "rgba(0, 0, 0, 0.10)"; ctx.lineWidth = 1;
    for (let gx = 0; gx <= texW; gx++) { const lx = Math.round(gx * scale) + 0.5; ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, texH * scale); ctx.stroke(); }
    for (let gy = 0; gy <= texH; gy++) { const ly = Math.round(gy * scale) + 0.5; ctx.beginPath(); ctx.moveTo(0, ly); ctx.lineTo(cW, ly); ctx.stroke(); }
  }
}

/**
 * Initializes 2D canvas drawing events, zoom controls, and export handlers.
 */
export function initEditor2D({ getToolState, onPickColor }) {
  const canvas = document.getElementById("editor2DCanvas");
  if (canvas) {
    const setZoom = (z) => {
      zoomFactor2D = Math.max(MIN_ZOOM_2D, Math.min(MAX_ZOOM_2D, z));
      const slider = document.getElementById("zoom2DSlider");
      if (slider) slider.value = zoomFactor2D;
      render2DSheet();
    };

    document.getElementById("zoom2DSlider")?.addEventListener("input", (e) => setZoom(parseFloat(e.target.value)));
    document.getElementById("btnZoom2DIn")?.addEventListener("click", () => { setZoom(zoomFactor2D + ZOOM_2D_STEP); playSound("click"); });
    document.getElementById("btnZoom2DOut")?.addEventListener("click", () => { setZoom(zoomFactor2D - ZOOM_2D_STEP); playSound("click"); });

    let isDrawing = false;
    const getCoord = (e) => {
      const rect = canvas.getBoundingClientRect(), cx = e.touches ? e.touches[0].clientX : e.clientX, cy = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: Math.floor(((cx - rect.left) / rect.width) * texW), y: Math.floor(((cy - rect.top) / rect.height) * texH) };
    };

    const handleStart = (e) => { isDrawing = true; lastPaintedCoord = null; pushUndo(); const { x, y } = getCoord(e); paintPixel(x, y, { ...getToolState(), onPickColor }); };
    const handleMove = (e) => { if (isDrawing) { const { x, y } = getCoord(e); paintPixel(x, y, { ...getToolState(), onPickColor }); } };
    const handleEnd = () => { isDrawing = false; lastPaintedCoord = null; };

    canvas.addEventListener("mousedown", handleStart); window.addEventListener("mousemove", handleMove); window.addEventListener("mouseup", handleEnd);
    canvas.addEventListener("touchstart", (e) => { if (e.cancelable) e.preventDefault(); handleStart(e); }, { passive: false });
    canvas.addEventListener("touchmove", (e) => { if (e.cancelable) e.preventDefault(); handleMove(e); }, { passive: false });
    canvas.addEventListener("touchend", handleEnd);
  }

  document.getElementById("btnToggleGrid")?.addEventListener("click", () => {
    gridEnabled = !gridEnabled;
    document.getElementById("btnToggleGrid")?.classList.toggle("active", gridEnabled);
    syncTexture(); playSound("click");
  });

  ["btnUndo", "btnUndoIcon"].forEach((id) => document.getElementById(id)?.addEventListener("click", undo));
  ["btnRedo", "btnRedoIcon"].forEach((id) => document.getElementById(id)?.addEventListener("click", redo));

  document.getElementById("btnDownloadPng")?.addEventListener("click", () => {
    promptSkinName((name) => {
      const a = document.createElement("a");
      a.href = textureCanvas.toDataURL("image/png"); a.download = `${name}.png`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); playSound("click");
    });
  });

  document.getElementById("btnEditorConvert")?.addEventListener("click", () => {
    promptSkinName((name) => {
      const btn = document.getElementById("btnEditorConvert");
      if (btn) { btn.disabled = true; btn.innerHTML = "<span>⏳ CRIANDO PACOTE...</span>"; }
      playSound("click");
      textureCanvas.toBlob((blob) => {
        if (!blob) { if (btn) { btn.disabled = false; btn.innerHTML = "<span>⚡ CRIAR PACOTE .MCPACK! ⚡</span>"; } return; }
        const fd = new FormData();
        fd.append("skin", blob, `${name}.png`); fd.append("name", name); fd.append("model", getToolState().currentModelType);
        fetch("/api/convert", { method: "POST", body: fd })
          .then((r) => r.ok ? r.blob() : r.json().then((e) => { throw new Error(e.error || "Erro"); }))
          .then((b) => {
            const url = URL.createObjectURL(b), a = document.createElement("a");
            a.href = url; a.download = `${name}.mcpack`;
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
            playSound("success"); launchConfetti();
            const banner = document.getElementById("editorSuccessBanner"), msg = document.getElementById("editorSuccessMsg");
            if (banner && msg) { msg.innerHTML = `Seu pacote <strong>${name}.mcpack</strong> foi baixado com sucesso!`; banner.style.display = "block"; }
          })
          .catch((err) => alert(err.message))
          .finally(() => { if (btn) { btn.disabled = false; btn.innerHTML = "<span>⚡ CRIAR PACOTE .MCPACK! ⚡</span>"; } });
      }, "image/png");
    });
  });
}
