# Bug: PDF Form Checkboxes Not Displaying Checked State

**Widget:** Document Viewer v1.2.0
**Mendix version:** 10.24.9
**Status:** Fixed

---

## Symptom

A W9 PDF generated via .NET has a checked checkbox in Section 3.a ("C corporation"). When opened directly in a browser (Chrome, Firefox native viewer), the checkbox renders correctly as checked. When displayed in the Document Viewer widget, the checkbox appears unchecked.

---

## Root Cause

The checkmark is drawn by a PDF Form XObject using the `/ZaDb` (ZapfDingbats) standard font with glyph `0x34`. PDF.js substitutes standard fonts with bundled Foxit equivalents, fetching them from `standardFontDataUrl`.

`PDFViewer.tsx` configured this as a relative URL:

```ts
const options = {
    cMapUrl: "/widgets/com/mendix/shared/pdfjs/cmaps/",
    standardFontDataUrl: "/widgets/com/mendix/shared/pdfjs/standard_fonts/"
};
```

The PDF.js worker is loaded from `//unpkg.com/pdfjs-dist@.../pdf.worker.min.mjs` — a cross-origin URL. A worker loaded from a different origin has no document base URL, so `fetch()` cannot resolve relative paths. The worker throws:

```
TypeError: Failed to execute 'fetch' on 'WorkerGlobalScope':
Failed to parse URL from /widgets/com/mendix/shared/pdfjs/standard_fonts/FoxitDingbats.pfb
```

Font load silently fails → ZapfDingbats not available → checkmark glyph renders as blank rectangle.

The browser's native PDF viewer is unaffected because it handles font resolution internally without a web worker.

---

## Fix

**File:** `packages/pluggableWidgets/document-viewer-web/src/components/PDFViewer.tsx`

```diff
+const origin = window.location.origin;
 const options = {
-    cMapUrl: "/widgets/com/mendix/shared/pdfjs/cmaps/",
-    standardFontDataUrl: "/widgets/com/mendix/shared/pdfjs/standard_fonts/"
+    cMapUrl: `${origin}/widgets/com/mendix/shared/pdfjs/cmaps/`,
+    standardFontDataUrl: `${origin}/widgets/com/mendix/shared/pdfjs/standard_fonts/`
 };
```

`window.location.origin` is the Mendix app origin (e.g. `https://myapp.mendixcloud.com`). The worker can fetch absolute URLs regardless of where it was loaded from.

---

## Verification

1. Load customer W9 PDF — Section 3.a "C corporation" checkbox shows as checked ✓
2. Build: `pnpm --filter @mendix/document-viewer-web run build`
3. Network tab shows absolute URL `http://<host>/widgets/.../FoxitDingbats.pfb` with 200 response (or request goes to worker — confirmed via console, no more `loadFont` warning)
