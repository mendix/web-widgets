# rich-text-image-dialog Specification

## Purpose

TBD - created by archiving change rich-text-image-dialog-tab-visibility. Update Purpose after archive.

## Requirements

### Requirement: Image dialog tabs reflect widget configuration

The Rich Text image dialog SHALL render only the image source tabs that are available for the current widget configuration. The URL tab SHALL always be rendered. The Upload tab SHALL be rendered only when `enableDefaultUpload` is `true`. The Entity ("Media Library") tab SHALL be rendered only when an image data source is configured (`imageSource` is not null or undefined). Hidden tabs SHALL NOT be rendered in the DOM (not merely disabled).

#### Scenario: No image data source configured

- **WHEN** the image dialog is opened and `imageSource` is null or undefined
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

- **WHEN** the image dialog is opened in any configuration
- **THEN** the URL tab is rendered and is the initially active tab

### Requirement: Image dialog configuration delivered via editor context

The image dialog configuration (image source content, default-upload flag, and whether an image data source is present) SHALL be provided to the image dialog through the shared editor context rather than passed as props through intermediate toolbar components.

#### Scenario: Dialog reads configuration from context

- **WHEN** the image dialog renders
- **THEN** it obtains image source content, the default-upload flag, and the has-image-source flag from the editor context
- **AND** intermediate toolbar components do not forward these values as props

### Requirement: Image dialog supports initial dimensions and aspect-ratio toggle

The Rich Text image dialog SHALL provide a Width input, a Height input, and a "Maintain aspect ratio" checkbox that let the user set an image's initial dimensions at insert time. The checkbox SHALL default to checked. While the checkbox is checked, the Height input SHALL be disabled and only the width SHALL be applied to the inserted image (height left unset so the browser derives it proportionally). While the checkbox is unchecked, both Width and Height SHALL be applied as entered. Width and Height are optional; only filled, positive-numeric values SHALL be applied, and each applied value SHALL be expressed as a pixel string (e.g., `300` becomes `300px`). Empty or non-positive/non-numeric values SHALL be omitted, preserving the image's natural size. Toggling the checkbox SHALL NOT clear a previously entered Height value.

#### Scenario: Insert with width and maintained aspect ratio

- **WHEN** the user enters a Width of `300`, leaves "Maintain aspect ratio" checked, and inserts the image
- **THEN** the inserted image is given a `width` of `300px`
- **AND** no `height` attribute is applied

#### Scenario: Height input disabled while ratio maintained

- **WHEN** the image dialog is open and "Maintain aspect ratio" is checked
- **THEN** the Height input is disabled

#### Scenario: Insert with explicit width and height

- **WHEN** the user unchecks "Maintain aspect ratio", enters a Width of `300` and a Height of `200`, and inserts the image
- **THEN** the inserted image is given a `width` of `300px` and a `height` of `200px`

#### Scenario: Empty dimensions preserve natural size

- **WHEN** the user leaves both Width and Height empty and inserts the image
- **THEN** neither `width` nor `height` is applied to the inserted image

#### Scenario: Invalid dimension values are ignored

- **WHEN** the user enters a non-positive or non-numeric Width
- **THEN** no `width` attribute is applied to the inserted image

#### Scenario: Toggling ratio preserves entered height

- **WHEN** the user has entered a Height value with "Maintain aspect ratio" unchecked, then checks the box, then unchecks it again
- **THEN** the previously entered Height value is still present in the Height input

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
