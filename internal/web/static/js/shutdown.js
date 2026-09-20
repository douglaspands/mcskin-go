/**
 * @file shutdown.js
 * @description Manages discrete local web server shutdown with Minecraft-themed confirmation modal.
 */

/**
 * Initializes the discrete shutdown button and confirmation dialog.
 */
export function initShutdown() {
  const btnShutdown = document.getElementById("btnShutdownServer");
  const modal = document.getElementById("shutdownModal");
  const btnConfirm = document.getElementById("btnConfirmShutdown");
  const btnCancel = document.getElementById("btnCancelShutdown");
  const goodbyeOverlay = document.getElementById("goodbyeOverlay");

  if (!btnShutdown || !modal || !btnConfirm || !btnCancel) return;

  const showModal = () => { modal.style.display = "flex"; };
  const hideModal = () => { modal.style.display = "none"; };

  btnShutdown.addEventListener("click", showModal);
  btnCancel.addEventListener("click", hideModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) hideModal();
  });

  btnConfirm.addEventListener("click", async () => {
    btnConfirm.disabled = true;
    btnConfirm.textContent = "Desligando...";

    try {
      const res = await fetch("/api/shutdown", { method: "POST" });
      if (!res.ok) throw new Error("Falha ao desligar o servidor");

      hideModal();
      if (goodbyeOverlay) {
        goodbyeOverlay.style.display = "flex";
      }
    } catch (err) {
      alert("Não foi possível desligar o servidor: " + err.message);
      btnConfirm.disabled = false;
      btnConfirm.textContent = "✔️ Sim, Desligar";
    }
  });
}
