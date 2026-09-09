## Why

In a multi-select Combobox with "boxes" selected-items style, a user can walk the selected chips with the arrow keys and remove them with Backspace/Delete. Removing the **last** chip in the row works as expected: the neighbouring chip becomes active and navigation continues. Removing any **other** chip drops keyboard focus out of the widget entirely — focus falls back to the document body, so the next arrow key or Tab starts over from the top of the page and the user has to find their way back into the combobox.

Reported as a UX follow-up to WC-3347 while verifying the chip-navigation fix on the same branch. The inconsistency is the giveaway: the same keystroke on two chips one position apart behaves differently, which reads as the widget losing track of the user.

## What Changes

- Removing a selected chip with Backspace or Delete keeps keyboard focus inside the widget: focus moves to the chip that takes the removed chip's place (or, when the removed chip was last, to the chip on its left), so arrow-key navigation continues from there.
- Removing the only remaining chip continues to return focus to the filter input, as it does today.
- Behaviour is unchanged for the keys that reach the chips (the WC-3347 gating rules stay as they are) and for chip removal via the chip's × button with the mouse.

## Capabilities

### New Capabilities

<!-- None. -->

### Modified Capabilities

- `multiselect-keyboard-interaction`: adds a requirement covering where keyboard focus lands **after** a chip is removed. The existing requirements describe only how a key reaches the chips, not what happens once one is deleted.

## Impact

- **Code**: `src/components/MultiSelection/MultiSelection.tsx` — the chip rendering block and the props passed into `getSelectedItemProps`. No change to `src/hooks/useDownshiftMultiSelectProps.ts`, whose `onStateChange` already handles the "list became empty" case.
- **Not affected**: `SingleSelection` (no chips), the filter input's own `onKeyDown` gating, the menu, and mouse-driven removal.
- **Tests**: unit coverage in `src/__tests__/MultiSelection.spec.tsx` (extending the existing WC-3347 describe block, which already has chip helpers), plus an e2e case in `e2e/ComboboxMultiSelectionKeys.spec.js`.
- **Release**: user-facing entry under `## [Unreleased]` → `### Fixed` in `CHANGELOG.md`. No version bump — versions are bumped at release time.
- **Dependencies**: none. Downshift stays on `^7.6.2`.
