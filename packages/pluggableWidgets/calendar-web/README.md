# Calendar

Calendar

## Overview

- **Folder**: `calendar-web`
- **Category**: Display
- **Offline capable**: Yes
- **Reference**: [Mendix documentation](https://docs.mendix.com/appstore/widgets/calendar)

## XML Properties

### Data source

- **Events** (`databaseDataSource`; type: datasource, optional, list).
- **Title type** (`titleType`; type: enumeration, default: attribute). Choose between an attribute or an expression for the title Allowed values: `attribute` (Attribute), `expression` (Expression).
- **Title attribute** (`titleAttribute`; type: attribute, optional, data source: databaseDataSource). Select an attribute that contains the event title Attribute types: String.
- **Title expression** (`titleExpression`; type: expression, optional, data source: databaseDataSource). Expression that results in the event title Returns: String.
- **All day attribute** (`allDayAttribute`; type: attribute, optional, data source: databaseDataSource). Attribute types: Boolean.
- **Start attribute** (`startAttribute`; type: attribute, optional, data source: databaseDataSource). Attribute types: DateTime.
- **End attribute** (`endAttribute`; type: attribute, optional, data source: databaseDataSource). Attribute types: DateTime.
- **Color attribute** (`eventColor`; type: attribute, optional, data source: databaseDataSource). Attribute containing a valid HTML color eg: red #FF0000 rgb(250,10,20) rgba(10,10,10, 0.5) Attribute types: Enum, String.

### Options

- **Editable** (`editable`; type: expression, default: true). Returns: Boolean.
- **View** (`view`; type: enumeration, default: standard). Standard has day, week and month Allowed values: `standard` (Standard), `custom` (Custom).
- **Initial selected view** (`defaultViewStandard`; type: enumeration, default: month). The default view showed when the calendar is loaded Allowed values: `day` (Day), `week` (Week), `month` (Month), `year` (Year).
- **Initial selected view** (`defaultViewCustom`; type: enumeration, default: month). The default view showed when the calendar is loaded Allowed values: `day` (Day), `week` (Week), `month` (Month), `work_week` (Work week), `agenda` (Agenda), `year` (Year).
- **Year view: day click opens** (`yearDayClickViewStandard`; type: enumeration, default: day). Which view opens when a day is clicked in the Year view. Allowed values: `day` (Day), `week` (Week), `month` (Month).
- **Year view: day click opens** (`yearDayClickViewCustom`; type: enumeration, default: day). Which view opens when a day is clicked in the Year view. Only applies if that view is enabled via a toolbar item; otherwise clicking a day does nothing. Allowed values: `day` (Day), `week` (Week), `work_week` (Work week), `month` (Month), `agenda` (Agenda).
- **Show event date range** (`showEventDate`; type: expression, default: true). Show the start and end date of the event Returns: Boolean.
- **Time format** (`timeFormat`; type: textTemplate, optional). Default time format is "hh:mm a"
- **Top bar date format** (`topBarDateFormat`; type: textTemplate, optional). Format used for the title in the toolbar across views. Defaults to a locale-aware format.
- **Day start hour** (`minHour`; type: integer, default: 0). The hour at which the day view starts (0–23)
- **Day end hour** (`maxHour`; type: integer, default: 24). The hour at which the day view ends (1–24)
- **Show all events** (`showAllEvents`; type: boolean, default: true). Auto-adjust calendar height to display all events without "more" links
- **Show multi-day times** (`showMultiDayTimes`; type: boolean, default: false). Show start and end times for events that span multiple days in the week and day views instead of placing them in the all-day row
- **Step** (`step`; type: integer, default: 30). Determines the selectable time increments in week and day views
- **Time slots** (`timeslots`; type: integer, default: 1). The number of slots per "section" in the time grid views. Adjust with step to change the default of 1 hour long groups, with 30 minute slots
- **Start date attribute** (`startDateAttribute`; type: attribute, optional). The DateTime attribute used on initial load Attribute types: DateTime.

### Toolbar

- **Custom top bar views** (`toolbarItems`; type: object, optional, list). Configure items displayed in the calendar toolbar.
- **Item** (`itemType`; type: enumeration, default: month). Select which item to render on the toolbar. Allowed values: `day` (Day view button), `month` (Month view button), `agenda` (Agenda view button), `week` (Week view button), `work_week` (Work week view button), `year` (Year view button), `title` (Title date text), `previous` (Previous button), `next` (Next button), `today` (Today button).
- **Position** (`position`; type: enumeration, default: left). Align the item within the toolbar. Allowed values: `left` (Left), `center` (Center), `right` (Right).
- **Caption** (`caption`; type: textTemplate, optional). Optional text for the button or title. If empty, a default localized label is used.
- **Render mode** (`renderMode`; type: enumeration, default: button). Choose how the item is rendered. Allowed values: `button` (Button), `link` (Link).
- **Button tooltip** (`buttonTooltip`; type: textTemplate, optional). Tooltip for the button.
- **Button style** (`buttonStyle`; type: enumeration, default: default). Style of the button. Allowed values: `default` (Default), `primary` (Primary), `success` (Success), `info` (Info), `warning` (Warning), `danger` (Danger).
- **Header day format** (`customViewHeaderDayFormat`; type: textTemplate, optional). Format of date(s) in the header above the day, week, month, custom or Agenda view.
- **Cell date format** (`customViewCellDateFormat`; type: textTemplate, optional). Date shown in the month cells.
- **Time gutter format** (`customViewGutterTimeFormat`; type: textTemplate, optional). Time shown as the first column in the week, day and agenda view.
- **Date gutter format** (`customViewGutterDateFormat`; type: textTemplate, optional). Date shown as the first column in the agenda view.
- **All day text** (`customViewAllDayText`; type: textTemplate, optional). Text shown in the all day column.
- **Text header date** (`customViewTextHeaderDate`; type: textTemplate, optional). Text showing in the agenda view to header in the column date.
- **Text header time** (`customViewTextHeaderTime`; type: textTemplate, optional). Text showing in the agenda view to header in the column time.
- **Text header event** (`customViewTextHeaderEvent`; type: textTemplate, optional). Text showing in the agenda view to header in the column event.

### Custom view visible days

- **Monday** (`customViewShowMonday`; type: boolean, default: true). Show Monday in the custom week view
- **Tuesday** (`customViewShowTuesday`; type: boolean, default: true). Show Tuesday in the custom week view
- **Wednesday** (`customViewShowWednesday`; type: boolean, default: true). Show Wednesday in the custom week view
- **Thursday** (`customViewShowThursday`; type: boolean, default: true). Show Thursday in the custom week view
- **Friday** (`customViewShowFriday`; type: boolean, default: true). Show Friday in the custom week view
- **Saturday** (`customViewShowSaturday`; type: boolean, default: false). Show Saturday in the custom week view
- **Sunday** (`customViewShowSunday`; type: boolean, default: false). Show Sunday in the custom week view

- **On edit** (`onEditEvent`; type: action, optional, data source: databaseDataSource).
- **On create** (`onCreateEvent`; type: action, optional). The create event is triggered when a time slot is selected, and the 'Enable create' property is set to 'true'
- **On drag/drop/resize** (`onDragDropResize`; type: action, optional, data source: databaseDataSource). The change event is triggered on moving/dragging an item or changing the start or end time of by resizing an item
- **On view range change** (`onViewRangeChange`; type: action, optional). Triggered when the calendar view range (start/end) changes
- **Width unit** (`widthUnit`; type: enumeration, default: percentage). Allowed values: `pixels` (Pixels), `percentage` (Percentage).
- **Width** (`width`; type: integer, default: 100).
- **Height unit** (`heightUnit`; type: enumeration, default: pixels). Allowed values: `percentageOfWidth` (Auto), `pixels` (Pixels), `percentageOfParent` (Percentage), `percentageOfView` (Viewport).
- **Height** (`height`; type: integer, default: 580).
- **Minimum height unit** (`minHeightUnit`; type: enumeration, default: pixels). Allowed values: `none` (None), `pixels` (Pixels), `percentageOfParent` (Percentage), `percentageOfView` (Viewport).
- **Minimum height** (`minHeight`; type: integer, default: 250).
- **Maximum height unit** (`maxHeightUnit`; type: enumeration, default: none). Allowed values: `none` (None), `pixels` (Pixels), `percentageOfParent` (Percentage), `percentageOfView` (Viewport).
- **Maximum height** (`maxHeight`; type: integer, default: 250).
- **Vertical overflow** (`overflowY`; type: enumeration, default: auto). Allowed values: `auto` (Auto), `scroll` (Scroll), `hidden` (Hidden).

## Additional Notes

<!-- TODO: Update marketplace URL -->

Please see [Calendar](https://docs.mendix.com/appstore/widgets/) in the Mendix documentation for details.
