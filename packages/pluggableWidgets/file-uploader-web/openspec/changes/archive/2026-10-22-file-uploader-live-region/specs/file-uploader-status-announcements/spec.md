## ADDED Requirements

### Requirement: Single polite live region

The File Uploader SHALL render exactly one live region per widget instance, as an element with `role="status"`, `aria-live="polite"` and `aria-atomic="true"`. The region SHALL be visually hidden but exposed to assistive technology. The region SHALL be present in the DOM from the first render, including before any file is added, and SHALL be rendered in read-only mode as well. File entries SHALL NOT declare their own `aria-live` regions.

#### Scenario: Region present on initial render

- **WHEN** the File Uploader is rendered with no files
- **THEN** exactly one element with `role="status"` exists inside the widget
- **AND** it has `aria-live="polite"` and `aria-atomic="true"`
- **AND** its text content is empty

#### Scenario: No per-entry live regions

- **WHEN** the file list contains several entries in any status
- **THEN** no file entry or descendant of a file entry has an `aria-live` attribute

### Requirement: Upload success is announced

When a file finishes uploading successfully, the live region SHALL contain the configured **Uploading success** text (`uploadSuccessMessage`).

#### Scenario: Single successful upload

- **WHEN** the user adds a file and its upload completes successfully
- **THEN** the live region text equals the configured `uploadSuccessMessage` value

### Requirement: Upload failure is announced

When a file upload fails (object creation fails or file content cannot be saved), the live region SHALL contain the configured **Uploading unknown error** text (`uploadFailureGenericMessage`).

#### Scenario: Upload content save fails

- **WHEN** the user adds a file and saving its content fails
- **THEN** the live region text equals the configured `uploadFailureGenericMessage` value

#### Scenario: Object creation fails

- **WHEN** the user adds a file and the create-object action fails or times out
- **THEN** the live region text equals the configured `uploadFailureGenericMessage` value

### Requirement: Rejection due to file limit is announced

When one or more dropped files are rejected because the maximum file count is reached, the live region SHALL contain the configured **File limit reached** text (`uploadLimitReachedMessage`) with the maximum file count substituted. The announcement SHALL be made once per drop, regardless of how many files were rejected in that drop.

#### Scenario: Drop exceeds the file limit

- **WHEN** the maximum file count is 2, one file is already active, and the user drops 3 files
- **THEN** the live region text equals `uploadLimitReachedMessage` with `###` replaced by `2`

#### Scenario: Drop within the limit

- **WHEN** the user drops files that all fit within the file limit
- **THEN** no rejection announcement is made

### Requirement: File removal is announced using File removal success

When a file entry is removed from the list because its object was removed, the live region SHALL contain the configured **File removal success** text (`removeSuccessMessage`). This SHALL apply both to removal through the default remove button and to removal of an uploaded or existing file's object by any other means that makes it disappear from the data source (for example a custom button action that deletes the object). The `removeSuccessMessage` text SHALL NOT be rendered visually in the file list.

#### Scenario: Remove with default remove button

- **WHEN** the user removes an uploaded file with the default remove button and the removal succeeds
- **THEN** the entry disappears from the file list
- **AND** the live region text equals the configured `removeSuccessMessage` value

#### Scenario: Object removed through the data source

- **WHEN** an uploaded or existing file's object disappears from the data source
- **THEN** the entry disappears from the file list
- **AND** the live region text equals the configured `removeSuccessMessage` value

#### Scenario: Removal fails

- **WHEN** the user clicks the default remove button and the object cannot be removed
- **THEN** the entry stays in the list
- **AND** no removal announcement is made

#### Scenario: Removal text is not shown visually

- **WHEN** any file in the list is in any status
- **THEN** the configured `removeSuccessMessage` text does not appear in the visible file list

### Requirement: Failed upload stays a failure after its object disappears

When a file whose upload failed has its object disappear from the data source, the file entry SHALL keep displaying the upload failure message and SHALL NOT switch to a removal message.

#### Scenario: Failed upload object is cleaned up

- **WHEN** a file is in the upload-failed state and its object disappears from the data source
- **THEN** the entry still shows the configured `uploadFailureGenericMessage`
- **AND** no removal announcement is made

### Requirement: Announcements are events, not progress

The live region SHALL be updated only for the events listed in this capability. Upload progress, queuing, adding files to the list, and file count totals SHALL NOT be announced. Each event SHALL replace the previous announcement, and a repeated event with the same text SHALL still be announced again.

#### Scenario: Progress is not announced

- **WHEN** a file is queued and then uploading
- **THEN** the live region text does not change

#### Scenario: Same message twice in a row

- **WHEN** two files finish uploading successfully one after the other
- **THEN** the live region content changes on each completion so assistive technology announces both
