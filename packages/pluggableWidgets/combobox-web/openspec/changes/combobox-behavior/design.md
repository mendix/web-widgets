## Test Cases

The component specs and the 5 snapshots remain the net. The Core and the Behavior get their own cases.

### Regression Tests

- Views render the same DOM (unit) - `src/__tests__/SingleSelection.spec.tsx`, `MultiSelection.spec.tsx`, `StaticSelection.spec.tsx`
    - **Given**: the views over the Behavior and Popover hooks
    - **When**: the 29 component cases run
    - **Then**: all pass, the 5 snapshots are unchanged
- Chip navigation, focus after chip removal, lazy first load (unit) - `MultiSelection.spec.tsx`, `SingleSelection.spec.tsx`
    - **Given**: the controlled downshift
    - **When**: the WC-3347 cases, the focus cases and the lazy-loading cases run
    - **Then**: unchanged expectations hold

### Core (`src/core/__tests__/ComboboxCore.spec.tsx`, "ui state")

- open, close and toggle; highlight marks one option; the search term is the input value and a reset runs no action; enter and leave run their actions and leave closes; the first page is requested on open when lazy loading, once per datasource filter and read-only state; nothing is requested without lazy loading.

### Behavior (`src/hooks/__tests__/useComboboxBehavior.spec.tsx`)

- Backspace on an empty clearable single input clears; Space toggles the highlighted item in multi mode and keeps the menu open; Escape closes and drops the typed text; focus crossing the widget boundary runs enter and leave, and leave closes and drops the typed text; focus moving inside the widget runs neither; mouse-down on the menu list is prevented; a multi-select menu opens with no highlight and a single-select menu on its first option.

### E2E

- `pnpm run e2e` on the PR through CI. Visual snapshots must be identical; step 3 changes no DOM. The 55-case suite is the real net for the keyboard flows. Run locally on 2026-11-02 against the test project: 52 passed, 2 skipped, 3 failed, and the three failures were two regressions of the first cut of this change (see Notes), both fixed and pinned by unit tests. The re-run after an app restart was green. Note for next time: the Mendix 11 client bundles the widgets at app start, so a rebuilt MPK is not picked up by a running app.

## Decisions

- **Downshift fully controlled.** `isOpen`, `inputValue`, `highlightedIndex` and `selectedItem` are passed in from the ViewModel and every `onXChange` forwards to a command. The two state reducers are kept verbatim, so the accumulated key-handling fixes survive. Downshift becomes an implementation detail of the Behavior hook.
- **The input value is the search term.** They were always set together; the only difference was downshift's initial caption, which the single reducer wiped on the first controlled update. `setInputValue(text, reason)` keeps the one behavioural distinction: typed text runs the filter-input action, a reset after a selection or on close does not.
- **Enter and leave are commands.** The actions arrive through the gate and `leave()` closes the menu, so the close callback the hooks assigned on the selector is gone. `getRootProps()` only does the `relatedTarget` containment check.
- **Lazy first page in the Core.** `open()` requests it once; a setup reaction resets the flag when the datasource filter or the read-only state changes, which is what the former effect's dependency array did. This needs the Core to be registered with the setup host before `setup()` runs, so the container resolves it in `init`.
- **Status message stays in the Behavior.** The multi-mode message depends on downshift's `previousResultCount`, which only downshift knows. The Behavior composes it with `vm.t` exactly as before; `a11y.statusMessage` on the envelope waits for the conformance suite, when a View without Behavior needs it.
- **Closing a single-select menu drops the filter text.** That was downshift's single-mode reducer on `closeMenu`, which the leave callback used to call; with `leave()` closing through the Core, `close()` resets the text itself in single mode. A multi-select keeps the text on close, as its reducer always did.
- **A multi-select menu opens with no highlight.** Only the single-select hook set `defaultHighlightedIndex: 0`; the Behavior passes it per mode.
- **Getters return downshift's attributes, nothing more.** Data attributes arrive in step 4. `getToggleProps()` returns downshift's full set and the Atlas View spreads only `id` and `onClick` on the container, `getChipRemoveProps()` has no `tabIndex`, and `getOptionProps()` carries the multi-mode `aria-selected` quirk, all for DOM parity.
- **Multi selection changes are diffed.** Downshift reports the whole new list; the Behavior turns it into `select` and `deselect` per id. Downshift reports the same removal twice (its own change and the `setSelectedItems` echo the old hook also made), which the diff absorbs because the Mendix value has not changed in between.
- **The views own their root.** The `widget-combobox` element moved from `Combobox.tsx` into the views so the root props have an element; the placeholder keeps its own root and the editor preview passes its class through. The DOM is identical.

## Notes

- `vm.mode` is static, so the Behavior calls `useMultipleSelection` in both modes (empty in single mode) rather than conditionally.
- Found by the local E2E run and fixed before the push: leaving a single-select widget kept the typed text, and a multi-select menu reopened with its first option highlighted. Both came from the first cut of this change, not from the old code. The E2E suite was the only net that caught them, which is the case for running it per step.
- Found on 2026-11-02 in a development build of the app and folded into this change: the Behavior calls `useMultipleSelection` in both modes, but the first cut of single mode never called its `getDropdownProps` getter, so downshift's dev-mode checker logged "You forgot to call the getDropdownProps getter function" on mount and "The ref prop \"undefined\" from getDropdownProps was not applied correctly" on every render. Single mode now calls the getter with `preventKeyAction: true` and the ref error suppressed, the same way multi mode does. The package's Jest setup fails a test on any `downshift:` console error, so the component specs catch a repeat.
- The known intermittent multi-select click bug and the lost keys during the first lazy load (E2E memory) are unchanged: both sit in downshift's event handling and the datasource timing, not in the ownership of state.
- Lint moved from 12 to 7 warnings, the difference being warnings in the deleted hooks.
- Verification at the tip: `pnpm exec tsc --noEmit` clean; `pnpm run test` 19 suites, 227 tests, 5 snapshots unchanged; `pnpm run lint` 0 errors; `pnpm run build` OK after the first commit and after the second.
