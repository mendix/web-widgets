## 1. Shared hook (`packages/shared/charts`)

- [x] 1.1 Add `src/hooks/useRefreshInterval.ts` exporting `useRefreshInterval(datasources: Array<ListValue | undefined>, intervalSeconds: number): void`. It does nothing when `intervalSeconds <= 0`, restarts its `setTimeout` whenever any data source object (and therefore its items) changes, calls `reload()` on fire for each defined data source whose status is not `loading`, and clears the timer on unmount or interval change.
- [x] 1.2 Export the hook from `src/main.ts`
- [x] 1.3 Add `src/hooks/__tests__/useRefreshInterval.spec.ts` (jest fake timers + `@testing-library/react` `renderHook`, `ListValueBuilder` from `@mendix/widget-plugin-test-utils`) covering: disabled at 0, single reload after interval, all data sources reloaded, timer restart on items change, loading source skipped, undefined sources ignored, unmount cancels timer
- [x] 1.4 `pnpm run test` and `pnpm run lint` pass in `packages/shared/charts`

## 2. Series-based charts (Area, Bar, Bubble, Column, Line, Time series)

- [x] 2.1 Add the `refreshInterval` integer property (caption "Refresh time (in seconds)", default `0`) to the end of the "General > Data source" group in `AreaChart.xml`, `BarChart.xml`, `BubbleChart.xml`, `ColumnChart.xml`, `LineChart.xml`, `TimeSeries.xml`
- [x] 2.2 Regenerate `typings/*Props.d.ts` for each by building the widget, not by hand-editing
- [x] 2.3 Call `useRefreshInterval` in each component, mapping the series list (`series` for Area/Bar/Column, `lines` for Bubble/Line/Time series) to each series' active data source (`dataSet === "static" ? staticDataSource : dynamicDataSource`)
- [x] 2.4 Update test fixtures / mock props with `refreshInterval: 0` where the type requires it, and update any affected snapshots
- [x] 2.5 Add one spec to `LineChart.spec.tsx` asserting that `reload()` is called on each series' data source after the interval

## 3. Single-datasource charts (Pie/Doughnut, Heat map)

- [x] 3.1 Add the `refreshInterval` property to the "General > Data source" group in `PieChart.xml` and `HeatMap.xml`
- [x] 3.2 Regenerate `typings/*Props.d.ts`
- [x] 3.3 Call `useRefreshInterval([props.seriesDataSource], props.refreshInterval)` in `PieChart.tsx` and `HeatMap.tsx`
- [x] 3.4 Update test fixtures / mock props and snapshots

## 4. Changelogs

- [x] 4.1 Add an `### Added` entry under `## [Unreleased]` in the CHANGELOG.md of all eight affected widgets: "We added a "Refresh time (in seconds)" property that periodically reloads the chart data."
- [x] 4.2 Do not bump versions (that happens at release time). Do not touch `charts-web/CHANGELOG.md` (aggregated at release).

## 5. Verification

- [x] 5.1 `pnpm run test` and `pnpm run lint` pass in each of the eight widget packages
- [ ] 5.2 Manual QA in Studio Pro: a Line chart on a view entity with `refreshInterval = 5` updates after the underlying data changes; at `0` it does not update; the chart does not flash empty during reload
