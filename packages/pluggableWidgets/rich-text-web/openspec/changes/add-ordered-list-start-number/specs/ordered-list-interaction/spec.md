## ADDED Requirements

### Requirement: Dropdown contains start number input

The ordered list dropdown SHALL contain, below the style options, a labelled group with a start number input. The input SHALL be reachable by keyboard.

#### Scenario: Input placed after style options

- **WHEN** dropdown menu is open
- **THEN** the style options are listed first
- **THEN** a group containing a labelled "Start at" number input follows them

#### Scenario: ArrowDown from last option reaches input

- **WHEN** focus is on the last style option
- **WHEN** user presses ArrowDown
- **THEN** focus moves to the start number input

#### Scenario: Arrow keys inside input change value

- **WHEN** focus is in the start number input
- **WHEN** user presses ArrowUp
- **THEN** the input value increases by 1
- **THEN** focus stays in the input

#### Scenario: Choosing a style keeps start number

- **WHEN** list starts at 5 with decimal style
- **WHEN** user selects lower-alpha from the dropdown
- **THEN** the list uses lower-alpha style
- **THEN** the list still starts at 5
