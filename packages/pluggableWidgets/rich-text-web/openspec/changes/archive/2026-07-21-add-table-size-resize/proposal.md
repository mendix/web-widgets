## Why

Users can style tables (background, border) and set individual column widths, but cannot control the overall table size. There is no way to set an explicit table width/height, and no drag-to-resize affordance like the one images and embeds already provide. Today the table width is only ever _derived_ from the sum of column widths (`colwidth`), so users who want a specific table footprint have no direct control.

This change adds table-level sizing: numeric width/height inputs in the table configuration dropdown, plus drag-to-resize handles on the table itself — mirroring the image/embed resize experience.

## What Changes

- Add `width` and `minHeight` attributes to the Table node (`TableBackgroundColor` extension), rendered on the `<table>` element in both `inline` and `class` style-data formats.
- Add two `numberInput` sections ("Table Width", "Table Height") to the table configuration dropdown, reusing the existing `numberInput` control from the column-width feature.
- Add `setTableWidth` / `setTableMinHeight` commands (mirroring the existing `setTableBorderWidth` command pattern).
- Add drag-to-resize handles to the existing plain-DOM `TableBackgroundColorNodeView`: live style updates during drag, single history-committing `setNodeMarkup` on mouseup.
- Ensure explicit table width coexists with per-column `colwidth`: table `width` wins as the table footprint, `colwidth` continues to feed per-column `min-width` (Strategy A).

## Capabilities

### New Capabilities

- `table-size-control`: table-level width and min-height control via numeric inputs in the table configuration dropdown, with validation, clear-to-auto support, and persistence.
- `table-drag-resize`: drag-to-resize handles on the table that update width/height interactively and commit a single undoable change on release.

### Modified Capabilities

<!-- No existing spec requirements change. This is additive and layered on top of the existing colwidth-derived sizing; the `table-column-width-control` capability is unaffected. -->

## Impact

**Affected Files:**

- `src/extensions/TableBackgroundColor.ts` — add `width`/`minHeight` attributes; render on `<table>`; add `setTableWidth`/`setTableMinHeight` commands; add resize handles + drag handlers to `TableBackgroundColorNodeView`.
- `src/components/toolbars/helpers/configurationHelpers.ts` — add "Table Width" and "Table Height" `numberInput` sections to `createTableConfigurationSections()`.
- `src/ui/*.scss` (table/format styles) — styles for resize handles and hover affordance.

**User Impact:**

- Positive: users gain explicit table sizing and familiar drag-to-resize, consistent with image/embed.
- No breaking changes: existing tables (no `width`/`minHeight` attr) render exactly as today via the unchanged `colwidth`-derived sizing.

**Technical Impact:**

- Table width now has two layered sources: explicit `attrs.width` (new, wins) and `colwidth`-derived `min-width` (existing, unchanged). See design.md for precedence rules.
- Resize handles are added to the existing plain-DOM NodeView (no rewrite to a React NodeView), keeping the working color/border code untouched.
