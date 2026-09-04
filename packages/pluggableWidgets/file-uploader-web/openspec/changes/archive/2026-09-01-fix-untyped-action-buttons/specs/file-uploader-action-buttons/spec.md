## ADDED Requirements

### Requirement: Widget buttons do not submit enclosing forms

Every `<button>` element rendered by the File Uploader widget SHALL declare `type="button"`. Activating a file action button or the retry button SHALL run only that button's own action and SHALL NOT cause submission of any enclosing `<form>`, regardless of where in a page or in another widget's content slot the File Uploader is placed.

#### Scenario: File action button inside a form

- **WHEN** the File Uploader is rendered inside a `<form>` and the user clicks a file's action button
- **THEN** the button's configured action is executed
- **AND** the enclosing form is not submitted

#### Scenario: Retry button inside a form

- **WHEN** an upload has failed, the File Uploader is rendered inside a `<form>`, and the user clicks the retry button
- **THEN** the upload is retried
- **AND** the enclosing form is not submitted

#### Scenario: Repeated activation inside a form

- **WHEN** the user clicks a file's action button several times in succession while inside a `<form>`
- **THEN** the enclosing form is not submitted at any point

### Requirement: Action buttons rely on the native button role

File Uploader buttons SHALL be native `<button>` elements and SHALL NOT declare a redundant `role="button"` attribute. The exposed accessibility role SHALL remain `button`.

#### Scenario: Action button role

- **WHEN** a file action button is rendered
- **THEN** it is a native `<button>` element with no explicit `role` attribute
- **AND** it is discoverable by its `button` role
