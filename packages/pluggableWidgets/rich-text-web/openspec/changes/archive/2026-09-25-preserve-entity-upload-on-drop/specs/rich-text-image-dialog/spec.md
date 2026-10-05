## ADDED Requirements

### Requirement: Pending files are forwarded to entity upload when available

The Rich Text image dialog SHALL, when opened with `initialFiles` and `hasImageSource` is true, activate the Media Library tab and forward the files to the embedded `imageSourceContent` uploader so the external File Uploader widget handles the upload. The dialog SHALL NOT convert those files to base64 in that case. When `hasImageSource` is false, the dialog SHALL preserve the existing base64 upload behavior for `initialFiles`.

#### Scenario: Entity uploader is available

- **WHEN** the image dialog opens with dropped or pasted files and an image source is configured
- **THEN** the Media Library tab becomes active
- **AND** the files are handed to the embedded uploader
- **AND** the dialog does not convert them to base64

#### Scenario: No entity uploader is configured

- **WHEN** the image dialog opens with `initialFiles` and no image source is configured
- **THEN** the dialog preserves the base64 upload path for the files
