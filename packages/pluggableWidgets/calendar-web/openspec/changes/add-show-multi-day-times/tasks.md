## 1. Property definition

- [x] 1.1 Add `showMultiDayTimes` boolean property (defaultValue `false`) with caption and description to `src/Calendar.xml` in the week/day view group
- [x] 1.2 Regenerate typings: `showMultiDayTimes: boolean` in `CalendarContainerProps` and `CalendarPreviewProps` (`typings/CalendarProps.d.ts`)

## 2. Implementation

- [x] 2.1 Pass `showMultiDayTimes: this.props.showMultiDayTimes` through to the calendar props in `CalendarPropsBuilder.build`
- [x] 2.2 Add `eventTimeRangeStartFormat` (`"<start> – "`) and `eventTimeRangeEndFormat` (`" – <end>"`) using the same configured time pattern as `eventTimeRangeFormat`
- [x] 2.3 When `showEventDate?.value === false`, blank `eventTimeRangeStartFormat` and `eventTimeRangeEndFormat` alongside the existing `eventTimeRangeFormat`

## 3. Tests

- [x] 3.1 Test `showMultiDayTimes=true`/`false` is passed through to calendar props
- [x] 3.2 Test start/end formats use the configured time pattern with the correct leading/trailing separator; and are unset when no time format is configured
- [x] 3.3 Test `showEventDate=false` blanks range/start/end formats; `showEventDate=true` preserves them
- [x] 3.4 Update the Calendar snapshot for the new `data-show-multi-day-times` (and `data-min`/`data-max`) attributes

## 4. Verification

- [x] 4.1 `calendar-web` unit suite passes
- [x] 4.2 Add user-facing changelog entry (new `showMultiDayTimes` property)
- [x] 4.3 `/code-review` before merge; PR ready (⚠️ Approved with suggestions — low-severity only, no medium/high findings)

## Notes

- Change is additive; default `false` preserves existing all-day rendering for multi-day events.
- Version bump deferred to release time per repo convention.
