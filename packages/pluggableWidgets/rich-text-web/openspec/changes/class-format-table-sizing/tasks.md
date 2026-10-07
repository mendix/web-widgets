## 1. Investigation

- [x] 1.1 Confirm whether the prosemirror-tables column-resize plugin runs alongside `TableBackgroundColorNodeView` and what it writes to `<col>` during and after a drag; record the outcome in design.md Open Questions
- [x] 1.2 Check whether the e2e test project has a class-format rich text page containing a table; decide e2e coverage vs. manual verification

## 2. Stylesheet

- [x] 2.1 Add sizing rules to `src/ui/RichTextFormatStyle.scss` for `table[data-width]`, `table[data-min-width]`, `table[data-min-height]`, `col[data-col-width]`, `td/th[data-cell-width]`, `td/th[data-cell-height]` using `attr(... type(<length-percentage>))`
- [x] 2.2 Replace the Sass `or` fallbacks in the `.has-table-border, .has-cell-border, .has-border` rule with CSS `attr()` comma fallbacks (`1px`, `solid`, neutral color) and `type(<custom-ident>)` for border style
- [x] 2.3 Compile the stylesheet and confirm the emitted CSS contains the fallbacks and the typed `attr()` calls unchanged

## 3. Table and colgroup serialization

- [x] 3.1 Make `createColGroup` format-aware: emit `data-col-width` in class format, inline `style` width in inline format
- [x] 3.2 Table `renderHTML`: in class format, stop pushing `width` / `min-width` / `min-height` into the style string; emit `data-width` (explicit or column-derived), `data-min-width` (column-derived) and `data-min-height`
- [x] 3.3 Mark column-derived `data-width` and make `width.parseHTML` ignore a marked value so it is not read back as an explicit width
- [x] 3.4 Omit the `style` attribute entirely when the class-format style string is empty

## 4. Table NodeView

- [x] 4.1 `updateTableStyles`: build size segments only in inline format; in class format set / remove `data-width`, the derived marker, `data-min-width` and `data-min-height`
- [x] 4.2 `updateColgroup`: pass the format through so the live `<col>` elements match serialized output
- [x] 4.3 Verify drag resize in class format: live preview during drag, and after release no inline `width` / `min-height` remains on the table

## 5. Cell serialization

- [x] 5.1 `renderCellHTML`: push `width` / `height` style segments only in inline format; keep `data-cell-width` / `data-cell-height` in class format
- [x] 5.2 Update the "applies in both formats" comments to describe the new behavior

## 6. Unit tests

- [x] 6.1 Class format: table with explicit width and min-height serializes data attributes and no inline sizing
- [x] 6.2 Class format: column-derived fixed width → `data-width`; derived minimum width → `data-min-width`; explicit width suppresses `data-min-width`
- [x] 6.3 Class format: `<col>` carries `data-col-width` (px and %) and no `style`; unsized column has neither
- [x] 6.4 Class format: `<td>` and `<th>` with width and height carry data attributes and no `style`
- [x] 6.5 Round trip: legacy class-format HTML with both `style` and `data-*` re-serializes without inline sizing and with sizes intact
- [x] 6.6 Round trip: column-derived `data-width` is not read back as an explicit table width
- [x] 6.7 Inline format: table, `<col>` and cell output unchanged, no sizing data attributes
- [x] 6.8 Update any existing specs or snapshots that assert inline sizing in class format

## 7. Verification and release notes

- [x] 7.1 Manual check in Chromium with class format: set table width/height, column width, cell height; drag-resize; save; confirm read-only rendering matches the editor
- [x] 7.2 Manual check of border defaults in class format: color only, width only, all three
- [ ] 7.3 Add or update e2e coverage per the decision in 1.2
- [x] 7.4 Add a `CHANGELOG.md` entry under Unreleased → Fixed describing the class-format table sizing and border default behavior, including the browser support note
- [x] 7.5 Run the package unit tests and confirm lint is clean
