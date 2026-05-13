# Gallery — Behavior Specification

## Purpose

Grid-based data display widget for Mendix applications. Renders items from a
ListValue datasource as a configurable multi-column grid with pagination, sorting,
filtering (via child filter widgets), and item click/selection actions.

---

## Requirements

### Requirement: Grid Data Rendering

The widget SHALL render datasource items as a grid of content slots, with a
configurable number of columns.

#### Scenario: Items available on mount

- GIVEN a datasource is configured with items
- WHEN the widget mounts and the datasource status is `"available"`
- THEN all items SHALL be rendered in a grid layout
- AND each item SHALL use the configured content template

#### Scenario: Loading state

- GIVEN a datasource is configured
- WHEN the datasource status is `"loading"`
- THEN the widget SHALL display a loading indicator
- AND no items SHALL be rendered

#### Scenario: Empty datasource

- GIVEN the datasource returns zero items
- WHEN the widget renders
- THEN the empty message widget SHALL be displayed in place of the grid

---

### Requirement: Column Count

The widget SHALL lay out items across a configurable number of columns.

#### Scenario: Custom column count

- GIVEN numberOfColumns is set to N
- WHEN the widget renders with items
- THEN items SHALL be arranged in N columns per row
- AND the grid SHALL be responsive within the configured column count

---

### Requirement: Pagination

The widget SHALL support paginating through datasource items when pagination is
configured.

#### Scenario: Load more pagination

- GIVEN pagination is "loadMore" and there are more items than pageSize
- WHEN the user clicks the "Load More" button
- THEN the next page of items SHALL be appended to the existing items
- AND the button SHALL disappear when all items are loaded

#### Scenario: Button pagination — next page

- GIVEN pagination is "buttons" and the current page is not the last
- WHEN the user clicks the next-page control
- THEN the next page of items SHALL replace the current display

---

### Requirement: Item Click Action

The widget SHALL execute the configured `onClickItem` action when an item is
clicked, subject to `canExecute`.

#### Scenario: Item clicked with valid action

- GIVEN `onClickItem` is configured and `canExecute` is true
- WHEN the user clicks an item
- THEN the action SHALL be executed with that item's object as context

---

### Requirement: Item Selection

The widget SHALL support selecting items in Single and Multi modes when configured.

#### Scenario: Single-mode item click

- GIVEN selectionMode is "Single"
- WHEN the user clicks an item
- THEN that item SHALL become selected
- AND any previously selected item SHALL be deselected
- AND the item's visual state SHALL reflect selection

#### Scenario: Multi-mode item click

- GIVEN selectionMode is "Multi"
- WHEN the user clicks multiple items
- THEN all clicked items SHALL be added to the selection set

---

### Requirement: Dynamic Item Class

The widget SHALL apply a dynamically evaluated CSS class to each item when
`itemClass` is configured.

#### Scenario: Dynamic class applied

- GIVEN `itemClass` is a dynamic expression returning a string
- WHEN the widget renders items
- THEN each item's wrapper element SHALL have the evaluated class applied
