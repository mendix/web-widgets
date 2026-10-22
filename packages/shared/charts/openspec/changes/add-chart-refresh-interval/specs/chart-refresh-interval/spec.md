## ADDED Requirements

### Requirement: Refresh time property on list-based chart widgets

The Area, Bar, Bubble, Column, Heat map, Line, Pie/Doughnut and Time series chart widgets SHALL each expose an integer property `refreshInterval`, captioned "Refresh time (in seconds)", in the "General > Data source" property group, with default value `0`. The Custom chart widget SHALL NOT expose this property.

#### Scenario: Property available in Studio Pro

- **WHEN** a developer selects one of the eight list-based chart widgets in Studio Pro
- **THEN** a "Refresh time (in seconds)" integer property appears in the Data source group with the value `0`

#### Scenario: Custom chart unchanged

- **WHEN** a developer selects a Custom chart widget
- **THEN** no "Refresh time (in seconds)" property is shown

### Requirement: Disabled by default

When `refreshInterval` is `0` or negative, the chart SHALL NOT schedule any automatic reload of its data sources.

#### Scenario: Default value keeps current behaviour

- **WHEN** a chart is rendered with `refreshInterval` set to `0`
- **THEN** no data source `reload()` is triggered by the widget, however long it stays mounted

### Requirement: Periodic reload of all chart data sources

When `refreshInterval` is greater than `0`, the chart SHALL call `reload()` on every list data source it renders after `refreshInterval` seconds without a data change. For series-based charts this means each series' active data source (`staticDataSource` for single series, `dynamicDataSource` for multiple series). For Pie/Doughnut and Heat map it means `seriesDataSource`. Undefined data sources SHALL be ignored.

#### Scenario: Single data source reloads after interval

- **WHEN** a Pie chart is rendered with `refreshInterval` = 5 and its data does not change
- **THEN** `seriesDataSource.reload()` is called once after 5 seconds

#### Scenario: All series reload

- **WHEN** a Line chart with two series, one static and one dynamic, is rendered with `refreshInterval` = 10
- **THEN** after 10 seconds `reload()` is called on the first series' `staticDataSource` and on the second series' `dynamicDataSource`

### Requirement: Timer restarts on data change

The refresh timer SHALL restart whenever the items of any of the chart's data sources change, so that a reload happens `refreshInterval` seconds after the most recent data update and not on a fixed wall-clock schedule.

#### Scenario: Data update postpones the next reload

- **WHEN** a chart has `refreshInterval` = 10 and its data source delivers new items 6 seconds after the last reload
- **THEN** the next automatic reload happens 10 seconds after that update, not 4 seconds later

### Requirement: No overlapping reloads

When the timer fires, the chart SHALL NOT call `reload()` on a data source whose status is `loading`.

#### Scenario: Data source still loading

- **WHEN** the refresh timer fires while a data source has status `loading`
- **THEN** `reload()` is not called on that data source

### Requirement: Existing data stays visible during reload

During an automatic reload, the chart SHALL keep rendering its last loaded data until the new data arrives. It SHALL NOT clear or blank the plot.

#### Scenario: No flash of empty chart

- **WHEN** an automatic reload is in progress
- **THEN** the chart continues to show the previously loaded data points

### Requirement: Timer cleanup

The chart SHALL cancel any pending refresh timer when it unmounts or when `refreshInterval` changes.

#### Scenario: Unmount cancels timer

- **WHEN** a chart with `refreshInterval` > 0 is unmounted before the timer fires
- **THEN** no `reload()` call happens afterwards
