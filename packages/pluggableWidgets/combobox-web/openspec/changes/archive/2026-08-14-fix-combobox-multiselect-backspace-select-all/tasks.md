## 1. Baseline

- [x] 1.1 Confirm the existing unit suite is green before any change: `cd packages/pluggableWidgets/combobox-web && pnpm run test`
- [x] 1.2 Get the Backspace reproduction and the Delete control BOTH executing against the running test project, using `e2e/WC-backspace-stale-diagnostic.spec.js` as the starting point — the Delete case has never been observed green (click timeout on refocus after blur). Fix the selectors/waits so the run shows Backspace failing and Delete passing.

## 2. Fix the key handler

- [x] 2.1 Add a local predicate in `src/components/MultiSelection/` replicating downshift 7.6.2's `isKeyDownOperationPermitted`: return false if `shiftKey || metaKey || ctrlKey || altKey`, and false if the target is an `HTMLInputElement` whose `value !== ""` and `(selectionStart !== 0 || selectionEnd !== 0)`. Comment it with the downshift source reference and version so a future upgrade re-checks it.
- [x] 2.2 Require that predicate in the Backspace branch of the `onKeyDown` passed to `getInputProps` in `MultiSelection.tsx` (currently `event.key === "Backspace" && inputRef.current?.selectionStart === 0`).
- [x] 2.3 Require the same predicate in the ArrowLeft branch (`isSelectedItemsBoxStyle` path), replacing its identical `selectionStart === 0` check.
- [x] 2.4 Read the event's own target rather than reaching through `inputRef.current` where practical, so the guard evaluates the element that actually received the key.

## 3. Unit coverage

- [x] 3.1 Add unit tests (Jest + RTL) under `src/**/__tests__/` covering the multi-select key matrix from the spec: Backspace with full selection clears text and activates no chip; Backspace with empty input activates the last chip; Backspace with empty input and zero chips is a no-op; partial selection anchored at 0 removes only selected characters; Delete with full selection matches Backspace.
- [x] 3.2 Add unit tests for ArrowLeft in "boxes" style: collapsed caret at 0 reaches the chips; active text selection does not.
- [x] 3.3 Run `pnpm run test` and confirm all pass, including the pre-existing single-select Backspace behaviour.

## 4. End-to-end regression

- [x] 4.1 Promote the diagnostic into a proper regression test in `e2e/` covering the user-visible round trip: type filter text with chips present → select all → Backspace → click outside → click back in → input still empty. Follow `docs/requirements/e2e-test-guidelines.md` (including `window.mx.session.logout()` cleanup).
- [x] 4.2 Cover the Delete path in the same regression test file so the asymmetry cannot silently return.
- [x] 4.3 Delete the throwaway `e2e/WC-backspace-stale-diagnostic.spec.js` once its coverage lives in the regression test.
- [x] 4.4 Run the widget's existing `e2e/Combobox.spec.js` to confirm nothing regressed — in particular the single-select "clears with backspace" and "types filter when selected" tests.

## 5. Verify the fix

- [x] 5.1 Build and deploy to the Studio Pro test project: `export MX_PROJECT_PATH=<combobox test project>` then `pnpm --filter @mendix/combobox-web run build`
- [x] 5.2 Re-run the regression test against the deployed widget and confirm both the Backspace and Delete cases pass. If Backspace still fails, return to the design's mechanism section rather than guessing another fix.

## 6. Release housekeeping

- [x] 6.1 Bump 2.9.0 → 2.9.1 in `package.json` and in the `<clientModule version="2.9.0">` attribute in `src/package.xml` (leave the `version="1.0"` XML declaration alone), keeping the two in sync.
- [x] 6.2 Add a user-facing entry under `## [Unreleased]` → `### Fixed` in `CHANGELOG.md` describing the behaviour only (e.g. selecting all text in a multi-select combobox and pressing Backspace now clears it permanently), with no implementation detail.
- [x] 6.3 Confirm lint is clean for the touched package.
