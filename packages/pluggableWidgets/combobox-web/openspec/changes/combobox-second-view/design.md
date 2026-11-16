## Test Cases

### Conformance suite (`src/conformance/describeComboboxConformance.tsx`)

Role-based only: `combobox`, `listbox`, `option`, `button` by accessible name, `checkbox`, `status`, and the ARIA attributes between them. Nothing queries a class name or the markup. Each case mounts the View over a live Core through `useComboboxCore` with the props fixtures; `update()` re-renders with a fresh props object the way the Mendix client does after a write.

Single selection (enumeration, captions `Formatted red|green|blue`, `green` selected):

- Renders a closed combobox input: `aria-expanded="false"`, no options.
- Opens on click: `aria-expanded="true"`, a `listbox`, the three captions in order, `aria-selected` true on the selected option and false on another.
- Opens with ArrowDown and moves the highlight: `aria-activedescendant` names an `option`; ArrowDown changes it, ArrowUp returns to it.
- Enter on the highlighted option writes the value and closes.
- Click on an option writes the value and closes.
- Typing filters the options; a term that matches nothing shows the no-options text inside the listbox.
- Escape closes and writes nothing.
- Focus entering the widget runs the enter action; focus leaving runs the leave action and closes.
- The clear control (button named by `t("clearSelection")`) writes `undefined` and is gone after the update.
- Read-only: the input is disabled, no clear control.
- Validation: `aria-invalid="true"` and `aria-describedby` pointing at an element with the message.
- The live region (`role="status"`) announces the option count while open.

Multiple selection (association, chips style, select-all on, `Apple` selected):

- The selected captions are shown, each with a remove control (button named by `t("removeSelection")`); removing one writes the rest.
- The listbox is `aria-multiselectable`; a click on an option writes the selection, the menu stays open and the option is `aria-selected` after the update.
- A click on a selected option deselects it.
- The select-all checkbox (named by `t("selectAll")`) writes every option.

### Who runs it

- `src/components/__tests__/ComboboxView.conformance.spec.tsx`: the Atlas View, with the floating menu mocked like the other component specs.
- `src/sandbox/__tests__/BareView.spec.tsx`: the bare View, nothing mocked.

### Core (`src/core/__tests__/ComboboxCore.spec.tsx`)

- `a11y.statusMessage`: the selection while closed; the selection, the count and the instructions while open; the no-options text while open with no match; empty while nothing is selected; joined captions in multi mode.

### E2E

- `pnpm run e2e` locally against the test project after an app restart, then on the PR through CI. The only DOM change is `aria-multiselectable` on the multi-select list; visual snapshots must be identical.

## Decisions

- **Step 7 before step 6.** The package move is infrastructure and teaches nothing about the contract; a second View does. Fixing the ViewModel before it crosses a package boundary is cheaper. Step 6 follows.
- **The second View brings its own behaviour instead of a component library.** The design doc sketched a Material UI View. What such a View needs from the ViewModel is the command surface (`open`, `close`, `highlight`, `select`, `toggleItem`, `clear`, `selectAll`, `setInputValue`, `enter`, `leave`) and the texts, not downshift. A hand-rolled View exercises exactly that surface, adds no dependency to the package, and can be deleted without a trace. A library View can still be written later in an app project, which is the real route anyway.
- **The suite is role-based and takes any component that renders the ViewModel.** It is the suite a View author gets. Mounting through the widget's `useComboboxCore` keeps it honest: a case passes only if the View re-renders from the Core.
- **The status message moves into the Core.** The Behavior's downshift callback returns `vm.a11y.statusMessage`. Three a11y-only differences, all deliberate: single mode no longer announces the hardcoded "No options selected." while nothing is selected; multi mode announces the option count regardless of the highlight (the old callback suppressed it while an option was highlighted and the count had not changed); a closed multi-select with no options announces its selection instead of the no-options text.
- **`aria-multiselectable` is a fix, not a contract change.** The ARIA listbox pattern requires it for a list with more than one selectable option, the design doc listed it among the menu props, and the Atlas View never rendered it. One attribute, three snapshot lines.

## What the second View showed about the ViewModel

- `select(id)` does not close a single-select menu and `toggleItem(id)` does not reset the filter text: the Behavior does both through downshift, so a View without the Behavior calls `close()` and `setInputValue("", "reset")` itself. Kept as is: closing on select is a View policy (a multi-select keeps the menu open), and the commands stay orthogonal.
- Opening does not place the highlight: the bare View highlights the first option on open in single mode and nothing in multi mode, the Atlas convention. Kept as is, for the same reason.
- There is no text key for the toggle control. The Atlas toggle is a decorative element next to the input; the bare View hides its toggle from assistive technology. Candidate for a `toggleMenu` key when the texts move to the platform system-text API.
- Nothing else was missing: the chips, the clear and remove labels, select-all with its three states, validation with `describedBy`, read-only, the empty caption, the lazy-loading flags and the footer slot were all there.

## Notes

- Verification at the tip: `pnpm exec tsc --noEmit` clean; `pnpm run test` 22 suites, 277 tests, 5 snapshots, the three multi-select ones updated once (`+aria-multiselectable="true"`); `pnpm run lint` 0 errors, 7 pre-existing warnings; `pnpm run build` OK, the bundle contains nothing from `src/sandbox/`.
- Four code commits (status message, the attribute fix, the suite with the Atlas spec, the sandbox View) plus this change as a docs commit.
