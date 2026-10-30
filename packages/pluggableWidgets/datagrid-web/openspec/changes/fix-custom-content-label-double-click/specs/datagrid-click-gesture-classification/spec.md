## ADDED Requirements

### Requirement: One pointer gesture runs at most one click classification

A single pointer gesture on a row or cell SHALL run either the configured single-click behavior or the double-click behavior, never both, and SHALL run it at most once — even when the gesture produces more than one DOM `click` event on the same element. Forwarded clicks, such as the click a browser dispatches on a labelled control when its `<label>` is clicked, SHALL NOT be counted as an additional gesture.

The widget SHALL NOT suppress the forwarded DOM event itself: content inside the cell keeps its native behavior, so a checkbox inside a custom content column still toggles.

#### Scenario: Single click on the label of a checkbox in a custom content column

- **GIVEN** a column with content shown as custom content, containing a checkbox with its own label, and the grid's on-click action configured to trigger on double click
- **WHEN** the user clicks the label once
- **THEN** the double click action does not run, and the checkbox toggles

#### Scenario: Single click on the label with the trigger set to single click

- **GIVEN** the same column, with the grid's on-click action configured to trigger on single click
- **WHEN** the user clicks the label once
- **THEN** the on-click action runs exactly once

#### Scenario: Double click on the label

- **GIVEN** the same column, with the on-click action configured to trigger on double click
- **WHEN** the user double clicks the label
- **THEN** the double click action runs exactly once

#### Scenario: Row selection by click is not doubled

- **GIVEN** a grid where rows are selected by clicking them, and a custom content column containing a checkbox with a label
- **WHEN** the user clicks the label once
- **THEN** the row's selection changes once, as if a single click had happened anywhere else in the row

#### Scenario: Selecting with the row selection checkbox column

- **GIVEN** a grid whose selection method is the checkbox column
- **WHEN** the user clicks a row's selection checkbox once
- **THEN** the row becomes selected and the grid's on-click action does not run

### Requirement: A second click shortly after a single click is a double click

A click that arrives within 320 ms of a click classified as single SHALL run the double-click behavior; any other click SHALL run the single-click behavior. Classification SHALL NOT depend on the browser's click count (`MouseEvent.detail`), because touch browsers do not report it consistently for double taps. After a double click, the next click SHALL be classified as single again.

#### Scenario: Two deliberate, separated clicks

- **WHEN** the user clicks a cell twice with a pause longer than 320 ms
- **THEN** the single-click behavior runs twice and the double-click behavior does not run

#### Scenario: Double tap on a touch device

- **GIVEN** a browser that reports a click count of 1 for both taps of a double tap
- **WHEN** the user double taps a cell
- **THEN** the single-click behavior runs once and the double-click behavior runs once

#### Scenario: Clicking again after a double click

- **WHEN** the user double clicks a cell and then, after a pause, double clicks again
- **THEN** two single clicks and two double clicks run in total

### Requirement: Clicks without a pointer still run row actions

A `click` event that reports a click count of 0 — as produced by assistive technology activating an element (NVDA/JAWS browse mode, VoiceOver) — SHALL run the row's single-click behavior, and SHALL be counted once when the browser forwards it from a `<label>` to its control.

#### Scenario: Screen reader activates a cell

- **WHEN** a screen reader activates a cell, dispatching a click with a click count of 0
- **THEN** the single-click behavior runs once

#### Scenario: Screen reader activates the label of a checkbox in a custom content column

- **WHEN** a screen reader activates the label, and the browser forwards the click to the checkbox
- **THEN** the single-click behavior runs once and the checkbox toggles
