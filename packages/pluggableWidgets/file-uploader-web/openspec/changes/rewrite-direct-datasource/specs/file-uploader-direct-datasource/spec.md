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

### Requirement: Contents are uploaded after the app commits the objects

The widget SHALL NOT render an Upload button. It SHALL render the "Action widgets" below the file list. A pending file SHALL count as committed when its object was listed in the datasource's `createdItems` and is no longer listed. The widget SHALL then upload the content of each committed file into its object, one after the other.

#### Scenario: Successful upload

- **WHEN** two files are ready and the user clicks a Save changes button in the action widgets
- **AND** both objects leave `createdItems`
- **THEN** the content of both files is uploaded into their objects
- **AND** both files show the "Uploaded successfully" message

#### Scenario: Object not listed yet

- **WHEN** a new object is missing from `createdItems` before it was ever listed there
- **THEN** the file stays ready to upload

#### Scenario: Content upload fails

- **WHEN** uploading one committed file's content fails
- **THEN** that file shows the generic upload failure message
- **AND** the other files are still uploaded

### Requirement: Each file has an Upload button

Every file that is ready to upload SHALL have an Upload button next to its remove button. Clicking it SHALL upload that file's content into its object with `saveDocument`, which also commits the object. Other files SHALL stay ready to upload.

#### Scenario: Upload one file

- **WHEN** two files are ready and the user clicks Upload on one of them
- **THEN** only that file's content is uploaded and it shows "Uploaded successfully"
- **AND** the other file stays ready to upload

#### Scenario: Upload while another upload runs

- **WHEN** the user clicks Upload on a second file while the first is uploading
- **THEN** the second file is uploaded after the first

### Requirement: Upload events

After the contents of committed files are uploaded, the widget SHALL run "On upload (per file)" with the object of each successfully uploaded file, and SHALL run "On upload" once.

#### Scenario: Events after upload

- **WHEN** two committed files are uploaded successfully
- **THEN** "On upload (per file)" runs for each file object
- **AND** "On upload" runs once

### Requirement: The list shows only files added in this session

The widget SHALL list only the files added since the widget was rendered. It SHALL NOT list existing objects from the datasource.

#### Scenario: Datasource has existing objects

- **WHEN** the datasource already contains file objects
- **THEN** the file list is empty until the user adds files

### Requirement: Files can be removed before upload

Every file that is ready to upload, and every rejected or invalid file, SHALL have a remove button. For a ready file, the widget SHALL run "On remove" with its object when configured, and SHALL remove the file from the list after the action has finished. Without "On remove", it SHALL only remove the file from the list.

#### Scenario: Rejected file

- **WHEN** a file was rejected because of its format
- **THEN** it has a remove button that removes it from the list

#### Scenario: Remove without On remove

- **WHEN** "On remove" is not configured and the user removes a ready file
- **THEN** the file leaves the list

### Requirement: On remove

When "On remove" is configured, removing a ready file SHALL run it with the file's object, and the file SHALL stay in the list until the action has finished.

#### Scenario: Remove a ready file

- **WHEN** "On remove" is configured and the user removes a ready file
- **THEN** the action runs with the file's object and the file leaves the list after the action has finished

#### Scenario: Remove fails

- **WHEN** the remove action does not finish within the timeout
- **THEN** the file stays in the list, ready to upload
