# @mendix/widget-harness

Renders real pluggable widgets in a plain browser page, with props backed by a live in-memory data store.
No mxbuild, Mendix runtime, JVM or Docker. It fakes only the pluggable widget API props (`mendix` typings)
and the data behind them; it is not a Mendix client.

## Layout

- `src/store`: framework-agnostic core (no React, no Jest). `DataStore` holds entity objects;
  `LiveList` is a `ListValue` source that applies filter conditions, sort order, offset and limit,
  total count and `hasMoreItems`, and goes `loading` → `available` after a configurable delay.
- `src/filters/builders.ts`: implementation of `mendix/filters/builders`. `evaluateFilter` runs the trees it builds.
- `src/props/Harness.ts`: live props on top of the store: list attributes, expressions, widgets, actions,
  editable values and selections. `harness.version` changes whenever a widget-visible value changes.
- `host/`: Vite page that mounts a scenario and passes the widget fresh props on every change.
- `e2e/`: Playwright tests against the host page.

## Run

```sh
cd packages/shared/widget-harness
pnpm run dev                       # http://localhost:5199/?scenario=datagrid-basic&delay=50
pnpm exec playwright install chromium   # once
pnpm run test:e2e
```

In the page, `window.harness` exposes the harness (`harness.store`, `harness.calls`) and scenario handles,
so tests can change data and check recorded actions.

## Semantics worth knowing

- Attribute ids are the attribute names from the scenario schema.
- String comparisons and `contains`/`starts-with`/`ends-with` are case-insensitive, like XPath in Mendix.
- Empty values sort first in ascending order.
- A store change reloads every `LiveList` (like refresh in client), unless `reloadOnStoreChange: false`.
- Formatting is fixed en-US: numbers via `Big#toString`, booleans as Yes/No, dates as `M/D/YYYY HH:mm`.
