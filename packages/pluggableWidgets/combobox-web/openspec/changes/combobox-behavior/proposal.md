## Why

Migration step 3 of `docs/design/headless-combobox.md`: the Core owns the open flag, the input text and the highlighted index, and the keyboard and ARIA handling becomes a function of the ViewModel. After step 2 the views rendered from the snapshot but still took the Core, because the two downshift hooks read the selector directly, assigned a close callback on it, and owned the UI state. A View built on another library could not be written, and the enter, leave and lazy-loading side effects lived in React hooks next to the markup.

## Root Cause

Downshift ran in uncontrolled mode. Its state was the source of truth for what the user saw, so the Core could neither close the menu on leave nor know which option was highlighted, and the views had to hand downshift the selector to read captions, options and the current value.

## What Changes

- `src/core/ComboboxViewModel.ts`: `inputValue`, `isOpen`, `highlightedIndex` and `highlighted` per option; commands `open`, `close`, `toggle`, `highlight`, `enter`, `leave`; `setInputValue(text, reason)` where `reset` runs no action.
- `src/core/ComboboxGate.ts`: `onEnterEvent` and `onLeaveEvent` join the gate.
- `src/core/ComboboxCore.ts`: observable `isOpen` and `highlightedIndex`; `inputValue` is the selector's search term; an `input` slice; `enter` and `leave` run the Mendix actions, `leave` closes. The lazy first page is requested by `open()`, once per datasource filter and read-only state, through a setup reaction; the Core is a setup component and the container creates it upfront so the reaction is registered before the host runs.
- `src/hooks/useComboboxBehavior.ts` (new): downshift in fully controlled mode over the ViewModel, returning the prop getters of the design doc, section 4. The two state reducers, the chip navigation rule, the focus restoration after chip removal, the Space toggle, the menu mouse-down guard and the scroll-driven lazy loading move here unchanged.
- `src/hooks/useComboboxPopover.ts` (new): wraps `useFloatingMenu`, section 5 shape.
- `src/components/*`: `SingleSelection` and `MultiSelection` take `{ vm, keepMenuOpen?, className? }`, render their own `widget-combobox` root with the root props, and spread the getters; the menus take the Behavior; `ComboboxWrapper`, `ComboboxMenuWrapper` and `ComboboxOptionWrapper` take plain prop objects. `Combobox.tsx` renders the placeholder root itself and hands the views the snapshot; the editor preview passes its class to the view.
- Removed: `useDownshiftSingleSelectProps`, `useDownshiftMultiSelectProps`, `useActionEvents`, `useLazyLoading`, `onEnterEvent` and `onLeaveEvent` on the `Selector` interface and the preview selectors, `SelectionProps.core`.
- Specs: six Core tests for the UI state, six Behavior tests for the must-survive items the component specs did not cover.

Not in this change: the selectors still take props through `updateProps`. Deriving them from the gate and the config is a separate change (`combobox-selector-gate`), independent of the Behavior and with its own risk.

## Impact

- **Behaviour**: none intended. 225 tests pass, the 5 DOM snapshots are untouched, no `-u`. The known browser-only bugs listed in the E2E memory are neither fixed nor reintroduced here.
- **Runtime**: downshift re-renders through the snapshot hook instead of its own state; one store update per keystroke, as before one React state update.
- **Release**: no CHANGELOG entry. Nothing user-facing changes.
- **Dependencies**: none added.
