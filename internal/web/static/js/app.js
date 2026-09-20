/**
 * @file app.js
 * @description Main orchestrator initializing modules and tab switching using native ES6 imports.
 */

import { initShutdown } from "./shutdown.js";
import { initNetwork } from "./network.js";
import { initConverter, updateSkinNameDisplays, sanitizeName } from "./converter.js";
import { initEditor3D, set3DModel, getViewport3D } from "./editor3d.js";
import {
  initEditor2D,
  loadTemplate,
  syncTexture,
  paintPixel,
  pushUndo,
  render2DSheet,
  textureCanvas,
  textureCtx
} from "./editor2d.js";
import { initPalette, getToolState, setColor } from "./palette.js";
import { playSound } from "./fx.js";

document.addEventListener("DOMContentLoaded", () => {
  initShutdown();
  initNetwork();
  initConverter();

  let editorInitialized = false;
  const initEditor = () => {
    if (editorInitialized) return;
    editorInitialized = true;

    initEditor3D({
      onPaintPixel: (x, y) => paintPixel(x, y, { ...getToolState(), onPickColor: setColor }),
      onPushUndo: pushUndo,
      getTouchMode: () => getToolState().touchMode,
      getCurrentLayer: () => getToolState().currentLayer
    });

    initEditor2D({
      getToolState,
      onPickColor: setColor
    });

    initPalette({
      onLoadTemplate: (type, model) => loadTemplate(type, model),
      onSetModel: (model) => set3DModel(model),
      onRender2D: render2DSheet,
      onRender3D: () => getViewport3D()?.render(),
      onUploadTexture: (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            pushUndo();
            textureCanvas.width = img.width;
            textureCanvas.height = img.height;
            textureCtx.clearRect(0, 0, img.width, img.height);
            textureCtx.drawImage(img, 0, 0);
            syncTexture();
            updateSkinNameDisplays(sanitizeName(file.name.replace(/\.[^/.]+$/, "")));
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    });

    loadTemplate("steve", "classic");
  };

  // Tab Navigation (Converter vs 3D Creator)
  const tabConv = document.getElementById("tabConverter");
  const tabEdit = document.getElementById("tabEditor");
  const viewConv = document.getElementById("viewConverter");
  const viewEdit = document.getElementById("viewEditor");

  tabConv?.addEventListener("click", () => {
    tabConv.classList.add("active");
    tabEdit?.classList.remove("active");
    if (viewConv) viewConv.classList.add("active");
    if (viewEdit) viewEdit.classList.remove("active");
    playSound("click");
  });

  tabEdit?.addEventListener("click", () => {
    tabEdit.classList.add("active");
    tabConv?.classList.remove("active");
    if (viewEdit) viewEdit.classList.add("active");
    if (viewConv) viewConv.classList.remove("active");
    initEditor();
    getViewport3D()?.render();
    playSound("click");
  });
});
