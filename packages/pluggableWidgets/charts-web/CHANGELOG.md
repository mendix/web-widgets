# Changelog

All notable changes to this widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [4.2.4] Charts - 2023-11-30

### Fixed

-   We fixed chart's custom configuration not properly merged for arrays.

## [4.2.3] Charts - 2023-11-21

### [3.1.3] AreaChart

#### Fixed

-   We fixed an issue where it was not possible to select entity attributes in the "line color" expression editor. In versions of the widget before 4.0, after configuring the data source, entity attributes were available in the "line color" expression editor. With this fix, entity attributes are accessible in the expression editor again for all "line color", "marker color", and "fill color" settings.

### [3.1.3] BarChart

#### Fixed

-   We fixed an issue where it was not possible to select entity attributes in the "bar color" expression editor. In versions of the widget before 4.0, after configuring the data source, entity attributes were available in the "bar color" expression editor. With this fix, entity attributes are accessible in the expression editor again for "bar color" setting.

### [3.1.3] BubbleChart

#### Fixed

-   We fixed an issue where it was not possible to select entity attributes in the "marker color" expression editor. In versions of the widget before 4.0, after configuring the data source, entity attributes were available in the "marker color" expression editor. With this fix, entity attributes are accessible in the expression editor again for "marker color" settings.

### [3.1.3] ColumnChart

#### Fixed

-   We fixed an issue where it was not possible to select entity attributes in the "column color" expression editor. In versions of the widget before 4.0, after configuring the data source, entity attributes were available in the "column color" expression editor. With this fix, entity attributes are accessible in the expression editor again for "column color" setting.

### [3.1.2] PieChart

#### Fixed

-   We fixed an issue where it was not possible to select entity attributes in the "slice color" expression editor. In versions of the widget before 4.0, after configuring the data source, entity attributes were available in the "slice color" expression editor. With this fix, entity attributes are accessible in the expression editor again for "slice color" setting.

## [4.2.2] Charts - 2023-10-27

### Fixed

-   We fixed an error that was happening when the data source with the aggregation function had an "on click" action. Note: If a data point is aggregated (a single data point on the chart represents multiple entities), only the last entity is passed as a parameter to the associated microflow or nanoflow.

## [4.2.1] Charts - 2023-09-27

### [3.1.2] AreaChart

#### Fixed

-   We removed redundant code to improve widget load time in the browser.

### [3.1.2] BarChart

#### Fixed

-   We removed redundant code to improve widget load time in the browser.

### [3.1.2] BubbleChart

#### Fixed

-   We removed redundant code to improve widget load time in the browser.

### [3.1.2] ColumnChart

#### Fixed

-   We removed redundant code to improve widget load time in the browser.

### [3.1.1] HeatMap

#### Fixed

-   We removed redundant code to improve widget load time in the browser.

### [3.1.2] LineChart

#### Fixed

-   We removed redundant code to improve widget load time in the browser.

### [3.1.1] PieChart

#### Fixed

-   We removed redundant code to improve widget load time in the browser.

### [3.1.2] TimeSeries

#### Fixed

-   We removed redundant code to improve widget load time in the browser.

## [4.2.0] Charts - 2023-08-16

### Fixed

-   We fixed an issue where, in 4.0, parameters related to on-click actions were missing. In versions of the widget before 4.0, when you added an on click action to the widget, additional parameters were passed. These parameters are now being passed again.

### Breaking changes

-   After updating the widget(s) to this version, a few properties will lose their configured values. The following properties should be reconfigured manually (if they were configured before): `Line color` (Line chart), `Marker color` (Line chart), `On click action` (all widgets except Pie chart and Heat map).

### [3.1.1] LineChart

#### Fixed

-   We fixed an issue where it was not possible to select entity attributes in the "line color" expression editor. In versions of the widget before 4.0, after configuring the data source, entity attributes were available in the "line color" expression editor. With this fix, entity attributes are accessible in the expression editor again for both "line color" and "marker color" settings.

## [4.1.0] Charts - 2023-06-06

### [3.1.0] AreaChart

#### Changed

-   We updated page explorer's caption to display datasource.

-   We updated the light and dark icons and tiles for the widget.

### [3.1.0] BarChart

#### Changed

-   We updated page explorer's caption to display datasource.

-   We updated the light and dark icons and tiles for the widget.

### [3.1.0] BubbleChart

#### Changed

-   We updated page explorer's caption to display datasource.

-   We updated the light and dark icons and tiles for the widget.

### [3.1.0] ColumnChart

#### Changed

-   We updated page explorer's caption to display datasource.

-   We updated the light and dark icons and tiles for the widget.

### [3.1.0] HeatMap

#### Changed

-   We updated page explorer's caption to display datasource.

-   We updated the light and dark icons and tiles for the widget.

### [3.1.0] LineChart

#### Changed

-   We updated page explorer's caption to display datasource.

-   We updated the light and dark icons and tiles for the widget.

### [3.1.0] PieChart

#### Changed

-   We updated page explorer's caption to display datasource.

-   We updated the light and dark icons and tiles for the widget.

### [3.1.0] TimeSeries

#### Changed

-   We updated page explorer's caption to display datasource.

-   We updated the light and dark icons and tiles for the widget.

## [4.0.4] Charts - 2023-04-13

### Changed

-   Before, if some items in a series for a chart were missing an association value, the chart might not display properly. However, this issue has been resolved. Now, if an item in the series is missing an association value, it will be grouped under a new label called "(empty)".

## [4.0.3] Charts - 2023-01-09

### Changed

-   Update `fast-json-patch` dependency.

## [4.0.2] Charts - 2022-11-22

### Security

-   Updade d3-color library to 3.1.0 to prevent ReDoS

## [4.0.1] Charts - 2022-11-10

### Changed

-   Data series that have null values now handled correctly.

## [4.0.0] Charts - 2022-10-27

### Breaking changes

-   We removed all deprecated chart widgets. If your app uses deprecated chart widgets, you must manually replace them with new ones.

## [2.0.0] Charts - 2021-09-28

### Added

-   We added a toolbox category and toolbox tile image for Studio & Studio Pro.

## [1.4.12] Charts - 2021-08-04

### Fixed

-   We fixed an issue with sorting using XPath and attribute over-association (Ticket #105229).

### Removed

-   We've removed deprecated APIs warnings

## [1.4.11] Charts - 2021-04-28

### Fixed

-   Fixed an issue where grouped legends were not working.

-   Maintain compatibility with Mendix client in MX 7, 8 and 9.

-   Fix localized date handling.

### Changed

-   Update `plotly.js` dependency.

-   Update `react-ace` dependency and switch `brace` for `ace-builds`.

### Security

-   Patch `lodash` vulnerability.

-   Update `fast-json-patch` dependency.

## Previous versions

See [marketplace](https://marketplace.mendix.com/link/component/105695) notes.
