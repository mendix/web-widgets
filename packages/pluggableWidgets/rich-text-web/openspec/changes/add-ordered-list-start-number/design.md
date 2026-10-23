## Context

The ordered list toolbar button is a split button (`ToolbarSplitButton.tsx`). The main part toggles the list using the last-used style; the dropdown part opens a `role="menu"` popover with three style options. Positioning and click-outside handling come from `useDropdown`.

`OrderedListStyled` extends TipTap's `OrderedList`. The parent already declares a `start` attribute (default `1`, parsed from `start` on `<ol>`, rendered only when not `1`) and its `renderHTML` handles it. `OrderedListStyled.renderHTML` delegates to the parent, so `start` already round-trips through `getHTML()` and `setContent`. `computeMarkerLength` in `src/utils/markerFormat.ts` already uses `start` to size the marker gutter.

The missing part is a command and a UI control.

## Goals / Non-Goals

**Goals:**

- Let the end user set the start number of the ordered list at the cursor from the existing dropdown.
- Keep saved HTML unchanged for lists that start at 1.
- Keep the change in one undo step.

**Non-Goals:**

- Automatic numbering continuation across lists.
- Accepting letters or roman numerals as input.
- A Studio Pro property or a default start number.
- Negative or zero start values.

## Decisions

### 1. Number input inside the split-button dropdown

The input is a row at the bottom of the existing dropdown menu, separated from the style options. Alternatives:

- A dialog opened from a "Start at…" item: one more click and a modal for a single number.
- A separate toolbar button: more toolbar width for a rarely used option, and a second place for ordered list settings.

The dropdown already holds the ordered list settings, so the input goes there.

### 2. Integer input, style mapping left to the browser

The input is `<input type="number" min="1" step="1">`. The browser converts the number to the list's marker (`3` → `c` for lower-alpha). Parsing letters and roman numerals would need a converter and error messages for invalid text, for little benefit.

### 3. Apply on commit, not on every keystroke

The value is applied on Enter and on blur, not on `input` events. Applying per keystroke would create one undo step per digit and move numbering around while the user types `12` (first `1`, then `12`). Escape discards the typed value and closes the menu.

Applying on blur needs care: the input lives in a floating element and the editor selection is not the DOM selection while the input has focus. The command runs through `editor.chain().focus().setOrderedListStart(n).run()`. ProseMirror keeps its own selection state while the input has focus, so `focus()` restores the cursor in the same list. This must be checked against the click-outside handler in `useDropdown`: if the menu unmounts before blur fires, the value is applied in the close handler instead.

### 4. Normalization

| Typed value       | Result                                   |
| ----------------- | ---------------------------------------- |
| empty             | `start` reset to 1, attribute removed    |
| `1`               | attribute removed                        |
| integer ≥ 2       | `start = N`                              |
| `0`, negative     | rejected, input reverts to current value |
| decimal (`2.5`)   | rejected, input reverts to current value |
| above upper bound | clamped to the upper bound               |

Upper bound: `9999`. Higher values are valid HTML, but they push the marker gutter wider than the editor content area at normal widths and are not a realistic use case. The bound is a constant in one place so it can be changed.

The command stores the parent's default `1` for 1 and for `null`. The parent's `renderHTML` omits `start` when it is 1, so the output matches lists that never had a start set.

### 5. Command on `OrderedListStyled`

```ts
setOrderedListStart: (start: number | null) => ReturnType;
```

It returns `false` when the cursor is not in an ordered list, like `setOrderedListStyle`. It uses `updateAttributes("orderedList", { start })`, which targets the innermost ordered list at the selection. In a nested list, only the nested list changes.

### 6. Not sticky

The style choice is sticky (module-level `lastOrderedListStyle`). The start number is not: a start number belongs to one specific list, and carrying `5` into the next new list would surprise the user.

### 7. Gutter for long counters at the base size

`computeMarkerLength` counts `start`, but `maxMarkerSizeToAttrs` returned nothing unless an item had an enlarged font size. The `1.5em` gutter fits one and two characters at the base size and clips three, so a list starting at 98 showed `100.` cut off at the editor edge. Lists with 100 or more items had the same problem before this change.

- `maxMarkerSizeToAttrs` emits only the character count (`--rt-marker-chars`, or `data-marker-chars` with `has-marker-chars` in class mode) when there is no enlarged size and the count is 3 or more. One- and two-character lists keep their current markup.
- The stylesheet fallback for `--rt-marker-max-size` changes from `0px` to `1em`, so the gutter is computed from the list's own font size. With the default count of 1 this is `1.1em`, below the `1.5em` floor, so lists without the property render as before.
- `computeMarkerLength` measured only the last counter, assuming it is the widest. That holds for decimal and alpha but not roman: `xcix` (99) is four characters and `c` (100) is one. Roman lists now take the longest numeral in the list's range. This also fixes a plain roman list of 9 items, whose `viii` was measured as `ix`.
- `li` resets `--rt-marker-chars`, because custom properties inherit. Without the reset, a nested `a.` list under a list that reaches `100.` would get the same wide gutter.

Checked in Chrome on the sample app at 14px after a redeploy: decimal `start="99"` with two items gives a 32.2px gutter (was 21px), lower-roman `xcix.` gives 40.6px, and the nested list stays at 21px.

### 8. Accessibility

The menu has `role="menu"`, and an editable field is not a valid menu item. The input row is placed in a `role="group"` with a visible `<label>`, and the input keeps its native role. The style options had no arrow key handling before this change; they now move focus with ArrowUp and ArrowDown, so ArrowDown from the last option reaches the input, and Escape closes the menu and returns focus to the dropdown button. Inside the input, ArrowUp and ArrowDown keep their native increment and decrement behavior.

Open question 1 asks whether a `role="menu"` containing a group is acceptable or whether the popover should become `role="dialog"`.

## Risks / Trade-offs

- **Blur during menu close** — clicking outside may unmount the input before `blur` fires, losing the typed value. Mitigation: the pending value is kept in a ref and applied in the `useDropdown` `onClose` path; covered by a test. The draft is cleared before it is applied, so a later blur does not apply it twice.
- **Toggling list off and on** — `toggleOrderedList` off and on creates a fresh list, so `start` resets to 1. This matches the non-sticky decision but may surprise users. Accepted.
- **Joining lists** — when TipTap joins two adjacent ordered lists (for example, deleting the paragraph between them), the joined list keeps the first list's attributes, including `start`. Accepted, standard behavior.
- **Pre-existing, not addressed here:** in an app whose Content Security Policy disallows inline styles, the browser ignores `style` attributes in HTML parsed with `DOMParser`. Inline-mode `list-style-type` is then lost when stored content is loaded, while the parent's `type` attribute survives. Seen in the sample app. Separately, switching a list from roman back to decimal leaves the parent's `type="i"` in place. Both are independent of the start number and need their own change.
- **Word paste** — Word HTML that carries `start` on `<ol>` will now show its value in the input. No change to `WordPaste.ts` needed, but worth one test.

## Open Questions

Implemented with the first option of each; confirm before archiving.

1. Is `role="group"` with a labelled input inside the existing `role="menu"` acceptable, or should the popover change to `role="dialog"`?
2. Is `9999` the right upper bound?
3. Label text: "Start at" or "Start number"? The nl, de, fr, and es translations need a native speaker check.
