## 1. Widget property & config

- [x] 1.1 Add `<property key="helpButton" type="boolean" defaultValue="true">` (caption "Keyboard shortcuts") after `tableBetter` in `src/RichText.xml`
- [x] 1.2 Add `"helpButton"` to `toolbarGroupKeys` in `src/RichText.editorConfig.ts` so it hides unless preset is `custom`
- [x] 1.3 Regenerate `typings/RichTextProps.d.ts` from XML via the build (do not hand-edit); confirm `helpButton` appears in props

## 2. Shortcut catalog

- [x] 2.1 Create `src/components/toolbars/helpers/shortcuts.ts` exporting a static grouped catalog (Formatting, Paragraph, History, Accessibility) with "keep in sync" comment
- [x] 2.2 Populate Formatting (bold, italic, underline, strikethrough, superscript, subscript), Paragraph (indent Ctrl+], outdent Ctrl+[), History (undo, redo), Accessibility (Alt+F10, Alt+F11, Escape)

## 3. Help dialog component

- [x] 3.1 Create `src/components/toolbars/components/HelpDialog.tsx` — centered modal mirroring `ConfirmDialog`, reusing `Dialog.scss`
- [x] 3.2 Render the shortcut catalog grouped by category with key combos
- [x] 3.3 Add accessibility: `role="dialog"`, `aria-modal="true"`, accessible name from title, focus into dialog on open
- [x] 3.4 Dismiss on click-outside and on Escape (scope Escape to open modal, `stopPropagation` to avoid fullscreen/editor handlers)

## 4. Toolbar integration

- [x] 4.1 Create a help toolbar button (text "?") via `ToolbarDefaultButton` with `children="?"`, toggling the modal via local state
- [x] 4.2 In `Toolbar.tsx`, render the help button outside `filteredGroups`, gated on `helpButton !== false && filteredGroups.length === TOOLBAR_GROUPS.length`
- [x] 4.3 Plumb `helpButton` prop: `RichText.tsx` → `EditorWrapper.tsx` → `Editor.tsx` → `Toolbar`

## 5. Styling

- [x] 5.1 Ensure the "?" button aligns with icon-font buttons using existing button classes; add minimal styles for the help dialog list layout if needed

## 6. Tests

- [x] 6.1 Unit test: button renders under full preset / custom-all-groups, hidden under basic/standard, custom-missing-group, and `helpButton=false`
- [x] 6.2 Unit test: modal opens on click, closes on click-outside and Escape
- [x] 6.3 Unit test: dialog exposes `role="dialog"`, `aria-modal`, accessible name; focus moves into dialog on open
- [x] 6.4 Unit test: catalog covers shortcuts owned by custom extensions (Indent, Fullscreen, KeyboardNavigation) — drift guard
- [x] 6.5 Update snapshots if applicable (`pnpm run test -u`)

## 7. Docs

- [x] 7.1 Add a user-facing CHANGELOG.md entry describing the new help button and shortcuts modal
