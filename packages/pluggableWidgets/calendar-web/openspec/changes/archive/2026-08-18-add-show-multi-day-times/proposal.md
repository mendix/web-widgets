## Why

In the Calendar widget's week and day views, `react-big-calendar` places any event that
spans more than one day into the top "all-day" row, hiding its start and end times. For
apps where multi-day events have meaningful times (e.g. a booking that starts at 22:00 on
one day and ends at 02:00 the next), authors need those events rendered as timed blocks in
the time grid, showing their start/end times, instead of being flattened into the all-day
row.

`react-big-calendar` already exposes a `showMultiDayTimes` flag for exactly this, but the
Calendar widget did not surface it, so authors had no way to opt in.

## What Changes

Add a `showMultiDayTimes` boolean property (default `false`) to the Calendar widget and pass
it through to `react-big-calendar`. When enabled, multi-day events render in the time grid
with their start/end times in week and day views. To make those times readable on the
event blocks, the widget also supplies `eventTimeRangeStartFormat` and
`eventTimeRangeEndFormat` derived from the widget's configured time format, and keeps them
consistent with the existing `eventTimeRangeFormat` and `showEventDate` behavior.

- `src/Calendar.xml` — add `showMultiDayTimes` boolean property (defaultValue `false`) in
  the week/day view group, with caption and description.
- `typings/CalendarProps.d.ts` — add `showMultiDayTimes: boolean` to the container props and
  `showMultiDayTimes: boolean` to the preview props (generated typings).
- `src/helpers/CalendarPropsBuilder.ts`:
    - Pass `showMultiDayTimes: this.props.showMultiDayTimes` through to the calendar props.
    - Add `eventTimeRangeStartFormat` (`"<start> – "`) and `eventTimeRangeEndFormat`
      (`" – <end>"`) using the same configured time pattern as `eventTimeRangeFormat`.
    - When `showEventDate` is `false`, blank out `eventTimeRangeStartFormat` and
      `eventTimeRangeEndFormat` alongside the existing `eventTimeRangeFormat`.
- Unit tests + snapshot update for the above.
- User-facing changelog entry.

## Impact

- **Consumers:** Purely additive. The default is `false`, which preserves the existing
  behavior (multi-day events stay in the all-day row), so existing apps are unaffected. Not
  breaking.
- **Must NOT break:** `showEventDate=false` must continue to hide all event time ranges,
  including the new start/end formats; existing single-day timed event rendering and the
  existing `eventTimeRangeFormat` behavior are unchanged.
- **Users:** Authors can opt in to see start/end times for multi-day events in week and day
  views. Version bump deferred to release time per repo convention.
