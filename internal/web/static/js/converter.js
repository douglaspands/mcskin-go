/**
 * @file converter.js
 * @description Manages skin PNG upload, dropzone, character 2D preview, naming modal, and .mcpack conversion.
 */

import { playSound, launchConfetti } from "./fx.js";
import { processImageDimensions } from "./editor-file-loader.js";

let selectedFile = null;
let loadedImage = null;
let currentSkinName = "";
let hasConfirmedSkinName = false;
let pendingDownloadAction = null;
let selectedModel = "both";

export function updateSkinNameDisplays(name) {
  const display = name || "Sem nome";
  ["editorSkinNameDisplay", "editorCurrentNameText", "converterCurrentNameText"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = display;
  });
  const input = document.getElementById("converterSkinNameInput");
  if (input && name) input.value = name;
}

export function generateDefaultSkinName() {
  const now = new Date();
  const pad = (n) => (n < 10 ? "0" : "") + n;
  return `skin_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
}

export function sanitizeName(n) {
  return (n || "").replace(/[^a-zA-Z0-9_-]/g, "_").trim() || "custom_skin";
}

export function promptSkinName(suggestedName, actionCallback, forceModal) {
  if (typeof suggestedName === "function") {
    forceModal = actionCallback;
    actionCallback = suggestedName;
    suggestedName = null;
  }
  if (hasConfirmedSkinName && currentSkinName && !forceModal) {
    if (actionCallback) actionCallback(currentSkinName);
    return;
  }
  pendingDownloadAction = actionCallback;
  const nameToUse = sanitizeName(suggestedName || currentSkinName || generateDefaultSkinName());
  const modal = document.getElementById("skinNameModal");
  const input = document.getElementById("skinNameInput");
  if (input) input.value = nameToUse;
  if (modal) {
    modal.style.display = "flex";
    modal.classList.add("open");
    if (input) setTimeout(() => { input.focus(); input.select(); }, 50);
  }
}

export function renderSkinCharacter(img, model) {
  const canvas = document.getElementById("skinCanvas");
  if (!canvas || !img) return;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const isSlim = model === "slim";
  const armWidth = isSlim ? 3 : 4;
  const scale = img.width / 64;
  const px = 3.5;
  const originX = 48 - (isSlim ? 7.5 : 8) * px;
  const originY = 10;
  const drawPart = (sx, sy, sw, sh, dx, dy, dw, dh) => {
    ctx.drawImage(img, sx * scale, sy * scale, sw * scale, sh * scale, originX + dx * px, originY + dy * px, dw * px, dh * px);
  };

  drawPart(8, 8, 8, 8, isSlim ? 3.5 : 4, 0, 8, 8); // Head
  drawPart(40, 8, 8, 8, isSlim ? 3.5 : 4, 0, 8, 8); // Helmet
  drawPart(20, 20, 8, 12, isSlim ? 3.5 : 4, 8, 8, 12); // Torso
  if (img.height >= 64) drawPart(20, 36, 8, 12, isSlim ? 3.5 : 4, 8, 8, 12);
  drawPart(44, 20, armWidth, 12, isSlim ? 0.5 : 0, 8, armWidth, 12); // Right arm
  if (img.height >= 64) drawPart(44, 36, armWidth, 12, isSlim ? 0.5 : 0, 8, armWidth, 12);
  const armLeftX = isSlim ? 11.5 : 12;
  if (img.height >= 64) {
    drawPart(36, 52, armWidth, 12, armLeftX, 8, armWidth, 12);
    drawPart(52, 52, armWidth, 12, armLeftX, 8, armWidth, 12);
  } else {
    drawPart(44, 20, armWidth, 12, armLeftX, 8, armWidth, 12);
  }
  drawPart(4, 20, 4, 12, isSlim ? 3.5 : 4, 20, 4, 12); // Right leg
  if (img.height >= 64) drawPart(4, 36, 4, 12, isSlim ? 3.5 : 4, 20, 4, 12);
  const legLeftX = isSlim ? 7.5 : 8;
  if (img.height >= 64) {
    drawPart(20, 52, 4, 12, legLeftX, 20, 4, 12);
    drawPart(4, 52, 4, 12, legLeftX, 20, 4, 12);
  } else {
    drawPart(4, 20, 4, 12, legLeftX, 20, 4, 12);
  }
}

export function initConverter() {
  const getEl = (id) => document.getElementById(id);
  const dropzone = getEl("dropzone");
  const skinInput = getEl("skinInput");
  const previewBox = getEl("previewBox");
  const btnConvert = getEl("btnConvert");
  const nameField = getEl("converterSkinNameInput");

  const getActiveModel = () => selectedModel || "both";

  const showError = (msg) => {
    if (getEl("errorMessageText")) getEl("errorMessageText").innerHTML = msg;
    const err = getEl("errorBanner");
    if (err) { err.style.display = "block"; err.classList.add("active"); }
    const suc = getEl("successBanner");
    if (suc) { suc.style.display = "none"; suc.classList.remove("active"); }
  };

  const hideErrors = () => {
    const err = getEl("errorBanner");
    if (err) { err.style.display = "none"; err.classList.remove("active"); }
  };

  const closeSkinModal = () => {
    const modal = getEl("skinNameModal");
    if (modal) { modal.style.display = "none"; modal.classList.remove("open"); }
    pendingDownloadAction = null;
  };

  const confirmDownload = () => {
    const input = getEl("skinNameInput");
    let chosen = sanitizeName(input ? input.value : "");
    if (!chosen) chosen = currentSkinName || generateDefaultSkinName();
    currentSkinName = chosen;
    hasConfirmedSkinName = true;
    updateSkinNameDisplays(chosen);
    const cb = pendingDownloadAction;
    closeSkinModal();
    if (cb) cb(chosen);
  };

  getEl("btnCancelSkinName")?.addEventListener("click", closeSkinModal);
  getEl("skinNameModal")?.addEventListener("click", (e) => { if (e.target === getEl("skinNameModal")) closeSkinModal(); });
  getEl("btnConfirmSkinName")?.addEventListener("click", confirmDownload);
  getEl("skinNameInput")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") confirmDownload();
    else if (e.key === "Escape") closeSkinModal();
  });

  nameField?.addEventListener("input", (e) => {
    currentSkinName = sanitizeName(e.target.value);
    hasConfirmedSkinName = true;
  });

  document.querySelectorAll(".model-card-item").forEach((card) => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".model-card-item").forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
      selectedModel = card.dataset.model || "both";
      playSound("click");
      if (loadedImage) renderSkinCharacter(loadedImage, selectedModel);
    });
  });

  const handleFile = (file) => {
    hideErrors();
    if (!file.name.toLowerCase().endsWith(".png")) {
      showError("Por favor, selecione uma imagem no formato <strong>PNG</strong>!");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const { width: w, height: h } = img;
        const processed = processImageDimensions(img);
        if (!processed) {
          showError(`Tamanho inválido (<strong>${w}x${h} pixels</strong>). Skins precisam ter <strong>64x64</strong>, <strong>64x32</strong> ou <strong>128x128</strong> pixels!`);
          return;
        }

        const { canvas, targetW, targetH, isAI } = processed;
        let finalImage = img;
        if (isAI) {
          finalImage = canvas;
          canvas.toBlob((blob) => {
            selectedFile = new File([blob], file.name, { type: "image/png" });
            if (btnConvert) btnConvert.disabled = false;
          }, "image/png");
        } else {
          selectedFile = file;
          if (btnConvert) btnConvert.disabled = false;
        }

        loadedImage = finalImage;
        if (getEl("fileNameDisplay")) getEl("fileNameDisplay").textContent = file.name;
        if (getEl("fileDimsDisplay")) {
          getEl("fileDimsDisplay").textContent = isAI
            ? `${w} × ${h} ➔ ${targetW} × ${targetH} pixels (Ajustado para Bedrock)`
            : `${w} x ${h} pixels (${h === 32 ? "Clássica Antiga" : "RGBA Válido"})`;
        }
        currentSkinName = sanitizeName(file.name.replace(/\.[^/.]+$/, ""));
        hasConfirmedSkinName = false;
        updateSkinNameDisplays(currentSkinName);
        renderSkinCharacter(finalImage, getActiveModel());
        if (dropzone) dropzone.style.display = "none";
        if (previewBox) { previewBox.style.display = "flex"; previewBox.classList.add("active"); }
        playSound("click");
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  dropzone?.addEventListener("click", () => skinInput?.click());
  getEl("btnChangeSkin")?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (previewBox) { previewBox.style.display = "none"; previewBox.classList.remove("active"); }
    if (dropzone) dropzone.style.display = "flex";
    if (skinInput) skinInput.value = "";
    selectedFile = null;
    loadedImage = null;
    if (btnConvert) btnConvert.disabled = true;
    hideErrors();
    const suc = getEl("successBanner");
    if (suc) { suc.style.display = "none"; suc.classList.remove("active"); }
    playSound("click");
  });

  dropzone?.addEventListener("dragover", (e) => { e.preventDefault(); dropzone.classList.add("dragover"); });
  dropzone?.addEventListener("dragleave", (e) => { e.preventDefault(); dropzone.classList.remove("dragover"); });
  dropzone?.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    if (e.dataTransfer?.files.length) handleFile(e.dataTransfer.files[0]);
  });
  skinInput?.addEventListener("change", () => { if (skinInput.files.length) handleFile(skinInput.files[0]); });

  btnConvert?.addEventListener("click", () => {
    if (!selectedFile) return;
    const finalName = sanitizeName(nameField?.value || currentSkinName || selectedFile.name.replace(/\.[^/.]+$/, ""));
    btnConvert.disabled = true;
    btnConvert.innerHTML = "<span>⏳ CRIANDO PACOTE...</span>";
    hideErrors();
    const suc = getEl("successBanner");
    if (suc) { suc.style.display = "none"; suc.classList.remove("active"); }

    const formData = new FormData();
    formData.append("skin", selectedFile, finalName + ".png");
    formData.append("name", finalName);
    formData.append("model", getActiveModel());

    fetch("/api/convert", { method: "POST", body: formData })
      .then((res) => {
        if (!res.ok) return res.json().then((d) => { throw new Error(d.error || "Erro ao gerar arquivo"); });
        return res.blob();
      })
      .then((blob) => {
        playSound("success");
        launchConfetti();
        const cleanName = finalName + ".mcpack";
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = cleanName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        if (getEl("demoSuccessFileName")) getEl("demoSuccessFileName").textContent = cleanName;
        const fallback = getEl("downloadFallbackBtn");
        if (fallback) { fallback.href = blobUrl; fallback.download = cleanName; }
        if (suc) { suc.style.display = "flex"; suc.classList.add("active"); }
        btnConvert.disabled = false;
        btnConvert.innerHTML = "<span>⚡ CRIAR PACOTE .MCPACK ⚡</span>";
      })
      .catch((err) => {
        showError(err.message);
        btnConvert.disabled = false;
        btnConvert.innerHTML = "<span>⚡ CRIAR PACOTE .MCPACK ⚡</span>";
      });
  });
}
