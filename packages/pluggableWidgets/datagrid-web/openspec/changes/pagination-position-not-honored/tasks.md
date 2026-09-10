## 1. Runtime placement

- [x] 1.1 `WidgetFooter.tsx`: gate the existing `<If condition={pgConfig.customPaginationEnabled}>` custom pagination block on `pgConfig.pagingPosition !== "top"`.
- [x] 1.2 `WidgetTopBar.tsx`: add a custom pagination branch that renders `customPagination.get()` when `pgConfig.customPaginationEnabled && pgConfig.pagingPosition === "top"` (needs `useCustomPagination` from `../model/hooks/injection-hooks`, not currently imported there).
- [x] 1.3 Unit tests for `WidgetFooter`/`WidgetTopBar` (or their existing test files) covering `pagingPosition` × `useCustomPagination` for `"top"`, `"bottom"`, `"both"`, and custom pagination disabled.

## 2. Editor preview

- [x] 2.1 `Datagrid.editorPreview.tsx`: add a `usePagingTopCustom`/equivalent check (or extend `usePagingTop`) so the top bar's preview renders `<CustomPagination />` when `useCustomPagination && pagingPosition === "top"`.
- [x] 2.2 `Datagrid.editorPreview.tsx`: change the footer's `useCustomPagination()` check so it excludes `pagingPosition === "top"` (footer renders custom pagination for `"bottom"` and `"both"` only).
- [x] 2.3 ~~Update/add preview snapshot or structure tests~~ — not feasible: `Datagrid.editorPreview.tsx` imports `mendix/preview/Selectable`, which has no jest moduleNameMapper stub anywhere in this repo (confirmed repo-wide: no `*-web` package unit-tests its `editorPreview.tsx`). Adding one would mean changing the shared `@mendix/pluggable-widgets-tools` jest preset, out of scope for this fix. Verified instead by code inspection (mirrors the already-tested `WidgetTopBar`/`WidgetFooter` runtime logic 1:1) plus manual Studio Pro QA.

## 3. Studio Pro properties panel

- [x] 3.1 `Datagrid.editorConfig.ts`: in the `useCustomPagination` branch (inside `pagination === "buttons"`), stop hiding `pagingPosition` — only hide `showPagingButtons`.
- [x] 3.2 Add a `checkCustomPaginationPosition` (or similarly named) check to `consistency-check.ts`: emit a `"warning"` on property `pagingPosition` when `values.useCustomPagination && values.pagingPosition === "both"`, wired into `check()` alongside the existing selection/column checks.
- [x] 3.3 Unit test for the new consistency-check warning (present for custom+both, absent for custom+top/bottom and for non-custom pagination).

## 4. Docs

- [x] 4.1 Add a `CHANGELOG.md` entry: custom pagination now respects "Position of pagination" (top/bottom/both, with "both" rendering once below the grid).
