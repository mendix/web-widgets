# Ordered List Interaction Specification

## Purpose

User interaction patterns for ordered lists in the rich text editor. Covers split button behavior, sticky style preferences, and icon feedback.

## Requirements

### Requirement: Sticky state tracks last-used list style

The system SHALL remember the last-used ordered list style across toggle operations.

#### Scenario: Default style is decimal

- **WHEN** user first interacts with ordered list
- **THEN** sticky state defaults to `"decimal"`

#### Scenario: Sticky state updates on style selection

- **WHEN** user selects lower-alpha from dropdown
- **THEN** sticky state updates to `"lower-alpha"`

#### Scenario: Sticky state persists after toggle off

- **WHEN** user has lower-alpha active
- **WHEN** user toggles ordered list off
- **WHEN** user toggles ordered list on again
- **THEN** ordered list uses lower-alpha style

### Requirement: Main button toggles OL with sticky style

Clicking the main button SHALL toggle ordered list on/off, using sticky style when enabling.

#### Scenario: Enable OL with sticky style when inactive

- **WHEN** ordered list is inactive
- **WHEN** sticky state is lower-alpha
- **WHEN** user clicks main button
- **THEN** ordered list enables with lower-alpha style

#### Scenario: Enable OL with decimal on first use

- **WHEN** ordered list is inactive
- **WHEN** sticky state is default (decimal)
- **WHEN** user clicks main button
- **THEN** ordered list enables with decimal style (null attribute)

#### Scenario: Disable OL when active

- **WHEN** ordered list is active
- **WHEN** user clicks main button
- **THEN** ordered list disables
- **THEN** sticky state remains unchanged

### Requirement: Dropdown selection applies style and enables OL

Selecting a style from dropdown SHALL apply that style and enable OL if inactive.

#### Scenario: Apply style when OL inactive

- **WHEN** ordered list is inactive
- **WHEN** user selects lower-roman from dropdown
- **THEN** ordered list enables with lower-roman style
- **THEN** sticky state updates to lower-roman

#### Scenario: Change style when OL active

- **WHEN** ordered list is active with decimal style
- **WHEN** user selects lower-alpha from dropdown
- **THEN** ordered list style changes to lower-alpha
- **THEN** ordered list remains active
- **THEN** sticky state updates to lower-alpha

### Requirement: Icon reflects current or sticky state

The split button icon SHALL dynamically change to reflect the active style or sticky state.

#### Scenario: Icon shows active style

- **WHEN** ordered list is active with lower-alpha
- **THEN** icon displays List-lower-alpha

#### Scenario: Icon shows sticky state when inactive

- **WHEN** ordered list is inactive
- **WHEN** sticky state is lower-roman
- **THEN** icon displays List-roman

#### Scenario: Icon updates after style change

- **WHEN** user changes style from decimal to lower-alpha
- **THEN** icon updates from List-numbers to List-lower-alpha

### Requirement: Dropdown is accessible when OL inactive

The dropdown button SHALL be enabled and functional even when ordered list is inactive.

#### Scenario: Dropdown button is not disabled

- **WHEN** ordered list is inactive
- **THEN** dropdown button is enabled
- **THEN** user can open dropdown menu

#### Scenario: Style options are selectable when inactive

- **WHEN** ordered list is inactive
- **WHEN** dropdown menu is open
- **THEN** all style options are clickable
- **THEN** selecting option enables OL with that style

### Requirement: Active style is visually indicated in dropdown

The dropdown menu SHALL highlight the currently active or sticky style.

#### Scenario: Active style is highlighted

- **WHEN** ordered list is active with lower-alpha
- **WHEN** dropdown menu is open
- **THEN** lower-alpha option has `is-active` class

#### Scenario: Sticky style is highlighted when inactive

- **WHEN** ordered list is inactive
- **WHEN** sticky state is lower-roman
- **WHEN** dropdown menu is open
- **THEN** lower-roman option has `is-active` class

### Requirement: Sticky state is module-scoped

The sticky state SHALL be stored at module level and shared across editor instances.

#### Scenario: State persists during editor session

- **WHEN** user selects lower-alpha
- **WHEN** user navigates to different content area
- **WHEN** user returns and toggles OL
- **THEN** ordered list uses lower-alpha style

#### Scenario: State resets on page reload

- **WHEN** user selects lower-roman
- **WHEN** page reloads
- **THEN** sticky state resets to default (decimal)
