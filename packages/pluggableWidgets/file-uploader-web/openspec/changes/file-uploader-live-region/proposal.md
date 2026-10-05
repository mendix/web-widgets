## Why

The File Uploader has no live region, so screen reader users are not told when an upload succeeds, fails, is rejected, or when a file is removed (WCAG 4.1.3 Status Messages, WC-3543). At the same time, the **File removal success** property (`removeSuccessMessage`) became dead text in 2.5.0: the normal remove flow never reaches the `"removedFile"` status that renders it, so customers configure and translate a string that never appears (WC-3544). Repurposing that property as the removal announcement fixes both with one change and keeps existing translations working.

## What Changes

- Add a single, visually hidden, polite live region (`role="status"`, `aria-live="polite"`, `aria-atomic="true"`) rendered once per widget in `FileUploaderRoot`.
- Feed it from one observable announcement on `FileUploaderStore`, replaced per event. No per-entry live regions.
- Announce these events using the existing configured text properties:
    - upload success → `uploadSuccessMessage`
    - upload failure → `uploadFailureGenericMessage`
    - file rejected because the file limit is reached → `uploadLimitReachedMessage`
    - file removed (default remove button or custom action that deletes the object) → `removeSuccessMessage`
- Do not announce per-percent progress, queued files, added files, or "N of M" totals.
- Repurpose `removeSuccessMessage`: it is now announced on removal and no longer rendered visually. Update its XML description accordingly.
- Remove the `"removedFile"` file status. A failed upload whose object disappears from the data source keeps showing its upload failure message instead of "Removed successfully." in error red.
- Add changelog entries for the accessibility fix and the new meaning of **File removal success**.

## Capabilities

### New Capabilities

- `file-uploader-status-announcements`: how the File Uploader announces upload, rejection, and removal outcomes to assistive technology through a single live region, and which configured text is used for each.

### Modified Capabilities

<!-- none: file-uploader-action-buttons requirements are unchanged -->

## Impact

- `src/stores/FileUploaderStore.ts`: new observable announcement state and `announce()` action; rejection announcement in `processDrop`.
- `src/stores/FileStore.ts`: announce on upload success/failure, removal, and removal via data source; drop `"removedFile"` status.
- `src/components/FileUploaderRoot.tsx`: render the live region.
- `src/components/UploadInfo.tsx`, `src/components/FileEntry.tsx`: drop `"removedFile"` rendering and `removed` class.
- `src/ui/FileUploader.scss`: drop `.removed` styling if unused.
- `src/FileUploader.xml`: description for `removeSuccessMessage`. No property keys added or removed, so no typings change and no Studio Pro migration.
- Unit tests in `src/stores/__tests__/` and `src/components/__tests__/`. E2E coverage is deferred: this package has no E2E setup yet.
- `CHANGELOG.md`: Fixed + Changed entries. No new dependencies.
