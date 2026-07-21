## ADDED Requirements

### Requirement: Contextual link bubble menu

The rich text editor SHALL display a floating bubble menu whenever the caret is inside a link or a selection covers a link, and the editor is editable. The menu SHALL contain an Edit action and a Remove action.

#### Scenario: Menu appears on a link

- **WHEN** the caret is placed inside link text in an editable editor
- **THEN** a bubble menu with Edit and Remove buttons appears anchored to the link

#### Scenario: Menu hidden away from links

- **WHEN** the caret is in text that is not part of a link
- **THEN** the bubble menu is not shown

#### Scenario: Menu suppressed when not editable

- **WHEN** the editor is read-only
- **THEN** the bubble menu is not shown even if the caret is inside a link

### Requirement: Edit an existing link

The Edit action SHALL select the entire link range before opening the link dialog, so the dialog is prefilled with the link's current attributes and updates the existing link in place rather than inserting a duplicate.

#### Scenario: Edit from a bare caret inside a link

- **WHEN** the caret is inside a link with no text selected and the user activates Edit
- **THEN** the full link range is selected and the link dialog opens prefilled with the current URL, text, title, and target
- **AND** submitting the dialog updates the existing link without duplicating its text

#### Scenario: Dialog anchored to the link

- **WHEN** the Edit action opens the link dialog
- **THEN** the dialog is positioned relative to the link's DOM element and remains positioned there while editing

### Requirement: Remove a link

The Remove action SHALL strip the link mark across its entire range, converting the linked text back into normal text.

#### Scenario: Remove from a bare caret inside a link

- **WHEN** the caret is inside a link with no text selected and the user activates Remove
- **THEN** the link mark is removed from the whole link range and the text remains as plain text

### Requirement: Single floating layer while editing

While the link dialog is open, the bubble menu SHALL be suppressed so that only one floating layer is visible at a time.

#### Scenario: Bubble hides during edit

- **WHEN** the link dialog is open via the Edit action
- **THEN** the bubble menu is not shown

#### Scenario: Bubble returns after editing

- **WHEN** the link dialog is closed and the caret is still inside a link
- **THEN** the bubble menu reappears
