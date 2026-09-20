/**
 * @file network.js
 * @description Manages Wi-Fi network information, QR code generation, and tablet modal display.
 */

import { playSound } from "./fx.js";

let activeUrl = window.location.href;

/**
 * Renders QR code inside the target container.
 * Uses QRCode library if available; falls back to SVG image API or text.
 * @param {HTMLElement} container - DOM element to render QR code into.
 * @param {string} text - URL or data to encode.
 * @param {number} size - Square pixel dimension.
 */
export function renderQRCodeToContainer(container, text, size) {
  if (!container) return;
  container.innerHTML = "";

  if (window.QRCode) {
    try {
      new window.QRCode(container, {
        text,
        width: size,
        height: size,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: window.QRCode.CorrectLevel.M
      });
      return;
    } catch (e) {
      // Fallback to SVG image
    }
  }

  const encoded = encodeURIComponent(text);
  const img = document.createElement("img");
  img.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&margin=2&format=svg`;
  img.alt = "QR Code";
  img.onerror = () => {
    container.innerHTML = `<div style="padding: 10px; text-align: center; font-size: 0.82rem; color: #222; font-weight: bold;">Acesso direto:<br><span style="font-family: monospace; color: #2e6482; user-select: all;">${text}</span></div>`;
  };
  container.appendChild(img);
}

/**
 * Copies IP text to clipboard and gives visual button feedback.
 * @param {HTMLElement} btn - Button that triggered copy.
 * @param {string} text - Text to copy.
 */
function handleCopy(btn, text) {
  const doCopy = () => {
    const label = btn.querySelector(".copy-text-label");
    const icon = btn.querySelector(".copy-icon-glyph");
    const origText = label ? label.textContent : btn.textContent;
    const origIcon = icon ? icon.textContent : "";
    btn.classList.add("copied");
    if (label) label.textContent = "Copiado!";
    else btn.textContent = "✓ Copiado!";
    if (icon) icon.textContent = "✓";
    setTimeout(() => {
      btn.classList.remove("copied");
      if (label) label.textContent = origText;
      else btn.textContent = origText;
      if (icon) icon.textContent = origIcon;
    }, 2000);
  };

  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(doCopy).catch(() => {});
  } else {
    const input = document.createElement("input");
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
    doCopy();
  }
  playSound("click");
}

/**
 * Initializes Wi-Fi info fetching, QR code presentation, copy URL button, and tablet modal.
 */
export function initNetwork() {
  const sideQr = document.getElementById("sideQrcodeCanvas") || document.getElementById("qrcodeCanvas");
  const drawerQr = document.getElementById("drawerQrcodeCanvas");
  const giantQr = document.getElementById("qrcodeCanvasGiant");
  const sideIp = document.getElementById("sideWifiIp") || document.getElementById("networkUrlDisplay");
  const drawerIp = document.getElementById("drawerWifiIp");
  const giantIp = document.getElementById("giantUrlDisplay");
  const qrModal = document.getElementById("qrModal");
  const btnCloseQrModal = document.getElementById("btnCloseQrModal");

  const renderQR = (url) => {
    activeUrl = url;
    if (sideQr) renderQRCodeToContainer(sideQr, url, 120);
    if (drawerQr) renderQRCodeToContainer(drawerQr, url, 120);
    if (giantQr) renderQRCodeToContainer(giantQr, url, 220);
    if (sideIp) sideIp.textContent = url;
    if (drawerIp) drawerIp.textContent = url;
    if (giantIp) giantIp.textContent = url;
  };

  fetch("/api/info")
    .then((res) => res.json())
    .then((info) => {
      const targetUrl = info.preferredUrl || info.localUrl || activeUrl;
      renderQR(targetUrl);
    })
    .catch(() => renderQR(activeUrl));

  const openModal = () => {
    if (qrModal) {
      qrModal.style.display = "flex";
      qrModal.classList.add("open");
    }
    playSound("click");
  };
  const closeModal = () => {
    if (qrModal) {
      qrModal.style.display = "none";
      qrModal.classList.remove("open");
    }
  };

  document.getElementById("sideQrPreview")?.addEventListener("click", openModal);
  document.getElementById("drawerQrPreview")?.addEventListener("click", openModal);
  document.getElementById("drawerBtnQrModal")?.addEventListener("click", openModal);
  document.getElementById("btnExpandQr")?.addEventListener("click", openModal);
  btnCloseQrModal?.addEventListener("click", closeModal);
  qrModal?.addEventListener("click", (e) => { if (e.target === qrModal) closeModal(); });

  const btnCopySide = document.getElementById("btnCopyIpSide");
  btnCopySide?.addEventListener("click", () => handleCopy(btnCopySide, sideIp?.textContent || activeUrl));

  const btnCopyDrawer = document.getElementById("btnCopyIpDrawer");
  btnCopyDrawer?.addEventListener("click", () => handleCopy(btnCopyDrawer, drawerIp?.textContent || activeUrl));

  const btnCopyUrl = document.getElementById("btnCopyUrl");
  btnCopyUrl?.addEventListener("click", () => handleCopy(btnCopyUrl, sideIp?.textContent || activeUrl));
}
