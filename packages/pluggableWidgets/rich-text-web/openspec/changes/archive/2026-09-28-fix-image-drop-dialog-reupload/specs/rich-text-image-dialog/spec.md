## MODIFIED Requirements

### Requirement: Image dialog tabs reflect widget configuration

The Rich Text image dialog SHALL render only the image source tabs that are available for the current widget configuration. The URL tab SHALL always be rendered. The Upload tab SHALL be rendered only when default upload is effectively enabled — that is, when `enableDefaultUpload` is `true` or no image data source is configured. The Entity ("Media Library") tab SHALL be rendered only when an image data source is configured (`imageSource` is not null or undefined). Hidden tabs SHALL NOT be rendered in the DOM (not merely disabled).

#### Scenario: No image data source configured

- **WHEN** the image dialog is opened and `imageSource` is null or undefined
- **THEN** the Entity tab is not rendered
- **AND** the URL and Upload tabs are rendered

#### Scenario: Stale default-upload value without an image data source

- **WHEN** the image dialog is opened, `imageSource` is null or undefined, and `enableDefaultUpload` is `false`
- **THEN** the Entity tab is not rendered
- **AND** the URL and Upload tabs are rendered

#### Scenario: Default upload disabled

- **WHEN** the image dialog is opened, `imageSource` is configured, and `enableDefaultUpload` is `false`
- **THEN** the Upload tab is not rendered
- **AND** the URL and Entity tabs are rendered

#### Scenario: All sources available

- **WHEN** the image dialog is opened, `imageSource` is configured, and `enableDefaultUpload` is `true`
- **THEN** the URL, Upload, and Entity tabs are all rendered

#### Scenario: Default URL tab remains valid

- **WHEN** the image dialog is opened without dropped or pasted files, in any configuration
- **THEN** the URL tab is rendered and is the initially active tab

### Requirement: Pending files are forwarded to entity upload when available

The Rich Text image dialog SHALL, when opened with `initialFiles` and `hasImageSource` is true, activate the Media Library tab and forward the files to the embedded `imageSourceContent` uploader so the external File Uploader widget handles the upload. The dialog SHALL NOT convert those files to base64. The files SHALL be forwarded exactly once per dialog opening: switching tabs, editing dialog fields, or any other re-render SHALL NOT forward them again and SHALL NOT change the active tab. If the uploader's file input is not yet present when the Media Library tab becomes active, the dialog SHALL keep the files pending and forward them once the input appears, rather than discarding them. The dialog SHALL NOT process `initialFiles` when `hasImageSource` is false.

#### Scenario: Entity uploader is available

- **WHEN** the image dialog opens with dropped or pasted files and an image source is configured
- **THEN** the Media Library tab becomes active
- **AND** the files are handed to the embedded uploader once
- **AND** the dialog does not convert them to base64

#### Scenario: Switching to the URL tab after a drop

- **WHEN** the image dialog was opened with dropped files and an image source is configured, and the user clicks the URL tab
- **THEN** the URL tab becomes and stays active
- **AND** the files are not handed to the uploader again

#### Scenario: Returning to the Media Library tab after a drop

- **WHEN** the user switches from the Media Library tab to the URL tab and back to the Media Library tab after a drop
- **THEN** the files are not handed to the uploader again

#### Scenario: Editing dialog fields after a drop

- **WHEN** the user types in the Alt text, Title, Width, or Height field after a drop and then switches tabs
- **THEN** the files are not handed to the uploader again

#### Scenario: Uploader input mounts after the dialog

- **WHEN** the image dialog opens with dropped files and the embedded uploader renders its file input after the Media Library tab is active
- **THEN** the files are handed to the uploader once the input appears

#### Scenario: No entity uploader is configured

- **WHEN** the image dialog opens with `initialFiles` and no image source is configured
- **THEN** the dialog does not read or convert the files
- **AND** the URL tab is active with an empty URL field
