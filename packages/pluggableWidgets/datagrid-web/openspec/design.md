## Test Cases

### Reproduction Tests

- Attribute number with default export type mirrors the grid - (unit)
    - **Given**: Attribute column with `exportType = "default"`, value `1234.56`, attribute has `formatter = { type: "number", config: { groupDigits: true } }` (Mendix Decimal attributes only expose `groupDigits` at runtime, not a fixed `decimalPrecision`)
    - **When**: Export reads the cell
    - **Then**: Cell is `{ t: "n", v: 1234.56, z: "#,##0.00" }` — the fractional-digit count is taken from the value itself so Excel renders exactly what the grid shows

- Attribute date with default export type uses custom pattern - (unit)
    - **Given**: Attribute column with `exportType = "default"`, attribute has `formatter = { type: "datetime", config: { type: "custom", pattern: "dd/MM/yyyy" } }`
    - **When**: Export reads the cell
    - **Then**: Cell is `{ t: "d", v: <stripped-date>, z: "dd/mm/yyyy" }` (M→m converted for Excel)

### Edge Cases

- Attribute date with non-custom datetime config falls back to locale default - (unit)
    - **Given**: Attribute column with `exportType = "default"`, attribute has `formatter = { type: "datetime", config: { type: "date" } }`
    - **When**: Export reads the cell
    - **Then**: Cell has `z: "dd-mm-yyyy"` (locale fallback, not derived from formatter)

- Attribute number honours explicit decimalPrecision when present - (unit)
    - **Given**: Attribute column with `exportType = "default"`, attribute has `formatter = { type: "number", config: { groupDigits: false, decimalPrecision: 0 } }` (precision explicitly provided)
    - **When**: Export reads the cell
    - **Then**: Cell has `z: "0"` (no grouping, no decimals) — an explicit `decimalPrecision` takes priority over the grid-mirroring fallback

- Attribute number without grouping mirrors the grid - (unit)
    - **Given**: Attribute column with `exportType = "default"`, value `0.5`, attribute has `formatter = { type: "number", config: { groupDigits: false } }` (no `decimalPrecision`)
    - **When**: Export reads the cell
    - **Then**: Cell has `z: "0.0"` (no grouping, one fractional digit derived from the value)

- Attribute whole-number value produces no fractional format - (unit)
    - **Given**: Attribute column with `exportType = "default"`, value `1983`, attribute has `formatter = { type: "number", config: { groupDigits: false } }`
    - **When**: Export reads the cell
    - **Then**: Cell has `z: "0"` — no fractional section, so Excel does not render a trailing dot (`"1983"`, not `"1983."`)

- Attribute with formatter lacking type field - (unit)
    - **Given**: Attribute column with `exportType = "default"`, attribute has basic formatter (no `type` property, e.g., default mock)
    - **When**: Export reads the cell
    - **Then**: Cell has `z: undefined` for numbers, locale fallback for dates (graceful degradation)

### Regression Tests

- Custom export type still uses explicit format - (unit)
    - **Given**: Attribute column with `exportType = "number"` and `exportNumberFormat = "#,##0.00"`
    - **When**: Export reads the cell
    - **Then**: Cell uses the explicit format, NOT the attribute formatter

- Dynamic text always exports as string regardless of export settings - (unit)
    - **Given**: Dynamic text column with any `exportType` set
    - **When**: Export reads the cell
    - **Then**: Cell is always `{ t: "s" }`, export type ignored

- Custom content export unchanged - (unit)
    - **Given**: Custom content column with `exportType = "number"` and `exportValue = "1234.56"`
    - **When**: Export reads the cell
    - **Then**: Cell is `{ t: "n", v: 1234.56, z: <format> }` (same as before)

## Notes

- Mendix Decimal attributes do **not** expose a fixed `decimalPrecision` on the formatter config at runtime — only `groupDigits` is present (verified against the live client). The number-default format therefore mirrors the grid by counting the fractional digits of the value itself and building `{base}.{0×n}`. A static `{base}.########` mask cannot be used because the literal `.` in the mask is always emitted, so whole numbers would render with a trailing dot (`1983` → `"1983."`). The `decimalPrecision` branch is retained for the case where a future runtime does supply it.
- The `M → m` conversion is needed because Mendix uses Java-style date patterns (M = month) while Excel uses `m` for month.
- `getAttributeDefaultFormat` returns `undefined` for string, boolean, and enum attributes — these fall through to existing logic (displayValue for strings, native boolean cells).
- The `editorConfig` change is Studio Pro-only (design time) — no runtime test needed.
