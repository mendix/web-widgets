## ADDED Requirements

### Requirement: Decorative icon SVGs must be hidden from assistive technologies

The combobox widget SHALL hide decorative icon elements from assistive technologies using `aria-hidden="true"`. Decorative icons are those that do not convey unique information and duplicate functionality already available through proper ARIA labels, roles, or semantic HTML.

#### Scenario: Down arrow icon hidden from screen readers

- **WHEN** the combobox renders the down arrow icon
- **THEN** the icon wrapper span SHALL have `aria-hidden="true"`
- **AND** screen readers SHALL NOT announce the icon as "image"

#### Scenario: Clear button icon hidden from screen readers

- **WHEN** the combobox renders the clear button with its icon
- **THEN** the icon wrapper span SHALL have `aria-hidden="true"`
- **AND** the parent button element SHALL remain accessible with its `aria-label`
- **AND** screen readers SHALL announce the button by its label, not as "image"

#### Scenario: Spinner loader remains accessible

- **WHEN** the combobox is in loading state and displays a spinner
- **THEN** the spinner element SHALL NOT have `aria-hidden="true"`
- **AND** screen readers SHALL be able to perceive the loading state

### Requirement: Icon functionality must remain intact

Hiding decorative icons from assistive technologies SHALL NOT affect their visual presentation or interactive behavior.

#### Scenario: Icons remain visible to sighted users

- **WHEN** decorative icons have `aria-hidden="true"`
- **THEN** the icons SHALL remain visually displayed
- **AND** their CSS styling SHALL be unchanged

#### Scenario: Buttons remain interactive

- **WHEN** a button contains a hidden decorative icon
- **THEN** the button SHALL remain fully interactive via mouse and keyboard
- **AND** click handlers SHALL continue to function normally
