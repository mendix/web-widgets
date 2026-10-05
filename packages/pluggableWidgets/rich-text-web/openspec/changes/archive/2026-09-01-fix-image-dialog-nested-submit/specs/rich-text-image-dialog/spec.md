## ADDED Requirements

### Requirement: Image insertion is triggered only by the dialog's own controls

The Rich Text image dialog SHALL insert an image only in response to its own Insert control, or to Enter pressed in one of the dialog's own single-line inputs (Image URL, Alt text, Title, Width, Height). No element rendered inside the dialog by app-developer-configured content (`imageSourceContent`) or by the upload dropzone SHALL be able to trigger image insertion or dismiss the dialog. The dialog SHALL NOT expose a form owner to its descendants, so that a descendant `<button>` without an explicit `type` cannot cause implicit form submission of the dialog.

#### Scenario: Untyped button inside embedded image-source content

- **WHEN** the Media Library tab is active and the embedded `imageSourceContent` renders a `<button>` with no `type` attribute, and the user clicks it
- **THEN** no image is inserted into the editor
- **AND** the dialog stays open

#### Scenario: Repeated clicks inside embedded image-source content

- **WHEN** the user clicks a button inside the embedded `imageSourceContent` a second time after an `imageSelected` event has set the image source
- **THEN** no image is inserted into the editor
- **AND** the dialog stays open

#### Scenario: Insert button inserts the image

- **WHEN** an image source is set and the user activates the Insert button
- **THEN** the image is inserted with the configured attributes
- **AND** the dialog closes

#### Scenario: Enter in a dialog input inserts the image

- **WHEN** an image source is set and the user presses Enter in the Image URL, Alt text, Title, Width, or Height input
- **THEN** the image is inserted with the configured attributes
- **AND** the dialog closes

#### Scenario: Enter inside embedded image-source content does not insert

- **WHEN** the Media Library tab is active and the user presses Enter while focus is inside the embedded `imageSourceContent`
- **THEN** no image is inserted into the editor
- **AND** the dialog stays open

#### Scenario: Insert is a no-op without an image source

- **WHEN** no image source is set and the user presses Enter in one of the dialog's inputs
- **THEN** no image is inserted into the editor
- **AND** the dialog stays open

### Requirement: Entity image selection listener reads current dialog state

The image dialog's `imageSelected` listener SHALL NOT depend on state captured from an earlier render. Selecting an entity image SHALL set the image source, record the selected entity image, and activate the Media Library tab, regardless of which tab was active when the listener was registered.

#### Scenario: Entity image selected after tab switching

- **WHEN** the user switches tabs and then an `imageSelected` event is dispatched on the dialog element
- **THEN** the image source and selected entity image are set from the event detail
- **AND** the Media Library tab is the active tab
