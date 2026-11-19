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

**Goals:** create file objects without a nanoflow or a parent; upload on an explicit button; keep the widget small.

**Non-Goals:** images, existing files, remove, retry, custom buttons, success and failure actions, 2.x compatibility.

## Decisions

### 1. One datasource, no parent

`files` is a list datasource with `allowCreate="true"`. `create()` creates an object of the datasource entity. Over an association, the platform also sets the association. Over a database datasource, the object is linked to nothing: the widget's job is to upload, and linking is the app's job.

### 2. Flow per file

1. The user drops or selects files. Each file is validated (format, size, count) as before.
2. For each accepted file: `files.create()`. The file shows "Ready to upload". If `create()` fails, it shows the generic failure.
3. The user clicks Upload:
    1. All ready files switch to "Uploading".
    2. The widget runs `uploadAction` once and waits until it has finished (decision 3).
    3. The widget uploads each file's content into its object, one after the other, with `mx.data.saveDocument`.
    4. Each file shows "Uploaded successfully" or the generic failure.

### 3. Waiting for the upload action

`ActionValue.execute()` returns `void`. Completion shows up as `isExecuting` on new props. `ActionRunner` starts the action, marks it started when a later prop has `isExecuting === true`, and resolves when a prop after that has `isExecuting === false`. It rejects after `uploadActionTimeout` seconds. If it rejects, every uploading file shows the generic failure and no content is uploaded.

### 4. One action, not linked to the datasource

The easiest option. One Save changes commits all created objects, and the widget needs only one wait. A per-item linked action would mean one commit per file. Widget XML cannot default to Save changes (`defaultType` only allows nanoflows, microflows, pages), so the docs tell app developers to choose it.

### 5. List shows session files only

The widget keeps its own `FileStore` per added file, holding the `File` blob and the created `ObjectItem`. Name, size and icon come from the blob, so no attribute properties are needed and no `mx.data.get` either. `files.items` is never read. The datasource is used only for `create()` and `canCreate`.

### 6. No remove before upload

There is no API to delete or roll back an uncommitted created object. A file hidden from the list would still be committed by Save changes, as an empty document. The PoC offers no remove for ready files. Files that failed validation, or were over the limit, have no object and can still be dismissed.

### 7. Commit succeeds, content upload fails

Not handled. The object stays committed without contents. A TODO in `FileStore.uploadContent` marks the spot.

### 8. Typings shim

`src/utils/creatableListValue.ts` holds `CreatableListValue`, `isCreatable()` and `canCreate()` until the `mendix` typings ship them.

## Risks / Trade-offs

- [Save changes and created items] It is not verified that Save changes commits objects from `createdItems`. → Verify on Windows. Fallback: a nanoflow that commits a list, or a per-item linked action.
- [`isExecuting` not observed] If both prop changes arrive in one render, the wait times out. → Verify on Windows.
- [`saveDocument` on a created object] It is not verified that a committed object from `create()` accepts content through `saveDocument`. → Verify on Windows.
- [`@beta` API] The API may change. → The shim keeps it in one file.

## Open Questions

- What does 3.0 do with the module package and Marketplace app 235351?
- Does WTF-2690 get a list-linked `type="file" allowUpload="true"` property? That would remove `saveDocument` and make the widget strict-mode safe.
