## Test Cases

The characterisation tests from `combobox-selector-safety-net` and the component tests remain the net. The Core gets its own spec against the same fixtures.

### Regression Tests

- Views render the same DOM (unit) - `src/__tests__/SingleSelection.spec.tsx`, `MultiSelection.spec.tsx`, `StaticSelection.spec.tsx`
    - **Given**: the views reading the ViewModel
    - **When**: the 29 component cases run
    - **Then**: all pass, the 5 snapshots are unchanged
- Selector seam unchanged (unit) - every spec under `src/helpers/**/__tests__/` and `src/hooks/__tests__/useGetSelector.spec.tsx`
    - **Given**: the selectors untouched except for the removed callback
    - **When**: the suite runs with `enforceActions: "always"`
    - **Then**: all pass, no `[MobX]` warning

### Core (`src/core/__tests__/ComboboxCore.spec.tsx`)

- Single mode on the enumeration fixture: envelope, flags, hints, options with captions and the selected flag, empty value, unavailable status, `t` with and without parameters, `describedBy` from validation, commands writing to the attribute, filtering through `setInputValue`, filter-input callback.
- Multi mode on the association fixture: chips in stored order, `allSelected`, `canSelectAll`, joined captions for the text style, `select`, `deselect`, `toggleItem`, `selectAll`, `clear` writing to the association, the forced boxes style arriving as a hint.
- Structural sharing: unchanged slices and commands keep their reference across an equal props update; only the options whose values changed are rebuilt; the ViewModel is cached between reads.
- `useComboboxCore`: one Core per host, one re-render per search-term change, the latest props pushed into the selector once per render, a props update reflected in the same render with no React error logged.
- Filter-input action (`FilterInputEvent.service.spec.ts`): debounced, last term wins, configured interval, empty term sent as `undefined`, skipped when it cannot execute or is executing, read from the gate when the timer fires, dropped on dispose.

### Container (`src/core/__tests__/createComboboxContainer.spec.ts`)

- Every family and mode binds its selector class and the Core wraps it; the selector gets the creation props; `setProps` updates the gate and the selector together and ignores a props object it has seen; unsupported sources throw as before.

### E2E

- `pnpm run e2e` on the PR through CI. Visual snapshots must be identical; step 2 changes no DOM.

## Decisions

- **brandi container as the composition root.** The Core is assembled the way datagrid-web, gallery-web and maps-web assemble theirs: typed tokens, `injected` constructors, a container class whose constructor binds the props-independent parts and whose `init` binds the config, the gate and the selector family. The container stays inside the Core; views get the snapshot and never resolve anything, so `brandi-react` is not needed.
- **Static properties in a frozen config.** Simple-type props never change for a widget instance, so `comboboxConfig(props)` reads them once. The Core's hints are a plain field; `filterable`, `canSelectAll`, `loading.lazy`, `id` and `tabIndex` read the config; the forced-boxes rule for chips is applied there instead of inside the multi selectors. The selectors keep their own copies for now: the characterisation tests pin them, and step 3 replaces the seam.
- **One `setProps` for the gate and the selector.** The selector seam still takes props by method call, so the container pushes a props object through the gate and `selector.updateProps` in one action. A props object already seen is skipped, which keeps the first render at one `updateProps` call.
- **Filter-input action as a setup component.** The debounced action lives in a service registered with the setup host, so `useSetup` disposes it on unmount and a pending call cannot fire after the widget is gone. It reads the action from the gate when the timer fires.
- **Props during render, muted reaction.** The repo pattern pushes gate props from a `useEffect`, which costs a second render per props change. The selector already takes props during render (step 1 kept that for the characterisation tests), so the Core does the same, and the snapshot subscription ignores changes made while the host renders. The host reads the fresh snapshot in that render; React's own consistency check in `useSyncExternalStore` sees no difference afterwards. Verified by the "no render-phase update" test.
- **Keep-alive ViewModel.** A MobX computed is not cached while nothing observes it, and `useSyncExternalStore` reads the snapshot before it subscribes. `viewModel` is `computed({ keepAlive: true })` so the first render and the editor preview, which never subscribes, get a stable object.
- **Content rendered by the captions providers.** `ComboboxOptionVM.content` is `caption.render(id, placement)`, so the `CaptionContent` markup and the custom-content wrapper are still produced by the providers, and the preview providers' design-mode overrides keep working. Step 4 moves that markup into the View and leaves only the custom content in the ViewModel. The design doc's "the Core never decides where content is shown" therefore holds from step 4, not from step 2.
- **No open state in the ViewModel yet.** Owning `isOpen`, `inputValue` and `highlightedIndex` means a controlled downshift, which is the Behavior work of step 3. The step 2 type omits them rather than carrying placeholders.
- **Hints use the Studio Pro enumeration values** (`bordered` | `text`, `boxes` | `text`, `skeleton` | `spinner`, `checkbox` | `rowclick`) except `customContent`, which is mapped to `none` | `everywhere` | `menuOnly` as the design doc specifies.
- **`tabIndex` joins the envelope.** It is a system property like class and style and the views need it. The generic design doc is updated.
- **`selectedContent` and `canSelectAll`** are additions to the design doc's ViewModel: the first carries what the input area shows when idle (caption, custom content or joined chip captions), the second whether the select-all control is configured.
- **Cheap structural sharing without `mobx-utils`.** Per-option caching is a `Map` keyed by id with a shallow comparison; slices are compared the same way. No new dependency.

## Notes

- Simplification 1: the single clear button used to show on `!readOnly && clearable && currentId !== null` or on a second clause for static sources that was implied by the first; now only the first. The click handler used to guard on `selectedItem || selectorType === "static"`, where `selectedItem` is the same `currentId`; now it clears unconditionally, since the button only renders with a value.
- Simplification 2: `aria-required` used to be the raw `DynamicValue` value, which is `undefined` while the expression loads and then omits the attribute; it is now a boolean, so a loading expression renders `aria-required="false"` for that moment. No test or snapshot covers that state.
- Quirk preserved: in multi mode, while the selector reports `currentId === null`, the options get no `aria-selected` attribute instead of `"false"`. Marked `// Quirk:` in `MultiSelectionMenu.tsx`.
- Quirk removed: `useGetSelector` attached the filter-input callback from the second render on, so typed text during the first render only cleared the search term. The downshift hooks now call `core.setInputValue` for every input change.
- The editor preview creates a new container per props object, as it created a new selector before. The preview selectors are plain objects, which is fine: the keep-alive computed evaluates once per Core.
- Run-to-run noise: one full-suite run reported one suite failed to execute while `pnpm run build` was running in parallel in the same package; five later runs were green. Do not run the build and the suite at the same time in one package.
