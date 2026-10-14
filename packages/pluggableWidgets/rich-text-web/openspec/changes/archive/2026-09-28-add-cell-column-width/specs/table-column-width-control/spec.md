## ADDED Requirements

### Requirement: Column width input control

The cell configuration dropdown SHALL include a number input control labeled "Column Width" that allows users to set the column width in pixels.

#### Scenario: Opening cell configuration shows current width

- **WHEN** user selects a table cell and opens the cell configuration dropdown
- **THEN** the "Column Width" input displays the current column width value if set, or shows empty with "Auto" placeholder if width is auto

#### Scenario: Setting a valid column width

- **WHEN** user enters a numeric value between 25 and 1000 in the "Column Width" input
- **THEN** the column width is set to that exact pixel value and the column resizes accordingly

#### Scenario: Clearing column width for auto sizing

- **WHEN** user clicks the clear button or deletes the value from the "Column Width" input
- **THEN** the column width is reset to auto (null) and the column resizes to fit content

### Requirement: Column width validation

The system SHALL validate column width input to ensure values are within acceptable ranges.

#### Scenario: Entering value below minimum

- **WHEN** user enters a value less than 25 pixels
- **THEN** the system clamps the value to 25 pixels

#### Scenario: Entering value above maximum

- **WHEN** user enters a value greater than 1000 pixels
- **THEN** the system clamps the value to 1000 pixels

#### Scenario: Entering invalid input

- **WHEN** user enters non-numeric text
- **THEN** the system ignores the input and retains the previous value

### Requirement: Colspan cell width handling

The system SHALL set only the first column width when the selected cell has a colspan greater than 1.

#### Scenario: Setting width on colspan cell

- **WHEN** user sets column width on a cell with colspan=3 that currently has colwidth=[100, 150, 200]
- **THEN** the system sets colwidth=[new_value] affecting only the first spanned column

#### Scenario: Reading width from colspan cell

- **WHEN** user opens cell configuration for a cell with colspan=3 and colwidth=[100, 150, 200]
- **THEN** the "Column Width" input displays 100 (the first column's width)

### Requirement: Number input UI component

The configuration dropdown SHALL support a "numberInput" type with number-specific controls.

#### Scenario: Number input with unit label

- **WHEN** a configuration section has type "numberInput" with unit "px"
- **THEN** the UI renders a number input field with "px" unit label beside it

#### Scenario: Number input with clear button

- **WHEN** a configuration section has type "numberInput" and the field has a value
- **THEN** the UI displays a clear button (×) that resets the field to empty when clicked

#### Scenario: Number input with placeholder

- **WHEN** a configuration section has type "numberInput" with placeholder "Auto"
- **THEN** the empty input field shows "Auto" as placeholder text

### Requirement: Column width persistence

The system SHALL persist column width values in the document's colwidth attribute.

#### Scenario: Width persists after save and reload

- **WHEN** user sets a column width to 150 pixels, saves the document, and reloads the page
- **THEN** the column width remains 150 pixels and is displayed correctly in the cell configuration

#### Scenario: Width persists across editing sessions

- **WHEN** user sets column widths on multiple columns and closes the editor
- **THEN** reopening the document displays all columns at their configured widths

### Requirement: Visual feedback

The system SHALL provide clear visual feedback when column width changes.

#### Scenario: Immediate column resize on input

- **WHEN** user changes the column width value in the input field
- **THEN** the table column resizes immediately without requiring additional confirmation

#### Scenario: Clear button visibility

- **WHEN** the column width input has a value
- **THEN** the clear button is visible
- **WHEN** the column width input is empty
- **THEN** the clear button is hidden
