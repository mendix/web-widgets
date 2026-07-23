## 1. Table node attributes

- [x] 1.1 Add `width` attribute to `addAttributes()` in `src/extensions/TableBackgroundColor.ts` (default null; parse from `element.style.width` / `data-width`; render into merged style / class attrs — mirror `borderWidth`)
- [x] 1.2 Add `minHeight` attribute the same way (parse from `element.style.minHeight` / `data-min-height`)
- [x] 1.3 In `renderHTML()`, layer `attrs.width` over the `colwidth`-derived `width`/`min-width` (explicit width wins) and append `min-height` from `attrs.minHeight`, for `inline` format
- [x] 1.4 In `renderHTML()`, emit `data-width` / `data-min-height` (and associated class) for `class` format
- [x] 1.5 Mirror 1.3/1.4 in `TableBackgroundColorNodeView.updateTableStyles()` so the NodeView applies the same size

## 2. Table size commands

- [x] 2.1 Declare `setTableWidth` / `setTableMinHeight` in the `tableBackgroundColor` command module interface
- [x] 2.2 Implement both in `addCommands()` mirroring `setTableBorderWidth` (walk selection depth to `table`, `setNodeMarkup` with new attr)
- [x] 2.3 Support clearing to `null` (auto) when passed an empty value

## 3. Table configuration dropdown

- [x] 3.1 Add "Table Width" `numberInput` section to `createTableConfigurationSections()` in `configurationHelpers.ts` (min/max/step, placeholder "Auto", unit "px")
- [x] 3.2 `getCurrentValue` reads `getTableAttributes(editor)?.width` (strip "px" to number, or null)
- [x] 3.3 `onChange` parses/validates/clamps and calls `setTableWidth` (or clears to null on empty)
- [x] 3.4 Add "Table Height" `numberInput` section wired to `minHeight` via `setTableMinHeight`

## 4. Drag-to-resize handles (NodeView)

- [x] 4.1 In `TableBackgroundColorNodeView` constructor, append resize-handle `<div>`(s) to `this.dom` (SE corner + E + S edges per resolved design)
- [x] 4.2 Add `mousedown` handler that records start pointer + start table rect, attaches document `mousemove`/`mouseup`
- [x] 4.3 On `mousemove`, compute new width/min-height, enforce clamp bounds, write to `this.table.style` live, and store in instance fields (`this.currentWidth` / `this.currentMinHeight`) — avoid stale-closure trap
- [x] 4.4 On `mouseup`, commit once via `this.view.dispatch(setNodeMarkup(pos, { ...attrs, width, minHeight }))`; remove document listeners
- [x] 4.5 Ensure no per-frame dispatch (history stays a single step per drag)
- [x] 4.6 Confirm `ignoreMutation()` still swallows the live style writes on `this.table` (+ handles)

## 5. Styling

- [x] 5.1 Add resize-handle styles (position, size, cursor) scoped to the table wrapper in `src/ui/TableStyle.scss`
- [x] 5.2 Add hover/active affordance; handles only rendered in editable mode (NodeView only exists when editable)
- [x] 5.3 Ensure `.tableWrapper` handles overflow (`overflow-x`) when `Σcolwidth > table width` (already had `overflow-x: auto`)

## 6. Testing & verification

> Section 6 = manual browser verification (drag/undo/reload). Verified by user in a running Mendix editor: table resize, config width/height inputs, and column width all working.

- [x] 6.1 Set table width via text input → table resizes; value persists after reload (inline format)
- [x] 6.2 Same for class style-data format (data attributes emitted)
- [x] 6.3 Set table min-height → table at least that tall; add content → grows beyond minimum
- [x] 6.4 Clear width/height → reverts to auto / colwidth-derived sizing
- [x] 6.5 Valid CSS size (`250px`, `100%`, bare `250`→px) applies; invalid/injection text rejected
- [x] 6.6 Coexistence: set column widths AND explicit table width → both apply
- [x] 6.7 Drag SE handle → live resize; release → single committed change
- [x] 6.8 Undo after drag → restores pre-drag size in one step
- [x] 6.9 Drag then open config dropdown → inputs reflect dragged size (and vice-versa)
- [x] 6.10 Read-only editor → no handles rendered; existing color/border behavior unchanged (regression check)

## 7. Free-form CSS size text inputs (done during feedback)

- [x] 7.1 Add `isSafeCssSize` / `normalizeCssSize` to `utils/helpers.ts` (CSS.supports + regex fallback; bare number → px)
- [x] 7.2 Add `"textInput"` type to `ConfigurationSection` (both `ToolbarConfig.ts` and `ConfigurationDropdown.tsx`) + render case
- [x] 7.3 Switch "Table Width"/"Table Height" sections to `textInput`; validate via `normalizeCssSize`; drop px clamps
- [x] 7.4 Fix handle alignment: `.tableWrapper` `width: fit-content; max-width: 100%` so handles track table edges
- [x] 7.5 Unit tests for `isSafeCssSize` + `normalizeCssSize`

## 8. Config text inputs commit on blur/Enter (fix focus loss)

- [x] 8.1 In `ConfigurationDropdown.tsx`, make `numberInput`/`textInput` `onChange` write to the local draft map ONLY (removed the per-keystroke `section.onChange(value)` call)
- [x] 8.2 Commit on `onBlur`: run `section.onChange(draft)`, then clear the draft entry (`commitDraft`)
- [x] 8.3 Add `onKeyDown`: Enter → commit + blur the input; Escape → discard draft + revert (`handleDraftKeyDown`)
- [x] 8.4 On invalid commit, revert the input to `getCurrentValue()` (draft cleared after commit; invalid ignored by `configurationHelpers` onChange, so input shows committed value)
- [x] 8.5 Remove the per-keystroke `.focus()` cause: size `onChange` handlers now only run on commit (blur/Enter), not per character
- [x] 8.6 Leave colorPicker + dropdown branches live (unchanged)
- [x] 8.7 Verify: type multi-char value in Table/Cell width input → focus retained, commits on blur/Enter, invalid reverts, colors still live (verified by user)

## 9. Column width as cell style (CSS string, replaces numeric colwidth in config)

- [x] 9.1 Add `cellWidth` string attribute to `TableCellBackgroundColor` (parse from `style.width` / `data-cell-width`; render into cell style + `data-cell-width`)
- [x] 9.2 `createColGroup` reads first-row `cellWidth` string and emits `width` on `<col>` (authoritative under `table-layout: fixed`); falls back to native `colwidth`; percent widths excluded from fixed px total
- [x] 9.3 Switch "Column Width" config section from `numberInput`/`colwidth` to `textInput`/`cellWidth` with `normalizeCssSize` validation
- [x] 9.4 Verified by user: altering column width resizes the column (px and %)
