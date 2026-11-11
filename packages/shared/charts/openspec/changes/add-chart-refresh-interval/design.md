## Context

Datagrid 2 and Gallery support "Refresh time (in seconds)" through `DatasourceService` in `@mendix/widget-plugin-grid` (`src/core/Datasource.service.ts`). It runs a MobX `autorun` that reads `datasource.items`, restarts a `setTimeout` on every items change, and when the timeout fires it calls `datasource.reload()` unless the data source is `loading`. That service only handles a single `ListValue` and belongs to the grid DI container setup.

The chart widgets are plain React function components and use no DI container:

- Area, Bar, Bubble, Column, Line, Time series: a list of series objects, each with `dataSet: "static" | "dynamic"` and `staticDataSource` / `dynamicDataSource`, mapped through `usePlotChartDataSeries` from `@mendix/shared-charts`.
- Pie/Doughnut and Heat map: one `seriesDataSource` consumed by widget-local hooks (`src/hooks/data.ts`).

All of them already keep their last data while a data source reloads. Plot series read `items`, which stay populated while status is `loading`. The Pie and Heat map hooks only update state when `status === Available`. That means a background reload does not blank the chart.

## Goals / Non-Goals

**Goals:**

- One shared, unit-tested implementation of the refresh timer in `@mendix/shared-charts`.
- Behaviour that matches Datagrid 2 / Gallery: seconds in the XML, timer restarts on data change, no reload while loading.
- Small per-widget changes: one XML property, one hook call.

**Non-Goals:**

- Custom chart, which uses attribute-based data rather than `ListValue`.
- A "silent refresh" loading indicator: charts show no loading UI today.
- Reusing or refactoring `DatasourceService`.
- Fixing Gallery's refresh wiring. `galleryConfig` hard-codes `refreshIntervalMs: 0` and `GY.refreshInterval` is never bound. That is out of scope here and is tracked separately.

## Decisions

### 1. A React hook `useRefreshInterval(datasources, intervalSeconds)` in shared/charts

```ts
export function useRefreshInterval(datasources: Array<ListValue | undefined>, intervalSeconds: number): void;
```

Location: `src/hooks/useRefreshInterval.ts`, exported from `src/main.ts`.

- _Why a hook rather than `DatasourceService`:_ charts have no `SetupComponentHost` / gate / container, and building one just for a timer would be over-engineering. `DatasourceService` also takes a single data source, while plot charts have N of them.
- _Why seconds in, not ms:_ every widget passes `props.refreshInterval` straight through. The `* 1000` conversion happens in one place, inside the hook.

### 2. Restart the timer when any data source changes

Mendix hands the widget a new `ListValue` object on every data source update, including an items change. The hook therefore compares the data source references, and `intervalSeconds`, with the previous render, and only on a difference clears the pending timeout and schedules a new one. This is the React equivalent of the `autorun` in `DatasourceService`, which reruns whenever the gate's `datasource` prop changes.

- The comparison is a shallow, element-wise one inside a dependency-free `useEffect`, using refs. This avoids spreading a variable-length array into a deps list. A parent re-render with the same data source objects does not restart the timer.
- _Implementation note:_ the comparison is on data source identity rather than `items` identity. Data source identity is a superset (it also changes on `loading` → `available`), so the timer is never left stale when a reload returns an equal `items` reference.
- _Alternative considered:_ `setInterval` on a fixed schedule. Rejected because it would reload straight after a user-triggered or other refresh and would differ from Datagrid behaviour.

### 3. When the timer fires, reload each non-loading data source

On fire, iterate over the latest data sources from the ref and call `ds.reload()` for each defined `ds` whose `status !== "loading"`. Each reload yields new `items`, which restarts the timer (Decision 2).

- _Alternative:_ skip all reloads if any source is loading. Rejected because one slow source would stall the refresh of the others.

### 4. Widget wiring

- Series charts: `useRefreshInterval(props.<series>.map(s => s.dataSet === "static" ? s.staticDataSource : s.dynamicDataSource), props.refreshInterval)`. Memoise the mapped array (or let the hook tolerate a new array each render, since its deps are derived from `items` and not from array identity).
- Pie/Doughnut, Heat map: `useRefreshInterval([props.seriesDataSource], props.refreshInterval)`.
- `LineChart` is wrapped in `memo` with a custom `flatEqual` comparator. A new `refreshInterval` prop is a primitive and compares through `defaultEqual`, so no comparator change is needed.

### 5. XML property

```xml
<property key="refreshInterval" type="integer" defaultValue="0">
    <caption>Refresh time (in seconds)</caption>
    <description />
</property>
```

Place it at the end of the "General > Data source" group, after the series / `seriesDataSource` properties. Caption and key are the same as in Datagrid/Gallery. The tracked `typings/*Props.d.ts` files are regenerated by the widget build, not edited by hand.

## Risks / Trade-offs

- [Several sources reload at slightly different times, so the timer restarts several times per cycle] → Harmless. The next reload happens `interval` seconds after the last arrival. This is documented in the spec ("restart on data change").
- [A very small interval (e.g. 1s) with heavy aggregations puts load on the server] → Same trade-off as Datagrid. It is the developer's choice, and the default stays off.
- [Plotly re-render on every reload even when data is unchanged] → Existing `usePlotChartDataSeries` effect behaviour. Acceptable, and the same as a manual refresh.
- [Editor preview / design mode] → Preview components do not receive live `ListValue`s, so the hook is called only in the runtime components.

## Migration Plan

Additive only. Existing apps get `refreshInterval = 0` (disabled) when they upgrade the widget, so no migration is needed. Rollback means reverting the widget versions.

## Open Questions

- Should each chart's editorConfig hide `refreshInterval` in some configurations? Current assumption: no, it is always visible, as in Datagrid.
