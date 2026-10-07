## Why

The `class` style-data format exists so stored rich text carries no inline `style` attributes (which need `style-src 'unsafe-inline'`). Table sizing breaks that promise: table width / min-width / min-height, `<col>` width and cell width / height are still written as inline `style` in class mode, alongside `data-*` attributes that no stylesheet consumes. In addition, the class-mode border rule relies on Sass `or`, which is compiled away, so its intended defaults (`1px`, `solid`, neutral color) never reach the browser.

## What Changes

- In `class` format, table, `<col>` and cell sizing are serialized **only** as data attributes; no `width`, `min-width`, `min-height` or `height` declarations are emitted in `style`.
- New data attributes: `data-col-width` on `<col>` and `data-min-width` on `<table>` (the column-derived minimum width that has no attribute today). The column-derived fixed table width reuses `data-width`.
- New stylesheet rules in `RichTextFormatStyle.scss` consume `data-width`, `data-min-width`, `data-min-height`, `data-col-width`, `data-cell-width` and `data-cell-height` through typed `attr()`.
- Class-mode border rule (`.has-table-border`, `.has-cell-border`, `.has-border`) uses real CSS `attr()` fallbacks instead of Sass `or`, so a partially configured border (e.g. color only) renders `1px solid` as in inline format.
- Previously saved class-format content (which carries both `style` and `data-*`) keeps loading and loses its inline sizing on the next save.
- `inline` format output is unchanged.
- Accepted trade-off: typed `attr()` is supported in Chromium 133+ only, so class-format table sizing becomes Chromium-only, matching class-format colors, font size and borders. Inline remains the recommended format.

## Capabilities

### New Capabilities

- `class-format-table-sizing`: how table, column and cell sizing and table/cell border defaults are serialized and rendered when the widget uses the `class` style-data format.

### Modified Capabilities

<!-- None. `table-size-control` and `table-column-width-control` already require data-attribute serialization in class format; this change adds the missing "no inline style" and "stylesheet renders it" guarantees as a new capability. -->

## Impact

- `src/extensions/TableBackgroundColor.ts`: `createColGroup`, table `renderHTML`, `TableBackgroundColorNodeView.updateTableStyles` / `updateColgroup`.
- `src/extensions/tableCellStyling.ts`: `renderCellHTML` (shared by `<td>` and `<th>`).
- `src/ui/RichTextFormatStyle.scss`: new sizing rules, border fallback fix.
- Unit tests under `src/extensions/__tests__/`; e2e screenshots only if a class-format table scenario exists.
- `CHANGELOG.md` (user-facing fix entry).
- No XML, typings or dependency changes. No change for `inline` format users.
