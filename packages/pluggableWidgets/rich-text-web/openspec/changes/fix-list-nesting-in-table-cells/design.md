## Context

Rich text widget uses Tiptap 3.x. Custom table styling lives in `TableBackgroundColor` (`src/extensions/TableBackgroundColor.ts`), which `Table.extend<...>`s the stock `@tiptap/extension-table`. List nesting is handled by:

- `ListItem` (from `@tiptap/extension-list`): binds `Tab` → `sinkListItem`, `Shift-Tab` → `liftListItem`.
- `Indent` (`src/extensions/Indent.ts`): a ProseMirror `handleKeyDown` plugin that, when `isActive("listItem")`, also runs `sink/liftListItem`; otherwise applies margin-based indent.

The stock `Table` extension binds Tab in `addKeyboardShortcuts` (verified in `node_modules/@tiptap/extension-table/dist/index.js`):

```js
Tab: () => {
  if (this.editor.commands.goToNextCell()) { return true; }
  if (!this.editor.can().addRowAfter()) { return false; }
  return this.editor.chain().addRowAfter().goToNextCell().run();
},
"Shift-Tab": () => this.editor.commands.goToPreviousCell(),
```

### Why the collision happens

ProseMirror runs keymap plugins in registration order; the first handler to return `true` consumes the event. Tiptap collects plugins via `sortExtensions([...extensions].reverse())` (desc by `priority`, default 100). All three Tab owners share priority 100, so array order decides. Table extensions are registered LAST in `Editor.tsx`, so after the `reverse()` they run FIRST. Table's `Tab` returns `true` whenever a next cell exists, so `ListItem.Tab` and the `Indent` plugin are never reached inside a cell.

```
Tab in <table><td><ul><li>|
  1. Table.Tab       goToNextCell() === true  → CONSUMED (cursor jumps cell)
  2. ListItem.Tab    sinkListItem             → never reached
  3. Indent plugin   handleKeyDown            → never reached
```

## Goals / Non-Goals

**Goals:**

- Enable multi-level list nesting (Tab) and un-nesting (Shift+Tab) inside table cells.
- Preserve stock table cell navigation for non-list cell content (next/prev cell, add-row-on-last-cell).
- Keep the change localized to the extension we already own.

**Non-Goals:**

- Changing `Indent` or `ListItem` extensions.
- Changing keyboard behavior outside tables.
- Adding Tab handling to `TableCell`/`TableHeader` (they do not bind Tab).
- Altering table navigation semantics for non-list content.

## Decisions

### Decision 1: Override Tab in TableBackgroundColor, delegate to parent

**Choice**: Add `addKeyboardShortcuts()` to the `Table.extend` block. Capture parent bindings via `this.parent?.()`. When `isActive("listItem")`, return `false` (yield to next handler); otherwise call the parent's `Tab`/`Shift-Tab`.

**Rationale**:

- Localized to the extension we own; no priority tuning, no global keymap plugin.
- `getExtensionField` (core) resolves an undefined field on a child to its parent, so `this.parent?.()` returns the stock `Table` bindings object. We delegate rather than re-implement `goToNextCell`.
- Returning `false` is the ProseMirror contract for "not handled" — the event falls through to `ListItem.Tab` (`sinkListItem`) and, if that also returns false, the `Indent` plugin.

**Alternatives considered**:

- Raise `Indent` priority above 100 so its plugin runs before Table → its `handleKeyDown` `preventDefault`s all in-editor Tab, so it would need a "in table & not in list → return false" branch; more edge cases, touches an unrelated extension.
- Custom coordinating keymap plugin at editor level → most code, overkill for a two-line delegation.

### Decision 2: Detect via editor.isActive("listItem")

**Choice**: Single `this.editor.isActive("listItem")` check.

**Rationale**: Matches the existing `Indent` extension and the archived `fix-list-tab-indent` change. Covers ordered, unordered, and (via `listItem`) task lists regardless of cursor position in the item.

### Decision 3: Delegate through parent bindings, not hard-coded commands

**Choice**: `parent?.Tab?.()` / `parent?.["Shift-Tab"]?.()` for the non-list branch, `?? false` fallback.

**Rationale**: Keeps behavior identical to whatever the installed `@tiptap/extension-table` version does (including add-row-on-last-cell), and survives future Tiptap updates without re-copying command logic.

## Risks / Trade-offs

**[Risk]** First list item in a cell cannot nest (ProseMirror requires a preceding sibling `<li>` for `sinkListItem`). When Table.Tab returns false, `ListItem.Tab` (`sinkListItem`) returns false too, then the `Indent` plugin's listItem branch `preventDefault`s and also fails → Tab does nothing, cursor stays put. → **Mitigation**: This is correct/expected behavior; crucially the cursor must NOT jump to the next cell. Verify empirically (scenario below).

**[Risk]** Double-handling: both `ListItem.Tab` and the `Indent` plugin target list items. → **Mitigation**: Both call the same idempotent `sink/liftListItem`; second call is a no-op. Confirm no visible glitch; if problematic, the `Indent` plugin already owns the listItem branch and `ListItem` could be relied on alone (out of scope unless observed).

**[Trade-off]** Parent binding shape (`Tab`, `"Shift-Tab"` keys) is coupled to the stock extension's naming. → Accepted; verified against the installed version and guarded with optional chaining + `?? false`.

## Implementation Plan

1. In `src/extensions/TableBackgroundColor.ts`, add `addKeyboardShortcuts()` to the `Table.extend` object:
    - `const parent = this.parent?.();`
    - `Tab: () => this.editor.isActive("listItem") ? false : (parent?.Tab?.() ?? false)`
    - `"Shift-Tab": () => this.editor.isActive("listItem") ? false : (parent?.["Shift-Tab"]?.() ?? false)`
    - Spread `...parent` first so other table bindings (Backspace/Delete handlers) are preserved.
2. Manual + e2e verification per scenarios in spec.md.
3. CHANGELOG.md entry.

Code location: `packages/pluggableWidgets/rich-text-web/src/extensions/TableBackgroundColor.ts` (the `Table.extend<TableBackgroundColorOptions>({ ... })` block).
