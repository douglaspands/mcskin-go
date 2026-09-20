/**
 * @file converter.js
 * @description Manages skin PNG upload, dropzone, character 2D preview, naming modal, and .mcpack conversion.
 */

import { playSound, launchConfetti } from "./fx.js";

let selectedFile = null, loadedImage = null, currentSkinName = "", hasConfirmedSkinName = false, pendingDownloadAction = null;

export function updateSkinNameDisplays(name) {
  const display = name || "Sem nome";
  ["editorSkinNameDisplay", "editorCurrentNameText", "converterCurrentNameText"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = display;
  });
  const convBadge = document.getElementById("converterSkinNameBadge"), edPill = document.getElementById("editorNamePill");
  if (convBadge) convBadge.style.display = name ? "inline-flex" : "none";
  if (edPill) edPill.style.display = name ? "flex" : "none";
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
  const modal = document.getElementById("skinNameModal"), input = document.getElementById("skinNameInput");
  if (input) input.value = nameToUse;
  if (modal) {
    modal.style.display = "flex";
    if (input) setTimeout(() => { input.focus(); input.select(); }, 50);
  }
}

export function renderSkinCharacter(img, model) {
  const canvas = document.getElementById("skinCanvas");
  if (!canvas || !img) return;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const isSlim = model === "slim", armWidth = isSlim ? 3 : 4, scale = img.width / 64, px = 3.5;
  const originX = 48 - (isSlim ? 7.5 : 8) * px, originY = 10;
  const drawPart = (sx, sy, sw, sh, dx, dy, dw, dh) => {
    ctx.drawImage(img, sx * scale, sy * scale, sw * scale, sh * scale, originX + dx * px, originY + dy * px, dw * px, dh * px);
  };

  drawPart(8, 8, 8, 8, isSlim ? 3.5 : 4, 0, 8, 8); // Head base
  drawPart(40, 8, 8, 8, isSlim ? 3.5 : 4, 0, 8, 8); // Head helmet
  drawPart(20, 20, 8, 12, isSlim ? 3.5 : 4, 8, 8, 12); // Torso base
  if (img.height >= 64) drawPart(20, 36, 8, 12, isSlim ? 3.5 : 4, 8, 8, 12);
  drawPart(44, 20, armWidth, 12, isSlim ? 0.5 : 0, 8, armWidth, 12); // Right arm base
  if (img.height >= 64) drawPart(44, 36, armWidth, 12, isSlim ? 0.5 : 0, 8, armWidth, 12);
  const armLeftX = isSlim ? 11.5 : 12;
  if (img.height >= 64) {
    drawPart(36, 52, armWidth, 12, armLeftX, 8, armWidth, 12);
    drawPart(52, 52, armWidth, 12, armLeftX, 8, armWidth, 12);
  } else {
    drawPart(44, 20, armWidth, 12, armLeftX, 8, armWidth, 12);
  }
  drawPart(4, 20, 4, 12, isSlim ? 3.5 : 4, 20, 4, 12); // Right leg base
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
  const dropzone = getEl("dropzone"), skinInput = getEl("skinInput");
  const getSelectedModel = () => document.querySelector("input[name=model]:checked")?.value || "both";
  const showError = (msg) => {
    if (getEl("errorMessageText")) getEl("errorMessageText").innerHTML = msg;
    getEl("errorBanner")?.classList.add("active");
    getEl("successBanner")?.classList.remove("active");
  };
  const hideErrors = () => getEl("errorBanner")?.classList.remove("active");

  const closeSkinModal = () => { if (getEl("skinNameModal")) getEl("skinNameModal").style.display = "none"; pendingDownloadAction = null; };
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

  ["btnConverterRename", "btnEditSkinName", "btnRenameSkin"].forEach((id) => {
    getEl(id)?.addEventListener("click", () => promptSkinName(currentSkinName, null, true));
  });

  document.querySelectorAll(".model-card").forEach((card) => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".model-card").forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
      const radio = card.querySelector("input[type=radio]");
      if (radio) radio.checked = true;
      playSound("click");
      if (loadedImage) renderSkinCharacter(loadedImage, getSelectedModel());
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
        if ((w !== 64 || (h !== 64 && h !== 32)) && (w !== 128 || h !== 128)) {
          showError(`Tamanho inválido (<strong>${w}x${h} pixels</strong>). Skins precisam ter <strong>64x64</strong>, <strong>64x32</strong> ou <strong>128x128</strong> pixels!`);
          return;
        }
        selectedFile = file; loadedImage = img;
        if (getEl("fileNameDisplay")) getEl("fileNameDisplay").textContent = file.name;
        if (getEl("fileDimsDisplay")) getEl("fileDimsDisplay").textContent = `${w} x ${h} pixels (${h === 32 ? "Clássica Antiga" : "Moderna HD"})`;
        currentSkinName = sanitizeName(file.name.replace(/\.[^/.]+$/, ""));
        hasConfirmedSkinName = false;
        updateSkinNameDisplays(currentSkinName);
        renderSkinCharacter(img, getSelectedModel());
        getEl("previewBox")?.classList.add("active");
        if (getEl("btnConvert")) getEl("btnConvert").disabled = false;
        playSound("click");
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  dropzone?.addEventListener("click", () => skinInput?.click());
  getEl("btnChangeSkin")?.addEventListener("click", () => skinInput?.click());
  dropzone?.addEventListener("dragover", (e) => { e.preventDefault(); dropzone.classList.add("dragover"); });
  dropzone?.addEventListener("dragleave", (e) => { e.preventDefault(); dropzone.classList.remove("dragover"); });
  dropzone?.addEventListener("drop", (e) => {
    e.preventDefault(); dropzone.classList.remove("dragover");
    if (e.dataTransfer?.files.length) handleFile(e.dataTransfer.files[0]);
  });
  skinInput?.addEventListener("change", () => { if (skinInput.files.length) handleFile(skinInput.files[0]); });

  getEl("btnConvert")?.addEventListener("click", () => {
    if (!selectedFile) return;
    promptSkinName(currentSkinName || selectedFile.name.replace(/\.[^/.]+$/, ""), (confirmedName) => {
      const btn = getEl("btnConvert");
      if (btn) { btn.disabled = true; btn.innerHTML = "<span>⏳ CRIANDO PACOTE...</span>"; }
      hideErrors(); getEl("successBanner")?.classList.remove("active");

      const formData = new FormData();
      formData.append("skin", selectedFile, confirmedName + ".png");
      formData.append("name", confirmedName);
      formData.append("model", getSelectedModel());

      fetch("/api/convert", { method: "POST", body: formData })
        .then((res) => {
          if (!res.ok) return res.json().then((d) => { throw new Error(d.error || "Erro ao gerar arquivo"); });
          return res.blob();
        })
        .then((blob) => {
          playSound("success"); launchConfetti();
          const cleanName = confirmedName + ".mcpack", blobUrl = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = blobUrl; a.download = cleanName;
          document.body.appendChild(a); a.click(); document.body.removeChild(a);

          const fallback = getEl("downloadFallbackBtn");
          if (fallback) { fallback.href = blobUrl; fallback.download = cleanName; }
          getEl("successBanner")?.classList.add("active");
          if (btn) { btn.disabled = false; btn.innerHTML = "<span>⚡ BAIXAR PACOTE .MCPACK! ⚡</span>"; }
        })
        .catch((err) => {
          showError(err.message);
          if (btn) { btn.disabled = false; btn.innerHTML = "<span>⚡ BAIXAR PACOTE .MCPACK! ⚡</span>"; }
        });
    });
  });
}
