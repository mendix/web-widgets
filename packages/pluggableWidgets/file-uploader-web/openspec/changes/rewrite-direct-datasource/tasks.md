## 1. Configuration

- [x] 1.1 `src/FileUploader.xml`: new property set (`files` with `allowCreate`, `uploadAction`, formats, limits, texts, `uploadActionTimeout`; reworked in 8.1)
- [x] 1.2 Regenerate `typings/FileUploaderProps.d.ts`
- [x] 1.3 `src/FileUploader.editorConfig.ts`: drop upload mode, read-only and custom button handling
- [x] 1.4 Remove `nf-defaults.mjs` and its scripts (no default nanoflows any more)
- [x] 1.5 `package.json`: `minimumMXVersion` `11.17.0`

## 2. Stores and utils

- [x] 2.1 `src/utils/creatableListValue.ts`: API shim
- [x] 2.2 `src/utils/ActionRunner.ts`: run an action and wait for `isExecuting` true then false, with timeout
- [x] 2.3 `src/stores/FileStore.ts`: statuses `creating`, `pending`, `uploading`, `done`, `uploadingError`, `validationError`, `rejected`; `uploadContent()` with a TODO for commit-ok/upload-failed
- [x] 2.4 `src/stores/FileUploaderStore.ts`: drop handling, `create()` per file, `upload()`
- [x] 2.5 `src/utils/mx-data.ts`: keep `saveFile` only
- [x] 2.6 Remove `ObjectCreationHelper`, `DatasourceUpdateProcessor`

## 3. Components

- [x] 3.1 `FileUploaderRoot`: Upload button (`btn btn-primary`), dropzone disabled while uploading (Upload button replaced in 8.2)
- [x] 3.2 `FileEntry`: no default action, no thumbnails, dismiss only for rejected and invalid files
- [x] 3.3 `UploadInfo`: `pending` message
- [x] 3.4 Remove `ActionsBar`, `RetryButton`, custom button code in `ActionButton`

## 4. Unit tests

- [x] 4.1 `ActionRunner`, `FileUploaderStore`, `FileStore`, components
- [x] 4.2 Remove specs for deleted code
- [x] 4.3 `pnpm run test` and lint pass

## 5. Manual verification (Studio Pro 11.17, Windows)

- [ ] 5.1 Database datasource on a `System.FileDocument` specialization, On upload = Save changes: files upload, objects have contents
- [ ] 5.2 Association datasource: association set on the new objects
- [x] 5.3 Save changes commits created items
- [ ] 5.4 `isExecuting` transitions reach the widget (no timeout), now for On remove
- [ ] 5.5 User without create access: message shown
- [ ] 5.6 Formats, size and count limits

## 7. Linked actions and events

- [x] 7.1 XML: `uploadItemAction` and `removeAction` linked to `files`; regenerate typings
- [x] 7.2 `ActionRunner` takes an action getter so linked values are re-read on every props update
- [x] 7.3 Store: `canRemove`, `removeFile`; `removing` status
- [x] 7.4 `FileEntry` remove button for pending files
- [x] 7.5 Unit tests
- [x] 7.6 Windows: Delete object as On remove on a created object; not committed by a later Save changes

## 8. App-owned commit

- [x] 8.1 XML: "Events" group (On upload, On upload (per file), On remove); `actions` widgets slot; remove Upload button text; `removeActionTimeout`
- [x] 8.2 Remove the Upload button; render `actions` below the file list; preview drop zone for it
- [x] 8.3 Store: detect commit through `createdItems` (seen, then gone); upload queue; run events after upload
- [x] 8.4 Remove button always shown for pending files; editor warnings for missing On remove and empty action widgets
- [x] 8.5 Unit tests
- [x] 8.6 Windows: Save changes in action widgets did not trigger uploads; replaced by section 9
- [ ] 8.7 Windows: On upload and On upload (per file) run after the upload

## 9. Per-file Upload button

- [x] 9.1 Windows: `saveDocument` on an uncommitted created object stores the content and commits it (test build `UPLOAD_ON_CREATE`)
- [x] 9.2 XML: `uploadButtonTextMessage`; regenerate typings
- [x] 9.3 Store: `canUploadFile`, `uploadFile`; `UPLOAD_ON_CREATE` off
- [x] 9.4 `FileEntry`: Upload button next to the remove button
- [x] 9.5 Unit tests
- [ ] 9.6 Windows: upload single files with the button; events run
- [x] 9.7 Remove the action widgets slot
- [x] 9.8 Remove the `createdItems` detection

## 6. Documentation

- [x] 6.1 `CHANGELOG.md`: breaking change entries under Unreleased
- [ ] 6.2 Docs page (after PoC)
