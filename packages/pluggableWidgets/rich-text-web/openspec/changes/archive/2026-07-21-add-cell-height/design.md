## Context

The just-completed `add-table-size-resize` change added `cellWidth` — a CSS-size string attribute on `TableCellBackgroundColor`, rendered as `width` on the cell and routed through `<colgroup>` (authoritative under `table-layout: fixed`). Cell height is the natural mirror.

## Goals / Non-Goals

**Goals:**

- Add a cell height control that accepts any CSS size string (`100px`, `50%`, bare number → px).
- Mirror `cellWidth`: same attribute shape, same `normalizeCssSize` validation, same commit-on-blur input.

**Non-Goals:**

- A dedicated table-row extension / true `<tr>` row-height attribute (no row extension exists; cell height achieves the visible result).
- Fixed/clipping height — table cell height is a minimum; content still grows the cell.

## Decisions

### Decision 1: Cell attribute `cellHeight`, rendered on `<td>` style

**Rationale:** Mirrors `cellWidth` exactly. Unlike width, height needs **no** `<colgroup>` routing — `table-layout: fixed` only governs column widths, so `height` on the `<td>` works directly. Simpler than width.

### Decision 2: "Column Height" label (matches the existing "Column Width")

**Rationale:** The width control is labeled "Column Width"; the paired control reads "Column Height" for UI symmetry, even though height technically applies to the cell/row. Terminology consistency beats pedantic accuracy here.

### Decision 3: Height is a minimum; whole row follows

**Rationale / behavior notes:**

- Browsers treat table-cell `height` as a minimum — the cell grows if content is taller (no clipping). Consistent with the table `min-height` decision.
- A `<td>` height stretches its entire row (sibling cells share the row height). So setting "cell height" visually behaves as row height — which is what a user asking for "column/row height" expects.

## Migration Plan

Additive. Existing tables (no `cellHeight`) unaffected. No data model or breaking changes.
