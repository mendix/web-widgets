## 1. Command

- [x] 1.1 Add `setOrderedListStart(start: number | null)` to the `orderedListStyled` command declaration in `src/extensions/OrderedListStyled.ts`
- [x] 1.2 Implement it with `updateAttributes("orderedList", { start })`; return `false` when not in an ordered list; store the parent's default `1` for 1 and `null` so the parent `renderHTML` omits the attribute
- [x] 1.3 Add a pure `normalizeStartInput(raw, current, max)` helper (empty → 1, non-integer or < 1 → current, > max → max), with the upper bound as `MAX_ORDERED_LIST_START`
- [x] 1.4 Unit-test the command: inline mode, class mode, nested list, 1 removes the attribute, no-op outside ordered list, one undo step — `src/extensions/__tests__/OrderedListStart.spec.ts`
- [x] 1.5 Unit-test `normalizeStartInput` for every row of the design.md normalization table — `src/components/toolbars/helpers/__tests__/listHelpers.spec.ts`
- [x] 1.6 Unit-test round-trip: `setContent('<ol start="7">…')` then `getHTML()` keeps `start="7"`

## 2. Toolbar UI

- [x] 2.1 In `ToolbarSplitButton.tsx`, render a `role="group"` row after the style options with a `<label>` and `<input type="number" min="1" max="9999" step="1">`
- [x] 2.2 Initialize the input from the current list's `start`; disable it when not in an ordered list
- [x] 2.3 Apply on Enter and on blur; close the dropdown and focus the editor on Enter
- [x] 2.4 Escape discards the typed value and closes the dropdown
- [x] 2.5 Apply a pending value when the dropdown closes by click outside, before the input unmounts (`useDropdown` `onClose` path)
- [x] 2.6 Keyboard: ArrowUp/ArrowDown move between style options and the input; ArrowUp/ArrowDown inside the input keep native behavior; Escape on an option closes the menu
- [x] 2.7 Confirm choosing a style option does not reset `start`
- [x] 2.8 Add styles for the input row in `src/components/toolbars/Toolbar.scss`

## 3. i18n

- [x] 3.1 Add `toolbar.orderedListStart` label to `en.json`, `de.json`, `es.json`, `fr.json`, `nl.json`

## 4. Gutter

- [x] 4.1 Emit the character count from `maxMarkerSizeToAttrs` without an enlarged size when it is 3 or more
- [x] 4.2 Change the `--rt-marker-max-size` fallback from `0px` to `1em` in `RichText.scss` and `RichTextFormatStyle.scss`
- [x] 4.3 Reset `--rt-marker-chars` on `li` so nested lists do not inherit it
- [x] 4.4 Update `markerFormat.spec.ts` for the new base-size output
- [x] 4.5 Measure the longest roman numeral in the list's range, not the last one

## 5. Tests

- [x] 5.1 Component tests for `ToolbarSplitButton`: input shown, current value shown, disabled outside ordered list, Enter applies, blur applies, click outside applies, Escape discards, invalid values revert, clamp, clear resets — `src/components/toolbars/components/__tests__/ToolbarSplitButton.spec.tsx`
- [x] 5.2 Accessibility test: labelled group, ArrowDown focus path
- [ ] 5.3 E2E test in `e2e/RichText.spec.js`: start 98 on a three-item list, check `start` attribute and gutter width — written, not run locally
- [x] 5.4 Manual check in the sample project (localhost:8080), Chrome, after redeploy: Enter applies, typing does not apply, real click outside applies, Escape discards, saved HTML reaches other editors bound to the same attribute, gutter fits `100.` and `xcix.`, nested list keeps its own gutter
- [x] 5.5 Manual check in class style mode, Chrome (Table configuration page, class editor): lower-alpha start 27 renders `aa.`; start 702 renders `zz.`/`aaa.` with `has-marker-chars` and `data-marker-chars="3"` and a 32.2px gutter; lower-roman start 99 gives `data-marker-chars="4"` and 40.6px; clearing the field removes `start` and the gutter returns to 21px; nested list keeps 21px
- [ ] 5.6 Manual check in Safari and Firefox

## 6. Release notes

- [x] 6.1 Add `[Unreleased]` entries to `CHANGELOG.md`
- [ ] 6.2 Resolve the open questions in `design.md` (menu role, upper bound, label text) before archiving
