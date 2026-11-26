## ADDED Requirements

### Requirement: Menu uses menu semantics

The popup list SHALL have `role="menu"`. Each visible item, in both basic and advanced mode, SHALL have `role="menuitem"`. Basic-mode dividers SHALL have `role="separator"` and MUST NOT be focusable. Hidden items (visibility expression false) MUST NOT be rendered.

#### Scenario: Basic mode roles

- **WHEN** the menu is open in basic mode with two items and one divider
- **THEN** the list has `role="menu"`
- **AND** the two items have `role="menuitem"`
- **AND** the divider has `role="separator"`

#### Scenario: Advanced mode roles

- **WHEN** the menu is open in advanced mode
- **THEN** every rendered custom item has `role="menuitem"`

### Requirement: Roving tabindex across items

Exactly one menu item SHALL have `tabIndex=0` (the active item). All other items SHALL have `tabIndex=-1`. This SHALL apply to basic items and to custom items, whether or not they have a widget-level On click action.

#### Scenario: Single tab stop

- **WHEN** the menu is open
- **THEN** exactly one `menuitem` has `tabindex="0"` and all others have `tabindex="-1"`

### Requirement: Arrow key navigation between items

While focus is inside a menu, Arrow Down SHALL move focus to the next item and Arrow Up to the previous item of **that menu level only**, wrapping at the ends. Home SHALL move focus to the first item and End to the last. Dividers SHALL be skipped. Arrow keys handled by a nested submenu MUST NOT also move focus in the parent menu.

#### Scenario: Arrow Down moves to next item

- **WHEN** focus is on the first item
- **AND** the user presses Arrow Down
- **THEN** the second item has focus

#### Scenario: Wrap from last to first

- **WHEN** focus is on the last item
- **AND** the user presses Arrow Down
- **THEN** the first item has focus

#### Scenario: Skip divider

- **WHEN** a divider sits between item A and item B and focus is on item A
- **AND** the user presses Arrow Down
- **THEN** item B has focus

#### Scenario: Home and End

- **WHEN** focus is on any item
- **AND** the user presses End
- **THEN** the last item has focus
- **WHEN** the user presses Home
- **THEN** the first item has focus

### Requirement: Visible focus indicator

The focused menu item SHALL show a visible focus indicator during keyboard navigation, with at least 3:1 contrast against adjacent colors (WCAG 2.4.7 / 1.4.11) in the default Atlas theme.

#### Scenario: Indicator follows arrow navigation

- **WHEN** the user moves focus between items with the arrow keys
- **THEN** the focused item shows a visible focus indicator and the previously focused item no longer does

### Requirement: Keyboard activation of items

Enter or Space on a focused item SHALL activate it the same way a mouse click on the item does. If the item has a widget-level On click action, that action SHALL be executed (respecting `canExecute`). Custom item content is treated as a black box: keyboard activation MUST NOT forward to, inspect, or activate elements inside the item's content. After activation, "Close on" SHALL be respected the same way it is for mouse clicks.

Interactive elements inside custom item content (buttons, links, inputs, containers with their own action) are not part of arrow-key navigation and are not activated by Enter/Space on the item. This is a known limitation and out of scope for this change.

When an item's action moves focus out of the menu (e.g. opens a dialog), the menu SHALL close regardless of "Close on", for both keyboard and mouse activation.

#### Scenario: Basic item action via Enter

- **WHEN** focus is on a basic item with an On click action
- **AND** the user presses Enter
- **THEN** the item's action is executed once

#### Scenario: Basic item action via Space

- **WHEN** focus is on a basic item with an On click action
- **AND** the user presses Space
- **THEN** the item's action is executed once and the page does not scroll

#### Scenario: Custom item with widget-level action

- **WHEN** advanced mode is on and focus is on a custom item whose action is configured on the Pop-up Menu widget
- **AND** the user presses Enter
- **THEN** the widget-level action is executed once

#### Scenario: Custom item without widget-level action

- **WHEN** advanced mode is on and a custom item has no widget-level action but its content contains a button with its own On click action
- **AND** the user presses Enter while that item has focus
- **THEN** no action is executed and the inner button is not activated
- **AND** "Close on" is respected as for a mouse click on the item

#### Scenario: Close on click anywhere

- **WHEN** "Close on" is "Click anywhere"
- **AND** the user activates an item with the keyboard
- **THEN** the menu closes and focus returns to the trigger element

#### Scenario: Close on click outside

- **WHEN** "Close on" is "Click outside"
- **AND** the user activates an item with the keyboard
- **THEN** the menu stays open and focus stays on the activated item

#### Scenario: Action that moves focus closes the menu

- **WHEN** "Close on" is "Click outside"
- **AND** the user activates an item, with the keyboard or the mouse, whose action opens a dialog
- **THEN** the menu closes once the dialog takes focus

### Requirement: Mouse behavior is preserved

Mouse click and hover behavior of the trigger and items SHALL remain unchanged, including nested Pop-up Menus placed inside custom items. The exceptions are focus placement on click open (see trigger-keyboard-interaction) and closing when an item's action moves focus (see Keyboard activation of items).

#### Scenario: Mouse click on item

- **WHEN** the user clicks a basic item with the mouse
- **THEN** its action is executed once and "Close on" is respected as before

#### Scenario: Hover open still works

- **WHEN** "Open on" is "Hover" and the pointer enters the trigger
- **THEN** the menu opens as before
