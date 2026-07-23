## Why

The Rich Text widget renders all toolbar tooltips, dropdown labels, dialog fields, help-shortcut text, and status-bar labels as hardcoded English strings. Mendix apps run in many languages, so non-English users see an untranslated toolbar. We want the widget UI to follow the page language automatically, with translations bundled in the widget (no per-instance configuration by app developers).

## What Changes

- Add a bundled internationalization (i18n) layer to the Rich Text widget covering all toolbar-facing UI text: button tooltips, heading/list dropdowns, table/cell configuration controls, link/image/video dialogs, the link bubble menu, the help dialog (shortcut categories + labels), and the status-bar aria-label.
- Resolve the active locale at runtime from `document.documentElement.lang`, falling back to `navigator.language`, then `en`. Locale keys are normalized to 2-letter codes (`de-DE` → `de`).
- Ship 5 language bundles: `en` (base), `nl`, `de`, `fr`, `es`. Missing keys in any bundle fall back to `en`.
- Replace hardcoded `title`/`label` strings in static config (`ToolbarConfig.ts`, `shortcuts.ts`, `configurationHelpers.ts`) with stable i18n keys, resolved via a translation function `t(key)` at render time. Inline JSX strings in dialogs/menus use `t()` directly.
- Provide translations through a lightweight React context + `useT()` hook (no mobx; bundles are static).

## Capabilities

### New Capabilities

- `rich-text-i18n`: Bundled localization of the Rich Text widget's toolbar and dialog UI, including locale resolution from the page language, a keyed translation lookup with English fallback, and shipped language bundles.

### Modified Capabilities

- `rich-text-help-shortcuts`: Help-dialog shortcut category titles and labels become localized via i18n keys instead of hardcoded English.

## Impact

- **New code**: `src/utils/i18n/` (locale resolver, translation loader, context + `useT` hook) and `src/utils/i18n/locales/*.json` (~120–150 keys × 5 languages).
- **Modified code**: `ToolbarConfig.ts`, `shortcuts.ts`, `configurationHelpers.ts` (strings → keys); leaf render components (`ToolbarButton`, `ToolbarDropdown`, `ColorPicker`, `Dialog`, `TableGrid`, `ConfigurationDropdown`, `CodeView`), `HelpDialog.tsx`, `LinkDialog.tsx`, `ImageDialog.tsx`, `VideoDialog.tsx`, `LinkBubbleMenu.tsx`, `StatusBar.tsx` (resolve keys via `t`); `Editor.tsx` (mount translation provider).
- **Tests**: `ToolbarDefaultButton.spec.tsx` and snapshots update (titles resolved via `t`); new unit tests for locale resolution + fallback.
- **No XML/API change**: purely internal; no new widget properties, no breaking change for app developers.
- **Dependencies**: none added (native `Intl`/DOM only).
