# rich-text-image-paste-drop Specification

## Purpose

TBD - created by archiving change add-image-paste-drop. Update Purpose after archive.

## Requirements

### Requirement: Dropped image files are inserted as base64 images

When one or more `image/*` files are dropped onto the Rich Text editor body, each valid file SHALL be inserted into the document as an image node whose `src` is a base64 `data:` URI. Insertion SHALL happen at the document position under the drop coordinates, not at the position of the selection before the drop. When several valid image files are dropped at once, they SHALL be inserted in the order they appear in the drop, at that position. Inserted images SHALL NOT be given `width` or `height` attributes; they keep their natural size and remain resizable afterwards.

#### Scenario: Single image dropped into the editor

- **WHEN** the user drops a valid image file onto the editor body
- **THEN** an image node with a base64 `data:` URI `src` is inserted at the drop position
- **AND** the browser does not navigate away from the page

#### Scenario: Image dropped away from the cursor

- **WHEN** the selection is in the first paragraph and the user drops a valid image over the third paragraph
- **THEN** the image is inserted at the third paragraph, not at the first

#### Scenario: Multiple images dropped at once

- **WHEN** the user drops three valid image files in a single drop
- **THEN** three image nodes are inserted in the same order as the dropped files

#### Scenario: Dropped image keeps its natural size

- **WHEN** a valid image file is dropped
- **THEN** the inserted image node has no `width` or `height` attribute

### Requirement: Pasted image files are inserted as base64 images

When the clipboard contains one or more `image/*` files (for example a screenshot), pasting into the Rich Text editor SHALL insert each valid file as an image node whose `src` is a base64 `data:` URI, at the current selection. The same validation, ordering, and sizing rules as dropped images SHALL apply.

#### Scenario: Screenshot pasted into the editor

- **WHEN** the clipboard holds an image file and the user pastes into the editor
- **THEN** an image node with a base64 `data:` URI `src` is inserted at the selection

#### Scenario: Pasted image replaces the selected range

- **WHEN** a range of text is selected and an image file is pasted
- **THEN** the image is inserted at that range's position

### Requirement: Image drop and paste are gated on default upload and edit state

Image drop and paste SHALL be available only when the `enableDefaultUpload` property is `true` and the editor is editable. When `enableDefaultUpload` is `false`, or the editor is read-only, an image file drop or paste SHALL insert nothing and SHALL NOT show an error message. In every case where an image file drop is detected — including the disabled and read-only cases — the browser's default handling SHALL be suppressed, so dropping a file can never navigate the page away or discard unsaved form data.

#### Scenario: Default upload disabled

- **WHEN** `enableDefaultUpload` is `false` and the user drops a valid image file onto the editor
- **THEN** nothing is inserted
- **AND** no error message is shown
- **AND** the browser does not navigate away from the page

#### Scenario: Read-only editor

- **WHEN** the editor is read-only and the user drops a valid image file onto it
- **THEN** nothing is inserted
- **AND** the browser does not navigate away from the page

#### Scenario: Paste while default upload is disabled

- **WHEN** `enableDefaultUpload` is `false` and the user pastes an image file
- **THEN** nothing is inserted and no error message is shown

### Requirement: Dropped and pasted files use the same validation as the Upload tab

Files arriving by drop or paste SHALL be validated with the same rules and the same maximum file size as the image dialog's Upload tab, from a single shared implementation used by both paths. A file whose size exceeds the maximum SHALL be rejected. A file that is not an image SHALL be rejected. A file that cannot be read SHALL be rejected. Rejected files SHALL NOT be inserted, and valid files in the same drop SHALL still be inserted.

#### Scenario: Oversized image is rejected

- **WHEN** the user drops an image file larger than the maximum file size
- **THEN** nothing is inserted
- **AND** a message stating the file is too large, including the file's size, is shown

#### Scenario: Unreadable file is rejected

- **WHEN** reading a dropped image file fails
- **THEN** nothing is inserted for that file
- **AND** a read-failure message is shown

#### Scenario: Valid and invalid files in one drop

- **WHEN** the user drops one valid image and one oversized image together
- **THEN** the valid image is inserted
- **AND** a rejection message is shown for the oversized one

### Requirement: Non-image drops and pastes are unaffected

A drop or paste that carries no `image/*` file SHALL be left entirely to the editor's default handling. Dragging an image element from another page or browser tab (which arrives as HTML rather than as a file) SHALL keep inserting through the editor's normal HTML handling, and pasted HTML SHALL keep passing through existing paste processing such as Word paste cleanup.

#### Scenario: Non-image file dropped

- **WHEN** the user drops a file that is not an image, such as a PDF
- **THEN** image drop handling does not claim the event

#### Scenario: Image dragged from another browser tab

- **WHEN** the user drags an image element from another tab into the editor
- **THEN** it is inserted by the editor's normal HTML handling, as before this change

#### Scenario: Pasted Word content

- **WHEN** the user pastes HTML content copied from Microsoft Word
- **THEN** the existing Word paste cleanup still applies

### Requirement: Editor shows drop-target and rejection feedback

While a drag carrying files is over the editor, the editor SHALL show a drop-target affordance, and that affordance SHALL be removed when the drag leaves the editor or the drop completes. When a dropped or pasted file is rejected, the editor SHALL show the reason inline, using the widget's existing translated image error messages, and that message SHALL disappear on its own after a short delay.

#### Scenario: Drop-target affordance during a drag

- **WHEN** the user drags a file over the editor body
- **THEN** the editor shows a drop-target affordance

#### Scenario: Affordance cleared after drop

- **WHEN** the user drops the file, or drags it back out of the editor
- **THEN** the drop-target affordance is removed

#### Scenario: Rejection message is translated and transient

- **WHEN** a file is rejected
- **THEN** the reason is shown using the widget's translated image error text
- **AND** the message clears by itself after a short delay
