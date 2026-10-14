## Context

The rich text widget (`@mendix/rich-text-web`) runs tiptap v3. Links come from StarterKit's link mark, configured with `openOnClick: false` so clicking a link places the caret instead of navigating. Link insertion today goes through the toolbar's `DialogToolbarButton` → `LinkDialog`, which reads `getAttributes("link")` and already renders an "Edit Link" variant. There is no affordance to edit or remove an _existing_ link without reselecting it from the toolbar.

`@tiptap/react/menus` exposes `BubbleMenu` (backed by `@tiptap/extension-bubble-menu@3.27.1`, already resolved transitively). `BubbleMenu` manages its own floating position via a ProseMirror plugin and accepts `editor`, `shouldShow`, `pluginKey`, `updateDelay`, plus standard div attributes. `shouldShow` receives `{ editor, element, view, state, from, to }`.

Reference: tiptap menus docs — https://tiptap.dev/docs/examples/advanced/menus

## Goals / Non-Goals

**Goals:**

- Contextual Edit/Remove menu that appears on any link in an editable editor.
- Reuse the existing `LinkDialog` for editing (prefilled, in-place update).
- Correct behavior from a bare caret inside a link (no selection required).

**Non-Goals:**

- No change to toolbar link insertion.
- No new bubble menus for other marks (bold, image, etc.) — link only.
- No new npm dependency.

## Decisions

### Render `LinkBubbleMenu` inside `EditorInner`

The bubble menu lives as a sibling to `EditorContent`, within the existing `EditorContextProvider`, so it can read `editor` via `useCurrentEditor()`. Buttons reuse `ToolbarDefaultButton`.

```tsx
<BubbleMenu editor={editor} pluginKey="linkBubbleMenu" shouldShow={showLinkMenu}>
    <ToolbarDefaultButton icon="<edit-icon>" onClick={openEdit} title="Edit link" />
    <ToolbarDefaultButton icon="<trash-icon>" onClick={removeLink} title="Remove link" />
</BubbleMenu>;
{
    isEditing && <LinkDialog referenceElement={linkEl} onClose={closeEdit} />;
}
```

### `shouldShow` = active link, editable, not editing

```ts
shouldShow = ({ editor }) => editor.isEditable && editor.isActive("link") && !isEditing;
```

Covers three spec requirements at once: appears on link, hidden off-link, hidden when read-only, and suppressed while the dialog is open (single floating layer).

_Alternative considered:_ require a non-empty selection over the link. Rejected — less discoverable; the caret-inside case is the common one.

### Full-range selection before Edit and Remove

Both actions first run `editor.chain().focus().extendMarkRange("link")`. This is the crux fix:

- **Edit:** `LinkDialog`'s submit branches on `selectedText`. With a bare caret, `selectedText === ""` → it takes the "insert new text" branch and **duplicates** the link. Selecting the whole link range first populates `selectedText` → correct "apply to existing selection" branch.
- **Remove:** without `extendMarkRange`, `unsetLink()` only clears from the caret; the rest of the link survives. Extending first strips the entire link.

```ts
removeLink = () => editor.chain().focus().extendMarkRange("link").unsetLink().run();
openEdit = () => {
    editor.chain().focus().extendMarkRange("link").run();
    setLinkEl(resolveLinkEl());
    setIsEditing(true);
};
```

### Anchor the dialog to the link DOM element

`LinkDialog` takes a `referenceElement`. Anchoring to the actual `<a>`/`.tiptap-link` element (resolved from `editor.view.domAtPos(selection.from)`, walking up to the nearest anchor) keeps the dialog positioned even after the bubble menu hides on focus loss, and reads as "editing _this_ link."

_Alternative considered:_ anchor to the bubble menu container ref. Rejected — the bubble hides when the editor blurs (dialog input steals focus), orphaning the dialog.

## Risks / Trade-offs

- **Icon names unknown** → the icon font names for edit/trash must be confirmed against the existing icon set (config uses names like `Text-bold`). Resolve during implementation; pick the closest existing glyph.
- **Focus loss hides the bubble mid-interaction** → mitigated by anchoring the dialog to the link element (not the bubble) and by `!isEditing` in `shouldShow`, so the dialog owns the interaction once open.
- **KeyboardNavigation extension** intercepts wrapper/toolbar keys → verify Tab/Escape inside the bubble buttons and dialog don't conflict; the bubble buttons are plain `ToolbarDefaultButton`s so Escape/click-outside close is handled by `LinkDialog`'s `useDropdown`.
- **`extendMarkRange` changes the user's selection** → acceptable and expected; the caret ends on the whole link, which is the intent for both edit and remove.

## Migration Plan

1. Add `LinkBubbleMenu.tsx` (menu + edit/remove + link-element resolution + dialog).
2. Render it in `EditorInner` inside `tiptap-wrapper`.
3. Add `.link-bubble-menu` container styling; reuse toolbar button styles.
4. Unit-test the edit/remove commands and `shouldShow` gating; manual check in Studio Pro.

Rollback: remove the render in `EditorInner`; the new file becomes dead and can be deleted.

## Open Questions

- Exact icon glyph names for Edit and Remove — resolve against the shipped icon font during implementation.
