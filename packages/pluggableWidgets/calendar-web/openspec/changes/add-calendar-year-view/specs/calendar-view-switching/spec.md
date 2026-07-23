## ADDED Requirements

### Requirement: Year view is available in Standard mode

The calendar widget SHALL include year view as an option in Standard mode alongside day, week, and month views.

#### Scenario: Standard mode toolbar displays year button

- **WHEN** calendar is configured with view mode set to "Standard"
- **THEN** the toolbar displays four view buttons: Day, Week, Month, and Year

#### Scenario: Year view can be set as default view in Standard mode

- **WHEN** calendar is configured with view mode "Standard" and default view "Year"
- **THEN** the calendar initially displays in year view

#### Scenario: User can switch to year view from any Standard view

- **WHEN** calendar is in Standard mode and currently showing day, week, or month view
- **THEN** user can click the "Year" button in the toolbar to switch to year view

### Requirement: Year view is available in Custom mode

The calendar widget SHALL allow year view to be configured in Custom mode through toolbar items.

#### Scenario: Custom mode can include year view button

- **WHEN** calendar is configured with view mode "Custom" and a toolbar item with type "Year view button"
- **THEN** the toolbar displays the year view button with configurable caption, position, and style

#### Scenario: Year view can be set as default view in Custom mode

- **WHEN** calendar is configured with view mode "Custom" and default view "Year"
- **THEN** the calendar initially displays in year view

#### Scenario: Year view button is omitted when not configured

- **WHEN** calendar is in Custom mode and no toolbar item with type "Year view button" is configured
- **THEN** the year view button does not appear in the toolbar AND year view is not accessible

### Requirement: View switching preserves date context

When switching to or from year view, the calendar SHALL maintain appropriate date context.

#### Scenario: Switching to year view preserves the date's year

- **WHEN** user switches from day/week/month view to year view
- **THEN** year view displays the year of the currently selected date

#### Scenario: Switching from year view after clicking a day

- **WHEN** user clicks a day in year view (which navigates to day view)
- **THEN** day view displays the clicked date

#### Scenario: Switching from year view via toolbar button

- **WHEN** user switches from year view to day/week/month view using toolbar buttons
- **THEN** the target view displays the currently selected date or the first day of the currently displayed year

### Requirement: Year view is enumerated in XML configuration

The calendar widget XML SHALL include "year" as a valid enumeration value for view-related properties.

#### Scenario: Default view Standard enum includes year

- **WHEN** developer configures the calendar widget in Mendix Studio Pro
- **THEN** the "Initial selected view" dropdown for Standard mode includes "Day", "Week", "Month", and "Year" options

#### Scenario: Default view Custom enum includes year

- **WHEN** developer configures the calendar widget in Mendix Studio Pro with Custom mode
- **THEN** the "Initial selected view" dropdown includes "Day", "Week", "Month", "Work week", "Agenda", and "Year" options

#### Scenario: Toolbar item type enum includes year

- **WHEN** developer adds a toolbar item in Custom mode
- **THEN** the "Item" dropdown includes "Year view button" as an option

### Requirement: TypeScript types include year view

The auto-generated TypeScript types SHALL include "year" in all view-related union types.

#### Scenario: DefaultViewStandardEnum includes year

- **WHEN** the widget is built and types are generated
- **THEN** the `DefaultViewStandardEnum` type is `"day" | "week" | "month" | "year"`

#### Scenario: DefaultViewCustomEnum includes year

- **WHEN** the widget is built and types are generated
- **THEN** the `DefaultViewCustomEnum` type is `"day" | "week" | "month" | "work_week" | "agenda" | "year"`

#### Scenario: ItemTypeEnum includes year

- **WHEN** the widget is built and types are generated
- **THEN** the `ItemTypeEnum` type includes `"year"` as one of its values

### Requirement: Year view button renders in toolbar

The toolbar component SHALL render a year view button when year view is enabled.

#### Scenario: Standard mode toolbar renders year button

- **WHEN** calendar is in Standard mode
- **THEN** the toolbar right section includes a "Year" button using the localized message for "year"

#### Scenario: Custom mode toolbar renders configured year button

- **WHEN** calendar is in Custom mode with a year view toolbar item configured with caption "Annual View"
- **THEN** the toolbar renders a button with text "Annual View" at the configured position

#### Scenario: Year view button is highlighted when active

- **WHEN** calendar is displaying year view
- **THEN** the year view button has the "active" CSS class applied

#### Scenario: Clicking year button switches to year view

- **WHEN** user clicks the year view button
- **THEN** the calendar switches to year view using the `onView('year')` callback

### Requirement: View registration integrates year view component

The calendar widget SHALL register the year view component with react-big-calendar's view system.

#### Scenario: Year view is registered in Standard mode

- **WHEN** calendar is in Standard mode and builds visible views
- **THEN** the views object includes `year: YearViewController.getComponent()`

#### Scenario: Year view is registered in Custom mode when configured

- **WHEN** calendar is in Custom mode and a year view toolbar item is configured
- **THEN** the views object includes `year: YearViewController.getComponent()`

#### Scenario: Year view is omitted when not enabled

- **WHEN** calendar is in Custom mode and no year view toolbar item is configured
- **THEN** the views object does NOT include a year property OR sets `year: false`

### Requirement: Year view handles react-big-calendar navigation events

The year view component SHALL implement the required interface for react-big-calendar custom views.

#### Scenario: Year view implements navigate method

- **WHEN** react-big-calendar calls `YearView.navigate(date, action)`
- **THEN** the method returns the appropriate date based on the action (PREV → date - 1 year, NEXT → date + 1 year, TODAY → current date)

#### Scenario: Year view implements title method

- **WHEN** react-big-calendar calls `YearView.title(date, options)`
- **THEN** the method returns a string containing the four-digit year (e.g., "2026")

#### Scenario: Year view implements range method

- **WHEN** react-big-calendar calls `YearView.range(date)`
- **THEN** the method returns an array containing the first and last day of the year ([Jan 1, Dec 31])

### Requirement: Backward compatibility with existing views

Adding year view SHALL NOT break or modify the behavior of existing day, week, month, work_week, or agenda views.

#### Scenario: Existing views render unchanged

- **WHEN** calendar displays day, week, month, work_week, or agenda views
- **THEN** the rendering and behavior remain identical to the previous version without year view

#### Scenario: Existing view switching continues to work

- **WHEN** user switches between day, week, and month views
- **THEN** the view switching behavior is unchanged from the previous version

#### Scenario: Existing Custom mode configurations without year view continue to work

- **WHEN** a calendar is configured in Custom mode without year view toolbar items
- **THEN** the calendar behaves identically to the previous version without year view support
