## Test Cases

Most findings are internal cleanups; some are structurally verifiable by unit test,
others (B5 packaging, B7 comment) are verified by build/inspection and carry no test.
The central net-new coverage is **B6** (`EditableChartStore`), which also acts as the
regression net for **B4** (data round-trips through the store before the Plotly cast).

Test files:

- `packages/shared/charts/src/model/stores/__tests__/EditableChart.store.spec.ts` (new — B6)
- `packages/pluggableWidgets/custom-chart-web/src/hooks/__tests__/useCustomChart.spec.ts` (new — B1/B2/B3)
- `packages/pluggableWidgets/chart-playground-web/src/helpers/__tests__/prettifyJson.spec.ts` (new — B9)

### Reproduction Tests

- **B3 — playgroundData carries real layout/config options** (unit)
    - **Given**: `useCustomChart` rendered with a `CustomChartContainerProps` whose adapter
      parses a non-empty `layoutStatic` / `configurationOptions` (e.g. `{ "title": "X" }` /
      `{ "displaylogo": true }`).
    - **When**: the hook returns `playgroundData`.
    - **Then**: `playgroundData.layoutOptions` equals the adapter's `layout` (contains
      `title: "X"`) and `playgroundData.configOptions` equals the adapter's `config`
      (contains `displaylogo: true`) — **not** `{}`.

- **B6 — store reset() loads props into layout/config/data** (unit)
    - **Given**: a fresh `EditableChartStore` wired to a `ComputedAtom` whose props are
      `{ layout: { a: 1 }, config: { b: 2 }, data: [{ x: [1] }] }`.
    - **When**: `setup()` autorun runs (or `reset` is called directly).
    - **Then**: `store.layout`, `store.config`, `store.data` equal those inputs.

### Edge Cases

- **B6 — setDataAt updates a valid index with valid JSON** (unit)
    - **Given**: store with `data = [{ x: [1] }, { x: [2] }]`.
    - **When**: `setDataAt(1, '{"x":[9]}')`.
    - **Then**: `store.data[1]` deep-equals `{ x: [9] }`; index 0 unchanged; `data` is a new
      array reference (observable.ref replaced, not mutated).

- **B6 — setDataAt ignores out-of-range index** (unit)
    - **Given**: store with `data` of length 2.
    - **When**: `setDataAt(5, '{"x":[9]}')` and `setDataAt(-1, '{"x":[9]}')`.
    - **Then**: `store.data` is unchanged (no throw).

- **B6 — setDataAt swallows invalid JSON and warns** (unit)
    - **Given**: store with a valid `data` array; `console.warn` spied.
    - **When**: `setDataAt(0, "{ not json ")`.
    - **Then**: `store.data` unchanged, no throw, `console.warn` called once.

- **B6 — setDataAt rejects non-object JSON (array / primitive)** (unit)
    - **Given**: store with valid `data`.
    - **When**: `setDataAt(0, "[1,2,3]")` and `setDataAt(0, "42")`.
    - **Then**: `store.data` unchanged (guard requires a non-array object).

- **B6 — setLayout / setConfig ignore null, replace on object** (unit)
    - **Given**: store with `layout = { a: 1 }`.
    - **When**: `setLayout(null as any)` then `setLayout({ c: 3 })`.
    - **Then**: after null, `layout` unchanged; after object, `layout` deep-equals `{ c: 3 }`
      and is a fresh reference. Same for `setConfig`.

- **B6 — JSON getters serialize current state** (unit)
    - **Given**: store with `layout = { a: 1 }`, `config = { b: 2 }`, `data = [{ x: [1] }]`.
    - **When**: read `layoutJson`, `configJson`, `dataJson`.
    - **Then**: `layoutJson === '{"a":1}'`, `configJson === '{"b":2}'`,
      `dataJson` deep-equals `['{"x":[1]}']`.

- **B9 — shared prettifyJson formats valid and flags invalid** (unit)
    - **Given**: the extracted `prettifyJson` helper.
    - **When**: called with `'{"a":1}'` and with `"{ bad"`.
    - **Then**: valid input returns 2-space-indented JSON (`'{\n  "a": 1\n}'`); invalid input
      returns `'{ "error": "invalid JSON" }'`.

### Regression Tests

- **B1 — playgroundData is a plain reactive object, no stale caching** (unit)
    - **Given**: `useCustomChart` rendered inside an `observer` (mirrors `CustomChart.tsx`).
    - **When**: the store's `data` changes (e.g. via `setDataAt`) and the component re-renders.
    - **Then**: `playgroundData.plotData` reflects the new `store.data` (reactivity preserved
      after removing the `computed(...).get()` wrapper). `playgroundData.type === "editor.data.v2"`.

- **B2 — hook return shape has no containerStyle** (unit)
    - **Given**: `useCustomChart` rendered.
    - **When**: inspect the returned object keys.
    - **Then**: keys are exactly `{ playgroundData, ref }`; `containerStyle` absent. (Compile-time
      guarantee via `UseCustomChartReturn`; asserted at runtime as regression guard.)

- **B4 — store data round-trips into Plotly Data via the boundary helper** (unit)
    - **Given**: `store.data = [{ type: "bar", x: [1], y: [2] }]`.
    - **When**: mapped through `toPlotlyData(store.data)`.
    - **Then**: output deep-equals the input traces (identity mapping, correctly typed as
      `Data[]`) — no data dropped or reshaped.

- **B10 — onViewSelectChange keeps a stable identity across renders** (unit)
    - **Given**: `useV2EditorController` (and `useComposedEditorController`) rendered.
    - **When**: the component re-renders without `store`/`key` changing.
    - **Then**: the `onViewSelectChange` reference is unchanged between renders (memoized like
      `onEditorChange`).

- **B11 — single source of truth for active key in V2 controller** (unit)
    - **Given**: `useV2EditorController` rendered.
    - **When**: `onViewSelectChange` selects `"config"`, then trace index `0`.
    - **Then**: `viewSelectValue` and the editor code both follow the selected key with no
      desync; changing the key updates the displayed code (the MobX reaction still fires from
      the single retained key representation).

## Notes

- **B5** (`@types/jest` → devDependencies, drop from `tsconfig.build.json`) and **B7**
  (document the `set-state-in-effect` suppression): no unit test — verified by
  `pnpm --filter @mendix/shared-charts build` succeeding and code inspection. Track in tasks.md.
- **B8** (silent `catch {}` in the editor controllers): **out of scope**, deferred to WC-3348.
- **B10/B11**: if a memoization/identity assertion proves brittle in RTL, fall back to
  asserting observable behavior (no desync, correct code shown) rather than reference equality.
- The `EditableChartStore` needs a `SetupComponentHost` + `ComputedAtom` test harness; check
  `@mendix/widget-plugin-mobx-kit` for an existing test helper before hand-rolling one.
