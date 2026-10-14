## 1. i18n

- [x] 1.1 Add `image.width`, `image.height`, and `image.maintainRatio` keys to `src/utils/i18n/locales/en.json`
- [x] 1.2 Add translations for the same keys to `de.json`, `es.json`, `fr.json`, and `nl.json`

## 2. Dialog UI and behavior

- [x] 2.1 Add `width`, `height`, and `maintainRatio` (default `true`) state to `ImageDialog.tsx`
- [x] 2.2 Add a "Dimensions" block with numeric Width and Height inputs and a "Maintain aspect ratio" checkbox using existing `dialog-field` markup and `useT` labels
- [x] 2.3 Disable the Height input while `maintainRatio` is checked, keeping any typed value in state (do not clear on toggle)
- [x] 2.4 In `handleSubmit`, parse width/height, apply only positive-numeric values as `"<n>px"` strings, and omit `height` when `maintainRatio` is checked

## 3. Tests

- [x] 3.1 Test inserting with width + ratio maintained applies `width` only (no `height`)
- [x] 3.2 Test Height input is disabled while ratio is checked
- [x] 3.3 Test inserting with ratio unchecked applies both `width` and `height`
- [x] 3.4 Test empty and invalid (non-positive/non-numeric) values are omitted
- [x] 3.5 Test toggling the checkbox preserves a previously entered Height value

## 4. Changelog

- [x] 4.1 Add a CHANGELOG.md entry for the new image insert dimension inputs
