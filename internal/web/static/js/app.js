/**
 * @file app.js
 * @description Main orchestrator initializing modules and tab switching using native ES6 imports.
 */

import { initShutdown } from "./shutdown.js";
import { initNetwork } from "./network.js";
import { initI18n, setLanguage } from "./i18n.js";
import { initConverter, updateSkinNameDisplays, sanitizeName } from "./converter.js";
import { initEditor3D, set3DModel, getViewport3D } from "./editor3d.js";
import {
  initEditor2D,
  loadTemplate,
  setTextureResolution,
  syncTexture,
  paintPixel,
  pushUndo,
  resetLastPaintedCoord,
  render2DSheet,
  textureCanvas,
  textureCtx
} from "./editor2d.js";
import { initPalette, getToolState, setColor, setModelType } from "./palette.js";
import { playSound } from "./fx.js";
import { initEditorLayout, setDockHint } from "./editor-layout.js";
import { initEditorMenu } from "./editor-menu.js";
import { loadSkinFile } from "./editor-file-loader.js";

document.addEventListener("DOMContentLoaded", () => {
  initI18n();
  initShutdown();
  initNetwork();
  initConverter();
  initEditorMenu();
  initEditorLayout({ getViewport3D });

  document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.dataset.langBtn;
      if (lang) {
        setLanguage(lang);
        playSound("click");
      }
    });
  });

  let editorInitialized = false;
  const initEditor = () => {
    if (editorInitialized) return;
    editorInitialized = true;

    initEditor3D({
      onPaintPixel: (x, y) => paintPixel(x, y, { ...getToolState(), onPickColor: setColor }),
      onPushUndo: pushUndo,
      onResetCoord: resetLastPaintedCoord,
      getTouchMode: () => getToolState().touchMode,
      getCurrentLayer: () => getToolState().currentLayer
    });

    initEditor2D({
      getToolState,
      onPickColor: setColor
    });

    initPalette({
      onLoadTemplate: (type, model) => {
        setTextureResolution(64, 64);
        loadTemplate(type, model);
      },
      onSetModel: (model) => set3DModel(model),
      onRender2D: render2DSheet,
      onRender3D: () => getViewport3D()?.render(),
      onUploadTexture: (file) => {
        loadSkinFile(file)
          .then(({ canvas, width, height, model, isAI, isHighRes }) => {
            setTextureResolution(width, height);
            pushUndo();
            textureCtx.clearRect(0, 0, width, height);
            textureCtx.drawImage(canvas, 0, 0);
            syncTexture();
            set3DModel(model);
            setModelType(model);
            getViewport3D()?.render();
            updateSkinNameDisplays(sanitizeName(file.name.replace(/\.[^/.]+$/, "")));
            const msg = (isAI || isHighRes) && width === 128
              ? `✅ Imagem importada com sucesso em HD (128x128)! Modelo: ${model === "slim" ? "Alex" : "Steve"}.`
              : `✅ Skin carregada! Modelo: ${model === "slim" ? "Alex (fino)" : "Steve (clássico)"}.`;
            setDockHint(msg, "📂", "Carregada");
          })
          .catch((err) => setDockHint(`⚠️ ${err.message}`, "⚠️", "Erro"));
      }
    });

    loadTemplate("steve", "classic");
  };

  // Tab Navigation (Converter vs 3D Creator)
  const tabConv = document.getElementById("tabBtnConverter") || document.getElementById("tabConverter");
  const tabEdit = document.getElementById("tabBtnEditor") || document.getElementById("tabEditor");
  const viewConv = document.getElementById("viewConverter");
  const viewEdit = document.getElementById("viewEditor");

  tabConv?.addEventListener("click", () => {
    tabConv.classList.add("active");
    tabEdit?.classList.remove("active");
    if (viewConv) { viewConv.style.display = "flex"; viewConv.classList.add("active"); }
    if (viewEdit) { viewEdit.style.display = "none"; viewEdit.classList.remove("active"); }
    playSound("click");
  });

  tabEdit?.addEventListener("click", () => {
    tabEdit.classList.add("active");
    tabConv?.classList.remove("active");
    if (viewEdit) { viewEdit.style.display = "flex"; viewEdit.classList.add("active"); }
    if (viewConv) { viewConv.style.display = "none"; viewConv.classList.remove("active"); }
    initEditor();
    getViewport3D()?.render();
    playSound("click");
  });

  // Editor is active by default matching prototype
  initEditor();
});
