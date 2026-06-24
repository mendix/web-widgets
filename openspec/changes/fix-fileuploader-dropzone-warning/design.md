## Test Cases

### Reproduction Tests

- Dropzone warning clears after dismissing all invalid files (unit)
    - **Given**: Dropzone rendered with `warningMessage` set (invalid files present)
    - **When**: All invalid files dismissed, `warningMessage` becomes undefined
    - **Then**: Dropzone has no `.warning` class, `.upload-text` shows idle message, no inline warning icon

- Dropzone warning does not use isDragReject after drop (unit)
    - **Given**: Dropzone component with react-dropzone's `isDragReject` stuck true (post-drop state)
    - **When**: `isDragActive` is false and no `warningMessage` prop
    - **Then**: Dropzone shows idle state — no `.warning` class, idle text displayed

- Default remove button removes file from list (unit)
    - **Given**: FileStore with status "done" or "existingFile", `removeObject` resolves successfully
    - **When**: `store.remove()` called
    - **Then**: File is removed from `rootStore.files` array (not kept as "removedFile")

### Edge Cases

- Warning icon shown only during warning state (unit)
    - **Given**: Dropzone rendered with `warningMessage`
    - **When**: Component renders
    - **Then**: `.inline-icon.warning-icon` span present inside `.upload-text`

- No icon shown for status message (limit reached) (unit)
    - **Given**: Dropzone rendered with `statusMessage` and `disabled=true`
    - **When**: Component renders
    - **Then**: No `.inline-icon` span rendered, text shown in neutral color

- Warning during active drag still works (unit)
    - **Given**: Dropzone in active drag state with rejected files (`isDragActive=true`, `isDragReject=true`)
    - **When**: Files being dragged over dropzone
    - **Then**: `.warning` class applied, rejected message shown with warning icon

- Dismissing one of multiple invalid files keeps warning (unit)
    - **Given**: Store has 2 files with `fileStatus === "validationError"`
    - **When**: One file dismissed via `dismissFile`
    - **Then**: `files.some(f => f.fileStatus === "validationError")` still true, warning remains

- Status message shown when disabled (unit)
    - **Given**: Dropzone with `disabled=true` and `statusMessage="Maximum file count of 5 reached."`
    - **When**: Component renders
    - **Then**: `.upload-text` contains the status message, dropzone has `.disabled` class not `.warning`

- File input not rendered when disabled (unit)
    - **Given**: Dropzone with `disabled=true`
    - **When**: Component renders
    - **Then**: No `input[type="file"]` in DOM

### Regression Tests

- Idle state shows drag and drop message (unit)
    - **Given**: Dropzone with no warnings, not disabled
    - **When**: Component renders
    - **Then**: `.upload-text` shows "Drag and drop files here", no `.warning`/`.disabled` class

- Drop accepted files works normally (unit)
    - **Given**: Store with capacity available
    - **When**: `processDrop` called with accepted files, no rejections
    - **Then**: Files added to store with "queued" status, no warning state

- Dropzone-message element no longer exists (unit)
    - **Given**: Dropzone rendered in any state (warning, disabled, idle)
    - **When**: Component renders
    - **Then**: No `.dropzone-message` element in DOM

- Upload limit reached message does not show warning styling (unit)
    - **Given**: `isFileUploadLimitReached` is true
    - **When**: FileUploaderRoot renders Dropzone
    - **Then**: Dropzone has `.disabled` class, text is neutral, no warning icon

## Notes

- react-dropzone v14.3.8 has a patched `isExt` regex in this repo but the `isDragReject` persistence after drop is upstream behavior — not a local bug. The fix works around it by only consulting drag state flags when `isDragActive` is true.
- The "removedFile" status type still exists in `FileStatus` union for backward compatibility with `markMissing()` logic (uploadingError → removedFile transition). It is no longer set by the user-initiated `remove()` flow.
