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

### Collapse duplicates inside one gesture with a small time window

Rule: ignore a click whose `detail` equals the previously handled click's `detail` and whose `timeStamp` is within `sameGestureWindow = 5` ms. Every other click goes on to the existing 320 ms single/double classification.

Why 5 ms is safe where 320 ms was not: the forwarded label click carries the same `detail` and the same `timeStamp` as the original (measured 0 ms in Chromium, ~1-2 ms in jsdom). The two clicks of a real double click carry different `detail` values (1 then 2), so the guard cannot swallow the second one even when they land close together (~2 ms apart under `user-event` in jsdom). On touch browsers that report `detail: 1` for both taps, the taps are far more than 5 ms apart.

The same guard covers assistive technology: a screen reader activating a `<label>` produces a forwarded `detail: 0` pair, which collapses to one click.

### Keep the 320 ms window for single versus double click

The window is measured with `event.timeStamp` (instead of `Date.now()`) so both rules use the same clock; `startTime` starts and resets to `-Infinity` because `timeStamp` counts from page load, so a reset to `0` would turn a click in the first 320 ms after load into a double click.

Alternatives rejected:

- Classify from `MouseEvent.detail` (`1` single, `2` double, `0` ignored). It honors the OS double-click interval, but touch browsers do not report a reliable tap count (iOS Safari can report `detail: 1` for both taps of a double tap), so the double-click action could become unreachable on phone and tablet profiles. Ignoring `detail === 0` also drops clicks from screen readers activating a cell in browse mode, losing the row click action and row-click selection for those users. It does not even achieve its own goal: Enter/Space on a control inside custom content still runs the row action through the key entries (see Open Questions, 2).
- Listen to the native `dblclick` event instead: would require restructuring `CellEventsController`'s entry folding, and the entries' filters are written against a single `onClick` context.
- Ignore clicks whose `target !== currentTarget`: would break clicking custom content deliberately.

### State lives in the closure returned by `getClickEntry()`

That closure is created per `DataCell` (`useMemo` on `[item, eventsController]`). Label forwarding happens within one cell, so per-cell state is the right granularity; module-level state would leak across rows and columns.

## Risks / Trade-offs

- The 5 ms window is empirical. If a browser ever dispatches a label-forwarded click more than 5 ms after the original, the second click would be classified as a double click again. Chromium dispatches both in the same task with an identical timestamp.
- The 320 ms window still ignores the user's OS double-click interval and makes a triple click run single, double, single. Both are unchanged from the shipped behavior.

## Migration Plan

None. Internal behavior change, no API or XML surface. Apps using `allowEventPropagation = false` as a workaround keep working; they can turn row events back on.

## Open Questions

Follow-ups found while investigating, deliberately out of scope:

1. `allowEventPropagation: false` only stops `onClick` / `onKeyUp` / `onKeyDown` on `.td-custom-content` (`src/helpers/state/column/ColumnStore.tsx`). `onMouseDown` (which calls `removeAllRanges()`, clearing text selection) and `onFocus` (which moves the keyboard focus target) still fire from inside custom content.
2. `canExecOnSpaceOrEnter` (`src/features/row-interaction/action-handlers.ts`) checks only `event.code`, with no `target === currentTarget` guard, so Space/Enter typed in a nested text box inside custom content fires the row's on-click action. Ctrl/Cmd+A already has that guard (`widget-plugin-grid/src/selection/keyboard.ts`).
3. `cell-pointer.spec.tsx` asserts native `dblclick` semantics that production does not have, because it bypasses `ClickEventSwitch`. Realigning it would make the row-interaction suite describe real behavior.
