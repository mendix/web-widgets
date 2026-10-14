## Why

Today a user can insert a link via the toolbar, but there is no quick way to edit or remove an _existing_ link — they must reselect the text and reopen the toolbar dialog, and the toolbar's link dialog even duplicates the link when invoked on a bare cursor inside a link. A contextual bubble menu that appears on any link gives an in-place Edit/Remove affordance, matching the standard rich text editor UX.

## What Changes

- Add a `LinkBubbleMenu` component using tiptap's `BubbleMenu` from `@tiptap/react/menus` (already resolved transitively — no new dependency).
- The menu appears whenever the caret is inside or a selection covers a link (`editor.isActive("link")`) and the editor is editable.
- Menu contains two `ToolbarDefaultButton` controls:
    - **Edit** — selects the whole link (`extendMarkRange("link")`) then opens the existing `LinkDialog`, prefilled, anchored to the link's DOM element.
    - **Remove** — `extendMarkRange("link").unsetLink()` to strip the link across its full range, turning it back into normal text.
- While the dialog is open, the bubble menu is suppressed (`shouldShow` returns false during editing) so only one floating layer shows at a time.
- Render `LinkBubbleMenu` inside `EditorInner`, as a sibling to `EditorContent`, within the existing `EditorContextProvider`.

## Capabilities

### New Capabilities

- `rich-text-link-bubble-menu`: Contextual bubble menu shown on links, offering in-place Edit and Remove actions, including the full-link selection behavior that keeps editing and removal correct regardless of caret position.

### Modified Capabilities

<!-- None — the existing toolbar link-insert behavior is unchanged. -->

## Impact

- Package: `@mendix/rich-text-web`
- New file: `src/components/LinkBubbleMenu.tsx`
- Modified: `src/components/Editor.tsx` (`EditorInner` renders the bubble menu)
- Reuses: `LinkDialog` (existing edit path), `ToolbarDefaultButton`, `useCurrentEditor`.
- Styling: new `.link-bubble-menu` container class; reuses existing toolbar button styles.
- No XML, no runtime API change, no new dependency.
