## ADDED Requirements

### Requirement: Dynamic mode context

The package SHALL export a global React context (registered on `window`, like the filter context, so separately bundled widgets share it) whose value tells descendants whether the parent widget is in Dynamic filtering mode. A missing provider SHALL mean "not in Dynamic mode".

#### Scenario: No provider

- **WHEN** a filter widget renders without any Dynamic mode provider above it
- **THEN** it behaves exactly as today

### Requirement: Filter widgets render an error in Dynamic mode

When the Dynamic mode context says the parent is in Dynamic mode, `withFilterAPI` SHALL render a danger `Alert` with a new `APIError` instead of the filter widget. The message SHALL say that filter widgets aren't supported when the widget's filtering mode is Dynamic filters, and how to fix it (remove the filter widget, or switch Filtering mode to Fixed filters).

#### Scenario: Text filter in the header in Dynamic mode

- **WHEN** a Text filter is placed in the header of a parent that provides Dynamic mode
- **THEN** the Text filter renders the Dynamic mode error alert and registers no filter store

#### Scenario: Fixed mode

- **WHEN** the parent provides the context with Dynamic mode off
- **THEN** filter widgets render and filter as today
