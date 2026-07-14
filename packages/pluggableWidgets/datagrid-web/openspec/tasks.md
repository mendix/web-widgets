## 1. Test Setup

- [x] 1.1 Write test: attribute number with default exportType uses formatter config to derive Excel format
- [x] 1.2 Write test: attribute date with default exportType and custom pattern uses converted pattern
- [x] 1.3 Write test: attribute date with non-custom config falls back to locale default
- [x] 1.4 Write test: attribute number with groupDigits=false and decimalPrecision=0 produces format "0"

## 2. Implementation

- [x] 2.1 Add `getAttributeDefaultFormat(props)` function in `cell-readers.ts` that reads `props.attribute.formatter` and derives Excel format string
- [x] 2.2 Branch attribute reader: `exportType === "default"` calls `getAttributeDefaultFormat()`, else calls existing `getCellFormat()`
- [x] 2.3 Hide `exportType`, `exportNumberFormat`, `exportDateFormat` in editorConfig when `showContentAs === "dynamicText"`

## 3. Refactoring

- [x] 3.1 No refactoring needed — implementation is minimal and isolated

## 4. Verification

- [x] 4.1 All 221 tests passing (4 new + 217 existing)
- [x] 4.2 Full test suite passes (no regressions)
- [x] 4.3 Build compiles without TypeScript errors
- [x] 4.4 PR submitted and reviewed

## Notes

- No XML property changes were needed — existing `exportType` enum with "default" value covers the use case.
- The `formatter` property is available on `ListAttributeValue` since Mendix 10 runtime.
- iobuhov review feedback: use consistent assertion syntax (assert `cell.v` in all date tests). Fixed.
