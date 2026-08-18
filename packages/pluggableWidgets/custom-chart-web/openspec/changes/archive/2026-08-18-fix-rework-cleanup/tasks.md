## 1. Test Setup

<!-- RED: Write failing tests first. B6 first — it is the safety net for B1/B3/B4. -->

- [x] 1.1 Add `EditableChart.store.spec.ts` (B6): `reset` loads props; `setDataAt` valid
      index/valid JSON; out-of-range index no-op; invalid JSON swallowed + `console.warn`;
      non-object JSON rejected; `setLayout`/`setConfig` null-guard + replace; JSON getters.
      Find/reuse a `SetupComponentHost` + `ComputedAtom` harness from `widget-plugin-mobx-kit`.
      → 8 tests, harness = `SetupHost` subclass + `{ get: () => box.get() }` atom.
- [x] 1.2 Add `useCustomChart.spec.ts` (B1/B2/B3): playgroundData has real `layoutOptions`/
      `configOptions` from adapter (not `{}`); return shape is exactly `{ playgroundData, ref }`
      (no `containerStyle`); plotData stays reactive to `store.data` under an `observer`.
      → reactivity asserted via an `observer` Probe + `waitFor` (setup autorun is post-render).
      Added `^src/` moduleNameMapper to widget jest.config.js (source uses baseUrl imports).
- [x] 1.3 Add `prettifyJson.spec.ts` (B9): formats valid JSON 2-space; returns error object
      string on invalid.
- [x] 1.4 Add controller tests (B4/B10/B11): `toPlotlyData` identity round-trip;
      `onViewSelectChange` stable identity across renders (both controllers); V2 key has no
      desync when switching layout→config→trace. → shared-charts barrel pulls plotly, so specs
      import `./stubObjectURL` first to shim `URL.createObjectURL` in the test env.

## 2. Implementation

<!-- GREEN: make tests pass with minimal code -->

- [x] 2.1 **B6** — implement/confirm `EditableChartStore` behavior so store spec passes (store
      already exists; adjust only if a test exposes a real defect — do not weaken tests).
      → store behavior already correct; spec is characterization coverage, no source change.
- [x] 2.2 **B1** — replace `computed((): PlaygroundData => ({...})).get()` in `useCustomChart.ts`
      with a plain object literal.
- [x] 2.3 **B3** — destructure `adapter` from `CustomChartControllerHost`; pass `adapter.layout`
      / `adapter.config` as `layoutOptions` / `configOptions`.
- [x] 2.4 **B2** — delete `getContainerStyle`, the `containerStyle` field on
      `UseCustomChartReturn`, and its return entry. → also dropped now-unused `CSSProperties` import.
- [x] 2.5 **B4** — add `toPlotlyData(data: Array<Record<string, unknown>>): Data[]` boundary
      helper; use it in `CustomChartControllerHost.viewModelAtom` instead of `as Data[]`.
- [x] 2.6 **B9** — extract `prettifyJson` to one shared helper; import in both
      `useComposedEditorController.ts` and `useV2EditorController.ts`; remove duplicates.
- [x] 2.7 **B10** — wrap `onViewSelectChange` in `useCallback` in both controllers.
- [x] 2.8 **B11** — collapse `key`/`keyBox` in `useV2EditorController` to a single source of
      truth. → DEVIATION: kept the React `useState` `key` (it drives render; the box could not)
      and removed `keyBox`. The MobX `reaction` now keys off `key` via the effect deps and uses
      `{ fireImmediately: true }` to re-sync editor input on view switch. Removed `observable`/
      `runInAction` imports.

## 3. Refactoring

<!-- REFACTOR: clean up while keeping tests green. Non-test findings live here. -->

- [x] 3.1 **B5** — move `@types/jest` from `dependencies` to `devDependencies` in
      `shared/charts/package.json`; remove `"jest"` from `types` in `tsconfig.build.json`.
- [x] 3.2 **B7** — add a comment above the `react-hooks/set-state-in-effect` disable in
      `useComposedEditorController.ts` explaining why it's safe (syncs editor input to external
      code changes; risk = overwriting in-progress edits, accepted).
- [x] 3.3 Confirm B8 left untouched (out of scope, WC-3348); no stray edits to `CodeEditor.tsx`.

## 4. Verification

- [x] 4.1 All new tests passing.
- [x] 4.2 Full test suite green for the three packages (custom-chart-web 33, chart-playground-web
      6, shared/charts 45) — no regressions. Lint clean on all changed files.
- [x] 4.3 shared-charts build succeeds after B5 tsconfig change (`tsc -p tsconfig.build.json` + `pnpm build` both clean).
- [ ] 4.4 Runtime check (optional, `/debug-widget`): playground Modeler Layout/Config panels
      populate (B3) in the WC-3348 test project.
- [x] 4.5 Changelog: added a "Fixed" entry to custom-chart-web for the restored Modeler
      Layout/Configuration panels (B3, user-visible). All other findings internal → no entry.
      chart-playground-web + shared/charts: no changelog. Version bumps at release only.

## Notes

<!-- Track test failures, refactoring decisions, blockers. -->

- Order rationale: B6 store spec first = safety net before touching the B1/B3/B4 cluster that
  feeds the store into the chart/playground.
- If B10/B11 identity assertions prove brittle in RTL, switch to behavior assertions per design.md.
