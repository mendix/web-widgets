## Why

Migration step 1 of `docs/design/headless-combobox.md`: the selector store becomes a MobX store so that step 2 can derive a ViewModel from it. Today the selectors are plain classes mutated in `updateProps`, and the only state change that is not a props update, the search term, reaches React through a callback that calls `setState({})` in `useGetSelector`. Nothing can observe the store, so nothing can be derived from it.

## Root Cause

`useGetSelector` hand-rolls a store: one instance per widget, `updateProps` on every render, and a forced re-render on search-term change through `options.onAfterSearchTermChange`. The selectors, options providers and captions providers keep their state in plain fields. That works for the current components, which read the selector directly during render, but it offers no subscription point for a snapshot hook or a computed ViewModel.

## What Changes

- `package.json`: adds `mobx` 6.12.3 and `@mendix/widget-plugin-mobx-kit` (both already used by other widgets in the repo). The `test` script runs `jest --projects jest.config.js`.
- `jest.config.js` and `jest.setup.ts`: extend the shared Jest config with `configure({ enforceActions: "always" })` and turn the MobX strict-mode warning into a thrown error, so a mutation outside an action fails the suite.
- `src/helpers/**`: every selector, options provider, captions provider, the values provider and `LazyLoadProvider` declare their state with `makeObservable`. Plain fields become `observable`; arrays and Mendix values (`ListValue`, `EditableValue`, `ReferenceValue`, `ReferenceSetValue`, `SelectionValue`, `ListWidgetValue`, formatters) become `observable.ref`; `updateProps`, `_updateProps`, `setValue`, `setSearchTerm`, `loadMore`, `loadSelectedValue` and `getLimit` become actions; the status, loading and sort getters become `computed`. Overrides are annotated with `override`. `StaticOptionsProvider` drops three field redeclarations that shadowed the base class observables.
- `src/hooks/useObservableSnapshot.ts` (new): `useSyncExternalStore` over a MobX `reaction`. This is the snapshot hook from the design docs.
- `src/hooks/useGetSelector.ts`: subscribes to `selector.options.searchTerm` through the snapshot hook instead of registering a `setState` callback.
- `src/helpers/__tests__/BaseOptionsProvider.spec.ts`: the test subclass seeds its state inside `runInAction`. No expectation changed.

Not in this change: `src/components/`, the downshift hooks, `useActionEvents`, the preview selectors, the `Selector` interface. `onAfterSearchTermChange` stays on the interface, marked deprecated, until step 2 removes it with its test. The props gate from `widget-plugin-mobx-kit` is not introduced yet: the `Selector` seam takes props by method call and the characterisation tests depend on that; the gate arrives in step 2 together with the first computed that derives from props.

## Impact

- **Behaviour**: none intended. The 194 characterisation and component tests pass unchanged, the 5 DOM snapshots are untouched. The `useGetSelector` seam tests pin the same render count on search-term change as before.
- **Runtime**: MobX is bundled into the widget as it is for the data grid, gallery and image cropper. Outside tests MobX runs with its default `enforceActions: "observed"`; the only observed value is the search term and its setter is an action, so no console warnings are expected.
- **Release**: no CHANGELOG entry. Nothing user-facing changes.
- **Dependencies**: `mobx`, `@mendix/widget-plugin-mobx-kit`.
