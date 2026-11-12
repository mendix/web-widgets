# tooltip-keyboard-access Specification

## Purpose

Keyboard users can open the tooltip with the default settings and in Click mode, following the Deque tooltip pattern (WC-3663). Hover stays a mouse-only option.

## Requirements

### Requirement: New widgets open on hover and focus by default

The default value of **Open on** SHALL be `Hover,focus`. A widget that already has a stored **Open on** value SHALL keep it.

#### Scenario: Add a new Tooltip

- **WHEN** an app developer adds a new Tooltip widget to a page
- **THEN** **Open on** is `Hover,focus`

#### Scenario: Existing widget set to Hover

- **WHEN** an app that has a Tooltip with **Open on** set to `Hover` updates to this widget version
- **THEN** the widget keeps `Hover` and opens on mouse hover only

### Requirement: Hover,focus opens on keyboard focus

When **Open on** is `Hover,focus`, the widget SHALL open the tooltip when an element inside the trigger receives focus, and SHALL keep it open while focus stays inside the trigger. Focus SHALL stay on the trigger element. Moving focus out of the trigger SHALL close the tooltip.

#### Scenario: Tab to a button

- **WHEN** **Open on** is `Hover,focus` and the user presses Tab until a button inside the trigger has focus
- **THEN** the tooltip opens, and focus stays on the button

#### Scenario: Tab to a text box

- **WHEN** **Open on** is `Hover,focus` and the user tabs into a text box inside the trigger and types
- **THEN** the tooltip opens and stays open while the user types

#### Scenario: Custom content

- **WHEN** the render method is `custom`, **Open on** is `Hover,focus`, and a button inside the trigger receives focus
- **THEN** the tooltip shows the custom content, and focus doesn't move into the tooltip

#### Scenario: Tab past the trigger

- **WHEN** the tooltip is open because its trigger has focus, and the user presses Tab to move focus past the trigger
- **THEN** the tooltip closes

### Requirement: Hover opens on mouse hover only

When **Open on** is `Hover`, the widget SHALL open and close the tooltip on pointer enter and leave, and SHALL NOT open it on focus.

#### Scenario: Hover with the mouse

- **WHEN** **Open on** is `Hover` and the pointer enters the trigger
- **THEN** the tooltip opens, and it closes when the pointer leaves the trigger and the tooltip

#### Scenario: Tab to the trigger

- **WHEN** **Open on** is `Hover` and the user tabs to a button inside the trigger
- **THEN** the tooltip stays closed

### Requirement: Escape dismisses the tooltip without moving focus

In every **Open on** mode, the widget SHALL close an open tooltip when the user presses Escape, and focus SHALL stay on the element that had it.

#### Scenario: Escape while the trigger has focus

- **WHEN** a tooltip is open and a button inside its trigger has focus, and the user presses Escape
- **THEN** the tooltip closes and the button keeps focus

#### Scenario: Escape doesn't reopen on the same focus

- **WHEN** the user closed a `Hover,focus` tooltip with Escape and the trigger still has focus
- **THEN** the tooltip stays closed until focus leaves and returns, or the pointer hovers the trigger

### Requirement: Click mode works with the mouse and the keyboard

When **Open on** is `Click`, the widget SHALL toggle the tooltip on a mouse click inside the trigger, and when the user presses Enter or Space on a button or link inside the trigger. This SHALL also work when that element doesn't dispatch a native `click` event for the key, or stops propagation of the event. The widget SHALL NOT stop propagation or prevent default, so the trigger's own action runs. A single activation SHALL toggle the tooltip once. Enter and Space typed in a text input inside the trigger SHALL NOT toggle the tooltip. Focus alone SHALL NOT open the tooltip in Click mode.

#### Scenario: Enter on a Mendix action button

- **WHEN** **Open on** is `Click`, a Mendix action button inside the trigger has focus, and the user presses Enter
- **THEN** the tooltip opens

#### Scenario: Space on a Mendix action button

- **WHEN** **Open on** is `Click`, a Mendix action button inside the trigger has focus, and the user presses Space
- **THEN** the tooltip opens

#### Scenario: Button action still runs

- **WHEN** **Open on** is `Click`, the trigger is a Mendix action button whose action shows a hidden container, and the user clicks it or presses Enter or Space on it
- **THEN** the tooltip toggles and the container is shown, each once per activation

#### Scenario: Trigger stops event propagation

- **WHEN** **Open on** is `Click` and the trigger element stops propagation of `click` and `keydown`, as a Mendix action button with an action does
- **THEN** a mouse click, Enter and Space still toggle the tooltip

#### Scenario: Native button doesn't double toggle

- **WHEN** **Open on** is `Click`, a native button that dispatches `click` for Enter has focus, and the user presses Enter
- **THEN** the tooltip opens and stays open

#### Scenario: Second key press closes

- **WHEN** a Click-mode tooltip is open and the user presses Enter again on the same button
- **THEN** the tooltip closes

#### Scenario: Typing in a text input

- **WHEN** **Open on** is `Click` and the user types a space or presses Enter in a text input inside the trigger
- **THEN** the tooltip doesn't change state

#### Scenario: Focus only

- **WHEN** **Open on** is `Click` and the user tabs to a button inside the trigger
- **THEN** the tooltip stays closed

### Requirement: Screen reader output is unchanged

Opening the tooltip by keyboard in Click mode SHALL NOT add live-region announcements, and SHALL NOT change the accessible name or description of the trigger elements.

#### Scenario: Enter opens a Click tooltip

- **WHEN** a screen reader user presses Enter on a button inside a `Click` trigger
- **THEN** the button's accessible name and description are the same as before this change, and the tooltip content isn't announced twice
