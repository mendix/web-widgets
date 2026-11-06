## Why

Migration step 6 of `docs/design/headless-combobox.md`: the core, the view model, the Atlas view and the conformance suite leave the widget and become packages, so that the widget is the thin host of section 10 and a view can be written against a package instead of against widget internals. Steps 1 to 5 and 7 prepared the code for it; the Studio Pro trial of step 8 (commit `feat(combobox-web): render a view from the app project when the widget name asks for one`) showed the seams hold.

## Root Cause

Everything lived under `combobox-web/src`, so the contract, the Atlas view and the Studio Pro surface shipped and versioned as one thing, and a second widget or an app project could not depend on the parts it needs.

## What Changes

- `packages/kits/widget-kit` (new, `@mendix/widget-kit`): `WidgetViewModel.ts` (the envelope, the input facet, `Translate`, `TextMap`), `focusBoundaryProps.ts` (new: the focus handlers a view spreads on its root), `useObservableSnapshot.ts` with its spec.
- `packages/kits/combobox-kit` (new, `@mendix/combobox-kit`): `src/core`, `src/helpers`, `src/hooks`, `src/conformance` and `src/sandbox` moved as they were; `src/components` becomes `src/atlas` and takes `icons.tsx`; `src/helpers/Preview` becomes `src/preview`. Four entries: `main.ts` (the contract, `useComboboxCore`, the container), `atlas.ts`, `conformance.ts`, `preview.ts`. `src/typings/ComboboxProps.ts` is a copy of the widget's generated typings with a spec that fails when the two drift. `AGENTS.md` describes the entries and the rules.
- Both packages are private workspace packages built with `tsc` into `dist`, exporting every file by path (`"./*"`) like the shared plugin packages, with `jest` over the pluggable-widgets-tools base config and the widget's strict MobX setup.
- `combobox-web` keeps `Combobox.tsx` (imports `useComboboxCore` from the package and always renders the Atlas view from `./atlas`; the name-suffix trial with its external dynamic imports is removed because mxbuild cannot resolve them in a test project without `node_modules`), the editor config and preview (`./preview`), the XML, icons, `ui/Combobox.scss`, the generated typings and its three specs with their five snapshots. Its dependencies reduce to `@mendix/combobox-kit`; `downshift` and `mobx` stay as dev dependencies of the specs and the Jest setup. The specs mock the floating hook through the package path.
- The Behavior's `getRootProps` and the bare view use `focusBoundaryProps` instead of their own copies of the containment check; the Behavior spec hosts the Atlas view over `useComboboxCore` instead of importing the widget.

Not in this change: publishing, the `uiVariant` property and the real registry (step 8), the Playwright half of the conformance suite, a narrower config type instead of the generated props.

## Impact

- **Behaviour**: none. The MPK bundles the package; the widget's three specs and five snapshots pass unchanged against `dist`.
- **Apps**: none.
- **Release**: no CHANGELOG entry.
- **Dependencies**: no new third-party dependency. `@floating-ui/react`, `brandi`, `classnames`, `downshift`, `match-sorter`, `mobx` and the workspace plugins move from the widget to the package. The headless packages are consumed as `workspace:*`; `pnpm turbo build` and the `test` task's `^build` dependency build them first.
