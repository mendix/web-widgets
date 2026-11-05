## 1. Test Setup

- [x] 1.1 Baseline on the envelope-and-facet tip: 22 suites, 279 tests, 5 snapshots, green; `tsc --noEmit` clean; lint 0 errors.
- [x] 1.2 Typings copy spec written with the package, before the first build.

## 2. Implementation

- [x] 2.1 `packages/kits/widget-kit`: `WidgetViewModel.ts`, `focusBoundaryProps.ts`, `useObservableSnapshot.ts` and its spec; package, tsconfig, Jest and ESLint files; README.
- [x] 2.2 `packages/kits/combobox-kit`: `core`, `helpers`, `hooks`, `conformance`, `sandbox` moved; `components` to `atlas` with `icons.tsx`; `helpers/Preview` to `preview`; the four entries; `typings/ComboboxProps.ts` with its spec; `AGENTS.md`; package, tsconfig, Jest and ESLint files, the strict MobX Jest setup.
- [x] 2.3 Imports rewritten across the 91 moved files; the Behavior spec hosts `ComboboxView` over `useComboboxCore`; the Behavior root props and `BareView` use `focusBoundaryProps`.
- [x] 2.4 `combobox-web`: `Combobox.tsx`, the editor config and preview and `uiRegistry.ts` import from the package entries; the three specs mock the floating hook through the package path; `typings/combobox-ui.d.ts` points at the package; dependencies reduced to `@mendix/combobox-kit`, `downshift` and `mobx` as dev dependencies.

## 3. Refactoring

- [ ] 3.1 Step 8: the `uiVariant` property and the registry decision replace the name-suffix trial.
- [ ] 3.2 A narrower core config replaces the copied generated typings.

## 4. Verification

- [x] 4.1 `pnpm run build` in both packages: clean.
- [x] 4.2 `pnpm run test`: widget-kit 1 suite, 3 tests; combobox-kit 19 suites, 226 tests; combobox-web 3 suites, 51 tests, 5 snapshots untouched.
- [x] 4.3 `pnpm run lint`: 0 errors in all three; 7 pre-existing warnings in the package, 2 in the widget, 0 in the generic package.
- [x] 4.4 `pnpm exec tsc --noEmit` in the widget: clean.
- [x] 4.5 `pnpm turbo build --filter @mendix/combobox-web`: 9 tasks, MPK built with the Atlas view bundled and copied into the PoC project.
- [ ] 4.6 E2E locally against the test project after an app restart in Studio Pro.
- [ ] 4.7 E2E on the PR through CI.

## Notes

- One code commit (the move, with history through `git mv`) plus this change as a docs commit.
