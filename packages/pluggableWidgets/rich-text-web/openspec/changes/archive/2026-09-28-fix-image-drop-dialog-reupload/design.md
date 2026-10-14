## Context

With "Enable default upload" off and an image source configured, the `ImagePasteDrop` plugin dispatches `richtextImageRequest`. `Toolbar` stores the files in `pendingImageDialogFiles` state (stable across renders, cleared on dialog close) and opens the image dialog with them as `initialFiles`.

`ImageDialog` currently handles `initialFiles` in an effect:

```ts
useEffect(() => {
    if (!initialFiles?.length) return;
    if (hasImageSource) {
        pendingEntityUploadFilesRef.current = initialFiles;
        setActiveTab("entity");
        return;
    }
    ...
}, [handleFileDrop, hasImageSource, initialFiles, showUploadTab]);
```

`handleFileDrop` is a plain function recreated every render, so the effect runs on every render. A second effect hands pending files to the uploader whenever `activeTab` becomes `"entity"`.

```
drop ─▶ dialog mounts
          ├─ effect#1: pending=[img], tab=entity
          └─ effect#2: hand-off ─▶ upload #1
click "URL" ─▶ tab=url ─▶ re-render
          ├─ effect#1 again: pending=[img], tab=entity   ← bounce back
          └─ effect#2 (url→entity): hand-off ─▶ upload #2   ← duplicate
```

Separately, `handOffFilesToEntityUploader` returns silently when the uploader's `input[type=file]` is not in the DOM yet, while the caller clears the pending files regardless.

`enableDefaultUpload` is hidden in Studio Pro when `imageSource` is empty (`RichText.editorConfig.ts`), but a hidden property keeps its stored value, so the runtime can receive `enableDefaultUpload=false` with no image source.

## Goals / Non-Goals

**Goals:**

- Dropped/pasted files are handed to the File Uploader exactly once per dialog opening.
- Tab switching after a drop is respected.
- Files are not lost when the uploader renders after the dialog.
- Runtime behaviour matches the Studio Pro configuration: no image source means default upload is on.

**Non-Goals:**

- Changing Studio Pro property visibility or adding `check()` validation.
- Changing behaviour when default upload is on (inline base64 insert).
- Changing the `imageSelected` event contract or the entity image preview.

## Decisions

### D1: Normalise the default-upload flag in `Editor.tsx`

Compute `uploadEnabled = enableDefaultUpload || imageSource == null` once in `Editor` and use it for both `configRef` (read by the `ImagePasteDrop` gate at event time) and `imageConfig.enableDefaultUpload` (read by the dialog). All runtime consumers of the flag already go through these two points.

Alternatives: a Studio Pro `check()` error — noisier and targets a property the developer cannot see; leaving the stale value — the dialog would open with no way to upload the file.

### D2: Initialise from `initialFiles` at mount instead of in an effect

`activeTab` uses a lazy `useState` initializer: `"entity"` when `initialFiles` is non-empty and `hasImageSource` is true, otherwise `"url"`. `pendingEntityUploadFilesRef` is initialised to `initialFiles` under the same condition. The per-render effect is removed; there is no base64 read on the initial-files path.

This is correct because `Toolbar` mounts a fresh `ImageDialog` for each opening and clears `pendingImageDialogFiles` on close, so mount-time state covers every opening.

Alternatives: a "consumed" ref guard inside the existing effect — works but keeps an effect whose dependencies are still unstable; stabilising `handleFileDrop` with `useCallback` — fixes this effect but leaves the "re-arm on any dependency change" shape fragile.

### D3: Hand-off only clears pending files on success, and waits for the input

`handOffFilesToEntityUploader` returns whether it found the input and dispatched `change`. The hand-off effect clears `pendingEntityUploadFilesRef` only on success. If the input is missing, the effect attaches a `MutationObserver` (`childList`, `subtree`) to `.image-dialog-entity` and retries on mutation; it disconnects after a successful hand-off and in its cleanup (tab change, unmount).

Alternatives: polling with `setTimeout` — needs an arbitrary interval and limit; relying on the Mendix widget rendering synchronously — not guaranteed.

## Risks / Trade-offs

- [The File Uploader never renders a file input (misconfigured `imageSourceContent`)] → Files stay pending and are dropped when the dialog closes; the observer is disconnected on cleanup, so nothing leaks. Same user outcome as today, without the silent early clear.
- [The user leaves the Media Library tab before the input appears] → Observer is disconnected on tab change; pending files remain and are handed off if the user returns to the tab. Acceptable: they have not been uploaded yet.
- [Normalising the flag changes behaviour for apps with the stale `false` value] → Those apps previously got a dialog with no way to upload the dropped file; they now get an inline insert, matching what Studio Pro shows. Drop-to-dialog is unreleased, so no released behaviour changes.

## Open Questions

- The main `rich-text-image-paste-drop` spec says dropped files are routed to the dialog whenever an image source is configured, but the plugin inserts inline whenever default upload is on, regardless of image source. This change does not alter that; the spec wording should be reconciled separately.
