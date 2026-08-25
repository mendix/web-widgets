## Context

Row/cell interaction in Data Grid 2 is built from `EventCaseEntry` objects (entry + optional filter) that `eventSwitch()` turns into React props. `CellEventsController.getEntries()` collects action handlers, selection handlers and focus-target handlers, then passes everything through `ClickEventSwitch`, which merges the `onClick` and `onDoubleClick` groups into a single synthetic `onClick` prop. Consequence: the browser's own `dblclick` event never drives the double-click action in production, and every double-click decision is made by the switch.

The switch is shared: `gallery-web` uses it for item interaction, so any change lands in both widgets.

## Goals / Non-Goals

Goals:

- One physical click never runs the double click action, regardless of what is inside the cell.
- A real double click still runs it exactly once.
- Custom content keeps working: the label-forwarded click must still reach the checkbox, so the DOM event is not suppressed or `preventDefault`ed.
- Fix at the producer (`ClickEventSwitch`), not at the consumer (per-column workarounds).

Non-Goals:

- Reinstating React's native `onDoubleClick` path for cells. That is a larger refactor of `CellEventsController` and would change which handlers can be filtered.
- Fixing the adjacent defects found while investigating (listed under Follow-ups).
- E2E coverage in `datagrid-web/e2e/`: it needs a new page with a custom-content checkbox column in the shared `testProjects` repo (`datagrid-web/data-widgets-3.0` branch) — a separate change to a separate repo.

## Decisions

### Classify from `MouseEvent.detail`, not from elapsed time

`detail` is the browser-maintained click counter and already honors the OS double-click interval, which a hard-coded 320 ms cannot. `1` → click entries, `2` → double click entries, `0` → neither (keyboard activation and `element.click()` report 0), `> 2` → neither (the double click group already ran at 2).

Alternatives rejected:

- Keep the timer, widen/narrow the window: no window works. The forwarded label click arrives with the _same_ timestamp, so any window that treats "two clicks close together" as a double click misfires.
- Listen to the native `dblclick` event instead: would require restructuring `CellEventsController`'s entry folding, and the entries' filters are written against a single `onClick` context.
- Ignore clicks whose `target !== currentTarget`: would break clicking custom content deliberately, and would not fix the plain-cell 1-2-1-2 reset defect.

### Collapse duplicates inside one gesture with a small time window

`detail` alone is insufficient: both events of a label click carry `detail: 1`, so with classification only, a single label click would run the click entries **twice** — breaking `onClickTrigger = "single"` grids and double-selecting rows.

Rule: ignore a click whose `detail` equals the previously handled click's `detail` and whose `timeStamp` is within `sameGestureWindow = 5` ms.

Why 5 ms is safe where 320 ms was not: a genuinely separate fast click carries a _different_ `detail` (1 then 2), so the guard cannot swallow it. The window only has to absorb dispatch jitter between two events of the same gesture — measured 0 ms in Chromium (identical `timeStamp`) and ~1 ms in jsdom.

### State lives in the closure returned by `getClickEntry()`

That closure is created per `DataCell` (`useMemo` on `[item, eventsController]`). Label forwarding happens within one cell, so per-cell state is the right granularity; module-level state would leak across rows and columns.

## Risks / Trade-offs

- Third and further clicks of a rapid gesture (`detail >= 3`) now run nothing. Previously they alternated click/double-click due to the `startTime = 0` reset. This is the intended shape, but it is a behavior change for triple-click users.
- `detail === 0` clicks are now ignored. This intentionally stops keyboard activation of a control inside custom content from firing the row action; it also means a programmatic `element.click()` no longer triggers row actions, which some custom JS snippets might have relied on.
- The 5 ms window is empirical. If a browser ever dispatches a label-forwarded click more than 5 ms after the original, the single-click action would run twice again. Chromium dispatches both in the same task with an identical timestamp.

## Migration Plan

None. Internal behavior change, no API or XML surface. Apps using `allowEventPropagation = false` as a workaround keep working; they can turn row events back on.

## Open Questions

Follow-ups found while investigating, deliberately out of scope:

1. `allowEventPropagation: false` only stops `onClick` / `onKeyUp` / `onKeyDown` on `.td-custom-content` (`src/helpers/state/column/ColumnStore.tsx`). `onMouseDown` (which calls `removeAllRanges()`, clearing text selection) and `onFocus` (which moves the keyboard focus target) still fire from inside custom content.
2. `canExecOnSpaceOrEnter` (`src/features/row-interaction/action-handlers.ts`) checks only `event.code`, with no `target === currentTarget` guard, so Space/Enter typed in a nested text box inside custom content fires the row's on-click action. Ctrl/Cmd+A already has that guard (`widget-plugin-grid/src/selection/keyboard.ts`).
3. `cell-pointer.spec.tsx` asserts native `dblclick` semantics that production does not have, because it bypasses `ClickEventSwitch`. Realigning it would make the row-interaction suite describe real behavior.
