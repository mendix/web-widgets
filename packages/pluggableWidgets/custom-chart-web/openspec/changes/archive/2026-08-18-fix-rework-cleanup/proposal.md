## Why

The custom-chart / playground editor rework PR merged to `main` with an unresolved
code review from Leonardo de Souza. Eleven Critical/Important/Minor findings shipped
unfixed and are still live on `main` (re-verified 2026-07-06, WC-3488). The most
visible impact:

- The playground sidebar's **"Modeler Layout"** and **"Modeler Configuration"** panels
  render empty — they read `layoutOptions` / `configOptions`, which the custom-chart
  widget hardcodes to `{}` (B3).
- A `computed(fn).get()` misuse allocates a throwaway MobX atom on every render,
  defeating caching and providing no reactivity (B1).
- The store that parses user JSON (`EditableChartStore`) has **zero unit tests** after
  a 402-line spec (`mergeChartProps.spec.ts`) was deleted with no replacement (B6).

The rest are correctness/maintainability debt: an unsound cast that hides invalid user
JSON, a misplaced `@types/jest` runtime dependency, dead code, duplication, and
undocumented lint suppressions.

## Root Cause

Per finding (all confirmed by file:line inspection, lines current on branch off
`origin/main`):

- **B1** `custom-chart-web/src/hooks/useCustomChart.ts:54-62` — a plain object is wrapped
  in `computed((): PlaygroundData => ({...})).get()`, creating a new computed atom each
  render. `CustomChart.tsx` is already `observer`-wrapped, so reactivity is handled there.
- **B2** `useCustomChart.ts:13-32,35,53,65` + `CustomChart.tsx:11` — `getContainerStyle`
  and the returned `containerStyle` are dead; `CustomChart.tsx` destructures only
  `{ playgroundData, ref }` and computes its own style via `constructWrapperStyle(props)`.
- **B3** `useCustomChart.ts:59-60` — `layoutOptions: {}` / `configOptions: {}` are hardcoded.
  The controller host exposes `adapter: ChartPropsController` with `layout` / `config`
  getters that hold the real parsed values.
- **B4** `custom-chart-web/src/controllers/CustomChartControllerHost.ts:34` — `store.data`
  (typed `Array<Record<string, unknown>>`) is cast `as Data[]`, suppressing the mismatch
  with Plotly's `Data` type.
- **B5** `shared/charts/package.json:38` + `shared/charts/tsconfig.build.json:10` —
  `@types/jest` sits in `dependencies` and `"types": ["jest"]` is in the production build
  tsconfig, shipping test types as a runtime dependency.
- **B6** `mergeChartProps.spec.ts` deleted (last seen in commit `e79bd67d9`); the only
  remaining custom-chart-web test is `src/utils/utils.spec.ts`. `EditableChartStore` (which
  handles user JSON edits) is untested.
- **B7** `chart-playground-web/src/helpers/useComposedEditorController.ts:83` —
  `eslint-disable react-hooks/set-state-in-effect` with no explanation.
- **B9** duplicate `prettifyJson` in `useComposedEditorController.ts:33-39` and
  `useV2EditorController.ts:32-38` (identical bodies).
- **B10** `onViewSelectChange` is not memoized while `onEditorChange` is `useCallback`-wrapped,
  in both `useComposedEditorController.ts:44-51` and `useV2EditorController.ts:44-54`.
- **B11** `useV2EditorController.ts:41-42` — the active editor key lives in both a React
  `useState` (`key`) and a MobX `observable.box` (`keyBox`): two sources of truth kept in
  sync by hand.

## What Changes

- **B1** Replace the `computed(...).get()` wrapper in `useCustomChart.ts` with a plain
  object literal.
- **B2** Delete `getContainerStyle`, the `containerStyle` field on `UseCustomChartReturn`,
  and its return-value entry.
- **B3** Destructure `adapter` from the controller host and pass `adapter.layout` /
  `adapter.config` as `layoutOptions` / `configOptions`.
- **B4** Route `store.data` → Plotly `Data[]` through a single named boundary helper
  (e.g. `toPlotlyData`) instead of a bare `as Data[]`. No runtime validation added — the
  store already guards on write (`setDataAt` parses, type-checks, and warns on invalid
  JSON); Plotly's `Data` is a large union that is impractical to validate exhaustively.
  This localizes and documents the unavoidable type conversion in one place.
- **B5** Move `@types/jest` to `devDependencies`; drop `"jest"` from `tsconfig.build.json`'s
  `types`.
- **B6** Add a unit spec for `EditableChartStore` covering `setLayout` / `setConfig` /
  `setDataAt` / `reset`, the JSON getters, and invalid/out-of-range input.
- **B7** Add a comment documenting why the `set-state-in-effect` suppression is safe.
- **B9** Extract `prettifyJson` to one shared helper; import in both controllers.
- **B10** Wrap `onViewSelectChange` in `useCallback` in both controllers.
- **B11** Collapse `key` to a single source of truth in `useV2EditorController`.

## Impact

- **In scope:** `custom-chart-web` (hooks, controllers, `CustomChart.tsx`),
  `chart-playground-web` (helpers only — **not** `CodeEditor.tsx`), `shared/charts`
  (`EditableChartStore`, `package.json`, `tsconfig.build.json`).
- **Out of scope (do not touch):** anything WC-3348 (PR #2310) delivered — `CodeEditor.tsx`,
  the editor restore, editor-side JSON lint. The silent empty-JSON `catch {}`
  (`useComposedEditorController.ts:75-76`, `useV2EditorController.ts:85-86`) is explicitly
  deferred to WC-3348 per the ticket; **B8 is not fixed here**.
- **Not breaking.** No public widget prop, XML key, or MPK output changes. B3 restores an
  intended behavior (populated Modeler panels); B1/B2/B4/B9/B10/B11 are internal; B5 is a
  packaging fix; B6/B7 add tests/docs.
- **Must not break:** live chart rendering and click events (B1/B2/B4), the V1 and V2
  playground editors' data/layout/config round-trip (B3/B9/B10/B11), and the
  `shared/charts` production build (B5).
- Internal-only changes → **no changelog entry** expected for any of the three packages
  (confirm at PR time). Version bumps at release only.
