## 1. Test Setup

- [x] 1.1 Write Dropzone.spec.tsx — idle state: shows idle message, no warning class, no inline icon, renders file input
- [x] 1.2 Write Dropzone.spec.tsx — warning state: shows warning message inside `.upload-text`, has `.warning` class, renders inline warning icon, no `.dropzone-message` element
- [x] 1.3 Write Dropzone.spec.tsx — disabled+statusMessage: shows status text inside `.upload-text`, has `.disabled` class (not `.warning`), no inline icon, no file input
- [x] 1.4 Write FileUploaderStore.spec.ts — validationError files tracking: present after rejected drop, cleared after all dismissed, remains when only some dismissed
- [x] 1.5 Write FileStore.spec.ts — `remove()` calls `dismissFile` on root store after successful `removeObject`

## 2. Implementation

- [x] 2.1 Fix Dropzone.tsx — gate `isDragAccept`/`isDragReject` behind `isDragActive` to prevent react-dropzone stuck state from affecting UI
- [x] 2.2 Fix Dropzone.tsx — add `statusMessage` prop, render all messages inside `.upload-text` with conditional inline icon span, remove `.dropzone-message` div and `Fragment` wrapper
- [x] 2.3 Fix FileUploaderRoot.tsx — split `warningMessage` (createActionFailed, validationError) vs `statusMessage` (limit reached), pass both to Dropzone
- [x] 2.4 Fix FileStore.ts — `remove()` calls `rootStore.dismissFile(this)` instead of setting `"removedFile"` status
- [x] 2.5 Update FileUploader.scss — remove `.dropzone-message` block, add `.inline-icon` styles (`.warning-icon` variant), add `.upload-text` color override in `.warning` state

## 3. Refactoring

- [x] 3.1 Remove unused `hasInvalidFormatFiles` observable field and related `dismissValidationErrors`/`dismissFile` flag toggling from FileUploaderStore — inline `.some()` check in component suffices now that Dropzone correctly handles post-drop state
- [x] 3.2 Remove unused `$file-dropzone-success-color`, `$file-check-icon`, and `check-icon.svg` after design review decided limit-reached should be neutral (no green, no icon)
- [x] 3.3 Simplify `getMessage()` return type — remove `"success"` MessageType and `"check-icon"` IconType since they're unused

## 4. Verification

- [x] 4.1 All tests passing — 116 total (102 existing + 14 new Dropzone specs)
- [x] 4.2 Full test suite passes (`pnpm run test` in widget dir)
- [x] 4.3 Build succeeds (`pnpm run build` in widget dir)
- [x] 4.4 Manual browser verification — warning appears on invalid drop, clears on dismiss, limit-reached shows neutral text, remove button removes instantly

## Notes

- react-dropzone v14.3.8 `setFiles` reducer sets `isDragReject: fileRejections.length > 0` which persists until next drop. This is upstream behavior, not a local bug. Fix works around it.
- The `"removedFile"` FileStatus still exists for `markMissing()` (uploadingError → removedFile transition when object disappears from datasource). It's no longer set by user-initiated remove.
- The `.dropzone-message` CSS class is removed entirely. Any external styling targeting it will break (unlikely — internal widget markup).
