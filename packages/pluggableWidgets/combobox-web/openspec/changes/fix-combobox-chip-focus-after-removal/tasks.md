## 1. Baseline

- [x] 1.1 Confirm the unit suite is green before any change: `cd packages/pluggableWidgets/combobox-web && pnpm run test`
- [x] 1.2 Write a failing unit test first: with three chips in "boxes" style, focus a middle chip, press Delete, and assert `document.activeElement` is the chip that took its place. Confirm it fails with focus on `document.body`, which is the reported defect.
    - Note: the mocked `ReferenceSetValue` updates in place instead of pushing new props, and `selector.currentId` is only recomputed when `Combobox` re-renders (`useGetSelector` calls `updateProps` during render). The tests therefore call `component.rerender(...)` after the keystroke to model the Mendix client feeding the new value back in — that re-render is what unmounts the chip.

## 2. Restore focus after keyboard removal

- [x] 2.1 In `src/components/MultiSelection/MultiSelection.tsx`, add a chip node array ref populated through the `ref` option of `getSelectedItemProps`, alongside downshift's own ref (downshift composes both via `handleRefs`).
- [x] 2.2 Pass an `onKeyDown` into `getSelectedItemProps` that records the chip's index in a ref when the key is `Backspace` or `Delete`. It must not call `preventDefault` or set `preventDownshiftDefault` — downshift still performs the removal.
- [x] 2.3 Add a `useEffect` keyed on the chip count that, when an index was recorded, focuses the chip at `Math.min(index, count - 1)`, focuses the filter input when no chips remain, and clears the recorded index. Bounds-check and null-check the lookup.
- [x] 2.4 Comment the index arithmetic with the downshift 7.6.2 reducer reference (`SelectedItemKeyDownBackspace`/`Delete`, `dist/downshift.cjs.js`) so a downshift upgrade re-checks it, matching the convention of the existing `isChipNavigationPermitted` helper.

## 3. Unit coverage

- [x] 3.1 Extend `src/__tests__/MultiSelection.spec.tsx` with a `focus after keyboard chip removal` describe block whose setup renders the widget with three pre-selected items in "boxes" style.
- [x] 3.2 Cover, for both `Backspace` and `Delete` via `it.each`: first chip, middle chip and last chip removal each leave focus on the expected remaining chip.
- [x] 3.3 Cover removal of the only chip returning focus to the filter input.
- [x] 3.4 Assert in each case that `document.activeElement` is not `document.body`, which is the specific regression.
- [x] 3.5 Run `pnpm run test` and confirm the whole suite passes, including the pre-existing WC-3347 cases. — 61 tests, 6 suites, all green.
- [x] 3.6 Confirm the new tests fail without the fix: stashing only `MultiSelection.tsx` fails the middle-chip, first-chip and continued-navigation cases while the last-chip and only-chip cases still pass, matching the reported asymmetry.

## 4. End-to-end regression

- [x] 4.1 Add a case to `e2e/ComboboxMultiSelectionKeys.spec.js` on `.mx-name-comboBox4`: select three options, ArrowLeft from the empty filter input into the chips, ArrowLeft again to reach a non-last chip, press Delete, and assert the focused element is still a `.widget-combobox-selected-item`.
- [x] 4.2 In the same case, press ArrowLeft once more and assert navigation continues (the focused chip changes), proving focus was genuinely restored to the chip row.
- [x] 4.3 Follow `docs/requirements/e2e-test-guidelines.md` for structure, waits and cleanup; verified with the `eslint-plugin-playwright` rules from `automation/run-e2e/eslint.config.mjs` (clean).
- [ ] 4.4 Run `e2e/Combobox.spec.js` and `e2e/ComboboxMultiSelectionKeys.spec.js` (`pnpm run e2e`) to confirm the new case passes and the WC-3347 cases do not regress. **First run done in CI: 18 passed, 6 failed** — all 6 in `ComboboxMultiSelectionKeys.spec.js`, and both root causes were in the tests rather than the widget (see 4.8 and 4.9). Needs a re-run after those fixes; cannot be run locally, as no Mendix `mxbuild`/`mxruntime` images are cached here and `run-e2e` has no spec filter.
- [x] 4.5 Fix the arrange step of 4.1: `.mx-name-comboBox4` ships with three options already selected on the test page (see the `comboBoxAssociationRowClick` baseline and the `nth(3)` clear button in `Combobox.spec.js`), so asserting a chip count of 1 after the first click could never pass. Clear the widget first, then select from the top, via a shared `selectChips` helper.
- [x] 4.6 Cover the remaining scenarios of the requirement in e2e: removing the only chip returns focus to the filter input (both keys), and Backspace on an empty filter input still reaches the last chip and removes it on the second press — the shortcut the WC-3347 gating rewrite is closest to breaking.
- [x] 4.7 Cover the WC-3347 partial-selection scenario in e2e as well: it asserts that the unselected tail of the text survives, which jsdom cannot verify because it does not perform native text deletion.
- [x] 4.8 Fix the four chip-navigation cases that failed in CI with chips silently dropping from 3 to 0 and `.mx-name-comboBox4 input` reported as not found: each pressed Escape first to close the menu. These specs run on a popup page (`.mx-name-actionButton1`), the Mendix client closes that popup on Escape, and downshift's input Escape handler only calls `preventDefault()` without stopping propagation, so the widget left the DOM mid-test. Escape is not needed at all — picking an option already leaves the filter input focused (`MultiSelection`'s `onOptionClick`), which `selectChips` now asserts as a postcondition.
- [x] 4.9 Fix the partial-selection case that failed in CI on `locator.click: element is not visible`: an empty, unfocused filter input is `max-width: 0` (`src/ui/Combobox.scss`). Focus it by opening the menu instead — downshift focuses the input whenever the menu opens without it already being focused (`useCombobox`'s `[isOpen]` effect, downshift 7.6.2) — clicking the down arrow rather than the input container, since a centre click on the container can land on a chip.
- [x] 4.10 Record both traps in `docs/requirements/e2e-test-guidelines.md`, since neither is combobox-specific.

## 5. Verify against a running app

- [x] 5.1 Build the widget to type-check the change: `pnpm run build` (clean).
- [ ] 5.2 Deploy to the Studio Pro test project (`export MX_PROJECT_PATH=<combobox test project>`), then manually walk the chips with the arrow keys and delete the first, a middle and the last chip, confirming focus stays on the chip row each time and that a subsequent arrow key continues navigation.

## 6. Release housekeeping

- [x] 6.1 Add a user-facing entry under `## [Unreleased]` → `### Fixed` in `CHANGELOG.md` describing the behaviour only, with no implementation detail. No version bump — versions are bumped at release time.
- [x] 6.2 Confirm lint is clean for the touched package: `pnpm run lint` reports 0 errors and no warnings in the touched files.
