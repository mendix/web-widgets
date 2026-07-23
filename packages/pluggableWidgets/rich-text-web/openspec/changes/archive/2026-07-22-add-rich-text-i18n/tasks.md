## 1. i18n core layer

- [x] 1.1 Create `src/utils/i18n/resolveLocale.ts`: read `document.documentElement.lang` → `navigator.language` → `"en"`, normalize to lowercase 2-letter code
- [x] 1.2 Create `src/utils/i18n/locales/en.json` as the base bundle with flat dot-namespaced keys for every string in the inventory
- [x] 1.3 Create `nl.json`, `de.json`, `fr.json`, `es.json` bundles (missing keys allowed; fall back to `en`)
- [x] 1.4 Create `src/utils/i18n/translations.ts`: load bundle by locale, shallow-merge over `en` base, expose `getBundle(locale)` and `translate(bundle, key)`
- [x] 1.5 Create `src/utils/i18n/context.tsx`: `TranslationProvider` + `useT()` hook; `useT` returns `en`-base `t` when no provider is mounted
- [x] 1.6 Add index barrel `src/utils/i18n/index.ts`

## 2. Wire provider

- [x] 2.1 Mount `TranslationProvider` once in `Editor.tsx`
- [x] 2.2 Ensure `RichText.editorPreview.tsx` renders safely (provider or `en` base default)

## 3. Static config → keys

- [x] 3.1 `ToolbarConfig.ts`: replace `title` string literals with `titleKey`; replace dropdown `label` literals with `labelKey`
- [x] 3.2 `helpers/shortcuts.ts`: replace category `title` and shortcut `label` literals with keys (leave `keys` combos untranslated)
- [x] 3.3 `helpers/configurationHelpers.ts`: add `t` parameter to section builders; replace label/option/placeholder literals with `t(key)`; update `customAction` call sites to pass `t`

## 4. Resolve keys at render leaves

- [x] 4.1 `ToolbarButton.tsx` and `ToolbarDropdown.tsx`: resolve `titleKey`/`labelKey` via `useT()`
- [x] 4.2 `ColorPicker.tsx`, `Dialog.tsx`, `TableGrid.tsx`, `ConfigurationDropdown.tsx`, `CodeView.tsx`: resolve titles via `useT()`
- [x] 4.3 `HelpDialog.tsx`: resolve category titles, shortcut labels, and Close button via `useT()`

## 5. Inline JSX strings → t()

- [x] 5.1 `LinkDialog.tsx`: URL/target/window labels and placeholders
- [x] 5.2 `ImageDialog.tsx`: title, URL, database, description/title placeholders
- [x] 5.3 `VideoDialog.tsx`: title, URL, width/height, embed-code strings
- [x] 5.4 `LinkBubbleMenu.tsx`: "Edit link" / "Remove link" tooltips
- [x] 5.5 `StatusBar.tsx`: status-bar aria-label

## 6. Tests

- [x] 6.1 Unit test `resolveLocale`: page lang, navigator fallback, English fallback, normalization
- [x] 6.2 Unit test translation lookup: active-bundle hit, missing-key English fallback, unknown-locale English
- [x] 6.3 Update `ToolbarDefaultButton.spec.tsx` + snapshots for `t`-resolved titles
- [x] 6.4 Add a render test asserting a localized tooltip/label for a non-`en` locale

## 7. Verify

- [x] 7.1 Run `pnpm run test` in `rich-text-web` — all green
- [x] 7.2 Manual/build check: toolbar renders localized text for `nl`/`de` via page `lang`, English fallback otherwise
