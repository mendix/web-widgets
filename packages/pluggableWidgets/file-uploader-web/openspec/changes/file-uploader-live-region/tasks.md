## 1. Announcement state

- [x] 1.1 Add observable `announcement: { text: string; seq: number }` and `announce(text)` action to `FileUploaderStore`
- [x] 1.2 Unit test: `announce()` sets text and increments `seq`; initial text is empty

## 2. Live region

- [x] 2.1 Render one `<div role="status" aria-live="polite" aria-atomic="true" className="sr-only">` as last child of the widget root in `FileUploaderRoot`, text = `announcement.text` plus NBSP when `seq` is odd
- [x] 2.2 Unit test: region exists once on initial render with empty text, also in read-only mode; no `aria-live` inside file entries

## 3. Event announcements

- [x] 3.1 `FileStore.upload()`: announce `uploadSuccessMessage` on `"done"`, `uploadFailureGenericMessage` on both `"uploadingError"` branches
- [x] 3.2 `FileUploaderStore.processDrop()`: announce `uploadLimitReachedMessage` (with `maxTotalFiles`) once when `capacityExcess` is non-empty
- [x] 3.3 `FileStore.remove()`: after successful `removeObject`, announce `removeSuccessMessage` only if the file is still in the list and not `"missing"`
- [x] 3.4 `FileStore.markMissing()`: announce `removeSuccessMessage` when previous status was `"existingFile"` or `"done"`
- [x] 3.5 Unit tests per event: success, failure (save fails, creation fails), limit rejection (once per drop, none within limit), default remove, data-source removal, failed remove (no announcement), no double announcement when `markMissing` precedes `remove()` resolving, repeated identical message changes region content, queued/uploading does not change region

## 4. Retire `"removedFile"` status

- [x] 4.1 `markMissing()`: keep `"uploadingError"` status instead of switching to `"removedFile"`; remove `"removedFile"` from `FileStatus` and `activeCount`
- [x] 4.2 Remove `"removedFile"` case from `UploadInfo`, `removed` class from `FileEntry`, and `.removed` / `:not(.removed)` rules in `FileUploader.scss`
- [x] 4.3 Update existing tests referencing `"removedFile"`; add test that a failed upload whose object disappears keeps `"uploadingError"` and shows `uploadFailureGenericMessage`, with no announcement
- [x] 4.4 Unit test: `removeSuccessMessage` text never appears in the visible file list

## 5. XML and changelog

- [x] 5.1 `FileUploader.xml`: set `removeSuccessMessage` description to explain it is announced to screen readers when a file is removed and not shown visually
- [x] 5.2 `CHANGELOG.md` Unreleased → Fixed: screen readers now announce upload success, upload failure, file-limit rejection and file removal
- [x] 5.3 `CHANGELOG.md` Unreleased → Changed: "File removal success" text is now announced to screen reader users on removal instead of being shown in the list; a failed upload keeps its failure message instead of showing "Removed successfully."

## 6. Verify

- [x] 6.1 `pnpm run test` and `pnpm run lint` pass in `packages/pluggableWidgets/file-uploader-web`
