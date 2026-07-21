## Why

Rich text widget users cannot nest list items using Tab key. When cursor is in ordered/unordered list and Tab is pressed, content inside list item gets indented (margin added to paragraph) instead of nesting the list item structurally. Expected behavior: Tab should increase list nesting level (convert flat list to nested sublists).

## What Changes

- Tab key in list items will nest the list item structurally (using Tiptap's `sinkListItem` command)
- Shift+Tab in list items will outdent/lift the list item (using Tiptap's `liftListItem` command)
- Tab key in non-list content (paragraphs, headings) continues to work as before (margin-based indentation)
- Toolbar indent buttons unchanged (still call `increaseIndent`/`decreaseIndent` commands)

## Capabilities

### New Capabilities

- `list-tab-indent`: Tab/Shift+Tab keys nest and unnest list items in ordered and unordered lists

### Modified Capabilities

<!-- No existing spec requirements changing - this is new keyboard behavior only -->

## Impact

**Files affected**:

- `packages/pluggableWidgets/rich-text-web/src/extensions/Indent.ts` — Tab handler logic modified

**User-facing changes**:

- Tab key behavior in lists now matches standard rich text editor expectations (Google Docs, Word, Notion)
- No breaking changes — adds missing functionality

**Testing scope**:

- Keyboard navigation in ordered lists
- Keyboard navigation in unordered lists
- Mixed list types (switching between ordered/unordered)
- Tab key in non-list content (should not regress)
