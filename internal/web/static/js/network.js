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
        text: text,
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
 * Initializes Wi-Fi info fetching, QR code presentation, copy URL button, and tablet modal.
 */
export function initNetwork() {
  const qrcodeCanvas = document.getElementById("qrcodeCanvas");
  const qrcodeCanvasGiant = document.getElementById("qrcodeCanvasGiant");
  const networkUrlDisplay = document.getElementById("networkUrlDisplay");
  const giantUrlDisplay = document.getElementById("giantUrlDisplay");
  const manualIpDisplay = document.getElementById("manualIpDisplay");
  const btnCopyUrl = document.getElementById("btnCopyUrl");
  const qrModal = document.getElementById("qrModal");
  const btnExpandQr = document.getElementById("btnExpandQr");
  const qrBoxClickable = document.getElementById("qrBoxClickable");
  const btnCloseQrModal = document.getElementById("btnCloseQrModal");

  const renderQR = (url) => {
    activeUrl = url;
    if (qrcodeCanvas) renderQRCodeToContainer(qrcodeCanvas, url, 220);
    if (qrcodeCanvasGiant) renderQRCodeToContainer(qrcodeCanvasGiant, url, 340);
    if (networkUrlDisplay) networkUrlDisplay.textContent = url;
    if (giantUrlDisplay) giantUrlDisplay.textContent = url;
    if (manualIpDisplay) manualIpDisplay.textContent = url.replace(/^https?:\/\//, "");
  };

  fetch("/api/info")
    .then((res) => res.json())
    .then((info) => {
      const targetUrl = info.preferredUrl || info.localUrl || activeUrl;
      renderQR(targetUrl);
    })
    .catch(() => renderQR(activeUrl));

  const openModal = () => {
    qrModal?.classList.add("active");
    playSound("click");
  };
  const closeModal = () => {
    qrModal?.classList.remove("active");
  };

  btnExpandQr?.addEventListener("click", openModal);
  qrBoxClickable?.addEventListener("click", openModal);
  btnCloseQrModal?.addEventListener("click", closeModal);
  qrModal?.addEventListener("click", (e) => { if (e.target === qrModal) closeModal(); });

  btnCopyUrl?.addEventListener("click", () => {
    const text = networkUrlDisplay?.textContent || activeUrl;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        btnCopyUrl.textContent = "✓ Copiado!";
        setTimeout(() => { btnCopyUrl.textContent = "📋 Copiar Endereço"; }, 2000);
      });
    } else {
      const input = document.createElement("input");
      input.value = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      btnCopyUrl.textContent = "✓ Copiado!";
      setTimeout(() => { btnCopyUrl.textContent = "📋 Copiar Endereço"; }, 2000);
    }
    playSound("click");
  });
}
