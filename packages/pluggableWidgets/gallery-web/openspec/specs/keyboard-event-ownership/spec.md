# Keyboard Event Ownership

## Purpose

Ensure that keyboard events originating from nested interactive elements (inputs, textareas, buttons) within gallery items are handled correctly by those elements rather than being intercepted by gallery-level keyboard handlers.

## Requirements

### Requirement: Keyboard events on gallery items respect event ownership

The gallery widget SHALL only prevent default behavior and stop propagation of SPACE and ENTER keyboard events when they originate directly from the gallery item itself, not from nested interactive elements. Nested elements SHALL be able to respond to keyboard input normally.

#### Scenario: SPACE key on gallery item triggers selection

- **WHEN** user presses SPACE on a gallery item (not a nested element)
- **THEN** the system prevents the browser's default SPACE behavior (page scroll) and triggers the gallery item's action

#### Scenario: SPACE key in nested input allows typing

- **WHEN** user presses SPACE inside a text input nested within a gallery item
- **THEN** the input receives the SPACE character and default browser behavior is NOT prevented

#### Scenario: ENTER key on gallery item triggers activation

- **WHEN** user presses ENTER on a gallery item (not a nested element)
- **THEN** the system triggers the gallery item's click action and prevents default browser behavior

#### Scenario: ENTER key in nested form input submits form

- **WHEN** user presses ENTER inside a form input nested within a gallery item
- **THEN** the input or form can respond to ENTER normally (e.g., form submission, autocomplete) and the gallery item action is NOT triggered

### Requirement: Event ownership determined by event target and current target

The system SHALL determine event ownership by comparing the event's target element with the element that has the event handler attached (`event.target === event.currentTarget`). Only when these match SHALL the event be considered "owned" by the gallery item.

#### Scenario: Event originated on gallery item

- **WHEN** a keyboard event fires on the gallery item element itself
- **THEN** `event.target === event.currentTarget` evaluates to true
- **THEN** the event is treated as owned and default behavior is prevented

#### Scenario: Event bubbled from nested element

- **WHEN** a keyboard event fires on a nested element and bubbles to the gallery item
- **THEN** `event.target !== event.currentTarget` (target is the nested element, currentTarget is the gallery item)
- **THEN** the event is NOT treated as owned and default behavior is NOT prevented by the gallery handler
