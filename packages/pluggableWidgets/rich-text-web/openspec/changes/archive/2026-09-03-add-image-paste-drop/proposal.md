## Why

Dragging an image file onto the editor, or pasting a screenshot from the clipboard, does nothing — and dropping is actively harmful: the browser navigates the whole tab away to the dropped file, discarding any unsaved form data on the page.

Root cause: no `handleDrop`/`handlePaste`/`handleDOMEvents` prop exists anywhere in `src/`. ProseMirror's default `handleDrop` builds a slice from `text/plain` + `text/html` only; a file drop supplies neither, so `parseFromClipboard` yields nothing and the handler returns **before** calling `event.preventDefault()` (`prosemirror-view/dist/index.js`, `handleDrop`: `if (!slice) return;`). The browser default then handles the drop. Clipboard image paste is the quieter half of the same gap: nothing is inserted, nothing is reported.

This is also a regression. The pre-TipTap (Quill) widget supported it — CHANGELOG 2.1.3: "Added 1MB file size limit for pasted and dropped images."

The Upload tab of the image dialog already accepts a file and inserts it as a base64 `data:` URI, and `ImageResize` is already configured with `allowBase64: true`. Drop and paste reuse that exact path, so no new widget properties and no backend work are needed.

## What Changes

- New `ImagePasteDrop` TipTap extension registers a ProseMirror plugin with `handleDOMEvents` for `drop`, `paste`, `dragover`, `dragenter`, and `dragleave`.
- Dropped/pasted `image/*` files are validated (same rules and 5MB `MAX_FILE_SIZE` as the Upload tab), read as base64 `data:` URIs, and inserted as `image` nodes — at the drop coordinates for drops, at the selection for pastes.
- Multiple dropped images are inserted in document order; invalid files are skipped and reported.
- Gated on the existing `enableDefaultUpload` property. When it is `false`, or the editor is read-only, the event is swallowed (`preventDefault`, nothing inserted) so the browser cannot navigate the page away.
- Validation and file-reading helpers move out of `ImageDialog.tsx` into a shared `src/utils/imageFiles.ts` used by both the dialog and the extension.
- Editor shows a dashed drop-target highlight while a file is dragged over it, and a transient inline error message when a file is rejected (reusing the existing `image.errorTooLarge` / `image.errorNotImage` / `image.errorReadFailed` translations).
- Non-image drops and pastes are passed through untouched, so existing behavior (dragging an `<img>` from another browser tab, pasting Word HTML) is unchanged.
- No new XML properties, no new translation keys, no data migration.

## Capabilities

### New Capabilities

- `rich-text-image-paste-drop`: images dropped onto or pasted into the editor body are inserted as base64 images, gated on `enableDefaultUpload`, with file validation, drop-position insertion, drag-over affordance, and error reporting.

### Modified Capabilities

<!-- No existing spec requirement changes. `rich-text-image-dialog` behavior is unchanged: the Upload
     tab keeps the same rules, but its file validation and base64 reading move into the shared
     `src/utils/imageFiles.ts` helper so the dialog and the drop/paste path cannot drift apart. -->

## Impact

**Files affected**:

- `src/utils/imageFiles.ts` — **new**: `MAX_FILE_SIZE`, `formatFileSize`, `validateImageFile`, `readFileAsDataUrl`, `pickImageFiles`
- `src/extensions/ImagePasteDrop.ts` — **new**: plugin registration + option types
- `src/components/Editor.tsx` — register `ImagePasteDrop`; live config ref for `enableDefaultUpload`/`readOnly`; render transient error + drag-over state in `EditorInner`
- `src/components/toolbars/components/ImageDialog.tsx` — use shared helpers, delete private `formatFileSize`/`validateFile`
- `src/components/toolbars/helpers/toolbarTypes.ts` — `MAX_FILE_SIZE` moves to `utils/imageFiles.ts` (re-exported here if other call sites remain)
- `src/ui/RichText.scss` — drag-over highlight + inline error message styles
- `src/RichText.xml` — fill the empty `enableDefaultUpload` description to state that it also controls drop/paste
- `CHANGELOG.md` — user-facing entry
- New unit tests: `src/utils/__tests__/imageFiles.spec.ts`, `src/extensions/__tests__/ImagePasteDrop.spec.ts`

**User-facing changes**:

- Drag & drop an image file into the editor → image inserted at the drop position.
- Paste an image from the clipboard (e.g. a screenshot) → image inserted at the cursor.
- Files over 5MB or non-image files are rejected with a visible message instead of being silently ignored.
- Dropping an image no longer navigates the page away — including on read-only editors.
- With "Enable default upload" off, drop and paste of image files insert nothing (and still cannot navigate the page).

**Testing scope**:

- Valid single image drop, multi-image drop (order preserved), oversized file, non-image file, unreadable file
- `enableDefaultUpload: false` → no insert; read-only editor → no insert; both cases `preventDefault`ed
- Paste image file; paste Word HTML must still route through `WordPaste` unchanged
- Drag an `<img>` from another tab (HTML slice) must still insert via ProseMirror's own path
- Drop position: inserted at drop coordinates, not at the previous cursor position
- Drag-over highlight appears on drag enter, clears on leave and on drop (no stuck highlight)
