## ADDED Requirements

### Requirement: Show multi-day times property

The Calendar widget SHALL expose a `showMultiDayTimes` boolean property (default `false`)
that controls whether events spanning multiple days are rendered as timed blocks (showing
start/end times) in the week and day views instead of being placed in the all-day row.

#### Scenario: Property is available in Studio Pro

- **WHEN** a developer configures the Calendar widget in Studio Pro
- **THEN** a "Show multi-day times" boolean property is available, defaulting to off

#### Scenario: Enabled flag is passed through to the calendar

- **WHEN** `showMultiDayTimes` is set to `true`
- **THEN** the Calendar passes `showMultiDayTimes=true` to `react-big-calendar`, so multi-day
  events render as timed blocks in the week and day views

#### Scenario: Disabled by default preserves all-day rendering

- **WHEN** `showMultiDayTimes` is left at its default (`false`)
- **THEN** the Calendar passes `showMultiDayTimes=false`, and multi-day events continue to be
  placed in the all-day row (existing behavior is unchanged)

### Requirement: Multi-day event time-range formats

When a time format is configured, the Calendar widget SHALL provide
`eventTimeRangeStartFormat` and `eventTimeRangeEndFormat` for `react-big-calendar`, derived
from the same configured time pattern used by `eventTimeRangeFormat`, so the start and end
times of multi-day events are shown in a locale-aware way.

#### Scenario: Start format renders the start time with a trailing separator

- **WHEN** a time format (e.g. `HH:mm`) is configured and `eventTimeRangeStartFormat` is
  called for an event
- **THEN** it returns the event's start time formatted with that pattern, followed by a
  " – " separator

#### Scenario: End format renders the end time with a leading separator

- **WHEN** a time format (e.g. `HH:mm`) is configured and `eventTimeRangeEndFormat` is called
  for an event
- **THEN** it returns the event's end time formatted with that pattern, preceded by a " – "
  separator

#### Scenario: Start, end, and range formats share the same time pattern

- **WHEN** a time format (e.g. `h:mm a`) is configured
- **THEN** `eventTimeRangeFormat`, `eventTimeRangeStartFormat`, and `eventTimeRangeEndFormat`
  all format times using that same pattern

#### Scenario: No time format leaves start/end formats unset

- **WHEN** no time format is configured
- **THEN** the widget does not set `eventTimeRangeStartFormat` or `eventTimeRangeEndFormat`

### Requirement: Show event date hides multi-day time ranges

When `showEventDate` is disabled, the Calendar widget SHALL hide all event time-range labels,
including the multi-day start and end formats, so no times are shown on events.

#### Scenario: showEventDate=false blanks all time-range formats

- **WHEN** `showEventDate` is `false` (with a time format configured)
- **THEN** `eventTimeRangeFormat`, `eventTimeRangeStartFormat`, and `eventTimeRangeEndFormat`
  all return an empty string

#### Scenario: showEventDate=true preserves all time-range formats

- **WHEN** `showEventDate` is `true` (with a time format configured)
- **THEN** `eventTimeRangeFormat`, `eventTimeRangeStartFormat`, and `eventTimeRangeEndFormat`
  all return a non-empty formatted label
