# Changelog

All notable changes to this widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Breaking changes

- We changed how "Static" data and "Source attribute" data are merged. Previously, traces were appended as separate chart elements. Now, traces are merged by index, where source attribute values override static values for the same trace position. This enables proper customization of chart traces through dynamic data.

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
