## Why

Inside a table cell, list nesting is impossible — only a single list level can be created. Pressing Tab in a list item inside a cell moves the cursor to the next cell (or adds a new row) instead of nesting the list item.

Root cause: Tiptap's `Table` extension binds `Tab`/`Shift-Tab` in its `addKeyboardShortcuts` to `goToNextCell`/`goToPreviousCell`. Because ProseMirror runs keymap handlers by extension order (table extensions are registered last in `Editor.tsx`, so after the internal `reverse()` they run first) and the table's `Tab` returns `true` whenever a next cell exists, the event is consumed before it can reach `ListItem`'s `Tab` (`sinkListItem`) or the `Indent` plugin. Outside tables, list nesting already works because those handlers are reached.

## What Changes

- `TableBackgroundColor` (our `Table.extend`) overrides `Tab`/`Shift-Tab` so that when the cursor is inside a list item (`editor.isActive("listItem")`), the handler returns `false` and yields to the list/indent handlers — enabling structural nesting/un-nesting inside cells.
- When the cursor is NOT in a list item, the handler delegates to the parent (stock) table behavior, preserving cell-to-cell navigation and add-row-on-last-cell.
- No change to `TableCell`/`TableHeader` (they do not bind Tab) or to the `Indent`/`ListItem` extensions.

## Capabilities

### New Capabilities

- `list-nesting-in-table`: Tab/Shift+Tab nest and un-nest list items when the list lives inside a table cell, while cell navigation is preserved for non-list cell content.

### Modified Capabilities

<!-- No existing spec requirement changes. The `list-tab-indent` capability's behavior is unchanged; this extends it to the in-table context by removing the table Tab collision. -->

## Impact

**Files affected**:

- `packages/pluggableWidgets/rich-text-web/src/extensions/TableBackgroundColor.ts` — add `addKeyboardShortcuts` override delegating to `this.parent?.()`

**User-facing changes**:

- Lists inside table cells now support multi-level nesting via Tab/Shift+Tab, matching list behavior outside tables and standard editors (Google Docs, Word, Notion).
- No breaking changes — cell navigation via Tab is unchanged for non-list cell content.

**Testing scope**:

- Tab/Shift+Tab on list items inside a table cell (ordered, unordered, task list)
- Tab on plain-text cell content (must still navigate to next cell)
- Tab on last cell with plain content (must still add a row)
- List nesting outside tables (must not regress)
