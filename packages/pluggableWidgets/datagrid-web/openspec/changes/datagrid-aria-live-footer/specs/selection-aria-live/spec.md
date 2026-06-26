## ADDED Requirements

### Requirement: Status region announces selection count changes

The DataGrid widget SHALL include a status region (using `role="status"` or `aria-live="polite"`) in the footer that announces the current selection count to screen reader users whenever the selection state changes.

#### Scenario: Selection count announced when row selected

- **WHEN** user selects a row via checkbox or row click
- **THEN** screen reader announces the updated selection count (e.g., "1 item selected")

#### Scenario: Selection count announced when row deselected

- **WHEN** user deselects a selected row
- **THEN** screen reader announces the updated selection count (e.g., "0 items selected")

#### Scenario: Selection count announced when multiple rows selected

- **WHEN** user selects multiple rows in sequence
- **THEN** screen reader announces the updated count after each selection change

#### Scenario: Selection count announced when all rows cleared

- **WHEN** user clears all selected rows via the "Clear selection" button
- **THEN** screen reader announces "0 items selected"

### Requirement: Aria-live region always present when selection enabled

The aria-live region SHALL be rendered in the DOM whenever the selection feature is enabled, regardless of the visual selection counter's visibility setting.

#### Scenario: Aria-live region present when counter hidden

- **WHEN** selection is enabled but `selectionCounterPosition` is set to "off"
- **THEN** aria-live region is still rendered in the footer and announces selection changes

#### Scenario: Aria-live region present when counter shown

- **WHEN** selection is enabled and `selectionCounterPosition` is set to "top" or "bottom"
- **THEN** aria-live region is rendered in the footer alongside the visual counter

#### Scenario: Aria-live region not present when selection disabled

- **WHEN** selection is disabled (`selectionType` is "None")
- **THEN** aria-live region is not rendered

### Requirement: Announcement text uses selection status logic

The status region SHALL use the same text logic as the select-all bar, distinguishing between partial selection and all-items-selected states.

#### Scenario: Partial selection announced with selected count text

- **WHEN** some but not all rows are selected (e.g., 50 out of 100)
- **THEN** status region announces using `selectedCountText` template (e.g., "50 items selected")

#### Scenario: All items selected announced with special text

- **WHEN** all items across all pages are selected (`isAllItemsSelected` is true)
- **THEN** status region announces using `allSelectedText` template (e.g., "All 100 rows selected.")

#### Scenario: Custom text template used in announcement

- **WHEN** `selectedCountText` is configured as "%d rows selected"
- **THEN** status region announces "3 rows selected" when 3 rows are selected (partial)

#### Scenario: Default text template used when not configured

- **WHEN** `selectedCountText` is not configured
- **THEN** status region uses the default text format "X item(s) selected"

#### Scenario: Status announcement matches visual SelectAllBar text

- **WHEN** SelectAllBar shows "All 100 rows selected."
- **THEN** status region announces the same text "All 100 rows selected."

### Requirement: Status region uses polite priority

The status region SHALL use `role="status"` (which implies `aria-live="polite"` and `aria-atomic="true"`) to avoid interrupting screen reader announcements.

#### Scenario: Selection change does not interrupt current announcement

- **WHEN** screen reader is reading content and user selects a row
- **THEN** selection count announcement waits until current announcement finishes

#### Scenario: Entire status text announced as atomic unit

- **WHEN** selection count changes from "2 items selected" to "3 items selected"
- **THEN** screen reader announces the complete new text "3 items selected" (not just "3")

### Requirement: Status region is visually hidden

The status region SHALL be visually hidden using appropriate CSS techniques while remaining accessible to screen readers (e.g., `sr-only` class or similar).

#### Scenario: Status region not visible to sighted users

- **WHEN** the status region is rendered
- **THEN** it is not visible on screen but remains in the accessibility tree

#### Scenario: Status region does not affect layout

- **WHEN** the status region is rendered
- **THEN** it does not take up visual space or affect the footer layout

### Requirement: Status message provides context without focus change

The selection count announcement SHALL qualify as a WCAG 4.1.3 status message by providing information without causing a change of context or receiving focus.

#### Scenario: Selection announcement does not move focus

- **WHEN** user selects a row and the status is announced
- **THEN** keyboard focus remains on the current element (checkbox, row, etc.)

#### Scenario: Selection announcement does not change page context

- **WHEN** selection count changes and is announced
- **THEN** no modal, alert dialog, or page navigation occurs
