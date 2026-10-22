## ADDED Requirements

### Requirement: Refresh time drives periodic datasource reload

When the Gallery's `refreshInterval` property is greater than `0`, the widget SHALL reload its datasource `refreshInterval` seconds after the most recent data change. It SHALL NOT start a reload while the datasource is already loading.

#### Scenario: Reload after configured interval

- **WHEN** a Gallery is rendered with `refreshInterval` = 5 and its data does not change
- **THEN** `datasource.reload()` is not called before 5 seconds and is called once at 5 seconds

#### Scenario: Interval value converted to milliseconds

- **WHEN** a Gallery is configured with `refreshInterval` = 5
- **THEN** the datasource service receives a refresh interval of 5000 ms

### Requirement: Refresh disabled at zero

When `refreshInterval` is `0`, the Gallery SHALL NOT reload its datasource automatically.

#### Scenario: No reload by default

- **WHEN** a Gallery is rendered with `refreshInterval` = 0
- **THEN** `datasource.reload()` is not called by the widget, however long it stays mounted
