## Test Cases

The widget-level specs merged in #2573, the characterisation tests from `combobox-selector-safety-net` and the component specs are the net; they pass unchanged, with the 5 DOM snapshots untouched. The strict-mode Jest setup guards every mutation. The Core, the container, the services and the selectors through the container have their own specs.

### Regression Tests

- Views render the same DOM (unit) - `src/__tests__/SingleSelection.spec.tsx`, `MultiSelection.spec.tsx`, `StaticSelection.spec.tsx`
    - **Given**: the views over the view model, the Behavior and the Popover hooks
    - **When**: the component cases run, including the downshift reducer pinning
    - **Then**: all pass, the 5 snapshots are unchanged
- Widget behaviour (unit) - `src/__tests__/DatasourceLoading.spec.tsx`, `KeyboardAndEvents.spec.tsx` (#2573)
    - **Given**: the whole widget rendered with RTL, and a fake datasource that applies the limit and filter the widget sets
    - **When**: datasources load and reload, the user types, presses keys and moves focus
    - **Then**: the placeholder, captions, options, ARIA state and executed actions match the released widget
- No mutation outside an action (unit) - the whole suite
    - **Given**: `enforceActions: "always"` and `[MobX]` warnings thrown as errors
    - **When**: the suite runs
    - **Then**: no test fails on a MobX warning

### Edge Cases

- **Core** (`src/core/__tests__/ComboboxCore.spec.tsx`):
    - single mode on the enumeration fixture: envelope, flags, hints, options with captions and the selected flag, empty value, unavailable status, texts with and without parameters, `describedBy` from validation, commands writing to the attribute, filtering, the filter-input action;
    - multi mode on the association fixture: chips in stored order, `allSelected`, `canSelectAll`, joined captions for the text style, `select`, `deselect`, `toggleItem`, `selectAll`, `clear`, the forced boxes style;
    - view model: the commands, hints and translate function keep their reference across props pushes; an option selected by a props push is marked; the view model is cached until an observable it reads changes;
    - UI state: open, close and toggle; one highlighted option; a reset of the input runs no action; enter and leave run their actions and leave closes; the lazy first page is requested on open, once per datasource filter and read-only state;
    - `useComboboxCore`: one Core per host, one re-render per search-term change, the latest props pushed on every render, no React error, and the datasource limit and the selection sync written after the render commits, not during it.
- **Container and services**: every family and mode binds its selector class; `setProps` ignores a props object it has seen; unsupported sources throw. The filter-input service debounces, sends the last term, honours the interval, sends `undefined` for an empty term, skips an action that cannot execute or is executing, reads the action when the timer fires and drops a pending call on dispose.
- **Selectors through the container** (`src/helpers/__tests__/harness.ts`, with the setup host running): no items requested while an association datasource without lazy loading loads; the page limit kept while a lazy one loads; client-side filtering with an expression caption under lazy loading; the datasource selection as the value without a bound attribute; an unchanged attribute value leaves the selection alone; unavailable during the first database load and loading on later reloads; a lazy bound-value lookup ended by a page request or by a search, in either order, asks for a full first page.

## Principles

1. **Static props are read once.** Simple-type props never change for a widget instance; they go into a frozen config and are never observed.
2. **Mendix values go through the gate.** Value objects change on every render; they live behind the props gate and are read through plain getters.
3. **Derive, do not copy.** Selectors, providers and the view model are computeds. The only state is what the widget owns: the search term, the open flag, the highlight and the lazy-loading latches.
4. **Side effects are setup reactions,** started on mount and disposed on unmount.
5. **No Mendix writes during render.** Props reach the gate during render; writes back to Mendix wait for the commit.
6. **Views never see MobX.** They render a plain view model and call its commands.

## Structure

```
Mendix client ── props ──▶ Combobox.tsx / useComboboxCore ── vm ──▶ SingleSelection / MultiSelection
      ▲                         │ setProps (in render)                 useComboboxBehavior (downshift)
      │                         ▼                                      useComboboxPopover (floating-ui)
      │             ComboboxContainer (brandi, one per instance)              │ commands
      │               config ─ gate ─ setup host                               ▼
      │               selector ◀── ComboboxCore ── FilterInputEventService
      │                 ├ options provider
      │                 └ captions provider
      └── setValue / setLimit / setFilter / setSelection (after commit)
```

| Layer              | Files                                                                | Owns                                                                                                                                 | Never does                                          |
| ------------------ | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| Entry              | `src/Combobox.tsx`, `src/hooks/useComboboxCore.ts`                   | one container per instance; pushes props in render, flushes queued writes in a layout effect, subscribes with `useSyncExternalStore` | read a selector directly                            |
| Composition root   | `src/core/Combobox.container.ts`, `tokens.ts`                        | the bindings; picks the selector class from `family` and `mode`                                                                      | hold state                                          |
| Config, gate, host | `Combobox.config.ts`, `ComboboxGate.ts`, `ComboboxSetup.service.ts`  | static props; the latest props object; setup lifecycle and the render-phase scheduler                                                | —                                                   |
| Core               | `src/core/ComboboxCore.ts`, `FilterInputEvent.service.ts`            | open flag, highlight, the view model, the commands; the debounced filter-input action                                                | write to a Mendix value except through the selector |
| Selector           | `src/helpers/**`                                                     | status, value, read-only, validation, `setValue`; its options and captions providers                                                 | keep a copy of a prop                               |
| Views              | `src/components/`, `useComboboxBehavior.ts`, `useComboboxPopover.ts` | markup, downshift wiring, positioning                                                                                                | import MobX                                         |

| Data source × mode            | Selector                                                | Providers                                                         | Setup reactions                               | State                                                             |
| ----------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------- |
| Enumeration or Boolean        | `EnumBooleanSingleSelector`                             | `EnumBoolOptionsProvider`, `EnumAndBooleanSimpleCaptionsProvider` | —                                             | search term                                                       |
| Static values                 | `StaticSingleSelector`                                  | `StaticOptionsProvider`, `StaticCaptionsProvider`                 | —                                             | search term                                                       |
| Association, single and multi | `AssociationSingleSelector`, `AssociationMultiSelector` | `DatasourceOptionsProvider`, `DatasourceCaptionsProvider`         | limit, filter                                 | search term, latched page, page request, lookup, first-page latch |
| Database, single              | `DatabaseSingleSelectionSelector`                       | as association                                                    | limit, filter, selection sync, keep-selection | as association, loaded once                                       |
| Database, multi               | `DatabaseMultiSelectionSelector`                        | as association                                                    | limit, filter, keep-selection                 | as association                                                    |
| Editor preview                | `DatasourcePreviewSelector`, `StaticPreviewSelector`    | `PreviewOptionsProvider`, preview captions providers              | —                                             | —                                                                 |

## Design

- **Static props in a frozen config.** Simple-type props never change for a widget instance, so `comboboxConfig(props)` reads them once, including the rule that forces the boxes style for chips.
- **Mendix values behind plain getters.** The gate holds the props object as `observable.ref`. A computed that returns a Mendix value object compares it by identity and hides a change made in place, so `attr`, `ds`, `selection` and the like are plain getters and every computed reads `gate.props` itself. Mendix values are never made deep observable.
- **Derive, do not copy.** A selector is a set of computeds over `gate.props` and the config, like the row and item models of the data grid and gallery. `action` marks every mutating method, `computed` every getter without side effects.
- **brandi container as the composition root.** Typed tokens and `injected` constructors. The constructor binds the props-independent parts; `init` binds the config, the gate and the selector family, and creates the Core so every setup component is registered before the host starts. The views get the view model and never resolve anything, so `brandi-react` is not needed.
- **Props during render, muted subscription.** `useComboboxCore` pushes props into the gate during render, so the render that receives new Mendix values also shows them. The snapshot subscription ignores changes made by that push: the same render reads the fresh view model, and reporting it would schedule a React update while rendering.
- **Mendix writes after the commit.** The setup reactions that write to Mendix values (datasource limit and filter, selection sync, keep-selection) take the setup host's `schedule` as their MobX scheduler. A run triggered while props are pushed is queued and runs in a layout effect once React commits, reading the state of that moment; outside a props push it runs at once, so specs that drive the container directly see the writes synchronously. No Mendix setter runs inside a render, so a render React replays or throws away writes nothing. A microtask would also leave the render, but it would make every write asynchronous, run after paint, and not know which render it belongs to; the layout effect runs once per commit, before paint.
- **Keep-alive view model.** A MobX computed is not cached while nothing observes it, and `useSyncExternalStore` reads before it subscribes, so `viewModel` is `computed({ keepAlive: true })`. The editor preview, which never subscribes, gets a stable object too.
- **No structural sharing yet.** The view model is rebuilt whenever an observable it reads changes. Option content is a new React element on every pass and no view memoises on its parts, so reusing slices by reference would save nothing. It belongs with memoised option rows.
- **Lazy-loading state in the options provider.** `DatasourceOptionsProvider` owns the limit, the filter, the bound-value lookup (`containsExact`, limit 1) and the first-page latch, which resets on a new datasource filter or read-only state. `Core.open()` calls `requestFirstPage()`. Whatever ends a lookup, a page request or a search, asks for a full first page, so the result does not depend on whether downshift reports the open state or the typed text first.
- **The loaded page is latched.** A datasource mid-reload may report no items; the provider keeps the previous page until the next one arrives.
- **Placeholder until the first load.** A database single selection reports `unavailable` until its datasource has loaded once, so the placeholder shows during the first load, and `loading` on later reloads, which the views render like `available`.
- **Downshift fully controlled.** `isOpen`, `inputValue`, `highlightedIndex` and `selectedItem` come from the view model and every `onXChange` forwards to a command. The released state reducers are kept verbatim, so the accumulated key-handling fixes survive. Downshift reports a multi selection as the whole new list; the Behavior turns it into `select` and `deselect` per id.
- **The input value is the search term.** `setInputValue(text, reason)` keeps the one distinction that matters: typed text runs the filter-input action, a reset after a selection or on close does not. Closing a single-select menu drops the text; a multi-select keeps it. A multi-select menu opens with no highlight, a single-select menu on its first option.
- **The editor preview runs the runtime Core** over plain preview selectors, so design mode and the app share one view-model code path and cannot drift apart. The cost is a MobX copy in `Combobox.editorPreview.js`, which only Studio Pro loads; a pure view-model builder could remove it if the size matters.
- **Option content is rendered by the captions providers**, so the caption markup, the custom-content wrapper and the preview providers' design-mode overrides are the released ones.

## Differences from the released widget

1. **Static values: an external clear clears the selection** (CHANGELOG). The released selector kept a stale value when a microflow emptied the attribute.
2. **Database without a target attribute: the datasource selection is the value** (CHANGELOG). In the released widget the value only existed after a selection in the same page visit, so showing the widget again showed nothing selected.
3. **Association: the open menu keeps the last loaded page while the datasource reloads**, where the released widget showed the no-options text.
4. **Enumeration: `clearable`, `readOnly` and `validation` read the configuration and the attribute in every status**, not fixed values while unavailable; nothing renders in that status.
5. **No lazy-loading limit never-shrink rule.** The released rule was overwritten on every update, so it never applied.
6. **Lazy loading: no extra page after a filter change while the menu is open.** The released widget requested another page each time the datasource filter changed with the menu open, so typing grew the limit by a page per filter. The first page is requested when the menu opens, once per datasource filter and read-only state; further pages load on scroll.
7. **No Mendix writes during render.** The released widget set the datasource limit and synced the selection inside `updateProps`, during render; they now run once React commits, still before paint.
8. **The single-select clear button** shows on `!readOnly && clearable && currentId !== null`. The released widget had a second clause for static sources that the first already implied.
9. **`aria-required` is a boolean.** While its expression loads it renders `"false"` instead of omitting the attribute.
10. **The filter-input action runs from the first render.** The released `useGetSelector` attached its callback from the second render on.

Not changed on purpose: chip sorting without a datasource sort order is still descending; a missing `emptyOptionText` still makes a selector unavailable; a read-only control still limits its datasource to zero items; in multi mode, while the selector has no value at all, the options get no `aria-selected` attribute instead of `"false"` (marked `// Quirk:` in the Behavior).

## Notes

- `enforceActions: "always"` only warns in MobX 6; the throw in `jest.setup.ts` makes the guard effective.
- The Jest setup also fails a test on any `downshift:` console error, so the dev-mode prop-getter checks stay quiet.
- The Core commands are bound after `makeObservable`, so the bound functions are the action wrappers for the first instance too.
- brandi rejects a class whose instance has a protected member named `valueOf`, so the database helper is `optionValue`.
- The Mendix 11 client bundles the widgets at app start: restart the app after rebuilding the MPK before a local E2E run.
- `pnpm run test <path>` does not filter in this package; use `pnpm run test --testPathPatterns <regex>`.
