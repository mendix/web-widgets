## Why

When exporting a Data Grid 2 to Excel with `exportType = "default"` on attribute columns, the exported cells had no Excel format applied. Numbers exported as raw values without thousand separators or decimal precision, and dates used only the browser locale fallback. Users expected "default" to mean "export the value the way the grid shows it" (matching decimals and grouping for a Decimal, `dd/MM/yyyy` for a DateTime).

Additionally, the export type and format properties were visible in Studio Pro for dynamic text columns even though the export logic ignores them — confusing for configurators.

## Root Cause

`getCellFormat()` returned `undefined` when `exportType === "default"`, meaning no Excel format code (`z` field) was written to the cell. The attribute's `formatter` property (available on `ListAttributeValue` since Mendix 10) was never consulted.

A first attempt derived the number format from `config.decimalPrecision`, but testing against the live client revealed that Mendix Decimal attributes do **not** expose `decimalPrecision` at runtime — the formatter config only carries `groupDigits`. This caused `decimalPrecision ?? 0` to collapse to `0` and export whole numbers (e.g. `1234.56` became `1235`). The format is therefore derived to mirror the grid instead of relying on a precision value that never arrives.

The `editorConfig.ts` visibility logic only conditionally hid `exportNumberFormat`/`exportDateFormat` based on the export type value, but never hid all three export properties when `showContentAs === "dynamicText"`.

## What Changes

Package: `packages/pluggableWidgets/datagrid-web`

- `src/features/data-export/cell-readers.ts` — New `getAttributeDefaultFormat(props)` function reads `props.attribute.formatter` and derives an Excel format string:
    - `formatter.type === "number"` → builds format from `groupDigits`; when `decimalPrecision` is present it is honoured, otherwise the format mirrors the grid as `{base}.########` (up to 8 fractional digits, trailing zeros suppressed by `#`), so `1234.56` exports as `1234.56` and integers stay integers
    - `formatter.type === "datetime"` with `config.type === "custom"` → converts Mendix pattern to Excel format (M→m replacement)
    - Otherwise returns `undefined` (falls through to existing locale default for dates)
    - Attribute reader now branches: `exportType === "default"` → `getAttributeDefaultFormat()`, else → existing `getCellFormat()`.

- `src/Datagrid.editorConfig.ts` — When `showContentAs === "dynamicText"`, hide `exportType`, `exportNumberFormat`, and `exportDateFormat` properties in Studio Pro.

## Impact

- Attribute columns with `exportType = "default"` now export with their configured format. This is an enhancement, not a breaking change — previously these cells had no format, now they have one.
- No XML property changes. No migration needed.
- No behavioral change for `exportType = "number"` / `"date"` / `"boolean"` (custom path unchanged).
- Dynamic text columns: cosmetic-only change in Studio Pro property panel (properties hidden). Runtime behavior identical.
