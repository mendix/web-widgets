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

### Use an absolute `origin` to make resource URLs absolute

Compute a module-scope `origin` and prepend it to both `cMapUrl` and `standardFontDataUrl` at module evaluation time:

```ts
const origin: string = (window.mx?.appUrl ?? window.location.origin).replace(/\/$/, "");
```

**Rationale:** The worker needs absolute URLs. `window.mx.appUrl` is the canonical Mendix application URL and is correct even when the app is served from a non-origin base path or behind a reverse proxy; `window.location.origin` is the fallback when `mx.appUrl` is unset (e.g. tests). The trailing-slash strip prevents `//` in the joined resource URLs. Evaluated at module load (not per-render), so no React re-render cost.

**Alternative considered:** Use `window.location.origin` alone. Rejected — does not account for apps served under a base path that `mx.appUrl` encodes.

**Alternative considered:** Move `options` inside the component and use `useMemo`. Rejected — no reactive dependencies, module-scope evaluation is simpler and equivalent.

**Alternative considered:** Set `useWorkerFetch: false` to force main-thread font loading. Rejected — works around the symptom, not the cause; disabling worker fetch has broader performance implications.

### Supporting typings

`window.mx` is not in the widget's ambient types, and CSS imports (`react-pdf/dist/Page/*.css`) need a module declaration. Added `typings/global.d.ts` (declares `Window.mx?: { appUrl?: string }`) and `typings/modules.d.ts` (`declare module "*.css"`).

## Risks / Trade-offs

- Neither `window.mx?.appUrl` nor `window.location.origin` is guaranteed in SSR. Tests don't exercise PDF rendering and `mx.appUrl` falls back to `location.origin` — no impact. If server-side rendering is ever added, this will need to be guarded.
- If the Mendix app is served from a subpath (e.g. `/app/`), `mx.appUrl` already encodes it correctly; fonts resolve under the app's `/widgets/` path.
