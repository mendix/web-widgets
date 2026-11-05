# @mendix/combobox-kit

The headless combo box: `combobox-web` is a thin host over this package. Read
`docs/design/headless-widgets.md` and `docs/design/headless-combobox.md` first.

## Entries

- `.` (`src/main.ts`): the contract. `ComboboxViewModel` and its types, `useComboboxCore(props)`
  for a host, `createComboboxContainer`, the envelope and input facet re-exported from
  `@mendix/widget-kit`.
- `./atlas`: the Atlas View (`ComboboxView` with `classes` and `parts`), the parts, the class map,
  `useComboboxBehavior` (downshift, controlled) and `useComboboxPopover` (floating-ui). A View that
  does not use them never imports this entry.
- `./conformance`: `describeComboboxConformance(name, View)`, the Jest + RTL suite every View must pass.
- `./preview`: what the Studio Pro editor preview needs.

## Layout

- `src/core/`: `ComboboxCore`, the brandi container, config, props gate, services, the view model builder.
- `src/helpers/`: the selectors and providers per data source family, the Core's internal model.
- `src/preview/`: the selectors the editor preview uses.
- `src/hooks/`, `src/atlas/`: the Atlas View and its hooks.
- `src/sandbox/`: throwaway Views that test the contract; not built into `dist`.
- `src/typings/ComboboxProps.ts`: a copy of the typings `combobox-web` generates from `Combobox.xml`;
  a spec fails when the two drift. Regenerate in the widget, then copy.

## Rules

- The Core knows nothing about HTML. The ViewModel is plain data and stable commands.
- The Atlas stylesheet lives in `combobox-web` (`src/ui/Combobox.scss`): the MPK ships the CSS.
- Run `pnpm run build` here before `pnpm run test` in `combobox-web`; the widget consumes `dist`.
