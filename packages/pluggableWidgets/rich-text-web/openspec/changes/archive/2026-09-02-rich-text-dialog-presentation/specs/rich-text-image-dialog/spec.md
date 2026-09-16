## ADDED Requirements

### Requirement: Image dialog content scrolls instead of overflowing

The Rich Text image dialog SHALL bound its height and scroll its content internally, so that embedded Media Library content of any height cannot push the Insert and Cancel controls out of reach. The Media Library region SHALL scroll within the dialog's scrollable area rather than expanding the dialog past the space available to it. This SHALL hold in both dialog styles.

#### Scenario: Media Library with many images

- **WHEN** the Media Library tab is active and `imageSourceContent` renders a list taller than the space available to the dialog
- **THEN** the dialog height is capped to the available space
- **AND** the Media Library region scrolls
- **AND** the Insert and Cancel controls remain visible without scrolling the dialog

#### Scenario: Alt text and dimension fields remain reachable

- **WHEN** the Media Library tab is active with tall embedded content
- **THEN** the Alt text, Title, Width and Height inputs are reachable by scrolling the dialog's content region

#### Scenario: Short embedded content

- **WHEN** the Media Library tab is active and `imageSourceContent` is shorter than the space available to the dialog
- **THEN** the dialog is sized to its content and shows no internal scrollbar
