## 1. Test Setup

- [x] 1.1 Baseline on the step 2 tip: 18 suites, 213 tests, 5 snapshots, green; `tsc --noEmit` clean.
- [x] 1.2 Core "ui state" cases written against the extended contract before the views changed.

## 2. Implementation

- [x] 2.1 ViewModel: `inputValue`, `isOpen`, `highlightedIndex`, `highlighted` per option, `open`/`close`/`toggle`/`highlight`/`enter`/`leave`, `setInputValue(text, reason)`. Gate: `onEnterEvent`, `onLeaveEvent`.
- [x] 2.2 Core: observable UI state, `input` slice, enter and leave, lazy first page on `open()` with the setup reaction; container resolves the Core upfront. Commit 1; the old hooks still work on top.
- [x] 2.3 `useComboboxBehavior`: controlled downshift, prop getters, reducers and fixes carried over; `useComboboxPopover`.
- [x] 2.4 Views, menus and wrappers over the getters; `Combobox.tsx` and the preview hand over the snapshot only; old hooks and the selector callbacks removed. Commit 2; snapshots unchanged.
- [x] 2.5 Behavior spec for the must-survive items not covered by the component specs.

## 3. Refactoring

- [x] 3.1 `combobox-selector-gate`: the selectors derive from the gate and the config instead of `updateProps`; `container.setProps` becomes the gate alone; `getAll()` stops scheduling the datasource filter from a getter. Done on 2026-11-02.
- [x] 3.2 Step 4: classes map and data attributes; `CaptionContent` moves into the View. Done on 2026-11-02 as `combobox-classes`; `a11y.statusMessage` still waits for a second View.

## 4. Verification

- [x] 4.1 `pnpm run test`: 19 suites, 227 tests, 5 snapshots unchanged, no `-u`.
- [x] 4.2 `pnpm run lint`: 0 errors; 7 warnings, all pre-existing and in untouched lines.
- [x] 4.3 `pnpm exec tsc --noEmit -p tsconfig.json`: clean.
- [x] 4.4 `pnpm run build`: MPK, editor preview and editor config build.
- [x] 4.5 E2E run locally on 2026-11-02 against the test project: first run 52 passed, 2 skipped, 3 failed, the 3 fixed (single-select leave kept the text, multi-select reopened highlighted); re-run after an app restart in Studio Pro: green.
- [ ] 4.6 E2E on the PR through CI with zero visual snapshot changes; waits for the safety-net PR to merge and a rebase on `main`.

## Notes

- Two code commits, Core state then Behavior and views, plus this change. Each keeps the suite green.
- Test count: 213 on the step 2 tip, plus 7 Core cases and 7 Behavior cases, equals 227.
