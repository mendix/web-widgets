## Why

Users can set column (cell) width via a CSS-size text input, but there is no equivalent control for cell height. Completing the pair lets users size table cells in both dimensions. (Requested as "column height"; height in a table applies to cells/rows, not columns — see design.md.)

## What Changes

- Add a `cellHeight` string attribute to the table cell (`TableCellBackgroundColor`), mirroring `cellWidth`.
- Render it as `height: <value>` in the cell's inline style (and `data-cell-height` in class format).
- Add a "Column Height" text input to the cell configuration dropdown, reusing the `textInput` type + `normalizeCssSize` validation + commit-on-blur behavior.

## Capabilities

### Modified Capabilities

- `table-size-control`: add a cell height control alongside the existing column width control.

## Impact

**Affected Files:**

- `src/extensions/TableCellBackgroundColor.ts` — add `cellHeight` attribute; render into cell style + `data-cell-height`.
- `src/components/toolbars/helpers/configurationHelpers.ts` — add "Column Height" text input section.

**User Impact:** additive; existing tables unaffected. No colgroup/NodeView changes — height lives directly on the cell (unlike width, which routes through `<colgroup>`).
