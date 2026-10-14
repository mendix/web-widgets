## ADDED Requirements

### Requirement: Table width input control

The table configuration dropdown SHALL include a text input control labeled "Table Width" that allows users to set the overall table width using any CSS length or percentage (e.g. `250px`, `100%`, `10em`).

#### Scenario: Opening table configuration shows current width

- **WHEN** user selects a table and opens the table configuration dropdown
- **THEN** the "Table Width" input displays the current table width value if set, or shows empty with an "Auto" placeholder if width is auto

#### Scenario: Setting a CSS length or percentage width

- **WHEN** user enters a valid CSS size such as `250px` or `100%` in the "Table Width" input
- **THEN** the table `width` attribute is set to that value and the table resizes accordingly

#### Scenario: Bare number is treated as pixels

- **WHEN** user enters a bare number such as `250` in the "Table Width" input
- **THEN** the value is normalized to `250px` before being applied

#### Scenario: Invalid or unsafe width is rejected

- **WHEN** user enters a value that is not a valid CSS size (e.g. non-size text or an injection payload)
- **THEN** the value is not applied to the table

#### Scenario: Clearing table width for auto sizing

- **WHEN** user clicks the clear button or deletes the value from the "Table Width" input
- **THEN** the table width is reset to auto (null) and the table falls back to its column-width-derived size

### Requirement: Table height input control

The table configuration dropdown SHALL include a text input control labeled "Table Height" that sets the table's minimum height using any CSS length or percentage.

#### Scenario: Setting a table minimum height

- **WHEN** user enters a valid CSS size in the "Table Height" input
- **THEN** the table `min-height` is set to that value and the table is at least that tall

#### Scenario: Rows still grow beyond minimum height

- **WHEN** a table has a minimum height set and its content requires more vertical space
- **THEN** the table grows to fit the content, exceeding the minimum height

#### Scenario: Clearing table height

- **WHEN** user clears the "Table Height" input
- **THEN** the table `min-height` is reset to auto (null)

### Requirement: Configuration text inputs retain focus while typing

Text inputs in the table and cell configuration dropdowns SHALL retain focus while the user types and SHALL commit their value to the editor only on blur or Enter, so that editing is not interrupted by editor re-renders.

#### Scenario: Typing does not lose focus

- **WHEN** user types multiple characters into a configuration text input (e.g. "Table Width")
- **THEN** the input retains focus for the entire entry and reflects each typed character without resetting

#### Scenario: Commit on blur

- **WHEN** user finishes typing a value and moves focus away from the input
- **THEN** the value is validated and applied to the editor as a single change

#### Scenario: Commit on Enter

- **WHEN** user presses Enter while a configuration text input is focused
- **THEN** the value is applied to the editor and the input blurs

#### Scenario: Invalid value reverts on commit

- **WHEN** user enters an invalid value and then blurs or presses Enter
- **THEN** the input reverts to the last committed value and the editor is not changed

#### Scenario: Escape discards the draft

- **WHEN** user presses Escape while editing a configuration text input
- **THEN** the draft is discarded and the input reverts to the last committed value

#### Scenario: Color and dropdown controls remain live

- **WHEN** user changes a color picker or a select dropdown in the configuration dropdown
- **THEN** the change is applied to the editor immediately (these controls do not defer to blur)

### Requirement: Table size validation

The system SHALL validate table width and height input as safe CSS size values before applying them, to prevent CSS injection through the inline style.

#### Scenario: Accepting valid CSS sizes

- **WHEN** user enters a valid CSS length or percentage (e.g. `250px`, `100%`, `10em`, `auto`)
- **THEN** the system accepts the value and applies it to the table

#### Scenario: Rejecting non-size text

- **WHEN** user enters text that is not a valid CSS size
- **THEN** the system ignores the input and retains the previous value

#### Scenario: Rejecting injection payloads

- **WHEN** user enters a value containing CSS-breakout characters or `url(`/`expression(` sequences
- **THEN** the system rejects the value and does not apply it to the table

### Requirement: Table width and column width coexistence

The system SHALL apply an explicit table width as the table footprint while continuing to honor per-column `colwidth` as column minimum widths.

#### Scenario: Explicit table width with column widths set

- **WHEN** a table has an explicit `width` attribute and one or more columns have `colwidth` set
- **THEN** the table element renders with the explicit `width`, and each sized column renders with its `colwidth` as a `min-width`

#### Scenario: No explicit table width falls back to derived sizing

- **WHEN** a table has no `width` attribute set
- **THEN** the table size is derived from the sum of column widths exactly as before this feature

### Requirement: Column width as CSS size

The column width control SHALL store the width as a CSS size string (e.g. `250px`, `50%`) on the cell and SHALL apply it to the column via the table's `<colgroup>`, which is authoritative under `table-layout: fixed`.

#### Scenario: Setting a column width resizes the column

- **WHEN** user enters a valid CSS size in the "Column Width" input for a cell
- **THEN** the corresponding column resizes to that width

#### Scenario: Percentage column width

- **WHEN** user enters a percentage such as `50%` for a column width
- **THEN** the column is sized to that percentage of the table

#### Scenario: Bare number treated as pixels

- **WHEN** user enters a bare number such as `120` for a column width
- **THEN** the value is normalized to `120px` and applied

#### Scenario: Clearing column width

- **WHEN** user clears the "Column Width" input
- **THEN** the column width is reset to auto

### Requirement: Table size persistence

The system SHALL persist table width and min-height values in the document in both inline and class style-data formats.

#### Scenario: Size persists after save and reload

- **WHEN** user sets a table width and height, saves the document, and reloads
- **THEN** the table width and min-height remain and are displayed correctly in the configuration dropdown

#### Scenario: Size serializes in the active style-data format

- **WHEN** the widget is configured for `class` style-data format and a table size is set
- **THEN** the size is serialized via data attributes/classes consistent with the other table attributes, and via inline `style` when configured for `inline` format
