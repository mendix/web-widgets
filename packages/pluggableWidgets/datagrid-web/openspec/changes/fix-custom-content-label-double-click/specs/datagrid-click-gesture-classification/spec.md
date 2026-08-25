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

### Requirement: Click classification follows the browser click count

The widget SHALL derive single-versus-double click from the browser's click count for the event (`MouseEvent.detail`) rather than from a widget-owned time window, so the user's operating system double-click interval is respected.

A count of 1 SHALL run the single-click behavior, a count of 2 SHALL run the double-click behavior, and counts beyond 2 SHALL run neither — the double-click behavior having already run at 2. Successive gestures SHALL be classified independently: a click after a double click is a single click again.

#### Scenario: Two deliberate, separated clicks

- **WHEN** the user clicks a cell twice with a pause longer than the double-click interval
- **THEN** the single-click behavior runs twice and the double-click behavior does not run

#### Scenario: Clicking again after a double click

- **WHEN** the user double clicks a cell and then, after a pause, clicks and double clicks again
- **THEN** each gesture is classified on its own: two single clicks and two double clicks in total, with no alternating misclassification

#### Scenario: Triple click

- **WHEN** the user clicks three times in rapid succession
- **THEN** the single-click behavior runs once (first click), the double-click behavior runs once (second click), and the third click runs neither

### Requirement: Clicks that are not pointer gestures do not run row actions

A `click` event that reports a click count of 0 — as produced by keyboard activation of a control or by a programmatic `element.click()` — SHALL NOT run the row's click or double-click behavior. Keyboard interaction with the row itself remains served by the widget's keyboard handling.

#### Scenario: Activating a button inside custom content with the keyboard

- **GIVEN** a custom content column containing a button
- **WHEN** the user focuses that button and presses Enter or Space
- **THEN** the button's own action runs and the grid's row click action does not
