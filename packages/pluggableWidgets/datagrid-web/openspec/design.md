## Test Cases

### Reproduction Tests

- Attribute number with default export type uses formatter - (unit)
    - **Given**: Attribute column with `exportType = "default"`, attribute has `formatter = { type: "number", config: { groupDigits: true, decimalPrecision: 2 } }`
    - **When**: Export reads the cell
    - **Then**: Cell is `{ t: "n", v: 1234.56, z: "#,##0.00" }`

- Attribute date with default export type uses custom pattern - (unit)
    - **Given**: Attribute column with `exportType = "default"`, attribute has `formatter = { type: "datetime", config: { type: "custom", pattern: "dd/MM/yyyy" } }`
    - **When**: Export reads the cell
    - **Then**: Cell is `{ t: "d", v: <stripped-date>, z: "dd/mm/yyyy" }` (M→m converted for Excel)

### Edge Cases

- Attribute date with non-custom datetime config falls back to locale default - (unit)
    - **Given**: Attribute column with `exportType = "default"`, attribute has `formatter = { type: "datetime", config: { type: "date" } }`
    - **When**: Export reads the cell
    - **Then**: Cell has `z: "dd-mm-yyyy"` (locale fallback, not derived from formatter)

- Attribute number with no decimal precision - (unit)
    - **Given**: Attribute column with `exportType = "default"`, attribute has `formatter = { type: "number", config: { groupDigits: false, decimalPrecision: 0 } }`
    - **When**: Export reads the cell
    - **Then**: Cell has `z: "0"` (no grouping, no decimals)

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

- The `M → m` conversion is needed because Mendix uses Java-style date patterns (M = month) while Excel uses `m` for month.
- `getAttributeDefaultFormat` returns `undefined` for string, boolean, and enum attributes — these fall through to existing logic (displayValue for strings, native boolean cells).
- The `editorConfig` change is Studio Pro-only (design time) — no runtime test needed.
