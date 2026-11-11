## ADDED Requirements

### Requirement: Custom pagination honours the configured pagination position

When custom pagination is enabled, the custom pagination widgets SHALL render in the bar named by `Position of pagination` — the top bar for `Above grid`, the footer for `Below grid` — rather than always in the footer.

#### Scenario: Custom pagination above the gallery

- **WHEN** custom pagination is enabled and `Position of pagination` is `Above grid`
- **THEN** the custom pagination widgets render in the top bar and not in the footer

#### Scenario: Custom pagination below the gallery

- **WHEN** custom pagination is enabled and `Position of pagination` is `Below grid`
- **THEN** the custom pagination widgets render in the footer and not in the top bar

### Requirement: Custom pagination renders once when both positions are requested

When custom pagination is enabled and `Position of pagination` is `Both`, the widget SHALL render the custom pagination widgets exactly once, in the footer, so that the configured widget instances are not duplicated across two bars.

Studio Pro SHALL surface this limitation at design time as a warning on the widget, explaining that custom pagination cannot be shown in both positions and will render below the gallery.

#### Scenario: Both positions requested with custom pagination

- **WHEN** custom pagination is enabled and `Position of pagination` is `Both`
- **THEN** the custom pagination widgets render once in the footer, and the top bar contains no custom pagination

#### Scenario: Design-time warning for the unsupported combination

- **WHEN** a page configures custom pagination together with `Position of pagination` set to `Both`
- **THEN** Studio Pro reports a warning on the Gallery widget describing that the widgets will render below the gallery

#### Scenario: No warning for supported combinations

- **WHEN** custom pagination is enabled and `Position of pagination` is `Above grid` or `Below grid`
- **THEN** no such warning is reported

### Requirement: Editor preview agrees with runtime on custom pagination position

The widget's editor preview SHALL place custom pagination in the same bar the running app would use for the same configuration, including for `Both`.

#### Scenario: Preview and runtime agree for Above grid

- **WHEN** custom pagination is enabled with `Position of pagination` set to `Above grid`
- **THEN** the page editor shows the custom pagination placeholder in the top bar, matching the running app

#### Scenario: Preview and runtime agree for Both

- **WHEN** custom pagination is enabled with `Position of pagination` set to `Both`
- **THEN** the page editor shows a single custom pagination placeholder in the footer, matching the running app
