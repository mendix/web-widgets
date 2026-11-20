## 1. Configuration

- [x] 1.1 `src/FileUploader.xml`: new property set (`files` with `allowCreate`, `uploadAction`, formats, limits, texts, `uploadActionTimeout`)
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

- [x] 3.1 `FileUploaderRoot`: Upload button (`btn btn-primary`), dropzone disabled while uploading
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
- [ ] 5.3 Save changes commits created items
- [ ] 5.4 `isExecuting` transitions reach the widget (no timeout)
- [ ] 5.5 User without create access: message shown
- [ ] 5.6 Formats, size and count limits

## 7. Experimental linked actions

- [x] 7.1 XML: `uploadItemAction` and `removeAction` linked to `files`, Experimental group; regenerate typings
- [x] 7.2 `ActionRunner` takes an action getter so linked values are re-read on every props update
- [x] 7.3 Store: per-file upload, `canRemove`, `removeFile`; `removing` status
- [x] 7.4 `FileEntry` remove button for pending files; editor warning when both upload actions are set
- [x] 7.5 Unit tests
- [ ] 7.6 Windows: `get(createdItem)` works and the per-file action receives the new object
- [ ] 7.7 Windows: nanoflow committing `$currentObject` as On upload (per file); contents uploaded
- [ ] 7.8 Windows: "Delete object" (or a nanoflow) as On remove on an uncommitted object; not committed by a later Save changes

## 6. Documentation

- [x] 6.1 `CHANGELOG.md`: breaking change entries under Unreleased
- [ ] 6.2 Docs page (after PoC)
