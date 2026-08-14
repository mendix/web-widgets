## ADDED Requirements

### Requirement: Tab nests list items inside a table cell

When the cursor is inside a list item (ordered, unordered, or task list) that is contained within a table cell, pressing Tab SHALL nest the list item one level deeper via Tiptap's `sinkListItem` command, and SHALL NOT move the cursor to another table cell.

#### Scenario: Tab in unordered list inside a cell

- **WHEN** cursor is in the second item of an unordered list inside a table cell and user presses Tab
- **THEN** the list item is nested one level deeper (becomes a sublist)
- **AND** the cursor remains in the same cell

#### Scenario: Tab in ordered list inside a cell

- **WHEN** cursor is in the second item of an ordered list inside a table cell and user presses Tab
- **THEN** the list item is nested one level deeper

#### Scenario: Tab in task list inside a cell

- **WHEN** cursor is in the second item of a task list inside a table cell and user presses Tab
- **THEN** the list item is nested one level deeper

#### Scenario: Tab on first list item inside a cell does not navigate

- **WHEN** cursor is in the first (top-level) list item inside a table cell and user presses Tab
- **THEN** no nesting occurs (no preceding sibling to nest under)
- **AND** the cursor does NOT move to the next table cell

### Requirement: Shift+Tab un-nests list items inside a table cell

When the cursor is inside a nested list item within a table cell, pressing Shift+Tab SHALL lift the list item one level up via Tiptap's `liftListItem` command, and SHALL NOT move the cursor to another table cell.

#### Scenario: Shift+Tab in nested list inside a cell

- **WHEN** cursor is in a nested list item inside a table cell and user presses Shift+Tab
- **THEN** the list item is lifted one level up (reduced nesting)
- **AND** the cursor remains in the same cell

### Requirement: Tab preserves cell navigation for non-list cell content

When the cursor is inside a table cell but NOT inside a list item, pressing Tab or Shift+Tab SHALL retain the stock table navigation behavior.

#### Scenario: Tab in plain-text cell

- **WHEN** cursor is in a table cell containing plain text (no list) and user presses Tab
- **THEN** the cursor moves to the next cell

#### Scenario: Tab in last cell adds a row

- **WHEN** cursor is in the last cell of a table (plain content) and user presses Tab
- **THEN** a new row is added and the cursor moves into its first cell

#### Scenario: Shift+Tab in plain-text cell

- **WHEN** cursor is in a table cell containing plain text and user presses Shift+Tab
- **THEN** the cursor moves to the previous cell

### Requirement: List nesting outside tables is unaffected

The table Tab override SHALL NOT change list nesting or indent behavior when the cursor is not inside a table.

#### Scenario: Tab in a list outside any table

- **WHEN** cursor is in a list item that is not inside a table and user presses Tab
- **THEN** the list item nests exactly as before this change
