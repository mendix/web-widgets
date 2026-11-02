## Why

The last piece of the model seam that predates the headless design: the selectors took the container props by method call. `Combobox.container` pushed every props object through the gate and through `selector.updateProps` in one action, each selector copied a dozen props into observable fields, and the lazy-loading side effects (datasource limit, filter, selected-value reload, selection sync) ran inside that copy, during render. The data grid and gallery stores derive from the gate instead; the combobox was the exception, deferred from step 2 and step 3 as `combobox-selector-gate`.

## Root Cause

The selectors were written as plain classes mutated per render, and steps 1 to 3 kept that shape so the characterisation tests could pin them unchanged. With the Behavior extracted, nothing outside the Core reads a selector any more, so the seam can change without touching a view.

## What Changes

- `src/core/ComboboxGate.ts`: the gate carries every Mendix value of the widget, the family values included. `src/core/Combobox.config.ts`: `clearable`, `captionType`, `customEditability` and `selectedItemsSorting` join the frozen config.
- `src/helpers/types.ts`: the `Selector` seam keeps `type`, `status`, `readOnly`, `validation`, `clearable`, `currentId`, `setValue`, `options` and `caption`; multi adds `getOptions` and `isOptionsSelected`. `updateProps`, the copied Studio Pro enumerations and the provider internals leave the interface. `OptionsProvider.hasMore`, `isLoading` and `loadMore` are always there.
- `src/helpers/DatasourceOptionsProvider.ts` (new, replaces `BaseDatasourceOptionsProvider`, the two family providers and `LazyLoadProvider`): the page, the id map and the ids are computeds over a `DatasourceSource` gate; `setup` keeps the datasource limit in step with an autorun and turns a search-term change into the debounced datasource filter with a reaction, aborted on dispose. `getAll()` is a pure read.
- `src/helpers/DatasourceCaptionsProvider.tsx` (new, replaces the association and database captions providers and `DatabaseValuesProvider`): captions, custom content and the empty caption over a `CaptionSource` gate.
- `src/helpers/BaseOptionsProvider.ts`: abstract `ids`, the search term as the only state, `keepSourceOrder` for the static family.
- Every selector takes `(host, gate, config)` or `(gate, config)`: `status`, `currentId`, `readOnly`, `validation` and `clearable` are computeds; the datasource-backed ones are setup components whose side effects run in reactions. `src/helpers/multiSelection.ts` holds the two multi-mode rules both multi selectors shared.
- `src/helpers/Preview/*`: the editor preview selectors are plain objects over the preview props, one for the datasource families and one for the static one.
- `src/core/Combobox.container.ts`: `setProps` is the gate alone; the selector classes are registered with their tokens like every other service.
- `src/core/ComboboxCore.ts`: the commands are bound after `makeObservable`, so they are the action wrappers for the first instance too.
- Removed: `LazyLoadProvider`, `BaseDatasourceOptionsProvider`, the family `utils.ts` extractors (except `getReadonly` and the type check of the database family), the family-nested `Preview` folders.
- Specs: the selector specs resolve their selector from the container through `src/helpers/__tests__/harness.ts`, with the setup host running, and push the next render with `setProps`. Assertions on fields that moved to the config are gone; the `LazyLoadProvider` spec is replaced by limit cases on the association spec.

## Impact

- **Behaviour**: five deliberate changes, listed in `design.md`; the user-visible one (a static combo box now follows an external clear of its attribute) has a CHANGELOG line. 218 tests pass, the 5 DOM snapshots are untouched, no `-u`.
- **Size**: 59 files, +1466 / -2295 lines in `src/`.
- **Runtime**: the side effects on the Mendix values run in reactions: on mount for the first props, then synchronously inside the props push, as before. The datasource filter is scheduled once per search-term change instead of once per `getAll()` call.
- **Release**: one CHANGELOG line under Fixed.
- **Dependencies**: none added.
