/**
 * @file i18n.js
 * @description Zero-dependency client-side internationalization for mcskin.
 * Supports pt-BR, en, and es with automatic detection and persistence.
 */

export const SUPPORTED_LANGS = ["pt-BR", "en", "es"];
export const STORAGE_KEY = "mcskin_lang";

import { TRANSLATIONS } from "./i18n-locales.js";

let currentLanguage = "pt-BR";

export function detectLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LANGS.includes(saved)) {
      return saved;
    }
  } catch (_) {
    // Ignore localStorage failures
  }

  const langs = navigator.languages || [navigator.language || "en"];
  for (const raw of langs) {
    if (!raw) continue;
    const lower = raw.toLowerCase();
    if (lower.startsWith("pt")) return "pt-BR";
    if (lower.startsWith("es")) return "es";
  }
  return "en";
}

export function getLanguage() {
  return currentLanguage;
}

export function t(key, params = null) {
  const dict = TRANSLATIONS[currentLanguage] || TRANSLATIONS["en"];
  let str = dict[key] ?? TRANSLATIONS["en"][key] ?? key;
  if (params && typeof params === "object") {
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return str;
}

export function applyTranslations(root = (typeof document !== "undefined" ? document : null)) {
  if (!root || !root.querySelectorAll) return;

  root.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (key) el.textContent = t(key);
  });

  root.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    const specs = el.dataset.i18nAttr.split(";");
    for (const spec of specs) {
      const idx = spec.indexOf(":");
      if (idx === -1) continue;
      const attr = spec.slice(0, idx).trim();
      const key = spec.slice(idx + 1).trim();
      if (attr && key) {
        el.setAttribute(attr, t(key));
      }
    }
  });

  root.querySelectorAll("[data-lang-btn]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.langBtn === currentLanguage);
  });
}

export function setLanguage(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) {
    lang = "en";
  }
  currentLanguage = lang;
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, lang);
    }
  } catch (_) {
    // Ignore localStorage failures
  }
  if (typeof document !== "undefined") {
    applyTranslations(document);
  }
  if (typeof window !== "undefined" && typeof CustomEvent === "function") {
    window.dispatchEvent(new CustomEvent("mcskin:langchange", { detail: { lang } }));
  }
}

export function initI18n() {
  const detected = detectLanguage();
  currentLanguage = detected;
  if (typeof document !== "undefined") {
    applyTranslations(document);
  }
  return currentLanguage;
}
