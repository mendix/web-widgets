## Why

Calendar's event click handling currently requires two single clicks (250ms apart) on the same event, or an explicit double-click, before `On edit` fires — a plain first click only selects the event and does nothing visible. Customers report that "only double-click works," which is a valid gap: there is no way to configure a plain single click to open/edit an event, even though the sibling data grid widget already exposes this choice via its `onClickTrigger` property.

## What Changes

- Add a new `onClickTrigger` enumeration property to `Calendar.xml` with values `single` and `double`, matching the pattern already used in `Datagrid.xml`.
- Default value is `double`, preserving current behavior for existing apps (no breaking change).
- When set to `single`, a plain single click on an event invokes `onEditEvent` immediately, without the 250ms select-then-confirm delay.
- When set to `double` (default), existing behavior is unchanged: single click selects, second click or explicit double-click edits.
- Keyboard `Enter`-to-edit behavior on a selected event is unaffected by this property.

## Capabilities

### New Capabilities

- `calendar-click-trigger`: Configurable single-click vs double-click behavior for triggering the edit action on a calendar event.

### Modified Capabilities

(none — no existing specs directory for this widget; event click behavior is being formalized as a new capability, not modifying a documented one)

## Impact

- `src/Calendar.xml` — new `onClickTrigger` property (Events property group, alongside `onEditEvent`).
- `src/helpers/useCalendarEvents.ts` — `handleSelectEvent` branches on `onClickTrigger`; when `single`, calls `invokeEdit` directly instead of arming the 250ms timer.
- `typings/CalendarProps.d.ts` (generated) — regenerated after XML change.
- No changes to `onCreateEvent`, `onDragDropResize`, or drag/resize handling.
- CHANGELOG.md entry under `[Unreleased]`.
