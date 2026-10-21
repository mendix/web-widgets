## ADDED Requirements

### Requirement: Builder renders the rows inline as a list

The builder SHALL render every row of the Filter Set, always visible (not behind a trigger), as a `<ul class="dynamic-filters-list">` with one `<li class="dynamic-filters-row">` per row, inside a root element with class `widget-dynamic-filters`. Each row SHALL render its controls in this order: remove button, field picker, operator control, value input.

#### Scenario: Two rows

- **WHEN** the Filter Set has two rows
- **THEN** the builder renders a list with two items, each starting with its remove button

### Requirement: Rows reuse the existing filter controls

Text and number rows SHALL use `InputWithFilters`, whose `FilterSelector` is the row's operator control. Date rows SHALL use the shared `DatePicker` with `FilterSelector`. Enumeration rows SHALL use the dropdown filter's multi-select and SHALL render no operator control. The field picker SHALL be the `Select` control from `@mendix/widget-plugin-dropdown-filter`.

#### Scenario: Enumeration row

- **WHEN** a row uses an enumeration field
- **THEN** it renders the remove button, the field picker and a multi-select value control, and no operator control

### Requirement: Empty state

When the Filter Set has no rows, the builder SHALL render only the "Add filter" button. "Clear all" SHALL NOT be rendered until there is at least one row.

#### Scenario: First load

- **WHEN** the builder renders with an empty Filter Set
- **THEN** only the "Add filter" button is visible

#### Scenario: First row added

- **WHEN** the user clicks "Add filter" on an empty Filter Set
- **THEN** one blank row and the "Clear all" button are rendered

### Requirement: Actions and buttons

"Add filter" SHALL be a `<button type="button" class="btn btn-secondary dynamic-filters-add">` and "Clear all" a `<button type="button" class="btn btn-link dynamic-filters-clear">`, both inside an element with class `dynamic-filters-actions` that follows the list. Their captions SHALL come from the parent widget's text properties.

#### Scenario: Captions from texts

- **WHEN** the parent passes the captions "Filter toevoegen" and "Alles wissen"
- **THEN** the buttons show those captions

### Requirement: Focus management

All interactive elements SHALL keep their default tab index (normal browser order, no roving tabindex). Focus SHALL move programmatically after these actions, whether triggered by keyboard or mouse:

- after "Add filter": to the new row's field picker;
- after removing a row: to the remove button of the row that took its place, or the new last row's remove button if the removed row was last, or "Add filter" if no rows are left;
- after "Clear all": to "Add filter".

#### Scenario: Remove the middle row

- **WHEN** the user activates the remove button of the 2nd of 3 rows
- **THEN** focus moves to the remove button of the row that is now 2nd

#### Scenario: Remove the only row

- **WHEN** the user removes the only row
- **THEN** focus moves to "Add filter"

### Requirement: Accessible labels

Each remove button SHALL be a `<button type="button">` whose accessible name is the remove label followed by the row's field label (for example "Remove filter Status"), or the remove label alone when no field is selected. The field picker SHALL be labelled by the field picker label text. Reused controls SHALL keep their existing labels. The builder SHALL NOT add a live region.

#### Scenario: Remove button name

- **WHEN** a row uses the field labelled "Status" and the remove label is "Remove filter"
- **THEN** the row's remove button has the accessible name "Remove filter Status"

### Requirement: Rows don't control their layout

The list SHALL use `flex-wrap`. Each row's controls SHALL stay on one line, and a row wider than its container SHALL be clipped with `overflow: hidden`. There SHALL be no breakpoints or container queries. Because the remove button comes first, it stays visible when a row is clipped.

#### Scenario: Narrow container

- **WHEN** a date "between" row is wider than the header
- **THEN** the end of the row is clipped and its remove button is still visible and usable
