## ADDED Requirements

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
