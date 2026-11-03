## 1. Test Setup

- [x] 1.1 Baseline on the parts tip after the rebase on the test PR: 20 suites, 243 tests, 5 snapshots, green; `tsc --noEmit` clean.
- [x] 1.2 Core cases for `a11y.statusMessage` written before the Behavior stopped composing it.

## 2. Implementation

- [x] 2.1 `ComboboxCore`: `statusMessage` computed, carried on `a11y`; the Behavior returns it from `getA11yStatusMessage`.
- [x] 2.2 `src/conformance/describeComboboxConformance.tsx`: sixteen role-based cases over a live Core.
- [x] 2.3 `ComboboxView.conformance.spec.tsx`: the Atlas View runs the suite; `aria-multiselectable` added to the Behavior's menu props where the suite failed.
- [x] 2.4 `src/sandbox/BareView.tsx` with README and spec: passes the suite with no change to the suite.

## 3. Refactoring

- [ ] 3.1 Step 6: move the Core, hooks, Atlas View, conformance suite and sandbox into `packages/headless/combobox`; the View takes the Core; the suite becomes importable by an app project.

## 4. Verification

- [x] 4.1 `pnpm run test`: 22 suites, 277 tests, 5 snapshots (three updated once, additive).
- [x] 4.2 `pnpm run lint`: 0 errors; 7 warnings, pre-existing.
- [x] 4.3 `pnpm exec tsc --noEmit -p tsconfig.json`: clean.
- [x] 4.4 `pnpm run build`: MPK, editor preview and editor config build; nothing from `src/sandbox/` in the bundle; MPK copied into the test project.
- [ ] 4.5 E2E locally against the test project after an app restart in Studio Pro; visual snapshots identical.
- [ ] 4.6 E2E on the PR through CI; waits for the test PR to merge and a rebase on `main`.

## Notes

- Test count: 243 on the rebased parts tip, plus 2 Core cases and 16 conformance cases run twice, equals 277.
