## ADDED Requirements

### Requirement: Added files create objects on the datasource

For each accepted file, the widget SHALL create one object by calling `create()` on the `files` datasource, which SHALL declare `allowCreate="true"`. The widget SHALL NOT commit the object or upload its content when the file is added.

#### Scenario: Two files added

- **WHEN** the user adds two accepted files
- **THEN** `create()` is called twice
- **AND** both files show the "Ready to upload" message

#### Scenario: Creation fails

- **WHEN** `create()` rejects for a file
- **THEN** that file shows the generic upload failure message

### Requirement: Adding files requires create access

The widget SHALL accept files only when the `files` datasource reports `canCreate === "available"`. Otherwise it SHALL show the "File creation is not available" message and SHALL NOT call `create()`.

#### Scenario: User without create access

- **WHEN** the datasource reports `canCreate === "unavailable"` and the user adds a file
- **THEN** the "File creation is not available" message is shown
- **AND** no file is added to the list

### Requirement: Upload button commits, then uploads

The widget SHALL show an Upload button. The button SHALL be enabled only when at least one file is ready to upload, no file is still being created, no upload is in progress, and `uploadAction` can execute. Clicking it SHALL run `uploadAction` once, SHALL wait until the action has finished, and SHALL then upload each ready file's content into its object.

#### Scenario: Successful upload

- **WHEN** two files are ready and the user clicks Upload
- **AND** the upload action starts executing and then finishes
- **THEN** the content of both files is uploaded into their objects
- **AND** both files show the "Uploaded successfully" message

#### Scenario: Upload action does not finish in time

- **WHEN** the upload action has not finished within `uploadActionTimeout` seconds
- **THEN** every file being uploaded shows the generic upload failure message
- **AND** no file content is uploaded

#### Scenario: Content upload fails

- **WHEN** the upload action has finished and uploading one file's content fails
- **THEN** that file shows the generic upload failure message
- **AND** the other files are still uploaded

#### Scenario: Nothing ready

- **WHEN** no file is ready to upload
- **THEN** the Upload button is disabled

### Requirement: The list shows only files added in this session

The widget SHALL list only the files added since the widget was rendered. It SHALL NOT list existing objects from the datasource.

#### Scenario: Datasource has existing objects

- **WHEN** the datasource already contains file objects
- **THEN** the file list is empty until the user adds files

### Requirement: Ready files cannot be removed

Unless the experimental On remove action is configured, the widget SHALL NOT offer a remove action for a file that has an object. Files rejected by validation or by the file limit have no object, and SHALL offer a dismiss action.

#### Scenario: Ready file

- **WHEN** a file is ready to upload
- **THEN** it has no remove button

#### Scenario: Rejected file

- **WHEN** a file was rejected because of its format
- **THEN** it has a remove button that removes it from the list

### Requirement: Experimental per-file actions

When "On upload (per file)" is configured, the widget SHALL run it once per pending file, with that file's object, and upload that file's content after its action has finished, instead of running "On upload". When "On remove" is configured, the widget SHALL offer a remove button for pending files that runs the action with the file's object and removes the file from the list after the action has finished.

#### Scenario: Upload per file

- **WHEN** "On upload (per file)" is configured and the user clicks Upload with two ready files
- **THEN** the action runs for the first file's object, its content is uploaded, then the same happens for the second file

#### Scenario: Per-file action fails

- **WHEN** the action can't run for one file
- **THEN** that file shows an error and the other files are still uploaded

#### Scenario: Remove a ready file

- **WHEN** "On remove" is configured and the user clicks remove on a ready file
- **THEN** the action runs with the file's object and the file leaves the list after the action has finished

#### Scenario: Remove fails

- **WHEN** the remove action does not finish within the timeout
- **THEN** the file stays in the list, ready to upload
