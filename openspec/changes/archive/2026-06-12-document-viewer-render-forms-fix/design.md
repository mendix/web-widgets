## Context

Document Viewer v1.2.0 uses `react-pdf` to render PDFs via PDF.js. The `options` object passed to the `<Document>` component includes `cMapUrl` and `standardFontDataUrl` as relative paths. PDF.js passes these to the worker thread for font/cmap fetching. When the worker is loaded from a cross-origin URL (the default is unpkg CDN: `//unpkg.com/pdfjs-dist@.../pdf.worker.min.mjs`), the worker's `fetch()` cannot resolve relative URLs — it has no document origin to resolve against — causing a `TypeError: Failed to parse URL` and silent font load failure.

The customer's W9 PDF draws a checkmark using the ZapfDingbats standard font (glyph `0x34`) via a Form XObject. Without the font, PDF.js renders a blank rectangle.

## Goals / Non-Goals

**Goals:**

- Fix standard font and cmap fetching when the PDF.js worker is cross-origin
- No new XML properties, no API surface changes, no dependency updates

**Non-Goals:**

- Changing how the worker URL is configured
- Supporting self-hosted worker deployments (already supported via `pdfjsWorkerUrl` prop)

## Decisions

### Use `window.location.origin` to make resource URLs absolute

Prepend `window.location.origin` to both `cMapUrl` and `standardFontDataUrl` at module evaluation time.

**Rationale:** The worker needs absolute URLs. `window.location.origin` is always the Mendix app origin — correct for all deployment environments. Evaluated at module load (not per-render), so no React re-render cost.

**Alternative considered:** Move `options` inside the component and use `useMemo`. Rejected — no reactive dependencies, module-scope evaluation is simpler and equivalent.

**Alternative considered:** Set `useWorkerFetch: false` to force main-thread font loading. Rejected — works around the symptom, not the cause; disabling worker fetch has broader performance implications.

## Risks / Trade-offs

- `window.location.origin` is not available in SSR/test environments. Tests currently stub this or don't exercise PDF rendering — no impact. If server-side rendering is ever added, this will need to be guarded.
- If the Mendix app is served from a subpath (e.g. `/app/`), `origin` alone is correct — fonts live under `/widgets/`, not the subpath.
