## Why

Migration step 5 of `docs/design/headless-combobox.md`: the Atlas View becomes a composition of parts, and gains the `classes` and `parts` props that give an app developer the first two customisation levels of the generic design (a class override, a part replaced). After step 4 the class names come from one map and state is a data attribute, but the map is a module constant, so nothing can override it, and the markup lives in two near-identical views (`SingleSelection`, `MultiSelection`) plus three wrappers, so nothing can be replaced on its own.

## Root Cause

The views grew per mode. Each one assembles the input area, the menu and the options inline and shares code through wrappers that take a dozen flags. Class names are read from a module import, which is fine for one View and useless for an override.

## What Changes

- `src/components/parts/` (new): eleven components, each something a View author would replace as a whole: `InputContainer`, `Placeholder`, `Chip`, `Clear`, `Toggle`, `Validation`, `Menu`, `SelectAll`, `Option`, `NoOptions`, `Loader`. Each takes the ViewModel where it reads from it and the Behavior props of its element.
- `src/components/parts.ts` (new): `ComboboxParts`, the type of the map, and `atlasParts`, the Atlas defaults.
- `src/hooks/useComboboxClasses.ts` (new): a context holding the resolved class map, provided by the View, read by the parts and the components inside them (`Caption`, `OptionContent`, the icons, the loaders). The module constant becomes `defaultClasses`, used outside the View for the unavailable placeholder only.
- `src/components/ComboboxView.tsx` (new): the Atlas View, one component for both modes, with `vm`, `classes?`, `parts?`, and the editor preview's `keepMenuOpen?` and `className?`. It resolves the class map and the parts, then renders the composition: root, input container with chips (multi, boxes style), input, placeholder, clear button and toggle, the validation message, and the menu with the select-all header (multi), the options or the empty row, the loader rows and the footer.
- Removed: `SingleSelection`, `SingleSelectionMenu`, `MultiSelection`, `MultiSelectionMenu`, `SelectAllButton`, `ComboboxWrapper`, `ComboboxMenuWrapper`, `ComboboxOptionWrapper`, `Loader`, `Placeholder` (its unavailable placeholder moves to `UnavailablePlaceholder.tsx`, its `NoOptionsPlaceholder` and `InputPlaceholder` become the `NoOptions` and `Placeholder` parts), `SelectionProps`.
- `src/Combobox.tsx` and `src/Combobox.editorPreview.tsx` render `ComboboxView`.
- Specs: the menu wrapper spec becomes the `Menu` part spec; a new `ComboboxView` spec covers the defaults, a `classes` override reaching a part's element and an element inside a part, and a replaced `Option` part that receives the Behavior props. The five DOM snapshots are untouched.

Not in this change: the package move and the `core` prop on the View (step 6); the second View (step 7).

## Impact

- **Behaviour**: none. The DOM is identical: same elements, classes, attributes and order in both modes, verified by the untouched snapshots and the component cases.
- **Apps**: none until the View is replaceable from the app project (step 6 and the client work in the generic design).
- **Release**: no CHANGELOG entry, nothing user-visible changes.
- **Dependencies**: none added.
