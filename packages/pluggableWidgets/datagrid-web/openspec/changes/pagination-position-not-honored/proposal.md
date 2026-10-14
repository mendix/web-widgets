## Why

Data Grid 2's "Position of pagination" property (`pagingPosition`: Above grid / Below grid / Both) already gates the built-in `Pagination` control in both `WidgetTopBar` and `WidgetFooter`. Custom pagination — the developer-supplied widgets placeholder shown when "Custom pagination" is enabled — ignores it completely: `WidgetFooter` renders the custom pagination widgets unconditionally whenever custom pagination is on, and `WidgetTopBar` never renders them at all. Setting "Above grid" has no effect; the widgets always render below the grid (WC-3548).

Gallery had the identical bug and fixed it under WC-3505, which explicitly scoped Data Grid 2 out to keep that change reviewable ("DataGrid 2's custom-pagination position bug ... needs its own ticket"). This change is that ticket. Unlike Gallery, Data Grid 2's editor preview already agrees with its runtime (both footer-only today), so there is no preview/runtime divergence to fix here — only the ineffective property, plus a related Studio Pro editor-config quirk: when custom pagination is enabled, `pagingPosition` is currently hidden from the properties panel entirely (a pre-existing mitigation for the very bug this change fixes), so once the position has a real effect it must be shown again.

## What Changes

- **`WidgetTopBar` renders custom pagination widgets when `pagingPosition` is `"top"`.** Today it only ever renders the built-in `Pagination` component and never checks for custom pagination.
- **`WidgetFooter` renders custom pagination widgets only when `pagingPosition` is not `"top"`** (i.e. `"bottom"` or `"both"`), instead of unconditionally.
- **`"Both"` renders custom pagination once, in the footer**, not in both bars — duplicating the `customPagination` widgets placeholder would duplicate widget instances, DOM ids, and state, exactly as identified in the Gallery fix.
- **A design-time `check()` warning** is added for the `useCustomPagination && pagingPosition === "both"` combination, explaining that custom pagination renders once (below the grid) and suggesting the developer pick a single position.
- **`Datagrid.editorConfig.ts` stops hiding `pagingPosition`** when custom pagination is enabled — the property now has an effect, so it must stay visible and editable (mirrors Gallery, which never hid it in this case). `showPagingButtons` stays hidden for custom pagination since it only affects the built-in control.
- **`Datagrid.editorPreview.tsx`** picks up the same top/footer/both rule so preview continues to agree with runtime.

## Capabilities

### New Capabilities

- `datagrid-custom-pagination-position`: where Data Grid 2's custom pagination widgets render relative to the grid, honouring `Position of pagination` ("Above grid" / "Below grid" / "Both"), including the single-render rule for "Both", the accompanying design-time warning, and parity between runtime and editor preview.

### Modified Capabilities

_None — `openspec/specs/` in this package currently documents no pagination-placement capability, so this is captured as a new capability rather than a delta._

## Impact

`packages/pluggableWidgets/datagrid-web`

- `src/components/WidgetFooter.tsx`, `src/components/WidgetTopBar.tsx` — gate custom pagination rendering on `pagingPosition`.
- `src/Datagrid.editorConfig.ts` — stop hiding `pagingPosition` for custom pagination; add the `"both"` + custom pagination warning (in `src/consistency-check.ts`, which `editorConfig.ts` re-exports `check` from).
- `src/Datagrid.editorPreview.tsx` — mirror the top/footer/both placement rule for the preview's `CustomPagination` placeholder.
- `src/components/__tests__/` — unit tests covering `pagingPosition` × custom pagination for both bars; `consistency-check` tests for the new warning.
- `CHANGELOG.md` — user-facing entry: custom pagination now respects "Position of pagination".

Cross-cutting

- No shared-package changes (`widget-plugin-grid` is untouched; Data Grid 2 has no pagination-alignment design property, unlike Gallery, so no `data-widgets` module changes are needed).
- No breaking changes: `pagingPosition` and `useCustomPagination` keep their existing keys and defaults; only the rendering behavior for an already-visible property changes.
- Release vehicle: `datagrid-web` patch/minor release; version bump and changelog entry added at release time per repo convention.
