## 1. Create the bubble menu component

- [x] 1.1 Add `src/components/LinkBubbleMenu.tsx` importing `BubbleMenu` from `@tiptap/react/menus`, reading `editor` via `useCurrentEditor()`
- [x] 1.2 Add local `isEditing` state and a `linkEl` state for the resolved link DOM element
- [x] 1.3 Implement `shouldShow = ({ editor }) => editor.isEditable && editor.isActive("link") && !isEditing`
- [x] 1.4 Render `<BubbleMenu editor pluginKey="linkBubbleMenu" shouldShow>` wrapping two `ToolbarDefaultButton`s (Edit, Remove) in a `.link-bubble-menu` container

## 2. Wire the actions

- [x] 2.1 `removeLink`: `editor.chain().focus().extendMarkRange("link").unsetLink().run()`
- [x] 2.2 `resolveLinkEl`: from `editor.view.domAtPos(editor.state.selection.from)`, walk up to nearest `<a>` / `.tiptap-link` element
- [x] 2.3 `openEdit`: run `extendMarkRange("link")`, set `linkEl` from `resolveLinkEl`, set `isEditing = true`
- [x] 2.4 Render `{isEditing && <LinkDialog referenceElement={linkEl} onClose={() => setIsEditing(false)} />}`
- [x] 2.5 Choose icons from the shipped font (`src/ui/RichTextIcons.scss`) — no pencil glyph exists; use `Hyperlink` for Edit and `Erase` (or `Delete`) for Remove, or add a new glyph if a dedicated edit icon is wanted

## 3. Integrate into the editor

- [x] 3.1 Render `<LinkBubbleMenu />` inside `EditorInner` in `Editor.tsx`, as a sibling to `EditorContent` within `tiptap-wrapper`
- [x] 3.2 Confirm it only mounts when not in code view (bubble is irrelevant in the HTML code editor)

## 4. Styling

- [x] 4.1 Add `.link-bubble-menu` container style (inline-flex, padding, background, shadow); reuse existing toolbar `.icon-button` styles for the buttons

## 5. Verify

- [x] 5.1 Unit test: `shouldShow` returns true on active link + editable, false off-link, false when read-only, false while editing
- [x] 5.2 Unit test: Remove strips the whole link from a bare caret; Edit selects the full range so `LinkDialog` prefills and updates in place (no duplicate)
- [x] 5.3 Run package unit tests (Jest + RTL) — all pass
- [ ] 5.4 Manual check in Studio Pro (`pnpm start` with `MX_PROJECT_PATH`): click a link → bubble shows → Edit prefills + updates, Remove unlinks; bubble hidden while dialog open and in read-only mode
