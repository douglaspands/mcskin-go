/**
 * @file palette.js
 * @description Manages Minecraft color swatches, custom picker, tool modes, layers, and template selectors.
 */

import { playSound } from "./fx.js";

export const mcColors = [
  { name: "Grama", color: "#5da632" },
  { name: "Terra", color: "#866043" },
  { name: "Pedra", color: "#7d7d7d" },
  { name: "Diamante", color: "#4deeea" },
  { name: "Ouro", color: "#fecb00" },
  { name: "Redstone", color: "#ff4757" },
  { name: "Lápis-Lazúli", color: "#2f56b5" },
  { name: "Carvão", color: "#222222" },
  { name: "Slime", color: "#7cd332" },
  { name: "Pele 1", color: "#f1c27d" },
  { name: "Pele 2", color: "#d39a74" },
  { name: "Pele 3", color: "#8d5524" },
  { name: "Azul Olho", color: "#2980b9" },
  { name: "Branco", color: "#ffffff" },
  { name: "Preto", color: "#000000" },
  { name: "Madeira", color: "#a0522d" },
  { name: "Água", color: "#1e90ff" },
  { name: "Lava", color: "#ff4500" }
];

let currentColor = "#5da632";
let currentTool = "pencil";
let currentLayer = "base";
let touchMode = "paint";
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
  if (picker) picker.value = hex;
  if (box) box.style.background = hex;
};

/**
 * Initializes palette swatches, tools, layer toggles, and template controls.
 */
export function initPalette({ onLoadTemplate, onSetModel, onRender2D, onRender3D, onUploadTexture }) {
  const grid = document.getElementById("paletteGrid");
  if (grid) {
    grid.innerHTML = "";
    mcColors.forEach((item, idx) => {
      const swatch = document.createElement("button");
      swatch.type = "button";
      swatch.className = `color-swatch${idx === 0 ? " active" : ""}`;
      swatch.style.background = item.color;
      swatch.title = item.name;
      swatch.addEventListener("click", () => {
        document.querySelectorAll(".color-swatch").forEach((s) => s.classList.remove("active"));
        swatch.classList.add("active");
        setColor(item.color);
        playSound("click");
      });
      grid.appendChild(swatch);
    });
  }

  document.getElementById("customColorPicker")?.addEventListener("input", (e) => {
    currentColor = e.target.value;
    const box = document.getElementById("currentColorBox");
    if (box) box.style.background = currentColor;
    document.querySelectorAll(".color-swatch").forEach((s) => s.classList.remove("active"));
  });

  // Tools (Pencil, Bucket, Eraser, Pipette)
  ["toolPencil", "toolBucket", "toolEraser", "toolPipette"].forEach((id) => {
    const btn = document.getElementById(id);
    btn?.addEventListener("click", () => {
      ["toolPencil", "toolBucket", "toolEraser", "toolPipette"].forEach((i) => document.getElementById(i)?.classList.remove("active"));
      btn.classList.add("active");
      currentTool = id.replace("tool", "").toLowerCase();
      playSound("click");
    });
  });

  // Layers & Glass Mode
  const btnBase = document.getElementById("btnLayerBase");
  const btnOverlay = document.getElementById("btnLayerOverlay");
  btnBase?.addEventListener("click", () => {
    currentLayer = "base";
    btnBase.classList.add("active");
    btnOverlay?.classList.remove("active");
    playSound("click");
  });
  btnOverlay?.addEventListener("click", () => {
    currentLayer = "overlay";
    btnOverlay.classList.add("active");
    btnBase?.classList.remove("active");
    playSound("click");
  });
  document.getElementById("chkGlassMode")?.addEventListener("change", (e) => {
    isGlassMode = e.target.checked;
    playSound("click");
  });

  // Touch Mode (Paint vs Rotate)
  const btnPaint = document.getElementById("btnTouchPaint");
  const btnRotate = document.getElementById("btnTouchRotate");
  btnPaint?.addEventListener("click", () => {
    touchMode = "paint";
    btnPaint.classList.add("active");
    btnRotate?.classList.remove("active");
    playSound("click");
  });
  btnRotate?.addEventListener("click", () => {
    touchMode = "rotate";
    btnRotate.classList.add("active");
    btnPaint?.classList.remove("active");
    playSound("click");
  });

  // View Mode (3D vs 2D)
  const btn3D = document.getElementById("btnMode3D");
  const btn2D = document.getElementById("btnMode2D");
  const wrap3D = document.getElementById("wrapper3D");
  const wrap2D = document.getElementById("wrapper2D");
  btn3D?.addEventListener("click", () => {
    btn3D.classList.add("active");
    btn2D?.classList.remove("active");
    if (wrap3D) wrap3D.style.display = "flex";
    if (wrap2D) wrap2D.style.display = "none";
    onRender3D();
    playSound("click");
  });
  btn2D?.addEventListener("click", () => {
    btn2D.classList.add("active");
    btn3D?.classList.remove("active");
    if (wrap2D) wrap2D.style.display = "flex";
    if (wrap3D) wrap3D.style.display = "none";
    onRender2D();
    playSound("click");
  });

  // Template Buttons (Steve, Alex, Blank)
  const setTpl = (btn, type, model) => {
    document.querySelectorAll(".btn-template").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentModelType = model;
    onSetModel(model);
    onLoadTemplate(type, model);
    playSound("click");
  };
  document.getElementById("tplSteve")?.addEventListener("click", (e) => setTpl(e.currentTarget, "steve", "classic"));
  document.getElementById("tplAlex")?.addEventListener("click", (e) => setTpl(e.currentTarget, "alex", "slim"));
  document.getElementById("tplBlank")?.addEventListener("click", (e) => setTpl(e.currentTarget, "blank", currentModelType));

  // New & Upload Skin
  document.getElementById("btnNewSkin")?.addEventListener("click", () => {
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
