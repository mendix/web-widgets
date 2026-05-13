# Data Grid 2 — Behavior Specification

## Purpose

Tabular data display and interaction for Mendix applications. Renders rows from
a configured ListValue datasource with support for column configuration, sorting,
pagination, row selection, filtering, column resizing and reordering, and data export.

---

## Requirements

### Requirement: Tabular Data Rendering

The widget SHALL render datasource items as rows in a table structure, with each
column mapped to a configured attribute or custom content slot.

#### Scenario: Data available on mount

- GIVEN a datasource is configured with items
- WHEN the widget mounts and the datasource status is `"available"`
- THEN all items SHALL be displayed as rows
- AND each column SHALL display the attribute value or content for each item

#### Scenario: Loading state

- GIVEN a datasource is configured
- WHEN the datasource status is `"loading"`
- THEN the widget SHALL display a loading indicator
- AND no data rows SHALL be rendered

#### Scenario: Empty datasource

- GIVEN a datasource returns zero items
- WHEN the widget renders
- THEN the empty message widget SHALL be displayed in place of data rows

---

### Requirement: Column Configuration

The widget SHALL support per-column configuration including caption, content,
visibility, width, sortability, and resizability.

#### Scenario: Column with static width

- GIVEN a column is configured with a fixed width
- WHEN the widget renders
- THEN the column SHALL occupy that fixed width regardless of container size

#### Scenario: Column hidden by default

- GIVEN a column has its visible property set to false
- WHEN the widget renders
- THEN the column SHALL NOT appear in the grid header or rows

---

### Requirement: Server-Side Sorting

The widget SHALL support sorting rows by a column's attribute value, delegating
sort order to the datasource.

#### Scenario: User clicks a sortable column header once

- GIVEN a column is configured as sortable
- WHEN the user clicks the column header
- THEN the datasource SHALL be sorted ascending by that column's attribute
- AND a visual indicator SHALL appear showing ascending sort direction

#### Scenario: User clicks the same sortable column header again

- GIVEN the column is already sorted ascending
- WHEN the user clicks the header again
- THEN the sort order SHALL toggle to descending
- AND the visual indicator SHALL update accordingly

#### Scenario: User clicks a non-sortable column header

- GIVEN a column is configured as not sortable
- WHEN the user clicks the header
- THEN no sort change SHALL occur

---

### Requirement: Pagination

The widget SHALL support paginating through datasource items, with configurable
page size and pagination control style.

#### Scenario: Next page navigation

- GIVEN pagination is enabled and the current page is not the last
- WHEN the user clicks the "next page" control
- THEN the next page of items SHALL be loaded and displayed
- AND the current page indicator SHALL update

#### Scenario: Page size change

- GIVEN the page size control is visible
- WHEN the user selects a different page size
- THEN the datasource SHALL reload with the new limit
- AND the display SHALL return to the first page

---

### Requirement: Row Selection

The widget SHALL support row selection in Single and Multi modes when configured.

#### Scenario: Single-mode row click

- GIVEN selectionMode is "Single"
- WHEN the user clicks a row
- THEN that row SHALL become selected
- AND any previously selected row SHALL be deselected
- AND the row's visual state SHALL reflect selection

#### Scenario: Multi-mode checkbox selection

- GIVEN selectionMode is "Multi" with checkbox column enabled
- WHEN the user checks a row's checkbox
- THEN that row SHALL be added to the selection set
- AND already-selected rows SHALL remain selected

#### Scenario: Selection disabled

- GIVEN selectionMode is "None"
- WHEN the user clicks a row
- THEN no selection state change SHALL occur

---

### Requirement: Row Click Action

The widget SHALL execute the configured `onClickRow` action when a row is clicked,
subject to `canExecute`.

#### Scenario: Row clicked with valid action

- GIVEN `onClickRow` is configured and `canExecute` is true
- WHEN the user clicks a row
- THEN the action SHALL be executed with that row's object as context

---

### Requirement: Column Resizing

The widget SHALL allow users to drag column dividers to resize column widths
when resizing is enabled for a column.

#### Scenario: Column resize drag

- GIVEN a column has resizing enabled
- WHEN the user drags the column's resize handle
- THEN the column width SHALL update in real time to match the drag position

---

### Requirement: Column Visibility Toggle

The widget SHALL provide a column selector allowing users to show or hide
individual columns at runtime.

#### Scenario: User hides a column

- GIVEN the column selector is open
- WHEN the user unchecks a column
- THEN that column SHALL disappear from the grid

#### Scenario: User re-shows a column

- GIVEN a column is hidden via the selector
- WHEN the user checks it in the column selector
- THEN the column SHALL reappear in its original position

---

### Requirement: Data Export

The widget SHALL support exporting visible data to a downloadable format when
export is enabled.

#### Scenario: Export triggered

- GIVEN exportEnabled is true
- WHEN the user clicks the export button
- THEN the currently displayed data SHALL be exported
- AND a file download SHALL be initiated
