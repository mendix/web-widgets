## 1. Dependency & Widget Config

- [x] 1.1 Add `@bwip-js/browser` to `packages/pluggableWidgets/barcode-generator-web/package.json` dependencies
- [x] 1.2 Add `DataMatrix` enum value to top-level `codeFormat` in `src/BarcodeGenerator.xml`
- [x] 1.3 Add "Advanced Data Matrix Settings" property group in XML: `dmGs1Mode` (boolean, default false), `dmShape` (enum square/rectangle, default square), and sizing property (`dmSize` / reuse margin)
- [x] 1.4 Build to regenerate `typings/BarcodeGeneratorProps.d.ts` and confirm `CodeFormatEnum` includes `DataMatrix`

## 2. Config Model

- [x] 2.1 Add `DataMatrixTypeConfig` (`type: "datamatrix"`, `gs1Mode`, `shape`, `size`, `margin`) to the `BarcodeConfig` union in `src/config/Barcode.config.ts`
- [x] 2.2 In `barcodeConfig()`, branch `format === "DataMatrix"` before the QR check, returning the new config
- [x] 2.3 Extend `src/utils/download-code.ts` filename-prefix logic to handle `config.type === "datamatrix"`

## 3. Rendering Seam

- [x] 3.1 Create `src/components/DataMatrix.tsx` with `DataMatrixRenderer({ config })`, importing `{ datamatrix, drawingSVG }` from `@bwip-js/browser` (tree-shakeable; do NOT use `toSVG()`)
- [x] 3.2 Build bwip-js options: `bcid` = `gs1datamatrix` when `gs1Mode` else `datamatrix`; apply rectangular option when `shape === "rectangle"`; set `text`, size, margin
- [x] 3.3 Render SVG and expose a real `SVGSVGElement` ref so `DownloadButton` + `downloadCode(ref, config, ...)` work unchanged
- [x] 3.4 Wrap encoding in try/catch → error state; render the existing error-alert markup honoring `logLevel` (mirror `BarcodeRenderer`)
- [x] 3.5 Extend dispatch in `src/BarcodeGenerator.tsx:25` to route `config.type === "datamatrix"` to `DataMatrixRenderer`

## 4. Validation

- [x] 4.1 Add `DataMatrix` case to `validateBarcodeValue` in `src/config/validation.ts` (plain: charset/length sanity; GS1: loose balanced-`(nn)` AI syntax)
- [x] 4.2 Wire GS1-mode-aware validation into the DataMatrix renderer before encoding

## 5. Editor Preview

- [x] 5.1 Add a DataMatrix preview asset/branch alongside `src/hooks/useBarcodePreviewSvg.ts`, `src/assets/barcodes/*.svg`, `src/components/preview/*` so Studio Pro shows a DataMatrix glyph for the format

## 6. Tests & Changelog

- [x] 6.1 Unit tests: config mapping for DataMatrix, GS1 vs plain `bcid` selection, shape option, validation (valid GS1 AI, malformed AI, plain string, empty value)
- [ ] 6.2 Playwright E2E: render + download a DataMatrix per `docs/requirements/e2e-test-guidelines.md` _(blocked: existing e2e spec is a placeholder; needs the external Mendix testProjects page configured with a DataMatrix widget instance)_
- [x] 6.3 Add user-facing `CHANGELOG.md` entry ("Added Data Matrix and GS1 Data Matrix generation support")

## 7. Verification

- [x] 7.1 `cd packages/pluggableWidgets/barcode-generator-web && pnpm run test` passes
- [ ] 7.2 `pnpm run build` succeeds; confirm bundle delta small (bwip-js tree-shaken to DataMatrix encoder only) _(blocked: local build env has a broken rollup binary — stale `.bin/rollup` shim points to uninstalled rollup@3.29.5; unrelated to this change. Code verified via `tsc --noEmit` + jest instead.)_
- [ ] 7.3 Live Studio Pro test: plain DataMatrix scans via Barcode Scanner (round-trip); GS1 value `(01)09501101020917(17)261231(10)ABC123` renders + decodes; PNG download works; rectangular shape renders _(requires human: live Studio Pro session with `MX_PROJECT_PATH` set)_
