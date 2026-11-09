# Changelog

All notable changes to this widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- We updated the underlying charting library (Plotly.js) to version 4, which includes security fixes. Chart text colors on filled areas may be chosen slightly differently to improve contrast.
- Breaking: Plotly.js 4 removed Mapbox map traces (use `scattermap`, `choroplethmap` and `densitymap` instead), changed how color strings are parsed (for example `rgb()` with fractional values and `hsv()` colors are no longer valid), removed the Chart Studio configuration options (`showLink`, `linkText`, `sendData`, `showSources`, `showEditInChartStudio`), and changed the defaults of `layout.geo.fitbounds` and `splom.axis.matches`. Review any custom Plotly JSON in your charts. See the [Plotly.js v4 migration guide](https://plotly.com/javascript/guides/migrating-to-v4/).

## [6.3.2] - 2026-07-27

### Fixed

- We fixed an issue where the "Modeler Layout" and "Modeler Configuration" panels in the chart playground were empty.

## [6.3.0] - 2026-02-17

### Breaking changes

- We changed how "Static" data and "Source attribute" data are merged. Previously, traces were appended as separate chart elements. Now, traces are merged by index, where source attribute values override static values for the same trace position. This enables proper customization of chart traces through dynamic data.

### Fixed

- We fixed an issue when conditional visibility enabled charts wouldn't re-draw as expected when the data changes.

## [1.2.3] - 2025-10-10

### Changed

- We changed the event data to return more properties instead of only bbox coordinates.

## [1.2.2] - 2025-09-21

### Fixed

- We fixed an issue where event data attribute wouldn't successfully get its value set.

## [1.2.1] - 2025-07-15

### Fixed

- We fixed an issue with incorrect parsing and merging of layout and data properties.

## [1.2.0] - 2025-06-03

### Changed

- We increase the version to update shared code.

## [1.0.1] - 2025-05-14

### Fixed

- We fixed an issue with static layout configuration not applying properly for some properties.

## [1.0.0] - 2025-02-28

### Added

- We introduce custom chart.
