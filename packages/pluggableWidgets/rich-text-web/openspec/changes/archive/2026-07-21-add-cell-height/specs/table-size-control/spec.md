## ADDED Requirements

### Requirement: Column height as CSS size

The cell configuration dropdown SHALL include a "Column Height" text input that stores the height as a CSS size string (e.g. `100px`, `50%`) on the cell's inline style, applying a minimum height to the cell's row.

#### Scenario: Setting a cell height

- **WHEN** user enters a valid CSS size in the "Column Height" input for a cell
- **THEN** the cell (and its row) renders at least that tall

#### Scenario: Row grows beyond the set height

- **WHEN** a cell has a height set and its content requires more vertical space
- **THEN** the cell grows to fit the content, exceeding the set height

#### Scenario: Bare number treated as pixels

- **WHEN** user enters a bare number such as `80` for the cell height
- **THEN** the value is normalized to `80px` and applied

#### Scenario: Invalid or unsafe height is rejected

- **WHEN** user enters a value that is not a valid CSS size
- **THEN** the value is not applied

#### Scenario: Clearing cell height

- **WHEN** user clears the "Column Height" input
- **THEN** the cell height is reset to auto (null)

#### Scenario: Height serializes in the active style-data format

- **WHEN** a cell height is set
- **THEN** it is rendered as inline `height` in `inline` mode and as `data-cell-height` in `class` mode, consistent with the column width control
