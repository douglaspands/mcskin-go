# i18n Specification

## Purpose
Provides client-side internationalization (i18n) for the `mcskin` web application, supporting Brazilian Portuguese, Spanish, and English with automatic browser/OS language detection, fallback to English, a discrete language selector, and a decoupled, extensible dictionary structure for future languages.

## Requirements

### Requirement: Automatic Browser and OS Language Detection
The web application SHALL automatically detect the user's preferred language from the operating system and browser settings upon initialization, configuring the application language accordingly.

#### Scenario: Detecting Portuguese language environment
- **WHEN** the browser `navigator.languages` or `navigator.language` starts with "pt" (e.g. "pt-BR", "pt-PT", "pt")
- **THEN** the application automatically sets the active interface language to Brazilian Portuguese (`pt-BR`)

#### Scenario: Detecting Spanish language environment
- **WHEN** the browser `navigator.languages` or `navigator.language` starts with "es" (e.g. "es-ES", "es-MX", "es-AR", "es")
- **THEN** the application automatically sets the active interface language to Spanish (`es`)

#### Scenario: Fallback to English for other languages
- **WHEN** the browser language is English or any language other than Portuguese or Spanish (or language detection is unavailable)
- **THEN** the application automatically sets the active interface language to English (`en`)

#### Scenario: Respecting user's stored language preference
- **WHEN** the user has previously chosen a language and stored it in `localStorage` (`mcskin_lang`)
- **THEN** the stored language selection takes precedence over automatic system language detection

### Requirement: Discrete In-App Language Selector
The application navigation drawer SHALL host a discrete, compact language selector that allows users to manually switch the interface between `pt-BR`, `es`, and `en` without visual disruption.

#### Scenario: Switching language manually
- **WHEN** the user taps or clicks any language option in the selector (e.g. `[ PT | EN | ES ]`)
- **THEN** the entire web interface, tool hints, modal dialogues, toasts, and labels update immediately to the selected language, and the choice is saved to `localStorage`

### Requirement: Modular and Extensible Translation Catalogs
The internationalization system SHALL isolate translation catalogs in a decoupled JavaScript module (`internal/web/static/js/i18n.js`) where adding a new language requires only defining a new dictionary object without modifying the translation engine.

#### Scenario: Translating static DOM elements and dynamic strings
- **WHEN** a translation pass occurs
- **THEN** elements with `data-i18n` have their text content replaced with the active language string, and elements with `data-i18n-attr` have their target attributes (such as `title`, `placeholder`, or `aria-label`) updated accurately
