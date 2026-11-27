# @mendix/widget-harness

Renders real pluggable widgets in a plain browser page, with props backed by a live in-memory data store.
No mxbuild, Mendix runtime, JVM or Docker. It fakes only the pluggable widget API props (`mendix` typings)
and the data behind them; it is not a Mendix client.

## Layout

- `src/store`: framework-agnostic core (no React, no Jest). `DataStore` holds entity objects;
  `LiveList` is a `ListValue` source that applies filter conditions, sort order, offset and limit,
  total count and `hasMoreItems`, with request timing modelled on the Mendix client (see the table below).
- `src/filters/builders.ts`: implementation of `mendix/filters/builders`. `evaluateFilter` runs the trees it builds.
- `src/props/Harness.ts`: live props on top of the store: list attributes, expressions, widgets, actions,
  editable values, dynamic values and selections. `harness.version` changes whenever a widget-visible value changes.
- `host/`: Vite page that mounts a scenario and passes the widget fresh props on every change.
  `datagrid-basic` is a 30-row demo; `test-project` rebuilds pages of the datagrid-web test project.
- `probe/probe.mjs`: records every props object a widget receives on `window.__probes[name]`.
- `runtime/`: runs the datagrid-web test project on a real Mendix runtime with a probe build of Datagrid.
- `e2e/`: Playwright tests. `e2e/behavior/` holds behavior specs that run against the harness and a real runtime.

## Run

```sh
cd packages/shared/widget-harness
pnpm run dev                              # http://localhost:5199/?scenario=datagrid-basic&delay=50
pnpm exec playwright install chromium     # once
pnpm run test:e2e                         # harness project: builds the host page and serves it with vite preview
```

In the page, `window.harness` exposes the harness (`harness.store`, `harness.calls`) and scenario handles,
so tests can change data and check recorded actions.

### Against a real Mendix runtime

`runtime/mx-runtime.sh start` downloads a JDK, mxbuild and the Mendix runtime (the version datagrid-web's e2e
uses, 11.15.0) into `~/.cache/mxrt`. It also downloads the datagrid-web test project, builds Datagrid,
swaps in a probe build of it, compiles the app and starts it on `:8080`. Docker is not needed;
the script runs mxbuild and m2ee directly on Linux (x64 or arm64).

```sh
runtime/mx-runtime.sh start
MX_RUNTIME_URL=http://localhost:8080 pnpm run test:e2e    # adds the "runtime" project
runtime/mx-runtime.sh stop
```

The probe build (`runtime/make-probe-mpk.mjs`) leaves the widget code as is. It wraps the bundle's default
export so each props object is recorded, and exposes the client's `mendix/filters/builders`. Specs drive the
real props and observe the next ones. Data changes go through the documented client API (`mx.data`).

## Alignment with the Mendix runtime

Each behavior spec in `e2e/behavior/store-behavior.spec.ts` asserts the same expectations on both targets.
Observed with Mendix 11.15.0, the React client (`--modern-web-client`) and the datagrid-web test project,
on 2026-11-27. "Observed" means a behavior spec passes on the real runtime. "Docs" means the `mendix` typings
document it.

| Behavior                                                                                      | Real runtime                                                                                                                       | Harness                                                                                            | Source                                                      |
| --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Initial value                                                                                 | `loading`, no items, offset 0, limit `Infinity`                                                                                    | same                                                                                               | observed, docs                                              |
| `contains` / `equals` on strings                                                              | case-insensitive                                                                                                                   | same                                                                                               | observed                                                    |
| `setFilter(undefined)`                                                                        | removes the filter                                                                                                                 | same                                                                                               | observed, docs                                              |
| An equal filter, sort order, offset or limit set again                                        | no request, no new props                                                                                                           | **fixed**: used to reload on equal filters and sort orders                                         | observed, docs                                              |
| `setSortOrder(undefined)`                                                                     | restores the data source's own sort order                                                                                          | **fixed**: used to clear the sort order                                                            | observed, docs                                              |
| `setLimit` / `setOffset`                                                                      | pages through rows; `hasMoreItems` true when rows remain past the page                                                             | same                                                                                               | observed                                                    |
| `setLimit(0)`                                                                                 | empty list, no `totalCount`, no request                                                                                            | **fixed**: used to report a total count and wait for the delay                                     | observed, docs                                              |
| `setLimit(undefined)`                                                                         | limit back to `Infinity`                                                                                                           | same                                                                                               | observed, docs                                              |
| `requestTotalCount`                                                                           | `false` drops `totalCount`, `true` brings it back; each change reloads                                                             | same                                                                                               | observed                                                    |
| `reload()`                                                                                    | new value with the same parameters                                                                                                 | same                                                                                               | observed, docs                                              |
| Fast request                                                                                  | goes straight to the next `available` value, no `loading` value                                                                    | **fixed**: used to publish `loading` for every request                                             | observed                                                    |
| Slow request                                                                                  | `loading` with the previous items and parameters, then `available` with the new ones                                               | **fixed**: used to report the new parameters while loading. Threshold `loadingThreshold` = 75 ms   | observed (threshold between 50 and 100 ms of added latency) |
| Limit change over rows already fetched                                                        | served without a request or `loading` value                                                                                        | **fixed**: used to load                                                                            | observed                                                    |
| Committed change to a listed object                                                           | list refreshes; the widget shows the new value                                                                                     | same (`store.update`)                                                                              | observed                                                    |
| Created and committed object                                                                  | appears in the list                                                                                                                | same (`store.insert`)                                                                              | observed                                                    |
| Object deleted with `mx.data.remove`                                                          | list keeps the item, with its last values, until it reloads                                                                        | list reloads on `store.remove`. **Fixed**: items still held keep their last values (used to throw) | observed                                                    |
| Uncommitted change (`mx.data` `set` without commit)                                           | no new props                                                                                                                       | the store has no uncommitted state                                                                 | observed                                                    |
| Attribute ids                                                                                 | opaque (`attr_xxx_N`), new on each page load                                                                                       | attribute names                                                                                    | observed                                                    |
| `ListAttributeValue.get(item).displayValue`                                                   | Integer `10`, String as is, date `11/5/2020`                                                                                       | **fixed**: dates used to include the time                                                          | observed                                                    |
| `ListAttributeValue.formatter`                                                                | numbers: `type: "number"`, config `{ groupDigits: false }`; dates: `type: "datetime"`, config `{ type: "date" }`; strings: no type | **fixed**: used to have no type or config                                                          | observed                                                    |
| `ListAttributeValue.get(item).readOnly`                                                       | `true`                                                                                                                             | **fixed**: now `true` by default (`listAttribute(..., { readOnly: false })` opts out)              | observed                                                    |
| Attribute that cannot be sorted or read (e.g. over an association)                            | `sortable: false`, value `unavailable`                                                                                             | always sortable and available                                                                      | observed, not modelled                                      |
| `EditableValue` initial value                                                                 | `loading` and read-only, then `available`                                                                                          | starts `available`                                                                                 | observed, not modelled                                      |
| `EditableValue.setValue`                                                                      | next props carry `value` and `displayValue`                                                                                        | same                                                                                               | observed                                                    |
| `EditableValue.setValidator`                                                                  | an invalid value is still set, with the validator's message in `validation`; a valid one clears it                                 | same                                                                                               | observed                                                    |
| `EditableValue.setTextValue`, string formatter                                                | parses through the formatter; string formatter has no `type`                                                                       | same                                                                                               | observed                                                    |
| `ListActionValue` initial                                                                     | `canExecute: true`, `isExecuting: false`                                                                                           | same                                                                                               | observed                                                    |
| `execute()`                                                                                   | a fresh `get(item)` reports `isExecuting: true`, the executed object stays unchanged, then it clears                               | **fixed**: `isExecuting` used to stay `false`                                                      | observed, docs                                              |
| `execute()` when `canExecute` is false                                                        | does nothing                                                                                                                       | same                                                                                               | docs                                                        |
| `setSelection`                                                                                | next props carry the selection; an equal selection is ignored                                                                      | **fixed**: an equal selection used to publish                                                      | observed                                                    |
| Selecting an object that is not in the list                                                   | throws `... is not assignable to selection of type Multi`                                                                          | **fixed**: used to accept it                                                                       | observed                                                    |
| Selection across `reload()`                                                                   | kept                                                                                                                               | same                                                                                               | observed                                                    |
| Selected objects the list no longer holds (filter, paging)                                    | dropped on load unless the `setKeepSelection` predicate keeps them                                                                 | **fixed**: used to keep everything                                                                 | observed                                                    |
| Single selection: select, deselect, reload                                                    | same as multi                                                                                                                      | same                                                                                               | observed                                                    |
| `DynamicValue` change, `ListExpressionValue`, `ListWidgetValue`, Datagrid `onSelectionChange` | not verified: the test project has no page using them                                                                              | live; covered by `e2e/harness-props.spec.ts`                                                       | assumed                                                     |

## Semantics worth knowing

- Attribute ids are the attribute names from the scenario schema.
- String comparisons and `contains`/`starts-with`/`ends-with` are case-insensitive, like XPath in Mendix.
- Empty values sort first in ascending order (observed on the runtime with a new object without an age).
- A store change reloads every `LiveList` (like a commit in the client), unless `reloadOnStoreChange: false`.
- Formatting is fixed en-US: numbers via `Big#toString`, booleans as Yes/No, dates as `M/D/YYYY`.
