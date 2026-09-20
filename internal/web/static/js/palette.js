/**
 * @file palette.js
 * @description Manages Minecraft color swatches, custom picker, tool modes, layers, and template selectors.
 */

import { playSound } from "./fx.js";

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

export const getToolState = () => ({
  currentColor,
  currentTool,
  currentLayer,
  touchMode,
  isGlassMode,
  currentModelType
});

export const setColor = (hex) => {
  currentColor = hex;
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
      playSound("click");
    });
  });

  // Color Picker dock button opens/closes the color bottom sheet
  document.getElementById("toolColorPicker")?.addEventListener("click", () => {
    colorSheet?.classList.toggle("open");
    playSound("click");
  });

  // Layer toggle: single dock button cycles Base <-> 3D
  const layerIcon = document.getElementById("layerIconGlyph");
  const layerLabel = document.getElementById("layerNameText");
  document.getElementById("toolLayerToggle")?.addEventListener("click", () => {
    currentLayer = LAYERS[(LAYERS.indexOf(currentLayer) + 1) % LAYERS.length];
    const meta = LAYER_META[currentLayer];
    if (layerIcon) layerIcon.textContent = meta.icon;
    if (layerLabel) layerLabel.textContent = meta.label;
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

  // View Mode (3D vs 2D)
  const btn3D = document.getElementById("btnMode3D");
  const btn2D = document.getElementById("btnMode2D");
  const wrap3D = document.getElementById("characterWorld");
  const wrap2D = document.getElementById("wrapper2D");
  const mannequin = document.getElementById("mannequinWidget");
  const zoom3D = document.getElementById("zoom3DVerticalControls");
  const floatingPill = document.querySelector(".floating-mode-pill");

  btn3D?.addEventListener("click", () => {
    btn3D.classList.add("active");
    btn2D?.classList.remove("active");
    if (wrap3D) wrap3D.style.display = "flex";
    if (wrap2D) wrap2D.style.display = "none";
    if (mannequin) mannequin.style.display = "flex";
    if (zoom3D) zoom3D.style.display = "flex";
    if (floatingPill) floatingPill.style.display = "flex";
    onRender3D();
    playSound("click");
  });

  btn2D?.addEventListener("click", () => {
    btn2D.classList.add("active");
    btn3D?.classList.remove("active");
    if (wrap3D) wrap3D.style.display = "none";
    if (wrap2D) wrap2D.style.display = "flex";
    if (mannequin) mannequin.style.display = "none";
    if (zoom3D) zoom3D.style.display = "none";
    if (floatingPill) floatingPill.style.display = "none";
    onRender2D();
    playSound("click");
  });

  // Template Buttons (Steve, Alex, Blank)
  const setTpl = (btn, type, model) => {
    document.querySelectorAll(".model-pill-item").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentModelType = model;
    onSetModel(model);
    onLoadTemplate(type, model);
    playSound("click");
  };

  document.getElementById("tplSteve")?.addEventListener("click", (e) => setTpl(e.currentTarget, "steve", "classic"));
  document.getElementById("tplAlex")?.addEventListener("click", (e) => setTpl(e.currentTarget, "alex", "slim"));
  document.getElementById("tplBlank")?.addEventListener("click", () => {
    onSetModel(currentModelType);
    onLoadTemplate("blank", currentModelType);
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
