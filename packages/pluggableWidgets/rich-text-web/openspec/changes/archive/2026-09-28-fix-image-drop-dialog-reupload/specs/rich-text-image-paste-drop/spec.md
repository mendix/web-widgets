## MODIFIED Requirements

### Requirement: Image drop and paste are gated on default upload and edit state

Image drop and paste SHALL be available for the base64 insertion path only when default upload is effectively enabled and the editor is editable. Default upload SHALL be treated as effectively enabled when `enableDefaultUpload` is `true`, or when no image source is configured — Studio Pro hides the `enableDefaultUpload` property without an image source, so a stored `false` in that case is stale and SHALL be ignored. When default upload is not effectively enabled (`enableDefaultUpload` is `false` and an image source is configured) and the editor is editable, dropped or pasted image files SHALL be accepted and handed to the image dialog so it can forward them to entity upload instead of base64 insertion. When the editor is read-only, image file drop or paste SHALL insert nothing and SHALL NOT show an error message. In every case where an image file drop is detected — including the read-only case — the browser's default handling SHALL be suppressed, so dropping a file can never navigate the page away or discard unsaved form data.

#### Scenario: Stale default-upload value without an image source

- **WHEN** `enableDefaultUpload` is `false`, no image source is configured, and the user drops a valid image file onto the editor
- **THEN** the image is inserted inline as a base64 image at the drop position
- **AND** the image dialog is not opened

#### Scenario: Paste with stale default-upload value without an image source

- **WHEN** `enableDefaultUpload` is `false`, no image source is configured, and the user pastes an image file
- **THEN** the image is inserted inline as a base64 image at the selection

#### Scenario: Default upload disabled with an image source

- **WHEN** `enableDefaultUpload` is `false`, an image source is configured, and the user drops a valid image file onto the editor
- **THEN** nothing is inserted inline
- **AND** the image dialog opens with the dropped file
- **AND** the browser does not navigate away from the page

#### Scenario: Read-only editor

- **WHEN** the editor is read-only and the user drops a valid image file onto it
- **THEN** nothing is inserted
- **AND** the browser does not navigate away from the page
