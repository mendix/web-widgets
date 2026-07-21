# Split Button Component Specification

## ADDED Requirements

### Requirement: Split button renders main and dropdown parts

The component SHALL render two interactive button elements grouped together: a main action button and a dropdown trigger button.

#### Scenario: Component renders with both parts

- **WHEN** split button is mounted in toolbar
- **THEN** main button displays configured icon
- **THEN** dropdown button displays chevron-down icon
- **THEN** both buttons are grouped in single container with `role="group"`

#### Scenario: Container has accessible label

- **WHEN** split button is rendered
- **THEN** container has `aria-label` matching button title

### Requirement: Main button executes primary action

The main button SHALL execute the configured command when clicked.

#### Scenario: Main button click triggers command

- **WHEN** user clicks main button
- **THEN** configured command executes via editor chain
- **THEN** focus returns to editor

#### Scenario: Main button respects active state

- **WHEN** configured `isActive` function returns true
- **THEN** main button has `aria-pressed="true"`
- **THEN** split button container has `is-active` class

### Requirement: Dropdown button opens style menu

The dropdown button SHALL toggle the dropdown menu when clicked.

#### Scenario: Dropdown button opens menu

- **WHEN** user clicks dropdown button
- **THEN** dropdown menu becomes visible
- **THEN** dropdown button has `aria-expanded="true"`

#### Scenario: Dropdown button closes menu

- **WHEN** dropdown menu is open
- **WHEN** user clicks dropdown button again
- **THEN** dropdown menu becomes hidden
- **THEN** dropdown button has `aria-expanded="false"`

### Requirement: Dropdown options display icon and text

Each dropdown option SHALL render both an icon and text label.

#### Scenario: Option renders with icon

- **WHEN** dropdown menu is open
- **THEN** each option displays icon from config `icon` field
- **THEN** each option displays text from config `label` field

#### Scenario: Active option is highlighted

- **WHEN** dropdown menu is open
- **WHEN** current value matches option value
- **THEN** option has `is-active` class

### Requirement: Selecting dropdown option updates state

When user selects a dropdown option, the component SHALL execute the option's command and close the menu.

#### Scenario: Option selection executes command

- **WHEN** user clicks dropdown option
- **THEN** option's command executes with configured attrs
- **THEN** dropdown menu closes
- **THEN** focus returns to editor

### Requirement: Icon updates dynamically

The main button icon SHALL change based on editor state and last-used value.

#### Scenario: Icon reflects active state

- **WHEN** editor has active state matching button config
- **THEN** icon updates to reflect current state value

#### Scenario: Icon reflects last-used value when inactive

- **WHEN** editor does not have active state
- **THEN** icon shows last-used value from sticky state

### Requirement: Keyboard navigation between parts

The component SHALL support arrow key navigation between main and dropdown buttons.

#### Scenario: ArrowRight moves focus to dropdown

- **WHEN** main button has focus
- **WHEN** user presses ArrowRight
- **THEN** focus moves to dropdown button

#### Scenario: ArrowLeft moves focus to main

- **WHEN** dropdown button has focus
- **WHEN** user presses ArrowLeft
- **THEN** focus moves to main button

#### Scenario: ArrowDown opens dropdown

- **WHEN** either button has focus
- **WHEN** user presses ArrowDown
- **THEN** dropdown menu opens

### Requirement: Tab navigation treats as single control

The split button SHALL act as single tab stop in toolbar navigation.

#### Scenario: Tab focuses split button once

- **WHEN** user tabs through toolbar
- **THEN** split button receives focus as single stop
- **THEN** next tab moves to next toolbar control

#### Scenario: Shift+Tab navigates backward

- **WHEN** split button has focus
- **WHEN** user presses Shift+Tab
- **THEN** focus moves to previous toolbar control

### Requirement: Enter and Space execute focused part

The component SHALL execute the action of whichever part has focus when Enter or Space is pressed.

#### Scenario: Enter on main button executes command

- **WHEN** main button has focus
- **WHEN** user presses Enter
- **THEN** main button command executes

#### Scenario: Space on dropdown button opens menu

- **WHEN** dropdown button has focus
- **WHEN** user presses Space
- **THEN** dropdown menu opens

### Requirement: Click outside closes dropdown

The dropdown menu SHALL close when user clicks outside the component.

#### Scenario: Outside click closes menu

- **WHEN** dropdown menu is open
- **WHEN** user clicks outside split button
- **THEN** dropdown menu closes

### Requirement: Focus indicators are visible

Both button parts SHALL display visible focus indicators for keyboard navigation.

#### Scenario: Focus outline on main button

- **WHEN** main button has focus
- **THEN** main button displays focus outline

#### Scenario: Focus outline on dropdown button

- **WHEN** dropdown button has focus
- **THEN** dropdown button displays focus outline

### Requirement: Component updates on editor events

The component SHALL re-render when editor state changes to keep icon and active state synchronized.

#### Scenario: Update on selection change

- **WHEN** editor `selectionUpdate` event fires
- **THEN** component re-renders with current state

#### Scenario: Update on content change

- **WHEN** editor `transaction` event fires
- **THEN** component re-renders with current state
