## Context

API from WTF-2690, confirmed by the sample widget `mendix.MyWidget.mpk`:

```ts
type CreatableListValue = ListValue & {
    readonly canCreate: "available" | "unavailable";
    readonly createdItems: ObjectItem[];
    create(): Promise<ObjectItem>;
};
```

The sample proves `create()`, `canCreate`, `createdItems`, linked attributes on a created item (`attr.get(item).setTextValue()`), and linked widgets on a created item. It saves through a separate widget slot ("a button to save all created objects"), which points to Save changes committing created items. It has no file content API. The installed `mendix` typings (11.12) do not have these members.

## Goals / Non-Goals

**Goals:** create file objects without a nanoflow or a parent; upload once the app commits the objects; keep the widget small.

**Non-Goals:** images, existing files, retry, custom buttons, success and failure actions, 2.x compatibility.

## Decisions

### 1. One datasource, no parent

`files` is a list datasource with `allowCreate="true"`. `create()` creates an object of the datasource entity. Over an association, the platform also sets the association. Over a database datasource, the object is linked to nothing: the widget's job is to upload, and linking is the app's job.

### 2. Flow per file

1. The user drops or selects files. Each file is validated (format, size, count) as before.
2. For each accepted file: `files.create()`. The file shows "Ready to upload". If `create()` fails, it shows the generic failure.
3. The user clicks the Upload button of a file (decision 3a). Before 3a, the app committed the objects with a Save changes button in an "Action widgets" slot; that slot is removed.
4. The widget notices the commit (decision 3) and uploads each committed file's content into its object, one after the other, with `mx.data.saveDocument`.
5. Each file shows "Uploaded successfully" or the generic failure. Then the On upload (per file) event runs for each uploaded file, and On upload runs once.

### 3. Detecting the commit through `createdItems` (removed)

Removed after Windows testing: uploads now start from the per-file Upload button (3a). Kept for history:

The widget can't call or observe the Save changes button. A committed object is no longer in `createdItems`, so on every props update the widget compares its pending files with `createdItems`. A file counts as committed when its object was listed in `createdItems` on an earlier props update and is missing now. The "seen first" rule is needed because the props right after `create()` resolves may not list the new object yet. Not verified on 11.17: that `createdItems` drops committed objects. Earlier versions of this change ran a widget-owned `uploadAction` from an Upload button and waited for `isExecuting`; that was replaced after Windows testing.

### 3a. Per-file Upload button (current)

Windows testing showed that `mx.data.saveDocument` accepts an uncommitted object from `create()`, stores the content and commits the object. Detecting a Save changes through `createdItems` did not work. So each pending file now has an Upload button next to its remove button: it calls `saveDocument` for that file (`FileUploaderStore.uploadFile`). Uploads run one after the other; files clicked during an upload are queued. `UPLOAD_ON_CREATE` in `src/utils/flags.ts` (off) uploads right after `create()` instead. The action widgets slot and the `createdItems` detection are removed.

### 4. Events

The "Events" group holds three optional actions:

- `uploadAction` ("On upload"): runs once after a batch of contents has been uploaded.
- `uploadItemAction` ("On upload (per file)", linked to `files`): runs with the file object after its content was uploaded. Not run for a file whose upload failed.
- `removeAction` ("On remove", linked to `files`): see decision 6.

The editor warns when On remove is not set.

### 5. List shows session files only

The widget keeps its own `FileStore` per added file, holding the `File` blob and the created `ObjectItem`. Name, size and icon come from the blob, so no attribute properties are needed and no `mx.data.get` either. `files.items` is never read. The datasource is used only for `create()` and `canCreate`.

### 6. Remove before upload

Every pending file has a remove button. Windows testing showed that a linked action set to Delete object on a created item works, and that a later Save changes does not commit the removed object.

- With `removeAction` set: the button runs `removeAction.get(item)`, waits for `isExecuting` true then false (`ActionRunner`, `removeActionTimeout` seconds), then removes the file from the list. On failure the file stays pending. One remove at a time.
- Without it: the file is only removed from the list. Its object stays on the page, and a later Save changes commits it without contents. The editor warns to set On remove to Delete object.

Files that failed validation, or were over the limit, have no object and are dismissed from the list directly.

`ActionRunner.run()` takes a getter, and `update()` re-reads it on every props update, because a linked action's value per item is new on every props update.

### 7. Commit succeeds, content upload fails

Not handled. The object stays committed without contents. A TODO in `FileStore.uploadContent` marks the spot.

### 8. Typings shim

`src/utils/creatableListValue.ts` holds `CreatableListValue`, `isCreatable()` and `canCreate()` until the `mendix` typings ship them.

## Risks / Trade-offs

- [`isExecuting` not observed] If both prop changes arrive in one render, the On remove wait times out. → Verify on Windows.
- [`saveDocument` on a created object] It is not verified that a committed object from `create()` accepts content through `saveDocument`. → Verify on Windows.
- [`@beta` API] The API may change. → The shim keeps it in one file.

## Open Questions

- What does 3.0 do with the module package and Marketplace app 235351?
- Does WTF-2690 get a list-linked `type="file" allowUpload="true"` property? That would remove `saveDocument` and make the widget strict-mode safe.
