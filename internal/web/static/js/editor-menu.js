/**
 * @file editor-menu.js
 * @description Editor navigation submenu expand/collapse, desktop sidebar /
 * mobile drawer state sync, mobile drawer open/close, and the "Nova Skin"
 * preset selection modal.
 */

import { playSound } from "./fx.js";

let closeDrawerFn = null;

/** @private */
function setSubmenuExpanded(expanded) {
  const sideSub = document.getElementById("sideSubmenu");
  const drawerSub = document.getElementById("drawerSubmenu");
  const sideArrow = document.getElementById("sideNavArrow");
  const drawerArrow = document.getElementById("drawerNavArrow");

  if (sideSub) sideSub.classList.toggle("collapsed", !expanded);
  if (drawerSub) drawerSub.classList.toggle("collapsed", !expanded);
  if (sideArrow) sideArrow.textContent = expanded ? "▾" : "▸";
  if (drawerArrow) drawerArrow.textContent = expanded ? "▾" : "▸";
}

/** @private */
function syncNavState(target) {
  const isConv = target === "viewConverter";
  document.getElementById("tabBtnConverter")?.classList.toggle("active", isConv);
  document.getElementById("tabBtnEditor")?.classList.toggle("active", !isConv);

  document.getElementById("sideBtnConv")?.classList.toggle("active", isConv);
  document.getElementById("sideBtnEdit")?.classList.toggle("active", !isConv);

  document.getElementById("drawerItemConv")?.classList.toggle("active", isConv);
  document.getElementById("drawerItemEdit")?.classList.toggle("active", !isConv);

  setSubmenuExpanded(!isConv);
}

/** @private */
function bindDrawer() {
  const backdrop = document.getElementById("drawerBackdrop");
  const panel = document.getElementById("drawerPanel");
  const hamburger = document.getElementById("btnHamburger");
  const closeBtn = document.getElementById("btnCloseDrawer");
  const sideMenu = document.getElementById("desktopSidebarMenu");
  const btnCollapse = document.getElementById("btnCollapseDesktopSidebar");

  const open = () => {
    backdrop?.classList.add("open");
    panel?.classList.add("open");
    playSound("click");
  };
  const close = () => {
    backdrop?.classList.remove("open");
    panel?.classList.remove("open");
  };

  hamburger?.addEventListener("click", () => {
    if (window.innerWidth >= 1024 && sideMenu) {
      sideMenu.classList.toggle("hidden");
      playSound("click");
    } else {
      open();
    }
  });

  btnCollapse?.addEventListener("click", () => {
    sideMenu?.classList.add("hidden");
    playSound("click");
  });

  closeBtn?.addEventListener("click", close);
  backdrop?.addEventListener("click", close);
  closeDrawerFn = close;
}

/** @private */
function bindSubmenuActions(prefix) {
  document.getElementById(`${prefix}BtnNewSkin`)?.addEventListener("click", () => {
    openPresetModal();
    closeDrawerFn?.();
  });
  document.getElementById(`${prefix}BtnOpenSkin`)?.addEventListener("click", () => {
    document.getElementById("editorFileInput")?.click();
    closeDrawerFn?.();
  });
  document.getElementById(`${prefix}BtnSavePng`)?.addEventListener("click", () => {
    document.getElementById("btnDownloadPng")?.click();
    closeDrawerFn?.();
  });
  document.getElementById(`${prefix}BtnDownloadMcpack`)?.addEventListener("click", () => {
    document.getElementById("btnEditorConvert")?.click();
    closeDrawerFn?.();
  });
}

/** @private */
function openPresetModal() {
  const modal = document.getElementById("modalNewSkin") || document.getElementById("newSkinModal");
  if (modal) {
    modal.style.display = "flex";
    modal.classList.add("open");
  }
}

/** @private */
function closePresetModal() {
  const modal = document.getElementById("modalNewSkin") || document.getElementById("newSkinModal");
  if (modal) {
    modal.style.display = "none";
    modal.classList.remove("open");
  }
}

/** @private */
function bindPresetModal() {
  const modal = document.getElementById("modalNewSkin") || document.getElementById("newSkinModal");
  if (!modal) return;

  const presetToTemplateBtn = {
    steve: "tplSteve",
    alex: "tplAlex",
    blank: "tplBlank",
  };

  modal.querySelectorAll(".btn-preset-option").forEach((btn) => {
    btn.addEventListener("click", () => {
      const templateBtnId = presetToTemplateBtn[btn.dataset.preset];
      document.getElementById(templateBtnId)?.click();
      closePresetModal();
    });
  });

  document.getElementById("btnCancelNewModal")?.addEventListener("click", closePresetModal);
  document.getElementById("btnCloseNewModal")?.addEventListener("click", closePresetModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closePresetModal();
  });
}

/**
 * Initializes editor navigation submenu, sidebar/drawer sync, and the
 * "Nova Skin" preset modal.
 */
export function initEditorMenu() {
  bindDrawer();
  bindSubmenuActions("side");
  bindSubmenuActions("drawer");
  bindPresetModal();

  const toggleEditorOrSubmenu = () => {
    const editor = document.getElementById("viewEditor");
    const isEditorActive = editor?.classList.contains("active") && editor?.style.display !== "none";
    if (isEditorActive) {
      const sideSub = document.getElementById("sideSubmenu");
      const isCollapsed = sideSub?.classList.contains("collapsed");
      setSubmenuExpanded(isCollapsed);
    } else {
      document.getElementById("tabBtnEditor")?.click();
    }
    closeDrawerFn?.();
    playSound("click");
  };

  document.getElementById("sideBtnEdit")?.addEventListener("click", toggleEditorOrSubmenu);
  document.getElementById("drawerItemEdit")?.addEventListener("click", toggleEditorOrSubmenu);

  document.getElementById("sideBtnConv")?.addEventListener("click", () => {
    document.getElementById("tabBtnConverter")?.click();
    closeDrawerFn?.();
    playSound("click");
  });
  document.getElementById("drawerItemConv")?.addEventListener("click", () => {
    document.getElementById("tabBtnConverter")?.click();
    closeDrawerFn?.();
    playSound("click");
  });

  document.getElementById("btnSideFullscreen")?.addEventListener("click", () => {
    document.getElementById("btnHeaderFullscreen")?.click();
  });

  document.getElementById("tabBtnConverter")?.addEventListener("click", () => syncNavState("viewConverter"));
  document.getElementById("tabBtnEditor")?.addEventListener("click", () => syncNavState("viewEditor"));
}
