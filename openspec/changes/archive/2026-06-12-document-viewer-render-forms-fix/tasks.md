## 1. Implementation

- [x] 1.1 Prepend an absolute `origin` (`window.mx?.appUrl ?? window.location.origin`, trailing slash stripped) to `cMapUrl` and `standardFontDataUrl` in `packages/pluggableWidgets/document-viewer-web/src/components/PDFViewer.tsx`
- [x] 1.2 Add `typings/global.d.ts` (`window.mx`) and `typings/modules.d.ts` (`*.css`)

## 2. Verification

- [x] 2.1 Run unit tests: `cd packages/pluggableWidgets/document-viewer-web && pnpm run test`
- [x] 2.2 Build widget: `pnpm --filter @mendix/document-viewer-web run build`
- [x] 2.3 Verify customer W9 PDF shows Section 3.a checkbox as checked in Document Viewer
- [x] 2.4 Verify a PDF without AcroForms renders correctly (no regression)
