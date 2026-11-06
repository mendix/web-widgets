## Why

Migration step 2 of `docs/design/headless-combobox.md`: the views stop reading the selector and render from a ViewModel instead. After step 1 the selector store is observable, but `SingleSelection` and `MultiSelection` still reach into it for captions, options, flags and Mendix-shaped details (`customContentType`, `selectorType`, `attributeType`). Nothing between the store and the markup says what a View is allowed to need. The ViewModel is that contract, and building the Atlas views from it is the test that the contract is complete.

## Root Cause

The `Selector` interface was the model seam, not a view contract. It exposes method calls (`caption.render`, `options.getAll`, `isOptionsSelected`), Studio Pro enumerations with model rules folded in (the forced boxes style), and callbacks the UI hooks assign at render time. A replaceable View cannot be written against it, and the host has no single snapshot to hand to one.

## What Changes

- `src/core/WidgetViewModel.ts` (new): the generic envelope from the design doc, section 7, with `tabIndex` added as a system property next to `className` and `style`.
- `src/core/ComboboxViewModel.ts` (new): `ComboboxViewModel`, `ComboboxOptionVM`, `ComboboxHints`, `ComboboxTexts`, `ComboboxLoading`. Step 2 shape: no `isOpen`, `inputValue` or `highlightedIndex` yet; those stay with downshift until step 3.
- `src/core/Combobox.config.ts` (new): `comboboxConfig(props)` reads the static Studio Pro properties once into a frozen config: selector family and mode (the former `getSelector` switch), filter type, debounce interval, lazy loading, loading type, custom content, read-only style, chip style with the forced-boxes rule, selection method, select-all, footer.
- `src/core/ComboboxGate.ts` (new): the Mendix values the Core derives from, a `Pick` of the container props: aria props, texts, footer content, filter-input action.
- `src/core/tokens.ts`, `Combobox.container.ts`, `createComboboxContainer.ts` (new): the brandi composition root, the pattern of datagrid-web, gallery-web and maps-web. The constructor binds the setup host, the filter-input service and the Core; `init` binds the config, the props gate and the selector class of the configured family; `setProps` pushes a props object through the gate and the selector in one action and ignores a props object it has seen.
- `src/core/FilterInputEvent.service.ts`, `ComboboxSetup.service.ts` (new): the debounced "On change filter input" action as a setup component. It reads the action from the gate when the timer fires and drops a pending call on unmount. Replaces the callback `useGetSelector` assigned on the selector; `onFilterInputChange` leaves the `Selector` interface.
- `src/core/ComboboxCore.ts` (new): injected with the selector, the config, the gate and the filter-input service. `viewModel` is a keep-alive computed assembled from cached slices (texts, envelope, options, selection, flags, loading); a slice keeps its reference while its values are unchanged, per-option objects are cached by id, and `hints` is a plain field because every hint is static. Commands are bound once and write through the selector.
- `src/core/createPreviewContainer.tsx` (new): the same container over the preview selectors, so the editor preview stops building a selector per source and a props object by hand.
- `src/hooks/useComboboxCore.ts` (new): one container per host, its setup components started with `useSetup`, props pushed during render, ViewModel read through `useSyncExternalStore` over a MobX reaction. The reaction is muted while the host renders, because the same render reads the fresh snapshot.
- `src/components/SingleSelection/*`, `src/components/MultiSelection/*`: take `{ core, vm, keepMenuOpen }` and read every rendered value from `vm`. `SelectionBaseProps` and `A11yStatusMessage` are gone from `src/helpers/types.ts`.
- `src/hooks/useDownshiftSingleSelectProps.ts`, `useDownshiftMultiSelectProps.ts`: take the Core; typed text goes through `core.setInputValue`, the live-region message through `core.t`. Output strings unchanged.
- `src/Combobox.tsx`, `src/Combobox.editorPreview.tsx`: resolve the Core from the container and hand the views the snapshot.
- Removed: `src/helpers/getSelector.ts` and `src/hooks/useGetSelector.ts` with their specs (replaced by `createComboboxContainer.spec.ts` and `FilterInputEvent.service.spec.ts`), `getSelectedCaptionsPlaceholder` (inlined in the Core over the config), `onFilterInputChange` on the `Selector` interface.
- `src/helpers/types.ts`, `BaseOptionsProvider.ts`, the two preview options providers: `onAfterSearchTermChange` removed, with its three characterisation tests. Closes task 3.2 of `combobox-mobx-store`.

Still read from the selector by the views, on purpose: the two downshift hooks (selection, captions, search term, leave event) and the lazy-loading hook's datasource filter. That is the step 3 list.

## Impact

- **Behaviour**: none intended. 213 tests pass, the 5 DOM snapshots are untouched, no `-u`. Two intentional simplifications and one removed quirk are listed in `design.md` under Notes.
- **Runtime**: one more object graph per widget instance (the container, the Core and its cached slices). The ViewModel is rebuilt once per store change instead of once per render of each component; the per-option objects are rebuilt whenever their rendered content changes, which today is every render, so step 2 brings the structure and not yet the saving.
- **Release**: no CHANGELOG entry. Nothing user-facing changes.
- **Dependencies**: `brandi`, added to the dependency commit of step 1 next to `mobx` and `widget-plugin-mobx-kit`. Not `brandi-react`: the views read a plain snapshot, nothing resolves from the container in React.
