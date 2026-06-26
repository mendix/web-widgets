## ADDED Requirements

### Requirement: Select-all checkbox has descriptive aria-label

The DataGrid widget SHALL include an `aria-label` attribute on the select-all checkbox in the table header that describes its purpose to screen reader users.

#### Scenario: Select-all checkbox labeled when multi-selection enabled

- **WHEN** multi-selection is enabled and the select-all checkbox is rendered in the header
- **THEN** the checkbox has `aria-label="Select all rows"` or similar descriptive text

#### Scenario: Select-all checkbox label announced by screen reader

- **WHEN** screen reader user focuses on the select-all checkbox
- **THEN** screen reader announces the aria-label (e.g., "Select all rows, checkbox, not checked")

#### Scenario: Select-all checkbox label reflects current state

- **WHEN** all rows are selected and the checkbox is checked
- **THEN** screen reader announces the checkbox as checked with the aria-label

### Requirement: Aria-label text is configurable

The aria-label text for the select-all checkbox SHALL be configurable via widget properties to support internationalization.

#### Scenario: Custom aria-label text used

- **WHEN** widget property `selectAllAriaLabel` is configured with custom text
- **THEN** the select-all checkbox uses the custom text as its aria-label

#### Scenario: Default aria-label text used when not configured

- **WHEN** widget property `selectAllAriaLabel` is not configured
- **THEN** the select-all checkbox uses default text "Select all rows" as aria-label

### Requirement: Aria-label updates with select-all state

The aria-label SHALL reflect whether the action will select or deselect all rows.

#### Scenario: Label indicates select action when rows not selected

- **WHEN** no rows or some rows are selected
- **THEN** aria-label indicates selection action (e.g., "Select all rows")

#### Scenario: Label indicates deselect action when all rows selected

- **WHEN** all rows on current page are selected
- **THEN** aria-label could indicate deselection (e.g., "Deselect all rows") or remain generic

### Requirement: Select-all checkbox is keyboard accessible

The select-all checkbox SHALL be fully operable via keyboard per WCAG 2.1.1 (Keyboard).

#### Scenario: Checkbox reachable via Tab key

- **WHEN** user navigates with Tab key through the DataGrid
- **THEN** the select-all checkbox receives focus and shows a visible focus indicator

#### Scenario: Checkbox toggleable via Space key

- **WHEN** select-all checkbox has focus and user presses Space
- **THEN** checkbox toggles state (checked ↔ unchecked) and selects/deselects rows accordingly

#### Scenario: Checkbox toggleable via Enter key

- **WHEN** select-all checkbox has focus and user presses Enter
- **THEN** checkbox toggles state (browser default behavior works)

#### Scenario: Focus management with grid keyboard navigation

- **WHEN** DataGrid has keyboard navigation enabled (arrow keys, etc.)
- **THEN** select-all checkbox integrates correctly with focus management (not trapped or skipped)

### Requirement: SelectAllBar buttons are keyboard accessible

The "Select all rows" and "Clear selection" buttons in the SelectAllBar SHALL be fully operable via keyboard per WCAG 2.1.1 (Keyboard).

#### Scenario: SelectAllBar buttons reachable via Tab key

- **WHEN** user navigates with Tab key through the page
- **THEN** both "Select all rows" and "Clear selection" buttons receive focus and show visible focus indicators

#### Scenario: Select all rows button activatable via keyboard

- **WHEN** "Select all rows" button has focus and user presses Space or Enter
- **THEN** all rows across all pages are selected

#### Scenario: Clear selection button activatable via keyboard

- **WHEN** "Clear selection" button has focus and user presses Space or Enter
- **THEN** all selected rows are deselected

#### Scenario: Disabled state prevents keyboard activation

- **WHEN** "Select all rows" button is disabled (e.g., already selecting)
- **THEN** button is not activatable via keyboard but remains in tab order for screen reader users

#### Scenario: Focus order is logical

- **WHEN** user tabs through the DataGrid
- **THEN** tab order flows logically: header checkbox → grid controls → SelectAllBar buttons
