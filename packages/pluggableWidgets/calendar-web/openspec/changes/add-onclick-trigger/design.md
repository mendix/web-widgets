## Context

`useCalendarEvents.ts` handles event clicks with a single shared `clickRef` timer:

- `handleSelectEvent` (RBC `onSelectEvent`): on click, if a timer is already pending it's cleared; then a new 250ms timer is armed. When it fires, if the clicked event matches the currently `selected` event, `invokeEdit` runs; otherwise the event just becomes `selected`.
- `handleDoubleClickEvent` (RBC `onDoubleClickEvent`): clears the pending timer and re-arms a 250ms timer that unconditionally calls `invokeEdit`.

This means a single click never edits on its own — it takes two single clicks on the same event (500ms+ apart is fine, but both within the widget's lifetime) or a real double-click. Datagrid-web solves the equivalent ambiguity with an explicit `onClickTrigger` enum (`single`/`double`) read by `ClickEventSwitch` in `widget-plugin-grid`, and only arms the delay/disambiguation logic when the trigger is `double`.

## Goals / Non-Goals

**Goals:**

- Let app builders choose `single` so one click on an event fires `onEditEvent` immediately.
- Preserve today's behavior exactly when the property is left at its default (`double`).
- Reuse the existing `invokeEdit`/`selected` plumbing — no new state shape.

**Non-Goals:**

- Reusing widget-plugin-grid's `ClickEventSwitch` class directly — it's designed around row/cell datasource clicks, not RBC's `CalendarEvent` shape and `onSelectEvent`/`onDoubleClickEvent`/`onKeyPressEvent` triad. We port the _pattern_ (an enum gating the disambiguation delay), not the shared code.
- Changing `onCreateEvent` slot-click behavior (the "click empty slot after selecting an event just deselects" quirk noted during investigation) — out of scope for this change, tracked separately.
- Adding a `single`/`double` choice for drag/resize or keyboard interactions — Enter-to-edit on a selected event is unaffected.

## Decisions

- **New property name: `onClickTrigger`.** Matches `Datagrid.xml`'s existing enum name/values (`single`/`double`) exactly, so the concept is instantly recognizable to anyone who has configured a data grid. Alternative considered: a boolean `editOnSingleClick` — rejected because the enum leaves room to document "double" explicitly and mirrors the sibling widget's convention.
- **Default value `double`.** No behavior change for existing apps on upgrade; this is additive, not breaking.
- **Branch inside `handleSelectEvent`, not a new handler.** When `onClickTrigger === "single"`, call `invokeEdit(event)` directly (no timer) and still call `setSelected(event)` so keyboard Enter-to-edit and visual selection stay consistent. When `"double"`, keep the existing 250ms-timer logic unchanged.
- **`handleDoubleClickEvent` must bail out in `single` mode.** RBC fires `onSelectEvent` _before_ `onDoubleClickEvent`, so in `single` mode a genuine double-click would invoke `onEditEvent` twice: once synchronously from the first click, then again 250ms later from the double-click handler. The double-click handler therefore returns early when `onClickTrigger === "single"` — the edit has already fired. (This corrects an earlier assumption that the handler needed no changes.)

## Risks / Trade-offs

- [Risk] Apps that rely on the current "click once to preview/select without opening edit" behavior (e.g., a microflow on select that shows a read-only panel) would break if they switched to `single` expecting only edit-suppression. → Mitigation: default stays `double`; `single` is opt-in, and the property description in `Calendar.xml` should state plainly that single-click will invoke `onEditEvent` with no selection-only step.
- [Risk] Property name collision or confusion with `onClickTrigger` in Datagrid if a future shared abstraction is built. → Mitigation: none needed now; naming consistency is the explicit goal.

## Migration Plan

Additive property with a safe default — no migration steps required for existing apps. New Studio Pro property appears under the "Events" group in `Calendar.xml`, defaulting to `Double click`.
