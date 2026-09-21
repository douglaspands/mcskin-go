import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  SUPPORTED_LANGS,
  STORAGE_KEY,
  detectLanguage,
  getLanguage,
  setLanguage,
  t,
  applyTranslations,
} from '../internal/web/static/js/i18n.js';
import { TRANSLATIONS } from '../internal/web/static/js/i18n-locales.js';

describe('i18n Module: Zero-dependency Translations & Detection', () => {
  beforeEach(() => {
    setLanguage('pt-BR');
  });

  describe('Supported Languages & Defaults', () => {
    it('supports pt-BR, en, and es', () => {
      assert.deepEqual(SUPPORTED_LANGS, ['pt-BR', 'en', 'es']);
      assert.equal(STORAGE_KEY, 'mcskin_lang');
    });

    it('defaults to pt-BR on reset', () => {
      assert.equal(getLanguage(), 'pt-BR');
    });
  });

  describe('Translation Lookup & Fallbacks', () => {
    it('returns accurate translations for all supported languages', () => {
      setLanguage('pt-BR');
      assert.equal(t('app_title'), 'CRIE SKINS LEGAIS');
      assert.equal(t('menu_title'), 'MENU');
      assert.equal(t('btn_close'), 'Fechar');

      setLanguage('en');
      assert.equal(t('app_title'), 'CREATE COOL SKINS');
      assert.equal(t('menu_title'), 'MENU');
      assert.equal(t('btn_close'), 'Close');

      setLanguage('es');
      assert.equal(t('app_title'), 'CREA SKINS GENIALES');
      assert.equal(t('menu_title'), 'MENÚ');
      assert.equal(t('btn_close'), 'Cerrar');
    });

    it('falls back to key if translation is missing in active and fallback languages', () => {
      assert.equal(t('completely_non_existent_key_xyz'), 'completely_non_existent_key_xyz');
    });

    it('interpolates {params} accurately', () => {
      setLanguage('pt-BR');
      const formatted = t('app_title', { ignore: 'none' });
      assert.equal(formatted, 'CRIE SKINS LEGAIS');
    });
  });

  describe('Catalog Parity & Symmetry', () => {
    it('has identical keys across pt-BR, en, and es dictionaries', () => {
      const ptKeys = Object.keys(TRANSLATIONS['pt-BR']).sort();
      const enKeys = Object.keys(TRANSLATIONS['en']).sort();
      const esKeys = Object.keys(TRANSLATIONS['es']).sort();

      assert.deepEqual(enKeys, ptKeys, 'en dictionary must have identical keys to pt-BR');
      assert.deepEqual(esKeys, ptKeys, 'es dictionary must have identical keys to pt-BR');
    });

    it('has non-empty values for every key in all languages', () => {
      for (const lang of SUPPORTED_LANGS) {
        for (const [k, v] of Object.entries(TRANSLATIONS[lang])) {
          assert.ok(typeof v === 'string' && v.trim().length > 0, `Key ${k} in ${lang} must not be empty`);
        }
      }
    });
  });

  describe('Language Detection', () => {
    it('detects Portuguese language environment', () => {
      Object.defineProperty(global.navigator, 'languages', { value: ['pt-BR', 'en'], configurable: true });
      assert.equal(detectLanguage(), 'pt-BR');

      Object.defineProperty(global.navigator, 'languages', { value: ['pt-PT'], configurable: true });
      assert.equal(detectLanguage(), 'pt-BR');
    });

    it('detects Spanish language environment', () => {
      Object.defineProperty(global.navigator, 'languages', { value: ['es-ES', 'en'], configurable: true });
      assert.equal(detectLanguage(), 'es');

      Object.defineProperty(global.navigator, 'languages', { value: ['es-AR'], configurable: true });
      assert.equal(detectLanguage(), 'es');
    });

    it('falls back to English for other environments', () => {
      Object.defineProperty(global.navigator, 'languages', { value: ['fr-FR', 'de'], configurable: true });
      assert.equal(detectLanguage(), 'en');

      Object.defineProperty(global.navigator, 'languages', { value: ['ja-JP'], configurable: true });
      assert.equal(detectLanguage(), 'en');
    });
  });

  describe('DOM Translation Application', () => {
    it('translates elements with data-i18n and data-i18n-attr mock', () => {
      const elText = { dataset: { i18n: 'app_title' }, textContent: '' };
      const elAttr = {
        dataset: { i18nAttr: 'title:btn_zoom_in;aria-label:btn_zoom_in' },
        attrs: {},
        setAttribute(k, v) { this.attrs[k] = v; },
      };
      const mockRoot = {
        querySelectorAll(selector) {
          if (selector === '[data-i18n]') return [elText];
          if (selector === '[data-i18n-attr]') return [elAttr];
          if (selector === '[data-lang-btn]') return [];
          return [];
        },
      };

      setLanguage('en');
      applyTranslations(mockRoot);

      assert.equal(elText.textContent, 'CREATE COOL SKINS');
      assert.equal(elAttr.attrs['title'], 'Zoom In');
      assert.equal(elAttr.attrs['aria-label'], 'Zoom In');
    });
  });
});
