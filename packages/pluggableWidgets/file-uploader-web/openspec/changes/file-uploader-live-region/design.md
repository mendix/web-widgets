## Context

All File Uploader feedback is visual only: status text in `UploadInfo`, the dropzone status/warning message, and entries appearing or disappearing. There is no `aria-live`, `role="status"` or `aria-atomic` anywhere in `src/` (WC-3543).

The file list is rendered from `FileUploaderStore.sortedFiles`, which reorders entries (validation errors and rejections sink to the bottom), and `dismissFile` splices entries out. Per-entry live regions would double-announce on reorder and race on unmount, so the ticket asks for one region fed from the root store.

`removeSuccessMessage` is only rendered for the `"removedFile"` status, which `FileStore.markMissing()` sets only when the previous status was `"uploadingError"`. The default remove flow (`FileStore.remove()` → `removeObject` → `dismissFile`) never sets it, and custom-button removals end in `"missing"`, which renders nothing (WC-3544). When it did render, it used `upload-status error` (red).

`TranslationsStore.updateProps()` reads every prop whose key ends in `Message`; all texts used here already exist, so no new props are needed.

## Goals / Non-Goals

**Goals:**

- One polite, atomic, visually hidden live region per widget instance.
- Announce upload success, upload failure, file-limit rejection, and removal using existing configured text properties.
- Give `removeSuccessMessage` a real job (removal announcement) and stop rendering it visually.
- Unit-test the region content per event.

**Non-Goals:**

- E2E coverage. This package has no `e2e/` setup or test project page yet; deferred to a follow-up.
- Announcing progress, queued/added files, or "N of M files" totals.
- Announcing validation errors (wrong type / too large). They keep their existing visual behaviour; can be added later with the same mechanism.
- Restoring the 2.4.2 greyed-out removed row or a transient visual removal message.
- New XML properties, renames, or deprecations.

## Decisions

### 1. Announcement state lives on `FileUploaderStore`

Add an observable `announcement: { text: string; seq: number }` and an `announce(key, ...substitutions)` action that resolves the text through `TranslationsStore`, sets it and increments `seq`. `FileStore` already holds `_rootStore`, so it calls `this._rootStore.announce(...)` at the points where outcomes are known. Texts are resolved through the existing `TranslationsStore` at announce time.

_Alternative:_ a separate `AnnouncementStore`. Rejected: one field and one action do not justify a new store and a new context.

_Alternative:_ derive announcements with a `reaction` on file statuses. Rejected: removal leaves no status to observe (the entry is spliced out), and a reaction cannot tell "object removed" from "list reloaded".

### 2. Repeated identical messages still announce

Screen readers ignore a live region update if its text is unchanged. The region renders `text` plus a trailing non-breaking space when `seq` is odd, so every `announce()` changes the DOM text while the spoken text stays the same.

_Alternative:_ clear the region, then set the text after a timeout. Rejected: adds timers and cleanup for no gain.

### 3. Where each event is announced

| Event                    | Location                                                                                                               | Text                                             |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Upload success           | `FileStore.upload()`, in the `runInAction` that sets `"done"`                                                          | `uploadSuccessMessage`                           |
| Upload failure           | `FileStore.upload()`, both `"uploadingError"` branches                                                                 | `uploadFailureGenericMessage`                    |
| File-limit rejection     | `FileUploaderStore.processDrop()`, once if `capacityExcess.length > 0`                                                 | `uploadLimitReachedMessage` with `maxTotalFiles` |
| Removal (default button) | `FileStore.remove()`, after `removeObject` succeeds, only if the file is still in the list and not already `"missing"` | `removeSuccessMessage`                           |
| Removal (data source)    | `FileStore.markMissing()`, only when previous status was `"existingFile"` or `"done"`                                  | `removeSuccessMessage`                           |

The guard in `remove()` prevents a double announcement if the data source update (→ `markMissing`) lands before the `removeObject` promise resolves. If the promise resolves first, `dismissFile` removes the entry and the later `processMissing` finds nothing, so `markMissing` is never called.

When one drop contains both accepted and over-limit files, the rejection is announced at drop time and later replaced by upload outcomes. This is acceptable: polite regions queue, and the visual rejection row stays.

### 4. Drop the `"removedFile"` status

`markMissing()` now keeps `"uploadingError"` (and clears the object references as today) instead of switching to `"removedFile"`; all other statuses go to `"missing"`. The `"removedFile"` member is removed from `FileStatus`, along with its `UploadInfo` case, the `removed` class in `FileEntry`, the `.removed` / `:not(.removed)` SCSS rules, and its references in `activeCount` and tests. A failed upload keeps saying it failed instead of saying "Removed successfully." in red, which also resolves the wrong-class issue from WC-3544.

_Alternative:_ keep `"removedFile"` and just fix its class. Rejected: the only path to it is a failed upload being cleaned up, and "removed successfully" is the wrong message for that.

### 5. Visually hidden via Atlas `sr-only`

Atlas ships Bootstrap's `.sr-only` (`atlas_core/web/core/_legacy/bootstrap`), already used by `switch-web`. The region uses `className="sr-only"`; no widget-local CSS.

### 6. Region placement

Rendered as the last child of the `.widget-file-uploader` root, outside `.files-list` and outside the dropzone, so it is not affected by list reordering or dropzone disabling. Rendered in read-only mode too, since data-source removals can still happen.

## Risks / Trade-offs

- [Atlas `sr-only` missing in a heavily customised theme] → Region becomes visible as a short text line. Low likelihood; same dependency `switch-web` already has.
- [Many concurrent uploads produce a burst of identical "Uploaded successfully." announcements] → Polite region lets the screen reader coalesce/queue; per-event is what the ticket accepts. "N of M" totals explicitly deferred.
- [`removeSuccessMessage` semantics change from visible text to spoken text] → XML description and changelog explain it; existing translations keep working.
- [No E2E coverage in this change] → Behaviour is covered by unit tests on the store and the rendered region; real screen reader behaviour is verified manually.

## Migration Plan

No property keys change, so existing apps need no update in Studio Pro. Ships as a minor/patch release per the changelog; rollback is reverting the widget version.

## Open Questions

- None blocking. "N of M files" totals deferred per team decision.
