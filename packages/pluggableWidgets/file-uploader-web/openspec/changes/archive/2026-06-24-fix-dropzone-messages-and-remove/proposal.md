## Why

Three issues in file-uploader-web dropzone behavior:

1. **Yellow warning persists** — After dropping invalid-format files and dismissing all of them, the dropzone stays yellow with "Some files may not be uploadable." text. Expected: reverts to idle (gray, "Drag and drop files here"). Only a subsequent valid drop clears it.

2. **Warning message placement** — The `.dropzone-message` element renders below the dropzone as a separate div. The limit-reached message ("Maximum file count of N reached") feels like an error when it should feel neutral/informational. All messages should appear inside the dropzone in `.upload-text`.

3. **Default remove greys out instead of removing** — When using default buttons, removing an uploaded file sets it to "removedFile" status (greyed out in list). With custom buttons, the file disappears immediately. Behavior should be consistent: file disappears on remove.

## Root Cause

1. `react-dropzone` (v14.3.8) sets `isDragReject = true` in its internal reducer after a rejected drop (`setFiles` action) and never clears it until the next drop. `Dropzone.tsx` used `isDragReject` unconditionally in `getMessage()` for both CSS class and text — so the warning state persisted indefinitely after a rejected drop.

2. The `.dropzone-message` div was a separate element below the dropzone with its own styling. There was no mechanism to show messages inside the dropzone itself when not in an active drag state.

3. `FileStore.remove()` calls `removeObject()` then sets `this.fileStatus = "removedFile"` — keeping the file in the list as greyed out. Custom buttons trigger a Mendix action that removes the object from the datasource, which triggers `processMissing` → `markMissing()` → status `"missing"` → component returns null.

## What Changes

Package: `packages/pluggableWidgets/file-uploader-web`

- `src/components/Dropzone.tsx` — Gate `isDragAccept`/`isDragReject` behind `isDragActive`. Add `statusMessage` prop for neutral messages. Render all messages inside `.upload-text` with optional inline icon. Remove `Fragment` wrapper and `.dropzone-message` div.
- `src/components/FileUploaderRoot.tsx` — Split warning vs status message: limit-reached → `statusMessage`, others → `warningMessage`.
- `src/stores/FileStore.ts` — `remove()` calls `rootStore.dismissFile(this)` after successful deletion instead of setting `"removedFile"` status.
- `src/ui/FileUploader.scss` — Remove `.dropzone-message` styles. Add `.inline-icon` styles inside `.upload-text`. Add warning text color in `.warning` state.
- `src/assets/check-icon.svg` — Removed (unused after design review).

## Impact

- Visual: dropzone messages now appear inside the dropzone instead of below it.
- Behavioral: removed files disappear immediately (no more greyed-out "removedFile" state visible to user with default buttons).
- No breaking API changes — widget XML properties unchanged.
- CSS class `.dropzone-message` removed — any custom CSS targeting it will no longer apply (unlikely external usage since it's internal widget markup).
