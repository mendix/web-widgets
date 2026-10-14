## ADDED Requirements

### Requirement: Custom pagination honors the position setting

When custom pagination is enabled, Data Grid 2 SHALL render the custom pagination widgets according to the `pagingPosition` property ("Above grid" / "Below grid" / "Both") instead of always rendering them in the footer.

#### Scenario: Position set to "Above grid"

- **WHEN** custom pagination is enabled and `pagingPosition` is `"top"`
- **THEN** the custom pagination widgets render in the top bar
- **AND** the custom pagination widgets do not render in the footer

#### Scenario: Position set to "Below grid"

- **WHEN** custom pagination is enabled and `pagingPosition` is `"bottom"`
- **THEN** the custom pagination widgets render in the footer
- **AND** the custom pagination widgets do not render in the top bar

#### Scenario: Position set to "Both"

- **WHEN** custom pagination is enabled and `pagingPosition` is `"both"`
- **THEN** the custom pagination widgets render exactly once, in the footer
- **AND** the custom pagination widgets do not also render in the top bar

### Requirement: Editor preview matches runtime placement

Studio Pro's editor preview for Data Grid 2 SHALL place the custom pagination placeholder using the same `pagingPosition` rule as the runtime, so the page editor never disagrees with the running app.

#### Scenario: Preview reflects "Above grid"

- **WHEN** custom pagination is enabled and `pagingPosition` is `"top"` in the page editor
- **THEN** the custom pagination placeholder renders above the grid preview

#### Scenario: Preview reflects "Below grid" or "Both"

- **WHEN** custom pagination is enabled and `pagingPosition` is `"bottom"` or `"both"` in the page editor
- **THEN** the custom pagination placeholder renders below the grid preview, exactly once

### Requirement: Position property remains configurable with custom pagination

The `pagingPosition` property SHALL remain visible and editable in the Studio Pro properties panel when custom pagination is enabled, since the property now affects rendering.

#### Scenario: Custom pagination enabled

- **WHEN** a developer enables custom pagination on a Data Grid 2 configured with `pagination` set to `"buttons"`
- **THEN** the "Position of pagination" property remains visible and editable in the properties panel

### Requirement: Design-time warning for "Both" with custom pagination

Data Grid 2's consistency check SHALL emit a warning when custom pagination is enabled and `pagingPosition` is `"both"`, explaining that the widgets render once, below the grid.

#### Scenario: Custom pagination with "Both" position configured

- **WHEN** a developer enables custom pagination and sets `pagingPosition` to `"both"`
- **THEN** Studio Pro shows a warning on the `pagingPosition` property explaining that custom pagination renders once, below the grid, and suggesting a single position instead
