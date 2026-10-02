## ADDED Requirements

### Requirement: Keyboard opens the menu from the trigger

Trigger content is treated as a black box. It is assumed to be focusable and to let key events propagate to the trigger. Under that assumption, when focus is on the trigger content, the widget SHALL open the menu in response to Enter, Space, Arrow Down and Arrow Up, in both "Open on: Click" and "Open on: Hover" modes. This SHALL hold even if the content calls `preventDefault()` on the key event. The widget MUST NOT inspect or modify the trigger content. A single key press SHALL open the menu exactly once. It MUST NOT open and immediately close it, for example because of a follow-up synthetic click.

#### Scenario: Enter opens the menu

- **WHEN** the trigger content has keyboard focus and the menu is closed
- **AND** the user presses Enter
- **THEN** the menu opens

#### Scenario: Space opens the menu

- **WHEN** the trigger content has keyboard focus and the menu is closed
- **AND** the user presses Space
- **THEN** the menu opens and the page does not scroll

#### Scenario: Arrow Down opens the menu

- **WHEN** the trigger content has keyboard focus and the menu is closed
- **AND** the user presses Arrow Down
- **THEN** the menu opens

#### Scenario: Content prevents default but propagates

- **WHEN** the trigger content is a button whose keydown handler calls `preventDefault()` on Enter/Space and lets the event propagate (e.g. a Mendix Action Button without an action)
- **AND** the user presses Enter or Space while it has focus
- **THEN** the menu opens

#### Scenario: Native button trigger does not double-toggle

- **WHEN** the trigger content is a native `<button>`
- **AND** the user presses Enter or Space while it has focus
- **THEN** the menu is open after the key press completes

#### Scenario: Hover-mode menu opens from keyboard

- **WHEN** "Open on" is set to "Hover" and the trigger content has keyboard focus
- **AND** the user presses Enter, Space or Arrow Down
- **THEN** the menu opens

### Requirement: Focus moves into the menu on keyboard open

When the menu is opened from the keyboard, focus SHALL move into the menu. Enter, Space and Arrow Down SHALL focus the first enabled item. Arrow Up SHALL focus the last enabled item.

#### Scenario: Focus first item

- **WHEN** the user opens the menu with Enter, Space or Arrow Down
- **THEN** the first menu item has focus

#### Scenario: Focus last item

- **WHEN** the user opens the menu with Arrow Up
- **THEN** the last menu item has focus

#### Scenario: Dividers are skipped for initial focus

- **WHEN** the first configured basic item is a divider
- **AND** the user opens the menu with Arrow Down
- **THEN** the first non-divider item has focus

### Requirement: Pointer opening places focus

When the menu is opened by clicking the trigger ("Open on: Click"), focus SHALL move to the first enabled item. When the menu is opened by hovering ("Open on: Hover"), focus MUST NOT move. The user can reach the items by pressing Tab or Arrow Down from the trigger.

#### Scenario: Click open focuses first item

- **WHEN** "Open on" is "Click"
- **AND** the user clicks the trigger
- **THEN** the menu opens and the first item has focus

#### Scenario: Hover open does not steal focus

- **WHEN** "Open on" is "Hover" and focus is on the trigger
- **AND** the pointer enters the trigger and the menu opens
- **THEN** focus stays on the trigger
- **WHEN** the user presses Tab
- **THEN** the first menu item has focus

### Requirement: Escape closes the menu containing focus

Escape SHALL close the menu that contains focus. At the top-level menu, it SHALL return focus to the focusable element inside the trigger that had focus before opening. Escape pressed while focus is on the trigger with the menu open SHALL close the menu and keep focus on the trigger. Escape pressed while focus is outside the widget (trigger and menu) MUST NOT close the menu and MUST NOT move focus. Escape handled by the menu MUST NOT propagate to other Escape handlers (e.g. a Mendix pop-up page).

#### Scenario: Escape returns focus to trigger

- **WHEN** the top-level menu is open and focus is on one of its items
- **AND** the user presses Escape
- **THEN** the menu closes
- **AND** the trigger element that had focus before opening has focus

#### Scenario: Escape on trigger closes

- **WHEN** the menu is open and focus is on the trigger
- **AND** the user presses Escape
- **THEN** the menu closes and focus stays on the trigger

#### Scenario: Escape with focus outside the widget

- **WHEN** the menu is open and focus is on an element outside the widget
- **AND** the user presses Escape
- **THEN** the menu stays open and focus doesn't move

#### Scenario: Escape inside a menu on a pop-up page

- **WHEN** the widget is on a Mendix pop-up page and focus is on a menu item
- **AND** the user presses Escape
- **THEN** only the menu closes, not the pop-up page

### Requirement: Enter/Space on trigger toggles

Pressing Enter or Space on the trigger while the menu is open SHALL close it and keep focus on the trigger.

#### Scenario: Toggle closed

- **WHEN** the menu is open and focus is on the trigger
- **AND** the user presses Enter
- **THEN** the menu closes

### Requirement: Tab closes the menu and moves on

Tab and Shift+Tab SHALL NOT move focus between menu items. This includes native focusable elements inside custom item content. When focus is inside the menu, Tab SHALL close the entire menu hierarchy and move focus to the next element in the page tab order after the widget. Shift+Tab SHALL close the entire menu hierarchy and move focus to the previous element in the tab order, which is the trigger element.

#### Scenario: Tab leaves the menu

- **WHEN** the menu is open and focus is on a menu item
- **AND** the user presses Tab
- **THEN** the menu closes
- **AND** focus moves to the next focusable element after the widget in page order

#### Scenario: Tab does not stop on content inside an item

- **WHEN** advanced mode is on and a custom item contains a native `<button>`
- **AND** focus is on that item
- **AND** the user presses Tab
- **THEN** the menu closes and focus moves past the widget, not onto the inner button

#### Scenario: Shift+Tab returns to trigger

- **WHEN** the menu is open and focus is on a menu item
- **AND** the user presses Shift+Tab
- **THEN** the menu closes and the trigger element has focus

#### Scenario: Shift+Tab from a submenu closes every level

- **WHEN** a submenu is open and focus is on one of its items
- **AND** the user presses Shift+Tab
- **THEN** the submenu and all its parent menus close
- **AND** the root trigger element has focus
- **AND** focus does not stop on the parent menu item while the submenu stays open

#### Scenario: Clicking the trigger still toggles the menu

- **WHEN** the menu was opened by click and focus is on a menu item
- **AND** the user clicks the trigger again
- **THEN** the menu closes and does not reopen

### Requirement: Trigger exposes popup state to assistive technology

The trigger wrapper SHALL expose `aria-haspopup="menu"`, `aria-expanded` (`true`/`false`) and, while open, `aria-controls` referencing the menu. The menu SHALL be labelled by the trigger wrapper via `aria-labelledby`. The widget MUST NOT add attributes to elements inside the trigger content.

#### Scenario: Expanded state reflects visibility

- **WHEN** the menu is closed
- **THEN** the trigger wrapper has `aria-haspopup="menu"` and `aria-expanded="false"`
- **WHEN** the menu is opened
- **THEN** it has `aria-expanded="true"` and `aria-controls` referencing the menu element id

#### Scenario: Menu has accessible name

- **WHEN** the menu is open
- **THEN** the menu has `aria-labelledby` referencing the trigger wrapper
