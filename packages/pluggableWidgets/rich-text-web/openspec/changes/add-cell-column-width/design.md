## Context

The rich text editor uses TipTap, which already supports column widths via the `colwidth` attribute on table cells. TipTap's base `TableCell` extension includes this attribute, and the `TableBackgroundColor` extension reads it to generate `<colgroup>` elements for column sizing.

Currently:

- `colwidth` is an array of pixel values (e.g., `[150]` for single column, `[100, 150, 200]` for colspan)
- TipTap has a `resizable: true` option that should enable drag-to-resize, but the custom `TableBackgroundColorNodeView` doesn't implement resize handles
- Users can click column borders, which sets a width, but cannot drag to adjust
- No UI control exists to set exact pixel widths

The existing cell configuration dropdown already has sections for background color, border color/style/width using a `ConfigurationSection` pattern.

## Goals / Non-Goals

**Goals:**

- Add a number input control to the cell configuration dropdown for setting column width
- Support exact pixel values (25-1000px range)
- Provide clear button to reset to auto width
- Handle colspan cells by setting only the first column width
- Follow existing configuration dropdown patterns and styling
- Validate input and clamp to acceptable ranges

**Non-Goals:**

- Implementing drag-to-resize handles (would require significant NodeView work)
- Supporting percentage or other CSS units (only pixels for now)
- Setting widths for all columns in a colspan cell (only first column)
- Syncing widths across all rows (only first row widths apply per TipTap's design)
- Adding column width presets dropdown (keep it simple with number input only)

## Decisions

### Decision 1: Use number input type (not dropdown with presets)

**Rationale:** User requested "exact pixel values" in requirements. A number input provides precision without limiting users to preset sizes.

**Alternatives considered:**

- Dropdown with presets (Small/Medium/Large): Too restrictive, doesn't meet "exact values" requirement
- Hybrid (input + preset buttons): Over-engineered for initial implementation
- Text input: Number input provides better UX with built-in increment/decrement and validation

**Implementation:** Add new `"numberInput"` type to `ConfigurationSection` interface alongside existing `"colorPicker"` and `"dropdown"` types.

---

### Decision 2: Set only first column width for colspan cells

**Rationale:**

- User explicitly requested "set only first column" in requirements
- Simplifies implementation and UX (no need for multi-column width editor)
- Matches TipTap's array-based `colwidth` structure where `colwidth[0]` is the first column

**Alternatives considered:**

- Set all spanned columns to same width: Could surprise users if they had different widths set
- Show per-column width array editor: Complex UI for edge case (most cells don't have colspan)
- Disable control for colspan cells: Too restrictive

**Implementation:** `onChange` handler creates `colwidth` array with single value: `[width]`

---

### Decision 3: Use setCellAttribute command (not custom command)

**Rationale:**

- `setCellAttribute("colwidth", value)` should work because `colwidth` is in TipTap's base TableCell
- Other cell properties (backgroundColor, borderColor, etc.) use `setCellAttribute` successfully
- No need to define custom commands in extensions

**Alternatives considered:**

- Custom `setCellWidth` command in `TableCellBackgroundColor`: Unnecessary abstraction
- Modify `TableCellBackgroundColor.addAttributes()` to re-declare colwidth: Already inherits via `...this.parent?.()`

**Implementation:** Direct call to `editor.chain().focus().setCellAttribute("colwidth", [width]).run()`

---

### Decision 4: Render clear button conditionally (when value exists)

**Rationale:**

- Provides explicit way to reset to auto width (null)
- Visual indicator that a custom width is set
- Follows common UI pattern (seen in search inputs, etc.)

**Alternatives considered:**

- Always show clear button: Clutters UI when empty
- Use empty string to mean auto: Less explicit, could be confusing
- Add separate "Auto" button: Redundant with clear functionality

**Implementation:** Render `×` button only when `currentValue !== null`

---

### Decision 5: Store null for auto width (not empty array or zero)

**Rationale:**

- TipTap treats `colwidth: null` as auto-sizing behavior
- Consistent with how TipTap's base extensions work
- `colwidth: []` or `colwidth: [0]` could cause layout issues

**Implementation:** When user clears input, call `setCellAttribute("colwidth", null)`

## Risks / Trade-offs

### Risk: Parent attribute inheritance might not work

If `TableCellBackgroundColor` doesn't properly inherit `colwidth` from base `TableCell`, `setCellAttribute` calls will fail silently.

**Mitigation:** The extension already uses `...this.parent?.()` in `addAttributes()`, which should preserve `colwidth`. If issues arise, explicitly re-declare `colwidth` in the extension's attributes.

---

### Risk: First-row-only behavior might confuse users

TipTap only uses `colwidth` from the first row of the table to generate `<colgroup>`. Setting widths on other rows has no effect.

**Mitigation:** Could add tooltip or helper text: "Note: Only first row column widths apply." For initial implementation, leave as-is since it matches TipTap's inherent behavior.

---

### Risk: Custom NodeView might interfere with colwidth updates

The `TableBackgroundColorNodeView` manually generates `<colgroup>` in `updateColgroup()`. If it's not reactive to `colwidth` changes, widths might not update visually.

**Mitigation:** The NodeView's `update()` method already calls `updateColgroup()` on node changes, so it should react to `colwidth` updates. Test thoroughly during implementation.

---

### Trade-off: No drag-to-resize (only manual input)

Users lose the convenience of dragging column borders to resize.

**Mitigation:** The number input provides precision that drag handles lack. If drag-to-resize is needed later, it would require integrating ProseMirror's `columnResizing` plugin into the custom NodeView (~200 lines of code). For now, manual input meets the stated requirements.

---

### Trade-off: Pixel-only units (no percentages)

Users cannot set responsive column widths using percentages.

**Mitigation:** Percentage support would require custom rendering logic (TipTap's `colwidth` is pixel-only). Tables in rich text editors typically use fixed layouts. Can be added later if users request it.

## Migration Plan

No migration needed. This is a purely additive feature:

- Existing tables without `colwidth` continue to work (auto width)
- Existing tables with `colwidth` set (via TipTap's base functionality) display correctly
- No data model changes or breaking API changes

Deployment:

1. Merge code changes
2. Run build
3. Deploy widget to Mendix project
4. Feature is immediately available in cell configuration dropdown

Rollback:

- If issues arise, remove the new configuration section from `createCellConfigurationSections()`
- No data corruption risk (colwidth attribute is standard TipTap)

## Open Questions

1. **Should we show the actual rendered column width vs. the set value?**
    - The set `colwidth` might differ from actual rendered width due to table layout constraints
    - For initial implementation: Show the set value only (simpler)
    - Can add "measured width" tooltip later if needed

2. **Should we prevent setting widths on non-first-row cells?**
    - Pro: Avoids confusion about why widths don't apply
    - Con: Restricts user control, might not match mental model
    - Decision: Allow setting on any cell (simpler), rely on TipTap's first-row behavior

3. **Should we add keyboard shortcuts for common widths?**
    - Out of scope for initial implementation
    - Can be added later if users request it
