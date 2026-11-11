## Why

Charts in Mendix used to offer a refresh interval, and the docs still describe it. The pluggable chart widgets have no such option today (WC-3362). If a chart reads data that changes without a client-side commit, such as an aggregation over a view entity, it shows stale data until the user refreshes the page by hand. Datagrid 2 and Gallery already have a "Refresh time (in seconds)" property, so charts should match them.

## What Changes

- Add a `refreshInterval` integer property ("Refresh time (in seconds)", default `0` = disabled) to the list-based chart widgets: Area, Bar, Bubble, Column, Heat map, Line, Pie/Doughnut, Time series. Custom chart is out of scope because it reads an attribute, not a list data source.
- When the interval is above 0, the chart reloads every list data source it uses after that many seconds. The timer restarts whenever the data changes. This matches the Datagrid 2 / Gallery behaviour.
- A reload in progress never starts a second one. The chart keeps showing the current data while it reloads, so it does not flash to empty.
- Add one shared hook to `@mendix/shared-charts` so all eight widgets use the same refresh logic.
- Each affected widget gets an "Added" entry under `[Unreleased]` in its CHANGELOG.

## Capabilities

### New Capabilities

- `chart-refresh-interval`: periodic background reload of the list data sources behind a chart widget, set by a "Refresh time (in seconds)" property.

### Modified Capabilities

<!-- None: shared/charts has no existing specs. -->

## Impact

- `packages/shared/charts`: new hook `useRefreshInterval` in `src/hooks/`, exported from `src/main.ts`, with unit tests.
- Widget XML and the regenerated `typings/*Props.d.ts` in: `area-chart-web`, `bar-chart-web`, `bubble-chart-web`, `column-chart-web`, `heatmap-chart-web`, `line-chart-web`, `pie-doughnut-chart-web`, `time-series-chart-web`.
- Each of those widget components calls the hook with its data sources (per series: `staticDataSource` / `dynamicDataSource`; for pie and heat map: `seriesDataSource`).
- Test mocks/fixtures that build container props need the new `refreshInterval: 0` prop.
- No new dependencies. Not breaking: the default `0` keeps today's behaviour.
