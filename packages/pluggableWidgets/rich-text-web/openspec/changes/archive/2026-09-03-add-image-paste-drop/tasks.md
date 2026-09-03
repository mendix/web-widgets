## 1. Extract shared image-file helpers

- [x] 1.1 Create `src/utils/imageFiles.ts` with `MAX_FILE_SIZE` (5MB, moved from `toolbarTypes.ts`), `formatFileSize`, `validateImageFile`, `readFileAsDataUrl`, `pickImageFiles`
- [x] 1.2 Make `validateImageFile` return a translation key + optional argument (`{ key: "image.errorTooLarge", arg: "12.4 MB" }`) instead of an already-translated string, so it works outside React
- [x] 1.3 Update `src/components/toolbars/helpers/toolbarTypes.ts`: remove the `MAX_FILE_SIZE` definition, re-export from `utils/imageFiles` if any other call site still imports it from there
- [x] 1.4 Update `src/components/toolbars/components/ImageDialog.tsx` to use the shared helpers; delete its private `formatFileSize` and `validateFile`
- [x] 1.5 Add `src/utils/__tests__/imageFiles.spec.ts` (oversized, non-image, valid, `pickImageFiles` filtering/order)
- [x] 1.6 Verify `src/components/toolbars/components/__tests__/ImageDialog.spec.tsx` still passes unchanged

## 2. ImagePasteDrop extension

- [x] 2.1 Create `src/extensions/ImagePasteDrop.ts` as an `Extension.create` with options `isEnabled: () => boolean`, `isEditable: () => boolean`, `wrapperSelector`, `dragOverClass`
- [x] 2.2 Keep the extension registration-only (like `WordPaste.ts`); put the decision logic in exported pure functions taking `(files, ctx)` so tests need no jsdom `DataTransfer`
- [x] 2.3 Register a ProseMirror `Plugin` with `props.handleDOMEvents` for `drop`, `paste`, `dragover`, `dragenter`, `dragleave`
- [x] 2.4 `drop`/`paste`: return `false` immediately when `pickImageFiles` finds no `image/*` file (leaves HTML slices, cross-tab `<img>` drags and Word paste to ProseMirror)
- [x] 2.5 When image files are present: always `event.preventDefault()`, then return `true` without inserting if `!isEnabled() || !isEditable()`
- [x] 2.6 Capture the target position up front — `view.posAtCoords({left: clientX, top: clientY})?.pos` for drop, `view.state.selection.from` for paste
- [x] 2.7 Validate each file; on failure dispatch the error event and skip that file, continuing with the rest
- [x] 2.8 Read each valid file with `readFileAsDataUrl` and insert sequentially via `insertContentAt`, clamping the position with `Math.min(pos, view.state.doc.content.size)`
- [x] 2.9 `dragover`/`dragenter`: `preventDefault()` when the drag advertises files (required for `drop` to fire on read-only views); maintain an enter/leave counter and toggle `dragOverClass` on the `.tiptap-wrapper` ancestor
- [x] 2.10 `dragleave` decrements the counter; `drop` resets it to `0` so the highlight cannot get stuck
- [x] 2.11 Dispatch rejections as a `richtextImageDropError` CustomEvent on `view.dom` with `{ key, arg }` detail

## 3. Wire into the editor

- [x] 3.1 In `src/components/Editor.tsx`, add a `configRef` (same `useMemo` mutable-ref pattern as `actionRef`) holding the current `enableDefaultUpload` and editable state, refreshed each render
- [x] 3.2 Register `ImagePasteDrop.configure({ isEnabled, isEditable, wrapperSelector: ".tiptap-wrapper", dragOverClass })` in the extensions array next to `WordPaste`
- [x] 3.3 In `EditorInner`, listen for `richtextImageDropError` on `editor.view.dom`, hold the detail in state, and clear it on a timer (clear the timer on unmount)
- [x] 3.4 Render the message with `useT()` so `image.errorTooLarge`'s `###` placeholder receives the formatted size
- [x] 3.5 Add drop-target highlight and inline error message styles to `src/ui/RichText.scss` (widget-prefixed; do not reuse the dialog's `.image-dialog-dropzone` classes)

## 4. Extension tests

- [x] 4.1 `src/extensions/__tests__/ImagePasteDrop.spec.ts`: valid drop inserts base64 image at the drop position
- [x] 4.2 Multi-file drop inserts in drop order
- [x] 4.3 Oversized file: nothing inserted, `preventDefault` called, `image.errorTooLarge` reported with formatted size
- [x] 4.4 Non-image drop: not handled, `preventDefault` not called
- [x] 4.5 `isEnabled() === false`: `preventDefault` called, nothing inserted, no error reported
- [x] 4.6 `isEditable() === false`: `preventDefault` called, nothing inserted
- [x] 4.7 `dragover` with files calls `preventDefault`
- [x] 4.8 Paste inserts at the selection
- [x] 4.9 Position clamped when the captured position exceeds the document size at resolve time
- [x] 4.10 Drag-over class removed after `drop` following two `dragenter`s
- [x] 4.11 Mixed valid + oversized drop: valid file inserted, rejection reported

## 5. Manual testing

- [x] 5.1 Drop a PNG mid-document → inserted at the drop point, not at the previous cursor
- [x] 5.2 Paste a screenshot (Cmd/Ctrl+V) → inserted at the cursor
- [x] 5.3 Drop a >5MB photo → nothing inserted, "too large" message shows the actual size, then fades
- [x] 5.4 Drop a PDF → no image inserted, page does not navigate
- [x] 5.5 Drop three images at once → all three appear, in order
- [x] 5.6 Set "Enable default upload" to false → drop and paste insert nothing, no message, page does not navigate
- [x] 5.7 Read-only editor → drop inserts nothing and the page does not navigate
- [x] 5.8 Drag an image from another browser tab → still inserts (HTML path unchanged)
- [x] 5.9 Paste Word content → Word paste cleanup still applies
- [x] 5.10 Drag over the editor then back out → highlight appears and clears, no stuck outline
- [x] 5.11 Resize a dropped image with the existing handles → works as for dialog-inserted images
- [x] 5.12 Drop while the widget sits inside a Mendix form → no implicit form submit, no navigation

## 6. Documentation

- [x] 6.1 Fill the empty `enableDefaultUpload` description in `src/RichText.xml` to state it also controls drag & drop and clipboard paste of images
- [x] 6.2 Add `CHANGELOG.md` entry: images can be dragged & dropped or pasted into the editor; oversized and non-image files are rejected with a message

## 7. E2E (optional, deferred)

- [ ] 7.1 Playwright spec building a `DataTransfer` inside `page.evaluate` and dispatching `dragover`/`drop` at the editor body (`setInputFiles` cannot drive a body drop)
