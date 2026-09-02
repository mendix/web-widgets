## Context

Chip focus management is entirely downshift's job today. `MultiSelection` renders each selected item with `getSelectedItemProps({ selectedItem, index })` and passes nothing else; `useMultipleSelection` owns `activeIndex`, moves DOM focus, and sets the roving `tabIndex` (`isFocusable = index === activeIndex`).

Two pieces of downshift 7.6.2 disagree about removal.

**The reducer keeps `activeIndex` unchanged for a non-last chip** (`node_modules/downshift/dist/downshift.cjs.js:3557-3575`):

```js
case SelectedItemKeyDownBackspace:
case SelectedItemKeyDownDelete: {
    if (activeIndex < 0) break;
    var newActiveIndex = activeIndex;
    if (selectedItems.length === 1) {
        newActiveIndex = -1;
    } else if (activeIndex === selectedItems.length - 1) {
        newActiveIndex = selectedItems.length - 2;
    }
    changes = { selectedItems: [...slice(0, activeIndex), ...slice(activeIndex + 1)], activeIndex: newActiveIndex };
}
```

**The focus effect only reacts to a change in `activeIndex`** (`downshift.cjs.js:3699-3708`):

```js
react.useEffect(
    function () {
        if (isInitialMountRef.current) return;
        if (activeIndex === -1 && dropdownRef.current) {
            dropdownRef.current.focus();
        } else if (selectedItemRefs.current[activeIndex]) {
            selectedItemRefs.current[activeIndex].focus();
        }
    },
    [activeIndex]
);
```

So removing a middle chip produces the same `activeIndex`, the effect does not re-run, the focused chip's DOM node unmounts, and focus falls back to `<body>`. Removing the last chip changes `activeIndex` (`length-1 → length-2`), the effect re-runs, and the neighbour is focused — the asymmetry as reported. Removing the only chip yields `activeIndex === -1`, which the widget already handles by focusing the input (`src/hooks/useDownshiftMultiSelectProps.ts:63-69`).

Note that `activeIndex` itself is _correct_ after the removal — it points at the item that shifted into the freed slot. Only the DOM focus is missing.

## Goals / Non-Goals

**Goals:**

- After Backspace/Delete on any chip, keyboard focus stays inside the widget and lands on the chip downshift considers active, so arrow navigation and further removals continue without re-entering the widget.
- Keep downshift as the single source of truth for `activeIndex` and the roving `tabIndex`; add focus restoration only.
- Cover all three positions (first, middle, last) plus the single-chip case with tests, so the asymmetry cannot come back for a different position.

**Non-Goals:**

- Changing which keys reach the chips. The WC-3347 gating in the filter input's `onKeyDown` is untouched.
- Changing focus behaviour for mouse removal via the chip's × button, where the user's focus expectation is different and no report exists.
- Upgrading or patching downshift.
- Reworking `activeIndex` bookkeeping, chip ordering, or `selectedItemsStyle`.

## Decisions

### 1. Restore focus in `MultiSelection`, not in the hook

`useDownshiftMultiSelectProps` has no access to the chip DOM nodes — downshift keeps its own `selectedItemRefs` private and exposes no imperative "refocus" call. `MultiSelection` renders the chips, so it can hold its own node array via the `ref` option of `getSelectedItemProps` (downshift composes it through `handleRefs`, `downshift.cjs.js:125-137`) and focus the right one itself.

_Why not the hook:_ passing DOM refs up into the hook only to focus them there adds indirection with no gain; the hook stays about state.

### 2. Record the intent on the chip's `onKeyDown`, act in an effect keyed on the chip count

`getSelectedItemProps` composes a caller-supplied `onKeyDown` before its own via `callAllEventHandlers`, so the widget sees the key first and can note "chip at index _i_ is being removed" in a ref. An effect keyed on `selectedItems.length` then focuses `chipRefs.current[Math.min(i, length - 1)]` once the removal has actually rendered, and clears the ref.

`Math.min(i, length - 1)` reproduces downshift's `newActiveIndex` for every case — middle chip (`i`), last chip (`length - 2` after removal is the new last index), single chip (`-1`, handled as "focus the input"). Focusing the same element downshift targets means the two never fight, and the focused chip is the one that renders with `tabIndex=0`.

_Why key the effect on `length` rather than the `selectedItems` array:_ `selectedItems` is `selector.currentId ?? []`, which can be a fresh array on any render. Keying on the count makes the effect fire on the removal itself, not on an unrelated re-render where the removed chip is still mounted (which would focus the node that is about to unmount and then clear the ref, reproducing the bug).

_Why `useEffect` and not `useLayoutEffect`:_ effects run in declaration order within a component, and downshift's focus effect is declared inside the hook call, i.e. before ours. Passive-vs-passive means ours runs last and wins; a layout effect would run _before_ downshift's and could be overridden.

_Alternatives considered:_

- **Nudge `activeIndex` to force downshift's effect** (`setActiveIndex(-1)` then back). Fires the effect twice, momentarily focuses the input, and emits misleading a11y status changes. Rejected.
- **Take over removal entirely** — handle Backspace/Delete on the chip, `preventDownshiftDefault`, call `removeSelectedItem` and `setActiveIndex` ourselves. `removeSelectedItem` (`FunctionRemoveSelectedItem`, `downshift.cjs.js:3596-3613`) computes the same index the same way, so `setActiveIndex` to an unchanged value is a no-op state update and the effect still would not fire. More code, same bug. Rejected.
- **Focus the chip from the keydown handler with a `requestAnimationFrame`/`setTimeout`.** Works by accident of timing and is untestable without fake timers. Rejected in favour of the render-driven effect.

### 3. Fall back to the filter input when no chips remain

The hook's `onStateChange` already focuses the input when `activeIndex === -1`, but the same branch in the new effect costs one line and makes `MultiSelection` correct on its own, independent of which of the two runs first.

## Risks / Trade-offs

- **Duplicating downshift's index arithmetic** → it is one `Math.min`, derived from the reducer quoted above; the unit tests pin all three positions, so a downshift change that alters the rule fails loudly rather than silently drifting. Comment it with the version reference, as the WC-3347 helper does.
- **Ref array staleness** → inline `ref` callbacks are re-invoked on every render (their identity changes), so the array is rebuilt each time; the focus lookup is still bounds-checked and null-safe rather than trusting the array length.
- **Mendix may apply `selector.setValue` asynchronously** → the effect is driven by the rendered chip count, not by the keystroke, so a deferred update just means the effect fires later, on the render that actually removes the chip.
- **jsdom focus fidelity** → RTL asserts `document.activeElement`, which jsdom models for programmatic `.focus()`; the e2e case covers the real browser round trip including continued arrow navigation.
