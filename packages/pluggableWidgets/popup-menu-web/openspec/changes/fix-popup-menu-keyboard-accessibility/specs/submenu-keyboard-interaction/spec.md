## ADDED Requirements

### Requirement: Parent item exposes its submenu

A custom item whose content contains a nested Pop-up Menu SHALL act as that submenu's parent item. It SHALL expose `aria-haspopup="menu"` and `aria-expanded` reflecting the submenu's open state.

#### Scenario: Parent item ARIA state

- **WHEN** a custom item contains a nested Pop-up Menu that is closed
- **THEN** the item has `aria-haspopup="menu"` and `aria-expanded="false"`
- **WHEN** the nested menu opens
- **THEN** the item has `aria-expanded="true"`

### Requirement: Right Arrow opens a submenu

When focus is on a parent item, Right Arrow, Enter or Space SHALL open its submenu and move focus to the submenu's first item. This SHALL work regardless of the nested menu's "Open on" setting (Click or Hover). Right Arrow on an item without a submenu SHALL do nothing.

#### Scenario: Right Arrow expands and moves in

- **WHEN** focus is on a parent item with a closed submenu
- **AND** the user presses Right Arrow
- **THEN** the submenu opens
- **AND** the submenu's first item has focus

#### Scenario: Enter on parent item opens submenu

- **WHEN** focus is on a parent item with a closed submenu
- **AND** the user presses Enter
- **THEN** the submenu opens and its first item has focus

#### Scenario: Right Arrow on a leaf item

- **WHEN** focus is on an item without a submenu
- **AND** the user presses Right Arrow
- **THEN** focus and open state are unchanged

### Requirement: Focus stays within an open submenu level

While a submenu is open and focused, Up/Down/Home/End SHALL navigate only among that submenu's items. Focus SHALL stay in the submenu until it is closed (Left Arrow, Escape, activation) or the user leaves the menu with Tab.

#### Scenario: Arrow Down wraps within submenu

- **WHEN** focus is on the last item of an open submenu
- **AND** the user presses Arrow Down
- **THEN** the first item of the same submenu has focus
- **AND** the parent menu's active item is unchanged

### Requirement: Left Arrow and Escape close the current level

In a submenu, Left Arrow SHALL close that submenu and return focus to its parent item. In a submenu, Escape SHALL close only that level and return focus to its parent item. At the top-level menu, Left Arrow SHALL do nothing, and Escape SHALL close the entire menu (see trigger-keyboard-interaction).

#### Scenario: Left Arrow collapses to parent

- **WHEN** focus is on an item in an open submenu
- **AND** the user presses Left Arrow
- **THEN** the submenu closes
- **AND** the parent item has focus
- **AND** the parent menu stays open

#### Scenario: Escape in nested submenu closes one level

- **WHEN** focus is on an item in a second-level submenu
- **AND** the user presses Escape
- **THEN** only the second-level submenu closes
- **AND** its parent item in the first-level menu has focus

#### Scenario: Left Arrow at top level

- **WHEN** focus is on an item of the top-level menu
- **AND** the user presses Left Arrow
- **THEN** the menu stays open and focus is unchanged

### Requirement: Opening a submenu closes sibling submenus

At any level, at most one submenu SHALL be open. Opening a submenu, by keyboard or pointer, SHALL close any other open submenu that shares the same parent menu, including that submenu's descendants.

#### Scenario: Switching branches

- **WHEN** the submenu of parent item A is open
- **AND** the user moves to parent item B and presses Right Arrow
- **THEN** A's submenu closes
- **AND** B's submenu opens with focus on its first item

### Requirement: Activation inside a submenu

Activating a leaf item in a submenu SHALL execute its action. When that item's menu closes on activation ("Close on: Click anywhere"), the entire menu hierarchy SHALL close and focus SHALL return to the top-level trigger element.

#### Scenario: Activate leaf in submenu

- **WHEN** focus is on a leaf item with an action in a submenu configured to close on click anywhere
- **AND** the user presses Enter
- **THEN** the action is executed once
- **AND** all menus close and the top-level trigger element has focus
