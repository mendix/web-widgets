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
