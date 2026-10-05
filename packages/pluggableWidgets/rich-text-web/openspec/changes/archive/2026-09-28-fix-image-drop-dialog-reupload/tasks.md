## 1. Normalise default upload at runtime

- [x] 1.1 In `src/components/Editor.tsx`, compute `uploadEnabled = enableDefaultUpload || imageSource == null` with a short comment on the stale hidden-property value
- [x] 1.2 Use `uploadEnabled` for `configRef` (the `ImagePasteDrop` `isEnabled` gate) and for `imageConfig.enableDefaultUpload`
- [x] 1.3 Add an editor-level unit test: `enableDefaultUpload=false` with no image source → the `ImagePasteDrop` gate reports enabled and the dialog config shows the Upload tab

## 2. Consume initial files once in the image dialog

- [x] 2.1 In `src/components/toolbars/components/ImageDialog.tsx`, initialise `activeTab` with a lazy `useState` initializer: `"entity"` when `initialFiles` is non-empty and `hasImageSource`, otherwise `"url"`
- [x] 2.2 Initialise `pendingEntityUploadFilesRef` to `initialFiles` under the same condition, otherwise `null`
- [x] 2.3 Remove the per-render `initialFiles` effect, including the base64 `handleFileDrop(initialFiles)` calls

## 3. Robust hand-off to the entity uploader

- [x] 3.1 Make `handOffFilesToEntityUploader` return `true` only when it found the file input and dispatched `change`
- [x] 3.2 In the hand-off effect, clear pending files only after a successful hand-off
- [x] 3.3 When the input is missing, observe `.image-dialog-entity` with a `MutationObserver` and retry on mutation; disconnect after success and in the effect cleanup

## 4. Unit tests (`src/components/toolbars/components/__tests__/ImageDialog.spec.tsx`)

- [x] 4.1 With `initialFiles` and an image source: Media Library tab is active and the uploader input receives exactly one `change`
- [x] 4.2 After a drop, clicking the URL tab keeps the URL tab active and fires no further `change`
- [x] 4.3 Switching URL → Media Library after a drop fires no further `change`
- [x] 4.4 Typing in Alt text then switching tabs fires no further `change`
- [x] 4.5 Uploader input rendered after the dialog: the files are handed off once it appears
- [x] 4.6 With `initialFiles` and no image source: URL tab active, URL field empty, file not read
- [x] 4.7 Run `pnpm run test` in the package and confirm existing image dialog and paste/drop tests still pass

## 5. Changelog

- [x] 5.1 Update the existing `[Unreleased]` drag & drop entry in `CHANGELOG.md`: inserted directly when default upload is on; when it is off, the image dialog opens and hands the files to the configured media library's upload widget

## 6. Toolbar follow-ups

- [x] 6.1 Move the `IMAGE_REQUEST_EVENT` listener in `Toolbar.tsx` above the `!editor` early return (`react-hooks/rules-of-hooks`)
- [x] 6.2 Clear pending dropped files in `handleDropdownToggle`, so reopening the dialog from the toolbar does not re-upload them
- [x] 6.3 Key the image dialog on a per-request id so a drop while the dialog is open remounts it with the new files
- [x] 6.4 RichText-level tests for 6.2 and 6.3
