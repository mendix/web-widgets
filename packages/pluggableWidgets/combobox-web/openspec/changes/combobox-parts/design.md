## Test Cases

The DOM must not change: `pnpm run test` without `-u`, the five snapshots pass as they are. The component and Behavior cases render the widget, so they cover the composition in both modes without edits.

### Regression Tests

- Views render the same DOM (unit) - `src/__tests__/SingleSelection.spec.tsx`, `MultiSelection.spec.tsx`, `StaticSelection.spec.tsx`, `src/hooks/__tests__/useComboboxBehavior.spec.tsx`
    - **Given**: the widget over `ComboboxView`
    - **When**: the component cases run
    - **Then**: all pass unchanged, the snapshots are identical
- Menu positioning (unit) - `src/components/parts/__tests__/Menu.spec.tsx` (the former `ComboboxMenuWrapper` spec)
    - **Given**: the `Menu` part open, floating or always open
    - **Then**: floating styles and ref applied when floating, inline and no ref when always open, `data-open` only when open
- Class override (unit) - `src/components/__tests__/ComboboxView.spec.tsx` (new)
    - **Given**: the View with `classes={{ inputContainer, caption }}`
    - **Then**: the input container carries the override and not the Atlas class; the caption inside the placeholder part carries its override; the other keys keep their Atlas class
- Part replaced (unit) - same spec
    - **Given**: the View with `parts={{ Option }}` rendering its own `li` with the given `optionProps`
    - **When**: the menu opens
    - **Then**: the custom options render with `role="option"` and `aria-selected` from the Behavior; the list around them is still the Atlas one

### E2E

- `pnpm run e2e` locally against the test project after an app restart, then on the PR through CI. Snapshots must be identical; this change changes no DOM. The local run after the app restart was green.

## Decisions

- **A part is something worth replacing as a whole.** Eleven parts, not one per class key and not the seventeen of the design doc's sketch. The root, the input area and the input element stay in the View: they carry the Behavior wiring (`getRootProps`, `getInputProps`) and nothing a View author would redo without redoing the View. The chip remove control is inside `Chip`, the menu header, list and footer inside `Menu`, the icons inside their control, the skeleton and spinner rows inside `Loader`: nobody replaces the chevron without replacing the toggle. Everything inside a part stays reachable through `classes`.
- **Parts read the classes through a hook, not a prop.** `ComboboxView` resolves `defaultClasses` with its `classes` override once and provides the result through `ComboboxClassesContext`; parts and the components inside them (`Caption`, `OptionContent`, icons, loaders) call `useComboboxClasses()`. A `classes` prop on every part would have to be threaded into every nested component for one override to reach a caption or an icon. A replaced part usually brings its own classes and ignores the hook. Outside a View the context falls back to the Atlas defaults, which is what the `OptionContent` spec and the unavailable placeholder rely on.
- **Overrides replace, they do not append.** `classes={{ menuItem: "my-option" }}` renders `my-option` and not `widget-combobox-item my-option`, per the generic design: a Tailwind user does not want Atlas rules dragged along. Appending is explicit on the caller's side.
- **One View for both modes.** `SingleSelection` and `MultiSelection` differed in the chips, the select-all header, the checkbox per option, the placeholder content and five flags. `ComboboxView` renders one tree and branches on `vm.mode` where the DOM differed: the chips and `data-style` in multi mode, `data-custom` and the custom content in the input area in single mode, the select-all header when `canSelectAll`, the checkbox and the caption `label` when the selection method asks for one. The branches are kept exactly where the old views differed so the snapshots stay identical; two of them (`data-style` only in multi mode, `data-custom` only in single mode) could be unified later as a deliberate DOM change.
- **The View still takes `vm`.** The design doc's contract passes the Core and lets the View subscribe. That belongs to step 6 with the wrapper of section 10; until then `Combobox.tsx` subscribes through `useComboboxCore` and passes the snapshot, as before. The View spec mounts the View the same way, through a small harness over `useComboboxCore`, so that a command re-renders it.
- **`keepMenuOpen` and `className` stay as View props.** They serve the editor preview only. Making the preview Core report `isOpen` would be cleaner but touches the Core for a preview concern; deferred.
- **Parts take what they read, not a uniform prop set.** `Menu`, `Clear` and `SelectAll` do not read the ViewModel and do not receive it; the others do. `Option` and `Chip` receive their `index` although the Atlas parts do not use it, because a replacement plausibly does.

## Notes

- `src/components/` keeps its name until step 6 moves the Atlas View into the package as `src/atlas/`.
- The `no-array-index-key` lint warning moved from `Loader.tsx` to `parts/Loader.tsx` with the skeleton rows; the rows are identical and have no identity, as before.
- Verification at the tip is recorded in tasks.md.
