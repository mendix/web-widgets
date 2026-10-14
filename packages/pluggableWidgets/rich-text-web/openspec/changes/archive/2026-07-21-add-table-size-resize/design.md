## Context

The rich text editor uses TipTap. The `TableBackgroundColor` extension (extends `@tiptap/extension-table`) already:

- Declares custom table attributes (`backgroundColor`, `borderColor`, `borderStyle`, `borderWidth`) in both `inline` and `class` style-data formats.
- Derives the table width from `colwidth` via `createColGroup()`: if every column has a fixed `colwidth`, the table gets `width: ΣpX`; otherwise `min-width: ΣpX`.
- Uses a hand-written plain-DOM NodeView (`TableBackgroundColorNodeView`) when `resizable` and editable, which builds the `<colgroup>` and applies table styles imperatively.

The table configuration dropdown (`createTableConfigurationSections()`) already reads/writes table attrs and supports `colorPicker`, `dropdown`, and `numberInput` section types. The `numberInput` control (with unit label, clear button, placeholder) was added by the `table-column-width-control` capability and is reused here.

There is currently **no** stored table `width`/`height` — the footprint is entirely `colwidth`-derived, and there are no drag handles on the table.

## Goals / Non-Goals

**Goals:**

- Store explicit table `width` and `minHeight` as Table node attributes.
- Provide numeric inputs ("Table Width", "Table Height") in the table configuration dropdown.
- Provide drag-to-resize handles on the table, similar to image/embed resize.
- Coexist cleanly with the existing per-column `colwidth` feature.
- Support both `inline` and `class` style-data formats.
- Validate/clamp inputs; clear resets to auto (null).

**Non-Goals:**

- Percentage or non-pixel units (pixels only, matching column-width feature).
- Fixed (non-growing) table height — height is `min-height`, rows still grow with content.
- Rescaling/redistributing column widths when the table is resized (Strategy C rejected).
- Converting the table NodeView to a React NodeView.
- Per-row height control.

## Decisions

### Decision 1: Store `width` / `minHeight` as Table node attributes (image-like)

**Rationale:** User wants explicit table sizing behaving like image/embed, where size is a direct node attribute. Storing on the node makes it persistent, undoable, and serializable in both style-data formats.

**Alternatives considered:**

- Derive everything from `colwidth` (status quo): no way to set an explicit table footprint.
- Scale columns proportionally (Strategy C): coherent but rejected — more math and couples tightly to the column-width feature.

**Implementation:** Add `width` and `minHeight` attributes in `addAttributes()`, mirroring the existing `borderWidth` attribute (parse from `element.style` / `data-*`, render into the merged style string / class attrs).

---

### Decision 2: Table width wins; `colwidth` feeds `min-width` (Strategy A)

**Rationale:** Explicit table `width` and per-column `colwidth` must coexist. Making `attrs.width` the table footprint while `colwidth` continues to emit per-column `min-width` (which `createColGroup()` already does when columns aren't all fixed) lets both features work together without one silently disabling the other.

**Precedence:**

```
table.style.width      = attrs.width           (NEW — explicit footprint, wins)
table.style.min-height = attrs.minHeight        (NEW — no conflict, nothing derives height today)
<colgroup><col>        = min-width from colwidth (EXISTING — unchanged)
```

`createColGroup()` logic is untouched; the new attributes are layered on top in `renderHTML()` and `updateTableStyles()`. When `attrs.width` is set it overrides the `colwidth`-derived `width`/`min-width` on the table element.

**Alternatives considered:**

- Strategy B (mutually exclusive): predictable but confusing ("why doesn't my table width apply?").
- Strategy C (rescale columns): rejected per Decision 1.

---

### Decision 3: Height is `min-height`, not fixed height

**Rationale:** Table rows are content-driven. A fixed height would force distribution across rows and risk content overflow. `min-height` gives users a floor while letting rows grow naturally. There is no existing derived table height, so there is no conflict.

---

### Decision 4: Add resize handles to the existing plain-DOM NodeView (no React rewrite)

**Rationale:** The table uses a hand-written `TableBackgroundColorNodeView` (~180 lines managing colgroup + color/border styles). Converting it to a React NodeView (like `ImageResize.tsx`) to reuse the React resize component would rewrite working code and risk regressions in color/border rendering. Adding drag handles imperatively to the existing NodeView is contained.

**Implementation:**

- In the NodeView constructor, append resize-handle `<div>`s to `this.dom` (the `tableWrapper`).
- Attach `mousedown` → document `mousemove`/`mouseup` handlers.
- During drag: write `this.table.style.width` / `min-height` directly (live preview), tracking the live value in an **instance field** (e.g. `this.currentWidth`) — the plain-class equivalent of the `currentSize` ref used in `ImageResize.tsx`, avoiding the stale-closure trap.
- On `mouseup`: commit **once** via `this.view.dispatch(tr.setNodeMarkup(pos, undefined, { ...attrs, width, minHeight }))` so the change is a single undoable step.
- Do **not** dispatch per-frame (avoids history spam and re-render churn).

---

### Decision 5: `setTableWidth` / `setTableMinHeight` commands mirror `setTableBorderWidth`

**Rationale:** The existing border-width command walks up the selection depth to the `table` node and applies `setNodeMarkup`. Reusing this exact pattern keeps the config-dropdown `onChange` handlers consistent with `tableBorderStyle`/`tableBorderWidth`.

---

### Decision 6: Both UIs — numeric inputs and drag handles write the same attrs

**Rationale:** Numeric input gives precision; drag gives speed. Both write `attrs.width` / `attrs.minHeight`, so they stay in sync: after dragging, the config dropdown reflects the new value, and vice-versa. Clear button resets to `null` (auto).

---

### Decision 7: Free-form CSS size text inputs (not clamped number inputs)

**Rationale:** A `type="number"` input only accepts a bare pixel count and rejects `"100%"`, `"250px"`, `"10em"`. Users need responsive units. The width/height config sections use a `textInput` type accepting any CSS length/percentage.

**Safety:** Because these values are interpolated into inline `style` (same injection surface as the color feature), input is validated via `isSafeCssSize` / normalized via `normalizeCssSize` in `utils/helpers.ts` — bare numbers become `<n>px`, valid units pass through, empty clears to auto, invalid/unsafe is rejected. Uses `CSS.supports("width", value)` at runtime with a regex allowlist fallback for jsdom.

**Consequence:** The earlier 50–2000 / 30–1000 px clamps are dropped (meaningless for `%`/`em`).

---

### Decision 8: Config text inputs buffer locally and commit on blur/Enter (fix focus loss)

**Problem:** Committing on every keystroke caused two focus-stealing effects: (1) each `onChange` ran `editor.chain().focus()`, yanking the caret into the editor; (2) the dispatched transaction fired `selectionUpdate`, re-rendering the toolbar subtree and resetting the input value. The field blurred after each character.

**Decision:** Text/number config inputs hold a **local draft** while focused and commit to the editor only on **blur** or **Enter**. The editor is not touched during typing, so no `selectionUpdate`, no toolbar re-render, no `.focus()` steal.

- `onChange` → update the draft map only (no editor dispatch).
- `onBlur` / Enter → run the section's `onChange` (validate/normalize/commit); Enter also blurs the field.
- **Invalid on blur/Enter → revert** the input to the last committed value (`getCurrentValue()`); no stuck bad text.
- Escape → discard the draft entry and revert.
- Color pickers and dropdowns are **unchanged** — they commit live (no text caret to lose). Save/Cancel buttons were considered but rejected: they add UI and their scope would be ambiguous since colors already apply live. Commit-on-blur needs no new controls.

**Scope note:** This fix lives in `ConfigurationDropdown` and therefore also fixes the pre-existing column-width (`cellWidth`) input, which had the same bug.

## Risks / Trade-offs

### Risk: `Σcolwidth > attrs.width` overflow

If columns sum to more than the explicit table width, the browser must reconcile `table.style.width` against per-column `min-width`. Columns may overflow or the wrapper may need to scroll.

**Mitigation:** `.tableWrapper` likely needs `overflow-x: auto`. Verify with a manual test (e.g. 3 cols @ 300px, table width 400px) during implementation. Document the observed behavior in the spec's visual-feedback scenarios.

---

### Risk: `ignoreMutation` swallowing drag style writes

`TableBackgroundColorNodeView.ignoreMutation()` already returns `true` for attribute mutations on `this.table`, so imperative style writes during drag won't trigger a ProseMirror re-parse. The final committed value must still flow through `view.dispatch` so history/undo captures it.

**Mitigation:** Only the mouseup commit dispatches; live drag mutates DOM only. Confirm undo restores the pre-drag size in one step.

---

### Trade-off: Not a React NodeView

The table resize code diverges stylistically from image/embed (imperative vs React). Accepted to avoid rewriting the working color/border NodeView.

## Migration Plan

No migration needed — purely additive:

- Tables without `width`/`minHeight` attrs render exactly as today (colwidth-derived).
- New attrs are `null` by default.
- No data model breaking changes.

Rollback: remove the two config sections and the resize-handle setup from the NodeView; the new attributes are ignored when unset.

## Resolved Questions

1. **Handles:** SE corner (width+height) + E edge (width-only) + S edge (height-only) — full independent control.
2. **Clamp ranges:** table width 50–2000px, min-height 30–1000px (table-appropriate, wider than the 25–1000 column range).
3. **Aspect ratio:** independent — width and height resize freely, no ratio lock (unlike image/embed). Correct for tables since rows/columns are independent axes.
