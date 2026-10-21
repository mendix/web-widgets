## Why

Ordered lists in the rich text editor always start at 1 (or `a`, or `i`). Users who split one numbered sequence across several lists, for example steps interrupted by a paragraph or an image, cannot continue the numbering. They have to fake the numbers as plain text, which breaks indentation, marker formatting, and auto-cycling of nested styles.

HTML already supports this through the `start` attribute on `<ol>`, and the TipTap `OrderedList` node the widget extends already parses and renders `start`. Only a way for the user to set it is missing.

## What Changes

- The ordered list split-button dropdown gains a **Start at** number input below the existing style options (`1, 2, 3` / `a, b, c` / `i, ii, iii`).
- The input accepts integers from 1 upward. The value applies to the innermost ordered list that contains the cursor.
- The number is mapped to the list's style by the browser: start `3` renders as `3.` for decimal, `c.` for lower-alpha, and `iii.` for lower-roman.
- Setting the value to 1, or clearing it, removes the `start` attribute so the saved HTML matches today's output.
- The start value is saved in the HTML as `<ol start="N">` in both inline and class style modes, and is restored when stored content is loaded.
- The input shows the current list's start value when the dropdown opens. It is disabled when the cursor is not in an ordered list.
- The start value is not sticky. Unlike the list style, a new ordered list always starts at 1.
- No new Studio Pro property. The control follows the existing ordered list toolbar setting.
- Not a breaking change. Content without a `start` attribute renders byte-identically to today, except lists whose highest number has three or more characters (100 or more items), which gain a `--rt-marker-chars` value so their numbers are no longer clipped.

## Capabilities

### New Capabilities

- `ordered-list-start-number`: Setting, displaying, validating, and persisting the start number of an ordered list from the toolbar.

### Modified Capabilities

- `ordered-list-interaction`: The split-button dropdown contains a start number input in addition to the style options, and its keyboard navigation must reach that input.

## Impact

**Affected code** (`packages/pluggableWidgets/rich-text-web`):

- `src/extensions/OrderedListStyled.ts` — add a `setOrderedListStart(start: number | null)` command. The `start` attribute itself already comes from the parent `OrderedList` and needs no change.
- `src/components/toolbars/components/ToolbarSplitButton.tsx` — render the number input in the dropdown menu, read the current value, apply it on Enter or blur, and extend keyboard handling.
- `src/components/toolbars/Toolbar.scss` — layout for the input row in `.toolbar-dropdown-menu`.
- `src/components/toolbars/helpers/listHelpers.ts` — `normalizeStartInput`, which turns the typed text into the stored value.
- `src/utils/i18n/locales/{en,de,es,fr,nl}.json` — label for the input.
- `src/utils/markerFormat.ts`, `src/ui/RichText.scss`, `src/ui/RichTextFormatStyle.scss` — `computeMarkerLength` already counts `start`, but its result only reached the stylesheet when a marker had an enlarged font size. At the base size, `100.` was clipped by the fixed `1.5em` gutter. The character count is now also emitted at the base size when it is 3 or more, and the stylesheet falls back to the list's own font size. This also fixes lists with 100 or more items, which were clipped before this change.

**Deliberately not affected:**

- No "continue numbering from previous list" automation. The user enters the number.
- No widget XML property and no default start value.
- No change to the bullet list or task list.

**Compatibility:** HTML stored by earlier versions that already contains `<ol start="N">` (for example, pasted content) keeps its start value and now shows it in the input.
