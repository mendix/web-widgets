## Why

In the Rich Text widget's table editor, cell styling (background color, border color, border style, border width) can be applied to data cells (`<td>`) but silently does nothing for header cells (`<th>`). When the cursor is in a header cell, the toolbar configuration UI still shows the controls and fires the commands, but the change is dropped — creating a confusing, asymmetric experience.

## Root Cause

The editor uses two different TipTap node types for cells (`packages/pluggableWidgets/rich-text-web/src/components/Editor.tsx`):

- Data cells use `TableCellBackgroundColor` — a custom extension of `@tiptap/extension-table-cell` that declares `backgroundColor`, `borderColor`, `borderStyle`, `borderWidth` (plus `cellWidth`/`cellHeight`) attributes and emits them in `renderHTML` as `["td", …]`.
- Header cells use the stock `TableHeader` extension, which has **none** of these attributes and renders a plain `["th", …]`.

The configuration UI is already header-aware — `getCellAttributes()` reads from both `tableCell` and `tableHeader`, and the handlers call the generic `setCellAttribute(...)` command. But because the `tableHeader` node schema has no such attributes and no `renderHTML` to emit them, the commands are no-ops for header cells.

## What Changes

- Extract the shared cell-styling logic (the `addAttributes()` map, the `renderHTML` style/class building, and the border commands) into a reusable helper so it can be applied to both `td` and `th` extensions without duplication.
- Refactor `TableCellBackgroundColor` to use the shared helper (renders `td`).
- Add a new `TableHeaderBackgroundColor` extension of `@tiptap/extension-table-header` using the same shared helper (renders `th`).
- Wire `TableHeaderBackgroundColor` into `Editor.tsx`, replacing the stock `TableHeader`.
- No changes needed to the configuration UI, commands wiring, or CSS — they already support header cells generically.

## Capabilities

### New Capabilities

- `rich-text-table-cell-styling`: Consistent background color, border color, border style, and border width styling applied to both data cells (`<td>`) and header cells (`<th>`) in the Rich Text table editor, in both `inline` and `class` style-data formats.

### Modified Capabilities

<!-- none -->

## Impact

- **Files**:
    - `packages/pluggableWidgets/rich-text-web/src/extensions/TableCellBackgroundColor.ts` (refactor to use shared helper)
    - `packages/pluggableWidgets/rich-text-web/src/extensions/TableHeaderBackgroundColor.ts` (new)
    - Shared helper — new module (e.g. `src/extensions/tableCellStyling.ts`) or added to `src/utils/tableStyle.ts`
    - `packages/pluggableWidgets/rich-text-web/src/components/Editor.tsx` (swap `TableHeader` → `TableHeaderBackgroundColor`)
- **Behavior**: Header cells now honor background/border configuration identically to data cells.
- **No migration**: The TipTap-based table editor is unreleased; this is purely additive. Existing saved content is unaffected.
- **No API or XML changes**; **no dependency version changes**.
- **Affected widget**: `@mendix/rich-text-web` (currently unreleased TipTap table feature).
