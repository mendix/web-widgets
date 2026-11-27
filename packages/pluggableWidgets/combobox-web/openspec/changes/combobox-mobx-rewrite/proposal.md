## Why

The combo box keeps its state in plain classes that are mutated during render, and the parts React needs to know about reach it through side channels: a `setState({})` callback that forces a re-render when the search term changes, callbacks the downshift hooks assign on the selector at render time, and UI state (open flag, typed text, highlight) owned by downshift in uncontrolled mode. That works, but it is hard to test and easy to break: nothing can observe the store, a state change outside React goes unnoticed, and the behaviour of the widget is spread over the selectors, two downshift hooks, `useActionEvents` and `useLazyLoading`.

This change rewrites the internals on MobX, the state library the Data Widgets, gallery and other widgets in the repo already use. For app developers and their users the widget stays the same: same properties, same DOM, same CSS classes, same keyboard and screen reader behaviour. Two bugs that came from copying props into the selectors are fixed.

## Root Cause

`useGetSelector` hand-rolled a store: one instance per widget, `updateProps` on every render, and a forced re-render through `options.onAfterSearchTermChange`. The `Selector` interface was the only seam, and the views read it directly during render. Downshift's own state was the source of truth for what the user saw, so the model could neither close the menu on leave nor know which option was highlighted. Side effects on Mendix values (datasource limit and filter, selection sync) ran inside `updateProps`, so they ran during render.

## What Changes

- **Static props in a frozen config, Mendix values behind a props gate.** `src/core/`: `ComboboxConfig` holds the simple-type properties, read once; a `DerivedPropsGate` holds the latest Mendix values as `observable.ref`. A brandi container, as in datagrid-web and gallery-web, binds them, the selector family for the instance, the setup host, the filter-input service and the Core.
- **Selectors derived from the gate.** Every selector and provider is a set of computeds over the gate and the config. The only state left is the search term, the latched page and the loading latches of the datasource provider, and the "loaded once" flag of the database single selection. `DatasourceOptionsProvider` and `DatasourceCaptionsProvider` serve the association and database families; `DatasourceOptionsProvider` owns all lazy-loading state: limit, filter, bound-value lookup and the first-page latch.
- **Side effects as setup reactions, after the commit.** The datasource limit, the debounced filter, the selection sync and keep-selection are reactions registered with the setup host, started on mount and disposed on unmount. Props reach the gate during render so that render shows them; the reactions that write to Mendix take the host's scheduler and run once React commits.
- **A Core that owns the UI state.** `ComboboxCore` owns the open flag and the highlighted index (the typed text is the search term), derives one plain view model, and exposes commands. `enter` and `leave` run the Mendix actions, `leave` closes the menu, and `open` asks the options provider for the lazy first page.
- **Views without MobX.** `useComboboxCore` hands the view model to `SingleSelection` and `MultiSelection` through `useSyncExternalStore`. `useComboboxBehavior` runs downshift fully controlled and keeps the released state reducers, chip navigation, focus handling and status messages; `useComboboxPopover` wraps the floating menu.
- **Editor preview** from the same container and Core over plain preview selectors.
- **Strict tests.** `jest.setup.ts` runs MobX with `enforceActions: "always"` and turns any `[MobX]` warning into a test failure.
- **Shared MobX at runtime.** `rollup.config.mjs` uses `withSharedLibs`, like the Data Widgets: the runtime bundle imports MobX from `com/mendix/shared/mobx/6.12.3/` in the MPK.
- **Removed:** `getSelector`, `useGetSelector`, `useDownshiftSingleSelectProps`, `useDownshiftMultiSelectProps`, `useActionEvents`, `useLazyLoading`, `LazyLoadProvider`, the per-family options and captions providers, and the internal `onAfterSearchTermChange`, `onFilterInputChange`, `onEnterEvent` and `onLeaveEvent` members of the selector interfaces.

Not in this change: any change to markup or class names.

## Impact

- **Behaviour**: two fixes, both in the CHANGELOG: a combo box with static values follows its attribute when a microflow or nanoflow clears it, and a combo box with a database data source and no target attribute shows the item selected in its data source when it is shown again. Everything else is unchanged: the component specs, the widget-level specs from #2573 and the 5 DOM snapshots pass (no `-u`). The differences without a visible effect are listed in `design.md`.
- **Bundle**: `Combobox.js` grows from 102 KB to about 108 KB; the 60 KB MobX bundle in the MPK is shared with every widget on MobX 6.12.3. `Combobox.editorPreview.js`, which only Studio Pro loads, grows from 84 KB to about 175 KB because it bundles its own MobX copy and the Core: `withSharedLibs` only rewrites the runtime entries.
- **Release**: two CHANGELOG lines under Fixed.
- **Dependencies**: `mobx` 6.12.3, `brandi`, `@mendix/widget-plugin-mobx-kit` (all already used by other widgets in the repo).
