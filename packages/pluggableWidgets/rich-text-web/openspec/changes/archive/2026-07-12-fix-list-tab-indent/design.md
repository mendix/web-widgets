## Context

Rich text widget uses Tiptap editor with custom `Indent` extension (`src/extensions/Indent.ts`). Current implementation:

- Targets `["paragraph", "heading", "blockquote"]` node types
- Tab handler intercepts Tab key when focus is inside editor
- Calls `increaseIndent()`/`decreaseIndent()` commands
- Applies margin-based indentation via `margin-left` style or `indent-*` class

Tiptap's StarterKit includes list extensions with built-in commands:

- `sinkListItem(typeOrName)` — increases list nesting (wraps in sublist)
- `liftListItem(typeOrName)` — decreases list nesting
- `listItem` node type for both ordered and unordered lists

Problem: Tab handler doesn't detect list item context, applies margin-based indent to paragraph inside list item instead of structural nesting.

## Goals / Non-Goals

**Goals:**

- Tab/Shift+Tab nest/unnest list items structurally
- Preserve existing Tab behavior for paragraphs, headings, blockquotes
- Maintain focus handling (only intercept Tab inside editor content)
- Work for both ordered and unordered lists

**Non-Goals:**

- Modifying toolbar indent buttons behavior (still call `increaseIndent`/`decreaseIndent`)
- Adding list item support to `updateIndentLevel()` function
- Changing maximum nesting depth limits
- Supporting mixed content selection (list + paragraph)

## Decisions

### Decision 1: Modify Tab handler, not indent commands

**Choice**: Add list detection to `handleKeyDown` in `addProseMirrorPlugins()`, call Tiptap's built-in list commands directly.

**Rationale**:

- Simplest change — Tab handler already exists and checks focus
- Avoids modifying `increaseIndent()`/`decreaseIndent()` commands
- Toolbar buttons unchanged (acceptable limitation for v1)
- Leverages Tiptap's proven list nesting logic

**Alternatives considered**:

- Add `listItem` to `types` array and implement list logic in `updateIndentLevel()` → More complex, mixes structural changes with style changes, would affect toolbar buttons (out of scope)
- Create separate list indent commands → Unnecessary duplication of Tiptap functionality

### Decision 2: Use editor.isActive('listItem') for detection

**Choice**: Check `editor.isActive('listItem')` to determine if cursor is in list.

**Rationale**:

- Standard Tiptap API for node detection
- Works regardless of cursor position within list item
- Single check covers both ordered and unordered lists

**Alternatives considered**:

- Check node type directly via ProseMirror state → More verbose, no benefit
- Check parent node chain → Unnecessary complexity

### Decision 3: Single typeOrName parameter 'listItem'

**Choice**: Pass `'listItem'` to `sinkListItem()` and `liftListItem()` commands.

**Rationale**:

- `listItem` is the node type for both ordered and unordered lists in Tiptap
- Commands handle list type conversion automatically
- Simpler than checking `bulletList` vs `orderedList`

**Alternatives considered**:

- Detect list type and pass `bulletList` or `orderedList` → Unnecessary, commands work on `listItem` directly

### Decision 4: Short-circuit return when in list

**Choice**: When `isActive('listItem')` returns true, call list command and return result immediately (don't fall through to indent commands).

**Rationale**:

- List and paragraph indent are mutually exclusive behaviors
- Prevents calling both list command and indent command
- Clear control flow

## Risks / Trade-offs

**[Risk]** Toolbar indent buttons won't work on lists → **Mitigation**: Acceptable for v1, document as known limitation. Can be addressed in future by extending indent commands.

**[Risk]** User muscle memory for existing Tab behavior in lists → **Mitigation**: New behavior matches industry standard (Google Docs, Word, Notion). Empty paragraph below list can still be indented.

**[Risk]** Selection spanning multiple list items may behave unexpectedly → **Mitigation**: Tiptap's `sinkListItem`/`liftListItem` handle ranges. If issues arise, can add selection check.

**[Trade-off]** Two separate indent systems (structure-based for lists, margin-based for paragraphs) → Accepted trade-off for simplicity. Unifying would require significant refactor.

## Implementation Plan

1. Modify `handleKeyDown` in `Indent.ts` `addProseMirrorPlugins()` section
2. After Tab key check, before focus check, add list detection
3. If `editor.isActive('listItem')`, call `sinkListItem('listItem')` or `liftListItem('listItem')`
4. Return result immediately (don't fall through)
5. Existing logic remains for non-list content

Code location: `packages/pluggableWidgets/rich-text-web/src/extensions/Indent.ts`, lines 125-153 (handleKeyDown function).
