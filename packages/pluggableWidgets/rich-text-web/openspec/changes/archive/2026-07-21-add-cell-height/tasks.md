## 1. Cell height attribute

- [x] 1.1 Add `cellHeight` string attribute to `TableCellBackgroundColor.addAttributes()` (parse from `style.height` / `data-cell-height`; renderHTML returns {} — handled in main renderHTML), mirroring `cellWidth`
- [x] 1.2 In `renderHTML`, append `height: ${cellHeight}` to the cell style string (both formats)
- [x] 1.3 In class mode, emit `data-cell-height`

## 2. Cell configuration control

- [x] 2.1 Add "Column Height" `textInput` section after `cellWidth` in `createCellConfigurationSections()` (placeholder e.g. "Auto (e.g. 100px, 50%)")
- [x] 2.2 `getCurrentValue` → `getCellAttributes(editor)?.cellHeight`; `onChange` → `normalizeCssSize` + `setCellAttribute("cellHeight", …)` (empty clears to null, invalid ignored)

## 3. Verification

- [x] 3.1 Typecheck + lint clean; unit suite passes (82 tests)
- [x] 3.2 Manual: set cell height (px + %) → row grows to that height; content taller → grows past it; clear → auto (verified by user in Mendix editor)
