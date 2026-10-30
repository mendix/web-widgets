## 1. Test Setup

- [x] 1.1 Baseline on the step 1 tip: 17 suites, 197 tests, 5 snapshots, green; `pnpm exec tsc --noEmit -p tsconfig.json` clean.
- [x] 1.2 `src/core/__tests__/ComboboxCore.spec.tsx` on the safety-net fixtures, written against the contract before the views changed.

## 2. Implementation

- [x] 2.1 `src/core/`: envelope types, combobox ViewModel types, `comboboxConfig`, `ComboboxGateProps`, tokens, `ComboboxContainer` with `createComboboxContainer`, the filter-input service and the setup host, `ComboboxCore` with cached slices and bound commands.
- [x] 2.2 `src/hooks/useComboboxCore.ts`: container per host, `useSetup`, props during render, muted subscription. `getSelector` and `useGetSelector` removed with their specs; container and service specs added.
- [x] 2.3 Downshift hooks take the Core: `core.setInputValue` for typed text, `core.t` for the live-region message.
- [x] 2.4 `SingleSelection`, `SingleSelectionMenu`, `MultiSelection`, `MultiSelectionMenu` read the ViewModel only; `Combobox.tsx` resolves the Core from the container, the editor preview from `createPreviewContainer`. Commit 1; snapshots unchanged.
- [x] 2.5 Remove `onAfterSearchTermChange` with its three tests. Commit 2.

## 3. Refactoring

- [x] 3.1 Remove `SelectionBaseProps` and `A11yStatusMessage` from `src/helpers/types.ts`.
- [ ] 3.2 Step 3: `useComboboxBehavior` and `useComboboxPopover`; `isOpen`, `inputValue`, `highlightedIndex` and `highlighted` per option move into the Core; the views drop `core` and keep `vm`; the selectors derive from the gate and the config instead of `updateProps`, and `container.setProps` becomes the gate alone.
- [ ] 3.3 Step 4: `CaptionContent` and the custom-content wrapper move from the captions providers into the View; `ComboboxOptionVM.content` becomes the custom content only.

## 4. Verification

- [x] 4.1 `pnpm run test`: 18 suites, 213 tests, 5 snapshots unchanged, no `-u`.
- [x] 4.2 `pnpm run lint`: 0 errors; 12 warnings, all pre-existing and in untouched lines.
- [x] 4.3 `pnpm exec tsc --noEmit -p tsconfig.json`: clean.
- [x] 4.4 `pnpm run build`: MPK, editor preview and editor config build.
- [ ] 4.5 E2E on the PR through CI with zero visual snapshot changes. The build workflow only runs for PRs that target `main`, so this waits until the safety-net PR merges and this branch is rebased on `main`.

## Notes

- Two code commits, core with container and views, then the callback removal, plus this change. Each keeps the suite green.
- Test count: 197 on the step 1 tip, plus 19 Core and hook tests, 12 container tests and 6 service tests, minus 10 `getSelector` tests, 8 `useGetSelector` tests and 3 callback tests, equals 213.
