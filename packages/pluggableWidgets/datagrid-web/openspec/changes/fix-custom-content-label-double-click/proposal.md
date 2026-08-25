## Why

WC-3524: in a Data Grid 2 column with `showContentAs = customContent` holding a checkbox widget, **one** physical click on the checkbox's `<label>` runs the grid's **double click** action. The customer workaround is setting the column's "Allow row events" (`allowEventPropagation`) to `false`, which also stops legitimate row events for that column.

Root cause is not the checkbox and not the custom content wrapper. Cell handlers sit on `div.td`, and single-vs-double click is not decided by the browser: `CellEventsController.getEntries()` folds every `onDoubleClick` entry into one synthetic `onClick` entry via the shared `ClickEventSwitch`, which hand-rolls detection with a 320 ms `Date.now()` window. React's real `onDoubleClick` prop on the cell is dead code in production.

The `<label>` activation behavior makes the browser dispatch a **second, trusted** click on the labelled control, and that click bubbles back through the same `div.td`. Instrumented in real Chromium against the customer repro app, one label click produces:

| target | detail | isTrusted | timeStamp | cell |
| ------ | ------ | --------- | --------- | ---- |
| LABEL  | 1      | true      | 2151      | 4,0  |
| INPUT  | 1      | true      | 2151      | 4,0  |

Two clicks 0 ms apart: the 320 ms window classifies the second one as a double click, so the double click action runs from a single physical click. Clicking the checkbox square directly produces only one click, which is why the bug looks target-dependent.

The browser already tracks click count in `MouseEvent.detail`, honoring the OS double-click interval. The 320 ms re-implementation is what breaks, and it carries two further latent defects: `startTime = 0` after a double click makes the classification pattern 1-2-1-2 instead of 1-2-3-4, and the hard-coded 320 ms ignores the user's OS double-click interval.

## What Changes

- `ClickEventSwitch.getClickEntry()` (shared `@mendix/widget-plugin-grid`) classifies from `event.detail` instead of a timer: `1` runs the click entries, `2` runs the double click entries, `0` (keyboard activation, `element.click()`) and `> 2` run neither.
- The same switch collapses duplicate clicks belonging to **one** gesture: a click whose `detail` equals the previously handled click's `detail` and whose `timeStamp` is within 5 ms of it is ignored. This is what discards the label-forwarded duplicate without suppressing it in the DOM, so the checkbox keeps toggling.
- Regression coverage for the switch itself (it had none) and for a data grid cell containing a checkbox with its own label.
- Gallery inherits the same fix through the shared package (`ItemEvents.viewModel.ts` uses the same switch), so its changelog gets the equivalent entry.

## Capabilities

### New Capabilities

- `datagrid-click-gesture-classification`: how Data Grid 2 decides whether a pointer gesture on a row/cell is a single click or a double click for the purpose of running the configured on-click action and row selection, including gestures that produce more than one click event.

### Modified Capabilities

_None — no existing `openspec/specs/` capability documents cell click classification, so this is captured as a new capability rather than a delta._

## Impact

- `packages/shared/widget-plugin-grid/src/event-switch/ClickEventSwitch.ts` — the fix site. Consumed by `datagrid-web` (`CellEventsController`, `RowEventsController`) and `gallery-web` (`ItemEvents.viewModel.ts`).
- `packages/shared/widget-plugin-grid/src/event-switch/__tests__/ClickEventSwitch.spec.ts` — new, first coverage of the class.
- `packages/pluggableWidgets/datagrid-web/src/features/row-interaction/__tests__/cell-custom-content.spec.tsx` — new integration regression test through the real `CellEventsController` (the existing `cell-pointer.spec.tsx` builds props with raw `eventSwitch(...)` and bypasses `ClickEventSwitch`, so it cannot cover this).
- `packages/pluggableWidgets/datagrid-web/CHANGELOG.md`, `packages/pluggableWidgets/gallery-web/CHANGELOG.md` — user-facing fix entries.
- No XML/property changes, no widget API changes, no version bumps. `allowEventPropagation` keeps its current meaning; it is no longer needed as a workaround for this symptom.
- Behavior change worth noting: clicks with `detail === 0` (keyboard activation of a control inside custom content, programmatic `element.click()`) no longer run the row's click action. Keyboard activation of the row itself is handled by the separate key entries and is unaffected.
