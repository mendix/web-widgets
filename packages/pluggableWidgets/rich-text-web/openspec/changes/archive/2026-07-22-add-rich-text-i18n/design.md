## Context

The Rich Text widget (`packages/pluggableWidgets/rich-text-web`) is a TipTap-based editor. Its toolbar, dropdowns, dialogs, help modal, and status bar render ~120–150 hardcoded English strings. These live in two shapes:

1. **Static module consts** — `TOOLBAR_GROUPS` in `ToolbarConfig.ts` (~60 strings), `SHORTCUT_CATEGORIES` in `helpers/shortcuts.ts` (~29 strings), and section builders in `helpers/configurationHelpers.ts` (~30 strings, produced at runtime inside `customAction`).
2. **Inline JSX** — dialog fields and menu tooltips in `LinkDialog.tsx`, `ImageDialog.tsx`, `VideoDialog.tsx`, `LinkBubbleMenu.tsx`, `StatusBar.tsx`, `HelpDialog.tsx`.

Constraints: no mobx needed (bundles are static, not per-instance props); no XML/property changes (app developers do not supply translations); the repo already reads Mendix locale via `window.mx.session.getConfig().locale.code` in other widgets, but the decision for this change is to key off the page language (`document.documentElement.lang`).

## Goals / Non-Goals

**Goals:**

- Localize every toolbar-facing UI string in the widget from bundled translations.
- Resolve the active language from the page automatically; no configuration.
- Keep static config serializable/static (avoid converting consts into factories that ripple through Toolbar/Editor/tests).
- English fallback for any missing locale or missing key.

**Non-Goals:**

- Localizing editor _content_ or user-entered text.
- App-developer-supplied per-instance translations (XML props) — explicitly out of scope for now.
- Localizing font family names or font-size numeric labels.
- Right-to-left (RTL) layout support.
- A build-time translation extraction/CI pipeline (bundles are hand-maintained JSON).

## Decisions

### Decision 1: Locale source = page language, not Mendix session

Resolve order: `document.documentElement.lang` → `navigator.language` → `"en"`. Normalize to a 2-letter code (`de-DE` → `de`, `pt_BR` → `pt`).

- **Why**: Directed by product owner; page `lang` is simple, testable, and available in Studio Pro preview and jest (where `window.mx` is often absent).
- **Alternative rejected**: `window.mx.session.getConfig().locale.code` (repo precedent in date-time-picker/google-tag). More authoritative but undefined in preview/tests and adds a runtime dependency. `navigator.language` retained only as second fallback for empty `lang`.

### Decision 2: i18n keys over factory functions

Replace `title: "Bold"` with `titleKey: "toolbar.bold"` in static config; resolve `t(key)` at the render leaf. Inline JSX uses `t()` directly.

- **Why**: `TOOLBAR_GROUPS` stays a static module const — no signature changes to `Toolbar.tsx`/`Editor.tsx`, no re-memoization concerns. Smaller blast radius.
- **Alternative rejected**: `getToolbarGroups(t)` factory — ripples through every consumer, memoization, and tests.

### Decision 3: Translation delivery via React context + `useT()` hook

A `TranslationProvider` (mounted once in `Editor.tsx`) resolves the locale, merges the chosen bundle over the `en` base, and exposes a `t(key, vars?)` function. Leaf components call `useT()`.

- **Why**: Avoids prop-drilling `t` through the toolbar factory tree. Mirrors file-uploader's context shape but with no mobx (static data). Locale resolved once per mount.
- **Alternative rejected**: A module-level singleton `t`. Harder to test (global state), and can't react if the provider needs props later.

### Decision 4: `configurationHelpers.ts` receives `t` as an argument

Section builders run inside `customAction` at runtime and return `ConfigurationSection[]`; their labels are not render-time JSX. The builder functions take `t` as a parameter, threaded from the call site (which has context access).

- **Why**: These strings materialize outside React render, so a hook can't reach them; explicit `t` arg is the clean seam.

### Decision 5: Bundle format and fallback

One JSON file per language under `src/utils/i18n/locales/` (`en`, `nl`, `de`, `fr`, `es`), flat dot-namespaced keys (e.g. `toolbar.bold`, `dialog.link.url`, `shortcut.category.formatting`). `en.json` is the base; the active locale is shallow-merged over `en`, so any missing key falls back to English. Unknown locale → `en` only.

- **Why**: Flat keys are greppable and match how strings map 1:1 to UI. Merge-over-base gives free per-key fallback with no runtime error.

## Risks / Trade-offs

- [Translation drift: new UI strings added without a key] → Lint/review convention: no string literals in the modified files' render paths; `en.json` is the single source of key truth. Fallback to `en` prevents runtime breakage.
- [Empty or non-standard `document.documentElement.lang`] → `navigator.language` then `en` fallback; normalization strips region and lowercases.
- [Snapshot test churn] → `ToolbarDefaultButton.spec.tsx` snapshots will change once titles resolve via `t`; update snapshots and add explicit locale-resolution unit tests so the behavior is asserted, not just snapshotted.
- [Studio Pro editor preview lacks a provider] → `RichText.editorPreview.tsx` either mounts the provider or `useT` degrades to the `en` base when no provider is present (safe default in the hook).
- [Incomplete non-English bundles] → Acceptable; missing keys render English. Bundles can be filled incrementally.

## Migration Plan

Internal-only, no data migration and no widget version-breaking change:

1. Add `src/utils/i18n/` (resolver, loader, context, hook) and 5 locale JSON files.
2. Swap static-config strings to keys; resolve at leaves; convert inline JSX strings to `t()`.
3. Thread `t` into `configurationHelpers.ts` builders.
4. Mount `TranslationProvider` in `Editor.tsx` (and preview).
5. Update tests + snapshots; add resolver unit tests.

Rollback: revert the change; no persisted state or API surface affected.

## Open Questions

- Should the editor preview render localized text or always English? (Leaning English base for design-time stability.)
- Confirm final language set stays `en/nl/de/fr/es` for the first release, or trim to `en`-scaffold if translations aren't ready.
