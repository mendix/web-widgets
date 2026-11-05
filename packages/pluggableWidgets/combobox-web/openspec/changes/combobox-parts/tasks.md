## 1. Test Setup

- [x] 1.1 Baseline on the classes tip: 19 suites, 228 tests, 5 snapshots, green; `tsc --noEmit` clean; local E2E green.
- [x] 1.2 `ComboboxView` spec written for the `classes` override and a replaced part before the views were cut.

## 2. Implementation

- [x] 2.1 `src/components/parts/`: `InputContainer`, `Placeholder`, `Chip`, `Clear`, `Toggle`, `Validation`, `Menu`, `SelectAll`, `Option`, `NoOptions`, `Loader`.
- [x] 2.2 `src/components/parts.ts`: `ComboboxParts` and `atlasParts`.
- [x] 2.3 `src/hooks/useComboboxClasses.ts`: context and hook; `classes.ts` exports `defaultClasses`; `Caption`, `OptionContent`, the icons and the loaders read the hook.
- [x] 2.4 `src/components/ComboboxView.tsx`: the composition for both modes with `classes` and `parts` props; `Combobox.tsx` and the editor preview render it.
- [x] 2.5 The two views, their menus, the three wrappers, `Loader`, `Placeholder`, `SelectAllButton` and `SelectionProps` removed; the unavailable placeholder in `UnavailablePlaceholder.tsx`.
- [x] 2.6 Specs: menu wrapper spec moved to `parts/__tests__/Menu.spec.tsx`; `ComboboxView.spec.tsx` added.

## 3. Refactoring

- [ ] 3.1 Step 6: move the Core, hooks and Atlas View into `packages/kits/combobox-kit`; the View takes the Core.

## 4. Verification

- [x] 4.1 `pnpm run test`: 20 suites, 231 tests, 5 snapshots untouched.
- [x] 4.2 `pnpm run lint`: 0 errors; 8 warnings, all pre-existing or moved with their code.
- [x] 4.3 `pnpm exec tsc --noEmit -p tsconfig.json`: clean.
- [x] 4.4 `pnpm run build`: MPK, editor preview and editor config build; MPK copied into the test project.
- [x] 4.5 E2E locally against the test project after an app restart in Studio Pro; visual snapshots identical. Green.
- [ ] 4.6 E2E on the PR through CI; waits for the safety-net PR to merge and a rebase on `main`.

## Notes

- One code commit (parts, View, hook, specs) plus this change as a docs commit.
- Test count: 228 on the classes tip, plus 3 `ComboboxView` cases, equals 231; the 3 menu cases moved with the part.
