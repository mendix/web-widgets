## Context

`pagingPosition` (`"top" | "bottom" | "both"`) already drives the built-in `Pagination` control:

- `WidgetTopBar.tsx`: `<If condition={!pgConfig.customPaginationEnabled && pgConfig.pagingPosition !== "bottom"}><Pagination /></If>`
- `WidgetFooter.tsx`: `<If condition={!pgConfig.customPaginationEnabled && pgConfig.pagingPosition !== "top"}><Pagination /></If>`

Custom pagination (the `customPagination` widgets placeholder, shown when `useCustomPagination` is true and `pagination === "buttons"`) is wired separately and ignores position:

- `WidgetFooter.tsx`: `<If condition={pgConfig.customPaginationEnabled}>{customPagination.get()}</If>` — always renders, no position check.
- `WidgetTopBar.tsx`: no custom pagination branch at all.
- `Datagrid.editorPreview.tsx`: `useCustomPagination()` returns `props.useCustomPagination` with no position check; only rendered in the footer's `CustomPagination`.
- `Datagrid.editorConfig.ts` currently hides `pagingPosition` from the properties panel whenever `useCustomPagination` is true (added when custom pagination shipped, as a stopgap since the property had no effect). Once position has an effect, hiding it is wrong.

Gallery (`gallery-web`) had the exact same defect and fixed it under WC-3505 (`GalleryFooterControls.tsx`, `GalleryTopBarControls.tsx`), which was explicitly scoped to exclude Data Grid 2 to keep that PR reviewable. This change ports the same rule to Data Grid 2. Data Grid 2's bars have no alignment/slot-resolution machinery (`resolveSlots`) — that part of the Gallery change was about a _different_, already-working design property (pagination alignment) that Data Grid 2 doesn't have — so none of that machinery is needed here.

## Goals / Non-Goals

**Goals:**

- Custom pagination widgets render in the top bar when `pagingPosition === "top"`, in the footer when `"bottom"`, and exactly once (footer) when `"both"`.
- Editor preview matches runtime for all three positions.
- `pagingPosition` stays visible/editable in Studio Pro when custom pagination is enabled.
- A `check()` warning fires for `useCustomPagination && pagingPosition === "both"`, mirroring Gallery's wording/severity.

**Non-Goals:**

- No pagination-alignment design property for Data Grid 2 (out of scope per WC-3505's own scoping note — Data Grid 2 doesn't have this property; adding one is a feature request, not this fix).
- No changes to `widget-plugin-grid` or `data-widgets` — the built-in `Pagination` component's own position logic is already correct and untouched.
- No changes to the unrelated `_datagrid.scss` top-bar container-query typo noted in the Gallery proposal as a separate, deliberately excluded fix.

## Decisions

- **Reuse the existing `pgConfig.pagingPosition` value already threaded into both bars** rather than introducing new state. `usePaginationConfig()` already exposes `pagingPosition` and `customPaginationEnabled`; both bars just need an additional condition.
- **"Both" resolves to footer-only, not top-bar-only or duplicated.** Same reasoning as Gallery: `customPagination.get()` returns the actual configured widgets placeholder — rendering it in two places would duplicate widget instances, DOM ids, and MobX-backed state. Footer is chosen (not top bar) purely for consistency with Gallery's precedent and because it's the current de facto behavior developers have already built pages against.
- **Condition shape mirrors Gallery exactly** for auditability:
    - Footer: `pgConfig.customPaginationEnabled && pgConfig.pagingPosition !== "top"`
    - Top bar: `pgConfig.customPaginationEnabled && pgConfig.pagingPosition === "top"`
- **Drop `pagingPosition` from the `hidePropertiesIn` call** in `Datagrid.editorConfig.ts` for the `useCustomPagination` branch; keep `showPagingButtons` hidden there since it only affects the built-in control's prev/next buttons, which custom pagination replaces entirely.
- **Warning lives in `consistency-check.ts`** (not inlined in `editorConfig.ts`) to match this package's existing convention — `editorConfig.ts` re-exports `check` from `consistency-check.ts`, and all other structural warnings/errors already live there.
- **No new capability abstraction (no `resolveSlots`-equivalent).** Data Grid 2's bars have exactly one pagination-bearing slot each (`pb-end` / `tb-end`); there's no counter/load-more displacement problem to solve, so a plain boolean condition is the right level of complexity — introducing a slot-resolution function here would be solving a problem this widget doesn't have.

## Risks / Trade-offs

- **[Risk]** Existing apps that already set `pagingPosition` to `"top"` or `"both"` while using custom pagination will see a visible layout change (widgets moving from footer to top bar, or a warning appearing) on upgrade. → **Mitigation**: this is the bug fix itself — the property was always meant to have this effect, per its own description in Studio Pro ("Position of pagination"). Documented in the changelog as a behavior fix, not flagged as breaking (no API/prop shape change).
- **[Risk]** Unhiding `pagingPosition` when custom pagination is on could surprise developers who never noticed the property while it was hidden. → **Mitigation**: matches Gallery's existing (never-hidden) behavior for the same property; the new `check()` warning immediately explains the "both" caveat if they hit it.

## Migration Plan

No data migration. Widget-level runtime/config-only change, shipped as a normal `datagrid-web` release. No rollback complexity beyond a standard revert.
