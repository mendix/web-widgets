# Combo Box — Behavior Specification

## Purpose

Configurable dropdown selection widget for Mendix applications. Supports single
and multi-selection from three data source modes (context, database, static),
with optional search/filter, lazy loading, clear, and accessibility via keyboard.

---

## Requirements

### Requirement: Single Selection

The widget SHALL allow selecting exactly one option at a time from the configured
data source.

#### Scenario: User opens dropdown and selects an item

- GIVEN the widget is in single-select mode and the datasource has items
- WHEN the user clicks the input or arrow to open the dropdown
- THEN the option list SHALL be displayed
- AND when the user clicks an option
- THEN that option SHALL become the selected value
- AND the dropdown SHALL close

#### Scenario: Selected value displayed in input

- GIVEN an option is selected
- WHEN the widget renders
- THEN the selected option's caption SHALL be shown in the input field

---

### Requirement: Multi-Selection

The widget SHALL allow selecting multiple options simultaneously when configured
for multi-select mode.

#### Scenario: User selects multiple options

- GIVEN the widget is in multi-select mode
- WHEN the user clicks multiple options in the dropdown
- THEN all clicked options SHALL be added to the selection
- AND the dropdown SHALL remain open between selections

#### Scenario: Selected items displayed as badges

- GIVEN multiple items are selected and selectedItemsStyle is "boxes"
- WHEN the widget renders
- THEN each selected item SHALL be displayed as a removable badge/tag

#### Scenario: Select All in multi-select

- GIVEN multi-select mode is active and a "Select All" option is available
- WHEN the user clicks "Select All"
- THEN all currently visible options SHALL be selected

---

### Requirement: Search / Filter

The widget SHALL filter visible options based on user-typed input in the search field.

#### Scenario: User types in search field

- GIVEN filterType is "contains" or "startsWith"
- WHEN the user types characters in the input
- THEN the option list SHALL update to show only matching options
- AND non-matching options SHALL be hidden

#### Scenario: No matching options

- GIVEN the user typed a search term that matches no options
- WHEN the option list renders
- THEN a "no options" placeholder SHALL be displayed

#### Scenario: Filter disabled

- GIVEN filterType is "none"
- WHEN the user types in the input
- THEN the option list SHALL NOT change — all options remain visible

---

### Requirement: Clear Selection

The widget SHALL allow clearing the current selection via a dedicated clear button
when clearable is enabled.

#### Scenario: Clear button visible with selection

- GIVEN clearable is true and at least one item is selected
- WHEN the widget renders
- THEN a clear button SHALL be visible

#### Scenario: User clicks clear

- GIVEN the clear button is visible
- WHEN the user clicks it
- THEN the selection SHALL be reset to empty
- AND the clear button SHALL disappear

---

### Requirement: Lazy Loading

The widget SHALL defer loading of database options until the dropdown is first
opened when lazyLoading is enabled.

#### Scenario: Dropdown opens with lazy loading enabled

- GIVEN lazyLoading is true and the datasource is a database datasource
- WHEN the widget mounts
- THEN the datasource SHALL NOT be fetched immediately
- AND when the user first opens the dropdown
- THEN options SHALL be loaded and displayed

---

### Requirement: Read-Only Mode

The widget SHALL display the current selection without allowing interaction when
in read-only mode.

#### Scenario: Widget rendered read-only

- GIVEN readOnly is true
- WHEN the widget renders
- THEN the selected value SHALL be displayed
- AND the dropdown SHALL NOT open on click
- AND the clear button SHALL NOT be visible

---

### Requirement: Change Action

The widget SHALL execute the configured `onChangeAction` when the selection changes.

#### Scenario: Selection changes

- GIVEN `onChangeAction` is configured and `canExecute` is true
- WHEN the user selects or deselects an option
- THEN the action SHALL be executed

---

### Requirement: Keyboard Navigation

The widget SHALL support full keyboard navigation for accessibility.

#### Scenario: Open with keyboard

- GIVEN the input is focused
- WHEN the user presses the down arrow or Enter key
- THEN the dropdown SHALL open and focus the first option

#### Scenario: Navigate options

- GIVEN the dropdown is open
- WHEN the user presses the down or up arrow keys
- THEN focus SHALL move to the next or previous option respectively

#### Scenario: Select with keyboard

- GIVEN an option is focused in the dropdown
- WHEN the user presses Enter or Space
- THEN that option SHALL be selected (or toggled in multi-select)

#### Scenario: Close with Escape

- GIVEN the dropdown is open
- WHEN the user presses Escape
- THEN the dropdown SHALL close
- AND focus SHALL return to the input
