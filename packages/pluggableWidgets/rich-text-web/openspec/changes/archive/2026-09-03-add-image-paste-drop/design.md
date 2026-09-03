## Context

The Rich Text widget builds its TipTap editor in `src/components/Editor.tsx`. Image insertion today has exactly one code path per source, all of them inside `ImageDialog.tsx`:

- **URL tab** — user-typed URL.
- **Upload tab** — `react-dropzone` inside the dialog; `FileReader.readAsDataURL` produces a base64 `data:` URI. Validation lives in dialog-private `validateFile`/`formatFileSize` (`ImageDialog.tsx:26-35`), with `MAX_FILE_SIZE = 5 * 1024 * 1024` in `toolbarTypes.ts:109`.
- **Media Library tab** — `imageSource` datasource plus the `imageSourceContent` widget, wired through an `imageSelected` CustomEvent dispatched at the dialog node.

`ImageResize` is configured with `allowBase64: true` (`Editor.tsx`), so base64 `src` values already survive parse and serialization.

The editor body itself has no file handling: `grep` for `handleDrop|handlePaste|handleDOMEvents|dataTransfer|clipboardData` across `src/` returns only unrelated dropdown handlers. `WordPaste` is the sole paste-adjacent extension and only hooks `transformPastedHTML`.

Two ProseMirror facts drive this design (both read from `prosemirror-view@1.42.2`):

```js
// dispatchEvent — custom handlers run BEFORE the editable gate
if (!runCustomHandler(view, event) && handlers[event.type] && (view.editable || !(event.type in editHandlers)))
    handlers[event.type](view, event);

// handleDrop — no preventDefault when nothing could be parsed
if (!slice) return;

// dragover/dragenter are prevented only for editable views
editHandlers.dragover = editHandlers.dragenter = (_, e) => e.preventDefault();
```

## Goals / Non-Goals

**Goals:**

- Drop and paste of image files insert base64 images, matching the Upload tab byte-for-byte in validation and output.
- One shared validation/read helper for the dialog and the new path.
- The page can never navigate away because of a dropped file — regardless of `enableDefaultUpload` or read-only state.
- Rejections are visible to the user.

**Non-Goals:**

- Uploading to a Mendix entity (`mx.data.saveDocument` + a create-object action, as `file-uploader-web` does with `createImageAction`). That needs new XML properties and async placeholder nodes; it is a separate future change. Drop/paste stays base64-only, consistent with the existing Upload tab.
- Changing `MAX_FILE_SIZE` (stays 5MB) or the Upload tab's UI.
- New XML properties. `enableDefaultUpload` is reused as the gate.
- New translation keys. Existing `image.error*` keys cover every rejection reason.
- E2E coverage of body drops (see Test Cases — deferred, not blocking).

## Decisions

### Use `handleDOMEvents`, not `handleDrop`/`handlePaste`

`handleDrop` and `handlePaste` are reached through `handlers[event.type]`, which is gated on `view.editable`. A read-only editor therefore never sees them — and because `editHandlers.dragover` is behind the same gate, `dragover` is not prevented either, so on a read-only editor the `drop` event may not even fire and the browser navigates.

`handleDOMEvents` runs in `runCustomHandler`, ahead of the gate, for every view state. So the plugin registers:

| Event                   | Behavior                                                                                                                    |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `dragover`, `dragenter` | `preventDefault()` when the drag carries image files — makes `drop` fire even on read-only views. Return `false` otherwise. |
| `dragleave`             | Clear the drag-over affordance.                                                                                             |
| `drop`                  | See decision below.                                                                                                         |
| `paste`                 | Same pipeline, insert at selection.                                                                                         |

**Rationale:** one registration point that also covers the read-only and upload-disabled cases, which are exactly the cases where the current bug is worst (nothing to insert, so nothing stops the browser).

**Alternative considered:** `handleDrop` + a separate `dragover` DOM listener on `.tiptap-wrapper`. Rejected — two mechanisms, and `handleDrop` still cannot cover read-only.

### Gate resolution: swallow, never fall through

Decision table, evaluated in order:

```
event has image/* in dataTransfer.files / clipboardData.files ?
  no  -> return false                     (ProseMirror's normal path: HTML slices,
                                           <img> dragged from another tab, Word paste)
  yes -> preventDefault()                 (always — this is the navigation fix)
         !isEnabled() || !editable ?
           yes -> return true             (insert nothing, no error message)
           no  -> validate + read + insert, return true
```

`enableDefaultUpload: false` is silent, not an error: the app developer turned the feature off, so a message would blame the end user for a configuration choice.

### `enableDefaultUpload` and `readOnly` come from a live ref, not from `configure()`

`Editor.tsx` memoizes its extension array on `[styleDataFormat]` and calls `useEditor(..., [])`, so extension options are frozen at editor creation. Both `enableDefaultUpload` and `readOnly` can change at runtime when Studio Pro re-renders the widget, and a `configure({ enabled })` value would stay stuck at the first render's value.

The extension therefore takes function options resolved at event time:

```ts
ImagePasteDrop.configure({
    isEnabled: () => configRef.current.enableDefaultUpload,
    isEditable: () => configRef.current.editable
});
```

`configRef` is the same `useMemo`-held mutable ref pattern already used for `actionRef` (`Editor.tsx:172`), refreshed on every render.

**Alternative considered:** add `enableDefaultUpload` to the extensions `useMemo` deps. Rejected — the editor instance is created once with `[]` deps and does not re-read extensions, so the new array would be ignored while adding a misleading dependency.

### Async read vs synchronous handler: clamp the captured position

`handleDOMEvents.drop` must return synchronously, but `FileReader` is async. So the handler captures the target position up front and inserts on resolve:

```
drop  -> pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos
paste -> pos = view.state.selection.from
      -> preventDefault(); return true
      ...FileReader resolves...
      -> insert at Math.min(pos, view.state.doc.content.size)
```

Between capture and insert the document can change (another user action, an external `setContent`). Clamping keeps the insert in-bounds; it may land slightly off if the doc shifted, which is acceptable for a local base64 read that resolves in milliseconds.

**Alternative considered:** a decoration-backed placeholder whose position is remapped by every transaction (the standard async-upload pattern). Rejected as unnecessary here — there is no network round-trip. It becomes the right design if entity upload is added later.

Multiple files are read in sequence and inserted in order, each after the previous insert, so document order matches drop order.

### Error reporting via CustomEvent on the editor DOM

The extension lives outside React and cannot call `useT()`. It dispatches a CustomEvent on `view.dom` carrying the translation key and its argument:

```
extension -> view.dom.dispatchEvent(
                 new CustomEvent("richtextImageDropError",
                                 { detail: { key: "image.errorTooLarge", arg: "12.4 MB" } }))
EditorInner -> listens, holds it in state, renders it with useT(), auto-clears on a timer
```

This mirrors the `imageSelected` CustomEvent already used between app-developer JS actions and `ImageDialog` (`ImageDialog.tsx`), and keeps translation entirely inside React where the provider lives.

**Alternative considered:** an `onError` callback option threaded through `configRef`. Workable, but the error must be rendered by `EditorInner` (inside `TranslationProvider`) while the ref is owned by `Editor` — the callback would have to be forwarded down anyway. The event keeps the two sides decoupled.

Rejections report the specific reason (`image.errorTooLarge` with the formatted size, `image.errorNotImage`, `image.errorReadFailed`). When several files in one drop fail, one message is shown for the first failure; valid files in the same drop are still inserted.

### Drag-over affordance uses an enter/leave counter

`dragenter`/`dragleave` fire for every descendant element the pointer crosses, so a naive toggle flickers as the cursor moves over text nodes. The plugin keeps an integer counter (increment on `dragenter`, decrement on `dragleave`, class applied while `> 0`) and resets it to zero on `drop`. The class goes on the `.tiptap-wrapper` ancestor of `view.dom`, styled in `src/ui/RichText.scss` with a dashed outline. The dialog's `.image-dialog-dropzone` classes stay dialog-scoped and are not reused.

### Inserted images use natural size

No `width`/`height` attributes are applied. The dialog's `250` width default belongs to the dialog's explicit dimension fields; drop/paste is the fast path, and `ImageResize` already provides handles for resizing afterwards.

## Test Cases

### Shared helpers — `src/utils/__tests__/imageFiles.spec.ts`

- `validateImageFile` rejects oversized files (unit)
    - **Given**: a `File` with `size` above `MAX_FILE_SIZE` and `type: "image/png"`
    - **When**: validated
    - **Then**: returns the `image.errorTooLarge` key with the formatted size as its argument

- `validateImageFile` rejects non-images (unit)
    - **Given**: a `File` with `type: "application/pdf"` under the size limit
    - **When**: validated
    - **Then**: returns the `image.errorNotImage` key

- `validateImageFile` accepts a valid image (unit)
    - **Given**: a `File` with `type: "image/jpeg"` under the size limit
    - **When**: validated
    - **Then**: returns no error

- `pickImageFiles` filters a mixed file list (unit)
    - **Given**: a file list containing two `image/*` files and one `text/plain` file
    - **When**: filtered
    - **Then**: only the two image files are returned, in their original order

### Drop/paste handling — `src/extensions/__tests__/ImagePasteDrop.spec.ts`

The event handling is exported as a pure function taking `(files, ctx)` so it is testable without jsdom's stub `DataTransfer`; the extension file stays registration-only, like `WordPaste.ts`.

- Valid image drop inserts at the drop position (unit)
    - **Given**: an enabled, editable editor and a drop carrying one valid `image/png`
    - **When**: the drop is handled
    - **Then**: the event is `preventDefault`ed, the handler reports handled, and one `image` node with a `data:` `src` is inserted at the drop position

- Multiple images preserve order (unit)
    - **Given**: a drop carrying three valid images
    - **When**: handled
    - **Then**: three `image` nodes appear in the document in drop order

- Oversized file is rejected with a message (unit)
    - **Given**: a drop carrying a 12MB image
    - **When**: handled
    - **Then**: no node is inserted, the event is `preventDefault`ed, and an `image.errorTooLarge` error is reported

- Non-image drop passes through (unit)
    - **Given**: a drop whose `dataTransfer` carries no `image/*` file
    - **When**: handled
    - **Then**: the handler reports not-handled and does not call `preventDefault`

- Upload disabled swallows the event silently (unit)
    - **Given**: `isEnabled()` returns `false` and a drop carrying a valid image
    - **When**: handled
    - **Then**: `preventDefault` is called, nothing is inserted, and no error is reported

- Read-only editor swallows the event silently (unit)
    - **Given**: `isEditable()` returns `false` and a drop carrying a valid image
    - **When**: handled
    - **Then**: `preventDefault` is called and nothing is inserted

- `dragover` is prevented for image drags (unit)
    - **Given**: a `dragover` whose `dataTransfer` advertises a file
    - **When**: handled
    - **Then**: `preventDefault` is called — this is what makes `drop` fire on read-only views

- Paste inserts at the selection (unit)
    - **Given**: an enabled editor with a collapsed selection mid-paragraph and a paste carrying an image file
    - **When**: handled
    - **Then**: the image is inserted at the selection position

- Insert position is clamped when the document shrank (unit)
    - **Given**: a captured drop position beyond the document size at read-resolve time
    - **When**: the read resolves
    - **Then**: the insert happens at the document end instead of throwing

- Drag-over class clears on drop (unit)
    - **Given**: two `dragenter` events followed by one `drop`
    - **When**: handled
    - **Then**: the drag-over class is removed (counter reset, not left at 1)

### Regression — existing suites

- `WordPaste` HTML paste still routes through `transformPastedHTML` (a paste with `text/html` and no files is not intercepted).
- `ImageDialog.spec.tsx` upload-tab validation cases still pass after validation moves to `utils/imageFiles.ts`.

### Manual / deferred

- Playwright body-drop coverage needs a hand-built `DataTransfer` inside `page.evaluate` (`setInputFiles` cannot reach a body drop). Deferred; drop/paste is covered by manual test steps in `tasks.md`.
