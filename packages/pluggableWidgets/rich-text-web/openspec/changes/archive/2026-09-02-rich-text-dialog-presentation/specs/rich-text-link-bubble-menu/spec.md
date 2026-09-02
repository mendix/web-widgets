## MODIFIED Requirements

### Requirement: Edit an existing link

The Edit action SHALL select the entire link range before opening the link dialog, so the dialog is prefilled with the link's current attributes and updates the existing link in place rather than inserting a duplicate. The dialog opened by the Edit action SHALL follow the widget's `dialogStyle` configuration: anchored to the link's DOM element under the `inline` style, centred above a dimmed overlay under the `focused` style. The bubble menu itself SHALL remain an anchored floating layer in both styles.

#### Scenario: Edit from a bare caret inside a link

- **WHEN** the caret is inside a link with no text selected and the user activates Edit
- **THEN** the full link range is selected and the link dialog opens prefilled with the current URL, text, title, and target
- **AND** submitting the dialog updates the existing link without duplicating its text

#### Scenario: Dialog anchored to the link under the inline style

- **WHEN** `dialogStyle` is `inline` and the Edit action opens the link dialog
- **THEN** the dialog is positioned relative to the link's DOM element and remains positioned there while editing

#### Scenario: Dialog centred under the focused style

- **WHEN** `dialogStyle` is `focused` and the Edit action opens the link dialog
- **THEN** the dialog is centred in the viewport above a dimmed overlay
- **AND** the dialog is not positioned relative to the link's DOM element

#### Scenario: Bubble menu presentation is unchanged

- **WHEN** the caret is inside a link and `dialogStyle` is `focused`
- **THEN** the bubble menu is still presented anchored to the link, without an overlay
