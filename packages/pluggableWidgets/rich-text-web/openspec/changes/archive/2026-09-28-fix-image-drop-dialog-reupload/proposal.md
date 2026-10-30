## Why

When "Enable default upload" is off and an image source is configured, dropping or pasting an image opens the image dialog on the Media Library tab and hands the file to the configured File Uploader widget. Clicking the URL tab afterwards snaps the dialog back to Media Library and uploads the same image a second time. The dialog re-processes its initial files on every re-render, so any interaction can trigger a duplicate upload, and the user cannot switch to the URL tab at all.

## What Changes

- The image dialog consumes dropped/pasted files exactly once, when it opens. Switching tabs, typing in fields, or any other re-render no longer re-activates the Media Library tab or re-uploads the file.
- The hand-off to the embedded File Uploader waits until the uploader's file input is present, instead of silently dropping the files when the uploader renders after the dialog.
- "Enable default upload" is treated as on at runtime whenever no image source is configured. Studio Pro already hides that property without an image source, but a previously stored `false` can remain; the editor no longer honours that stale value. As a result, drop and paste without an image source always insert inline, and the image dialog only ever receives dropped files when an image source is configured.
- The dialog no longer converts dropped files to base64 on the initial-files path.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `rich-text-image-dialog`: pending files are forwarded to entity upload exactly once and survive a late-mounting uploader; tab switching after a drop is respected; the base64 fallback for `initialFiles` without an image source is removed.
- `rich-text-image-paste-drop`: default upload is effectively enabled when no image source is configured, so the "default upload disabled without an image source" case now inserts inline.

## Impact

- `src/components/Editor.tsx`: normalise the effective default-upload flag used by the `ImagePasteDrop` gate and the dialog's editor-context config.
- `src/components/toolbars/components/ImageDialog.tsx`: replace the per-render initial-files effect with mount-time initialisation; make the entity hand-off robust to late mounting.
- Unit tests: `src/components/toolbars/components/__tests__/ImageDialog.spec.tsx`, plus an editor-level test for the normalised flag.
- `CHANGELOG.md`: adjust the existing `[Unreleased]` drag & drop entry (the feature is unreleased, so no separate "Fixed" entry).
- No XML, typings, or dependency changes.
