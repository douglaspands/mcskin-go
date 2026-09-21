/**
 * @file palette.js
 * @description Manages Minecraft color swatches, custom picker, tool modes, layers, and template selectors.
 */

import { playSound } from "./fx.js";
import { setDockHint } from "./editor-layout.js";
import { resetLastPaintedCoord } from "./editor2d.js";
import { t } from "./i18n.js";

export const mcColors = [
  { name: "Redstone", color: "#e74c3c" },
  { name: "Diamante", color: "#3498db" },
  { name: "Esmeralda", color: "#2ecc71" },
  { name: "Ouro", color: "#f1c40f" },
  { name: "Ametista", color: "#9b59b6" },
  { name: "Neve", color: "#ffffff" },
  { name: "Obsidiana", color: "#1b1b1b" },
  { name: "Terra", color: "#795548" },
  { name: "Cobre", color: "#e67e22" },
  { name: "Prismarinho", color: "#1abc9c" }
];

const LAYERS = ["base", "overlay"];
const LAYER_META = {
  base: { icon: "👕", label: "Base" },
  overlay: { icon: "🧥", label: "3D" },
};

let currentColor = "#2ecc71";
let currentTool = "pencil";
let currentLayer = "base";
let touchMode = "rotate";
let isGlassMode = false;
let currentModelType = "classic";
let currentViewMode = "3d";

export const getToolState = () => ({
  currentColor,
  currentTool,
  currentLayer,
  touchMode,
  isGlassMode,
  currentModelType,
  viewMode: currentViewMode
});

export const getViewMode = () => currentViewMode;

/**
 * Switches between 3D character viewport and 2D unfolded texture sheet editor.
 * @param {'3d'|'2d'} mode
 * @param {object} [callbacks]
 */
export function setViewMode(mode, { onRender2D, onRender3D } = {}) {
  currentViewMode = mode;
  const is2D = mode === "2d";
  document.getElementById("btnMode3D")?.classList.toggle("active", !is2D);
  document.getElementById("btnMode2D")?.classList.toggle("active", is2D);

  const charWorld = document.getElementById("characterWorld");
  const mannequin = document.getElementById("mannequinWidget");
  const touchPill = document.querySelector(".floating-mode-pill");
  const zoomControls = document.getElementById("zoom3DVerticalControls");
  const zoom2DControls = document.getElementById("zoom2DVerticalControls");
  const wrapper2D = document.getElementById("wrapper2D");

  if (is2D) {
    if (charWorld) charWorld.style.display = "none";
    if (mannequin) mannequin.style.display = "none";
    if (touchPill) touchPill.style.display = "flex";
    if (zoomControls) zoomControls.style.display = "none";
    if (zoom2DControls) zoom2DControls.style.display = "flex";
    if (wrapper2D) wrapper2D.style.display = "flex";
    if (onRender2D) onRender2D();
  } else {
    if (wrapper2D) wrapper2D.style.display = "none";
    if (zoom2DControls) zoom2DControls.style.display = "none";
    if (charWorld) charWorld.style.display = "";
    if (mannequin) mannequin.style.display = "";
    if (touchPill) touchPill.style.display = "flex";
    if (zoomControls) zoomControls.style.display = "";
    if (onRender3D) onRender3D();
  }
}

export const setColor = (hex) => {
  currentColor = hex;
  resetLastPaintedCoord();
  const picker = document.getElementById("customColorPicker");
  const box = document.getElementById("currentColorBox");
  const swatch = document.getElementById("activeColorSwatch");
  const labelHex = document.getElementById("labelHexCode");
  if (picker) picker.value = hex;
  if (box) box.style.background = hex;
  if (swatch) swatch.style.background = hex;
  if (labelHex) labelHex.textContent = hex;
};

/**
 * Updates the current model type and syncs Steve/Alex template buttons.
 * @param {'classic'|'slim'} model
 */
export const setModelType = (model) => {
  currentModelType = model;
  document.getElementById("tplSteve")?.classList.toggle("active", model === "classic");
  document.getElementById("tplAlex")?.classList.toggle("active", model === "slim");
};

/**
 * Initializes palette swatches, tools, layer toggles, and template controls.
 */
export function initPalette({ onLoadTemplate, onSetModel, onRender2D, onRender3D, onUploadTexture }) {
  const colorSheet = document.getElementById("colorBottomSheet");

  const bindSwatches = () => {
    document.querySelectorAll(".swatch-btn, .color-swatch").forEach((swatch) => {
      swatch.addEventListener("click", () => {
        const col = swatch.dataset.color || swatch.getAttribute("data-color");
        if (col) {
          document.querySelectorAll(".swatch-btn, .color-swatch").forEach((s) => s.classList.remove("active"));
          swatch.classList.add("active");
          setColor(col);
          colorSheet?.classList.remove("open");
          playSound("click");
        }
      });
    });
  };
  bindSwatches();
  setColor(currentColor);

  document.getElementById("customColorPicker")?.addEventListener("input", (e) => {
    setColor(e.target.value);
    document.querySelectorAll(".swatch-btn, .color-swatch").forEach((s) => s.classList.remove("active"));
  });
  document.getElementById("customColorPicker")?.addEventListener("change", (e) => {
    setColor(e.target.value);
    colorSheet?.classList.remove("open");
  });

  document.getElementById("btnCloseColors")?.addEventListener("click", () => {
    colorSheet?.classList.remove("open");
    playSound("click");
  });

  // Tools (Pencil, Bucket, Recolor, Eraser)
  const TOOL_IDS = ["toolPencil", "toolBucket", "toolRecolor", "toolEraser"];
  TOOL_IDS.forEach((id) => {
    const btn = document.getElementById(id);
    btn?.addEventListener("click", () => {
      TOOL_IDS.forEach((i) => document.getElementById(i)?.classList.remove("active"));
      btn.classList.add("active");
      currentTool = id.replace("tool", "").toLowerCase();
      resetLastPaintedCoord();
      playSound("click");
    });
  });

  // Color Picker dock button opens/closes the color bottom sheet
  document.getElementById("toolColorPicker")?.addEventListener("click", () => {
    colorSheet?.classList.toggle("open");
    playSound("click");
  });

  // Touch Mode (Paint vs Rotate) — floating pill on the 3D stage
  const stage3D = document.getElementById("stage3D");
  const btnPaint = document.getElementById("btnTouchPaint") || document.getElementById("btnModePaint");
  const btnRotate = document.getElementById("btnTouchRotate") || document.getElementById("btnModeRotate");

  btnPaint?.addEventListener("click", () => {
    touchMode = "paint";
    btnPaint.classList.add("active");
    btnRotate?.classList.remove("active");
    if (stage3D) stage3D.className = "immersive-3d-stage mode-paint";
    playSound("click");
  });

  btnRotate?.addEventListener("click", () => {
    touchMode = "rotate";
    btnRotate.classList.add("active");
    btnPaint?.classList.remove("active");
    if (stage3D) stage3D.className = "immersive-3d-stage mode-rotate";
    playSound("click");
  });

  // Template Buttons (Steve, Alex, Blank)
  const setTpl = (btn, type, model) => {
    document.querySelectorAll(".model-pill-item").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentModelType = model;
    resetLastPaintedCoord();
    onSetModel(model);
    onLoadTemplate(type, model);
    playSound("click");
  };

  document.getElementById("tplSteve")?.addEventListener("click", (e) => setTpl(e.currentTarget, "steve", "classic"));
  document.getElementById("tplAlex")?.addEventListener("click", (e) => setTpl(e.currentTarget, "alex", "slim"));
  document.getElementById("tplBlank")?.addEventListener("click", () => {
    resetLastPaintedCoord();
    onSetModel(currentModelType);
    onLoadTemplate("blank", currentModelType);
    playSound("click");
  });

  document.getElementById("btnMode3D")?.addEventListener("click", () => {
    if (currentViewMode === "3d") return;
    resetLastPaintedCoord();
    setViewMode("3d", { onRender2D, onRender3D });
    setDockHint(t("hint_mode_3d"), "🧊", t("badge_mode_3d"));
    playSound("click");
  });

  document.getElementById("btnMode2D")?.addEventListener("click", () => {
    if (currentViewMode === "2d") return;
    resetLastPaintedCoord();
    setViewMode("2d", { onRender2D, onRender3D });
    setDockHint(t("hint_mode_2d"), "📜", t("badge_mode_2d"));
    playSound("click");
  });

  const uploadInput = document.getElementById("editorFileInput");
  document.getElementById("btnUploadSkin")?.addEventListener("click", () => uploadInput?.click());
  uploadInput?.addEventListener("change", () => {
    if (uploadInput.files?.length) {
      onUploadTexture(uploadInput.files[0]);
    }
  });
}
