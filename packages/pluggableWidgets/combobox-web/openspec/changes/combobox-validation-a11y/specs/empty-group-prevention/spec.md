## ADDED Requirements

### Requirement: Empty menu structures must not be exposed to assistive technologies

The combobox widget SHALL NOT expose empty menu list elements to the accessibility tree when the menu is closed or has no content. This prevents screen readers from navigating to meaningless empty groups.

#### Scenario: Menu list not rendered when closed

- **WHEN** the combobox menu is closed
- **THEN** the menu `<ul>` element SHALL NOT be present in the DOM
- **AND** screen readers SHALL NOT encounter an empty list structure

#### Scenario: Menu list rendered when open with items

- **WHEN** the combobox menu is open
- **AND** there are items to display
- **THEN** the menu `<ul>` element SHALL be present in the DOM
- **AND** screen readers SHALL be able to navigate the list items

#### Scenario: Menu list rendered when open but empty

- **WHEN** the combobox menu is open
- **AND** there are no items to display (empty state)
- **THEN** the menu `<ul>` element SHALL be present in the DOM
- **AND** the "No options" placeholder SHALL be rendered inside the list
- **AND** screen readers SHALL be able to perceive the empty state message

#### Scenario: Menu list rendered during loading

- **WHEN** the combobox is loading items
- **AND** the menu is open
- **THEN** the menu `<ul>` element SHALL be present in the DOM
- **AND** the loading indicator SHALL be accessible to screen readers

### Requirement: Visual behavior must remain unchanged

Preventing empty menu structures in the accessibility tree SHALL NOT affect the visual presentation or user experience for sighted users.

#### Scenario: Menu visibility controlled by CSS

- **WHEN** the menu transitions between open and closed states
- **THEN** the visual appearance SHALL match previous behavior
- **AND** CSS animations and transitions SHALL continue to work
- **AND** layout SHALL NOT shift unexpectedly

#### Scenario: No options placeholder displays when appropriate

- **WHEN** the menu is open and has no items
- **THEN** the "No options" text SHALL be visible to sighted users
- **AND** it SHALL be announced by screen readers
