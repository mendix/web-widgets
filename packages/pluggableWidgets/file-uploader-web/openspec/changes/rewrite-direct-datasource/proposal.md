## Why

File Uploader 2.x stores uploads in objects that are linked to a parent through an association datasource (`FileUploadContext` → `UploadedFile` / `UploadedImage`). The association exists only because the widget could not create objects itself: a nanoflow (`ACT_CreateUploadedFileDocument`) had to create the object, link it to the parent and commit it, and the widget then guessed which new datasource item belonged to which upload.

Studio Pro 11.17 adds object creation to the Pluggable Widgets API (WTF-2690, `@beta`): a list datasource with `allowCreate="true"` exposes `canCreate`, `createdItems` and `create()`. The widget can now create the file object directly from any list datasource, so the parent link, the context entity, the module and the create nanoflows are no longer needed.

This change is a proof of concept for File Uploader 3.0: a rewrite around a direct datasource, for files only.

## What Changes

Package: `packages/pluggableWidgets/file-uploader-web`

- **BREAKING** New property set. Removed: `uploadMode`, `associatedFiles`, `associatedImages`, `readOnlyMode`, `createFileAction`, `createImageAction`, `maxFilesPerBatch`, `objectCreationTimeout`, `onUploadSuccess*`, `onUploadFailure*`, `enableCustomButtons`, `customButtons`, and the download, retry and removal texts.
- New `files` datasource (`isList="true" allowCreate="true"`). Any list datasource of a `System.FileDocument` specialization: database, XPath, microflow, nanoflow or association.
- Each file the user adds creates one uncommitted object with `files.create()`. Nothing is committed or uploaded yet.
- Each file has an Upload button next to its remove button. It uploads that file's content with `saveDocument`, which also commits the object.
- "Events" group: On upload (once after uploads), On upload (per file) and On remove, the last two linked to `files`. Ready files can be removed; with On remove set to Delete object, the object is not committed.
- The widget lists only the files added in the current session. Showing existing files is left to the app (for example a Gallery or Data Grid 2 on the same entity).
- Kept: allowed file formats, maximum file size, maximum number of files, the dropzone and the status announcements.
- `src/utils/mx-data.ts` keeps only `saveFile` (`mx.data.saveDocument`). Reading objects, document URLs, thumbnails and removal are gone with the features that needed them.
- `marketplace.minimumMXVersion` becomes `11.17.0`.

Out of this package:

- The File Uploader module (`packages/modules/file-uploader`) is not part of 3.0, which ships as a widget only. Deciding what happens to the module package and Marketplace app 235351 is a release task, not part of this PoC.

## Capabilities

### New Capabilities

- `file-uploader-direct-datasource`: adding files, creating their objects, removing them, and uploading them after the app commits.

### Modified Capabilities

None. The existing `file-uploader-action-buttons` and `file-uploader-status-announcements` specs describe 2.x behavior; they are updated when the rewrite leaves PoC state.

## Impact

**User-facing changes**:

- Requires Studio Pro 11.17 or later.
- Files are uploaded after the app commits them (with each file's Upload button), no longer on drop.
- App developers configure a datasource on their own `System.FileDocument` specialization and set "On remove" to Delete object. Users need create access on that entity.
- Images, read-only mode, download, retry, custom buttons and the upload success and failure actions are not available in the PoC.

**Non-goals (PoC)**:

- Image uploads (`System.Image`), thumbnails.
- Handling a successful commit followed by a failed content upload (left as a TODO in the code).
- Replacing `mx.data.saveDocument`. The sample widget for WTF-2690 has no file content API.
- Migration from 2.x.

**Testing scope**: unit tests with a mocked creatable `ListValue`; manual verification in Studio Pro 11.17 on Windows.

**Related**: WTF-2690, sample widget `SampleProject/mendix.MyWidget.mpk`, superseded change `use-datasource-create-api` (stashed, never merged).
