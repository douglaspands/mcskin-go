/**
 * @file editor-exporter.js
 * @description Handles PNG download and .mcpack conversion from the editor.
 */

import { playSound, launchConfetti } from "./fx.js";
import { promptSkinName } from "./converter.js";

/**
 * Returns a canvas scaled to the target resolution for export (never upsamples).
 * @param {HTMLCanvasElement} textureCanvas
 * @param {number} targetRes
 * @param {number} texW
 * @returns {HTMLCanvasElement}
 */
export function getExportCanvas(textureCanvas, targetRes, texW) {
  if (targetRes >= texW) return textureCanvas;
  const c = document.createElement("canvas");
  c.width = c.height = targetRes;
  const ctx = c.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(textureCanvas, 0, 0, targetRes, targetRes);
  return c;
}

/**
 * Binds the editor PNG download and .mcpack conversion button listeners.
 * @param {object} opts
 * @param {HTMLCanvasElement} opts.textureCanvas
 * @param {() => number} opts.getTexW
 * @param {() => object} opts.getToolState
 */
export function bindEditorExports({ textureCanvas, getTexW, getToolState }) {
  document.getElementById("btnDownloadPng")?.addEventListener("click", () => {
    const texW = getTexW();
    promptSkinName((name, resChoice) => {
      const exportCanvas = getExportCanvas(textureCanvas, resChoice, texW);
      const a = document.createElement("a");
      a.href = exportCanvas.toDataURL("image/png");
      a.download = `${name}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      playSound("click");
    }, { isHD: texW === 128 });
  });

  document.getElementById("btnEditorConvert")?.addEventListener("click", () => {
    const texW = getTexW();
    promptSkinName((name, resChoice) => {
      const btn = document.getElementById("btnEditorConvert");
      if (btn) { btn.disabled = true; btn.innerHTML = "<span>⏳ CRIANDO PACOTE...</span>"; }
      playSound("click");
      const exportCanvas = getExportCanvas(textureCanvas, resChoice, texW);
      exportCanvas.toBlob((blob) => {
        if (!blob) {
          if (btn) { btn.disabled = false; btn.innerHTML = "<span>⚡ CRIAR PACOTE .MCPACK! ⚡</span>"; }
          return;
        }
        const fd = new FormData();
        fd.append("skin", blob, `${name}.png`);
        fd.append("name", name);
        fd.append("model", getToolState().currentModelType);
        fetch("/api/convert", { method: "POST", body: fd })
          .then((r) => (r.ok ? r.blob() : r.json().then((e) => { throw new Error(e.error || "Erro"); })))
          .then((b) => {
            const url = URL.createObjectURL(b);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${name}.mcpack`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            playSound("success");
            launchConfetti();
            const banner = document.getElementById("editorSuccessBanner");
            const msg = document.getElementById("editorSuccessMsg");
            if (banner && msg) {
              msg.innerHTML = `Seu pacote <strong>${name}.mcpack</strong> foi baixado com sucesso!`;
              banner.style.display = "block";
            }
          })
          .catch((err) => alert(err.message))
          .finally(() => {
            if (btn) { btn.disabled = false; btn.innerHTML = "<span>⚡ CRIAR PACOTE .MCPACK! ⚡</span>"; }
          });
      }, "image/png");
    }, { isHD: texW === 128 });
  });
}
