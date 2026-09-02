## Context

`MultiSelection` layers a custom `onKeyDown` on top of the props returned by downshift's `useMultipleSelection().getDropdownProps()` and `useCombobox().getInputProps()`:

```ts
// src/components/MultiSelection/MultiSelection.tsx:59-65
onKeyDown: (event: KeyboardEvent) => {
    if (
        (event.key === "Backspace" && inputRef.current?.selectionStart === 0) ||
        (event.key === "ArrowLeft" && isSelectedItemsBoxStyle && inputRef.current?.selectionStart === 0)
    ) {
        setActiveIndex(selectedItems.length - 1);
    }
```

The intent is "the caret has nowhere left to go inside the filter input, so hand keyboard focus to the last selected chip". The check is wrong because `selectionStart === 0` is also true for a _range_ selection that begins at 0 — which is exactly what Ctrl/Cmd+A produces. Only the start of the range is inspected; `selectionEnd` is never consulted.

**Why the text comes back.** The multi-select combobox deliberately preserves typed filter text across focus changes — its `stateReducer` returns the previous state on blur:

```ts
// src/hooks/useDownshiftMultiSelectProps.ts:222-223
case useCombobox.stateChangeTypes.InputBlur:
    return { ...state, highlightedIndex: -1 };
```

`setActiveIndex(selectedItems.length - 1)` makes downshift move DOM focus onto the chip, so the input blurs in the _same_ keystroke that natively deleted the selected text. The `InputBlur` branch then resolves to `state` — the snapshot from before the deletion — discarding the `InputChange` that would have set `inputValue` to `""`. The input is controlled by `inputValue`, so the widget re-renders with the old text; the user sees it again on the next focus. Delete never enters the branch, never steals focus, and so never triggers this — matching the reported asymmetry.

**Confirmed by the reproduction (WC-3347 diagnostic).** The revert is immediate, not deferred to the next focus: right after select-all + Backspace the input still reads `value="zzz"` across the full 5s assertion retry window (14 samples), with `aria-expanded="true"`. The controlled input snaps back within the same render pass. The user perceives it as "the text came back when I clicked in again" only because focus had already jumped to a chip, so they were not looking at the input in between. Delete, run as a control in the same spec, passes — the input clears and stays clear.

The dispatch ordering inside downshift has not been step-through verified, but the observable outcome and the responsible branch are confirmed.

**The decisive find:** downshift already ships precisely the predicate this handler needs, and applies it to its _own_ dropdown Backspace handler:

```js
// downshift 7.6.2, dist/downshift.cjs.js:3432
function isKeyDownOperationPermitted(event) {
    if (event.shiftKey || event.metaKey || event.ctrlKey || event.altKey) return false;
    var element = event.target;
    if (
        element instanceof HTMLInputElement &&
        element.value !== "" &&
        (element.selectionStart !== 0 || element.selectionEnd !== 0)
    )
        return false;
    return true;
}
```

So downshift's rule is: permit chip interaction only when the input is empty, **or** the caret is collapsed at position 0, and no modifier is held. Our custom handler checks one third of that. It is not exported from the package (absent from `typings/index.d.ts` and from the CJS exports), so it cannot be imported.

## Goals / Non-Goals

**Goals:**

- Deleting a full text selection with Backspace clears the filter input permanently — no resurfacing on blur/refocus.
- Chip focus transfer keeps working for the case it was written for: Backspace with an empty filter input.
- Align this handler's gating with downshift's own semantics, so the widget and the library agree on when a key belongs to the text field versus the chip list.
- Close the Backspace/Delete asymmetry with regression coverage on both paths.

**Non-Goals:**

- Changing how multi-select preserves filter text across blur/focus. The `InputBlur` reducer returning previous state is intentional and stays; we fix the unintended focus steal instead.
- Touching `SingleSelection`, which guards on `e.currentTarget.value === ""` and is unaffected.
- Upgrading downshift (the repo also has 9.3.6 in the store for other packages; this widget stays on `^7.6.2`).
- Reworking chip removal, `selectedItemsStyle`, or menu behaviour.

## Decisions

### 1. Mirror downshift's `isKeyDownOperationPermitted` in a local helper rather than inventing a new condition

Extract a small predicate in the widget (e.g. `isChipNavigationPermitted(event)`) replicating downshift's logic, and require it in both branches.

_Why:_ the bug is a divergence from the library's own contract, so converging on that contract fixes this instance and the neighbouring ones (modifier-held keypresses, range selections not anchored at 0) in one move. Copying ~6 lines is preferable to inventing a subtly different rule that will drift from downshift's behaviour on the chips themselves.

_Alternatives considered:_

- **Minimal patch — add `&& selectionEnd === 0` to both branches.** Fixes the reported bug and is the smallest diff, but leaves the modifier-key gap and permits activation with a collapsed caret at 0 while text is present, where downshift itself would refuse. Acceptable fallback if reviewers want the tightest possible change; noted as the reduced-scope option.
- **Guard on `value === ""` only (copy `SingleSelection`).** Simple and consistent across the two components, but strictly narrower than downshift: it would drop chip navigation for a collapsed caret at position 0 with text present, a case downshift explicitly permits. Rejected as an unnecessary behaviour regression for the ArrowLeft path.
- **Fix the `InputBlur` reducer to accept `changes.inputValue`.** Treats the symptom at the state layer, and risks discarding the deliberate "keep the filter text across blur" behaviour that other flows depend on. Rejected.

### 2. Apply the same guard to the ArrowLeft branch

ArrowLeft with an active text selection should collapse that selection, per standard text-field semantics, not jump to a chip. The branch shares the identical faulty check, so it is corrected together rather than left as a known-latent twin of the same bug.

### 3. Verify both key paths, and promote the diagnostic into a real regression test

The investigation's throwaway spec (`e2e/WC-backspace-stale-diagnostic.spec.js`) confirmed the Backspace failure but its Delete control case was never observed green (a click timeout plus Playwright grep-flag trouble). The change must land coverage that actually executes both, so "Delete is fine" stops being a code-reading inference. Unit tests with React Testing Library are the cheaper home for the key-handling matrix; an e2e test covers the blur/refocus round trip that produced the user-visible symptom. Prefer unit coverage for the matrix, plus one e2e for the round trip.

## Risks / Trade-offs

- **Copied library internals can drift from downshift on upgrade** → keep the helper small, comment it with the downshift source reference and version, and note that a downshift major upgrade should re-check it against `isKeyDownOperationPermitted`.
- **Some users may rely on Backspace-at-caret-0-with-text reaching the chips** → this is preserved: downshift's predicate permits a collapsed caret at 0. Only range selections and modifier-held presses change, which is the defect being fixed.
- **Hidden dependence on the current (buggy) behaviour in existing tests** → run the widget's full unit suite and the existing `e2e/Combobox.spec.js` before concluding; the known Backspace test there is single-select (`comboBox2`, enum) and should be unaffected.
- **Mechanism is inferred, not instrumented** → the fix targets the trigger (the guard), which the reproduction directly implicates, so it holds even if the precise dispatch ordering differs. The regression test, not the mechanism narrative, is what gates success.
- **Reproduction requires a running test project** and the multi-select combobox with at least one existing chip (`comboBox4` on tab page 2); `setActiveIndex(-1)` on an empty selection means the bug does not surface with zero chips.
