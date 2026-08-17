## Why

In a multi-select Combobox that already has at least one selected chip, selecting all filter text and pressing Backspace appears to clear the input, but the text silently returns as soon as the user clicks outside the widget and back in. A customer reported this; it has been reproduced against a live test project. Pressing Delete instead of Backspace does not show the problem, which makes the behaviour look arbitrary and erodes trust in the widget's basic text editing.

## What Changes

- Backspace no longer moves focus to the last selected chip when the filter input has a non-collapsed text selection (e.g. after select-all). Chip activation stays reserved for a collapsed caret sitting at position 0, which is the case the behaviour was designed for.
- The same collapsed-caret condition is applied to the ArrowLeft chip-navigation path in "boxes" selected-items style, which shares the identical faulty check.
- Deleting a full text selection with Backspace now clears the filter input for good — the text does not reappear on blur/refocus.
- Regression coverage is added for both key paths (Backspace and Delete) so the asymmetry cannot silently return.
- No changes to single-select behaviour, and no changes to the chip-removal behaviour users rely on today (Backspace on an empty input still targets the last chip).

## Capabilities

### New Capabilities

- `multiselect-keyboard-interaction`: Keyboard behaviour of the multi-select Combobox filter input — when Backspace/ArrowLeft transfer focus to selected chips for removal versus when they act as ordinary text editing within the filter input.

### Modified Capabilities

<!-- None. The package has no existing specs (openspec/specs/ is empty), so this
     change introduces the first spec for this behaviour rather than modifying one. -->

## Impact

- **Code**: `src/components/MultiSelection/MultiSelection.tsx` — the `onKeyDown` handler passed into `getInputProps` (the `selectionStart === 0` guard on the Backspace and ArrowLeft branches).
- **Not affected**: `src/components/SingleSelection/SingleSelection.tsx` guards its Backspace branch on `e.currentTarget.value === ""`, so single-select never hits this defect.
- **Tests**: new regression coverage in `e2e/` and/or `src/**/__tests__/`. A throwaway diagnostic spec (`e2e/WC-backspace-stale-diagnostic.spec.js`) exists from the investigation and must be either promoted to a proper regression test or deleted.
- **Release**: patch version bump kept in sync across `package.json` and `src/package.xml`, plus a user-facing `CHANGELOG.md` entry under `## [Unreleased]`.
- **Dependencies**: none. Downshift stays on its current version; the fix is local to the widget's own key handler.
