## ADDED Requirements

### Requirement: Configurable click trigger for editing events

The Calendar widget SHALL expose an `onClickTrigger` enumeration property with values `single` and `double`, defaulting to `double`, that controls how many clicks on an event are needed to invoke the `On edit` action.

#### Scenario: Default behavior is unchanged

- **WHEN** `onClickTrigger` is left at its default value (`double`) and the user clicks once on an event
- **THEN** the event becomes selected and `onEditEvent` is not invoked

#### Scenario: Second click on selected event edits (default mode)

- **WHEN** `onClickTrigger` is `double`, the user has already selected an event, and clicks the same event again
- **THEN** `onEditEvent` is invoked for that event

#### Scenario: Double-click edits regardless of mode

- **WHEN** the user performs a genuine double-click on an event, in either `single` or `double` mode
- **THEN** `onEditEvent` is invoked for that event exactly once

### Requirement: Single click invokes edit when configured

When `onClickTrigger` is set to `single`, a single click on an event SHALL invoke `onEditEvent` immediately, without waiting for a second click.

#### Scenario: Single click edits immediately

- **WHEN** `onClickTrigger` is `single` and the user clicks once on an event
- **THEN** `onEditEvent` is invoked for that event without delay, and the event becomes selected

#### Scenario: Keyboard edit still works alongside single-click mode

- **WHEN** `onClickTrigger` is `single`, an event is selected, and the user presses Enter on that event
- **THEN** `onEditEvent` is invoked for that event
