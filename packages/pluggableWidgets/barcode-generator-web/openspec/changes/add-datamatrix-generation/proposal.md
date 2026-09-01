## Why

The Barcode Generator widget (`@mendix/barcode-generator-web`) can only produce 1D linear barcodes (jsbarcode) and QR codes (qrcode.react); it cannot generate DataMatrix. DataMatrix — specifically **GS1 DataMatrix** (FNC1 + GS1 Application Identifiers) — is mandatory for pharma serialization (EU FMD, US DSCSA). The Barcode Scanner widget already decodes DataMatrix, so generation closes the round-trip gap for pharma and logistics apps.

## What Changes

- Add **Data Matrix** as a top-level `codeFormat` option in the Barcode Generator.
- Support two encodings: plain DataMatrix and **GS1 DataMatrix** (pharma), selectable via a boolean toggle.
- Support square and rectangular symbol shapes.
- Add `@bwip-js/browser` as a dependency (tree-shakeable DataMatrix encoder) — the only maintained library with native GS1 DataMatrix support. jsbarcode and qrcode.react remain for their existing formats.
- Render DataMatrix as inline SVG (consistent with existing render + SVG→PNG download pipeline).
- Add runtime/design-time validation for DataMatrix values (plain charset/length; GS1 AI syntax).
- Add Studio Pro editor preview for the DataMatrix format.

No breaking changes — existing barcode/QR behavior is untouched; DataMatrix is additive.

## Capabilities

### New Capabilities

- `barcode-generation`: Generation of barcodes, QR codes, and (new) DataMatrix / GS1 DataMatrix from a string input in the Barcode Generator widget, including format selection, encoding options, validation, rendering, and download.

### Modified Capabilities

<!-- None: no prior spec exists for this widget. -->

## Impact

- **Package**: `packages/pluggableWidgets/barcode-generator-web`
- **New dependency**: `@bwip-js/browser` (MIT, tree-shakeable)
- **Widget config**: `src/BarcodeGenerator.xml` (new enum value + Data Matrix property group); regenerated `typings/BarcodeGeneratorProps.d.ts`
- **Source**: new `src/components/DataMatrix.tsx` (bwip-js seam), extended `src/config/Barcode.config.ts` (discriminated union), `src/BarcodeGenerator.tsx` (dispatch), `src/config/validation.ts`, editor-preview files
- **Reuses** existing `DownloadButton` + `src/utils/download-code.ts` SVG→PNG pipeline unchanged
- **Tests**: Jest unit tests + Playwright E2E; `CHANGELOG.md` entry
