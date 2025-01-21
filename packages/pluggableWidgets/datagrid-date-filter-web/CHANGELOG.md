# Changelog

All notable changes to this widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.11.1] - 2025-01-21

### Fixed

-   We fixed an issue with range date filter working incorrectly in some cases.

## [2.10.4] - 2024-11-13

### Changed

-   We improved type mismatch filter error message.

### Breaking changes

-   We improved accessibility for the filter type select button - the select menu shows on enter, space, and arrow keys.

### Added

-   We improved screen reader integration.

## [2.10.3] - 2024-10-31

### Fixed

-   We fixed an issue with grid wide filters not resetting.

## [2.10.2] - 2024-09-23

### Changed

-   Widget maintenance.

### Fixed

-   Fixed issue with "empty" and "not empty" filters showing incorrect results.

## [2.10.0] - 2024-09-20

### Breaking changes

-   We removed "Group key" property.

## [2.9.0] - 2024-09-13

### Changed

-   Improved integration with parent widgets.

### Added

-   Group key -- a new setting to associate the filter with the group (see "Filter groups" in docs for more information).

## [2.8.0] - 2024-06-19

### Fixed

-   The default filter values are now restored on initial page load.

### Added

-   A new hook that subscribes the widget to `Set_Filter` action.

### Changed

-   We update event listener for `Reset_Filter` to allow reset to default value.

## [2.7.1] - 2024-05-15

### Fixed

-   We fixed an issue where the filter type selector was not switching types correctly.

## [2.7.0] - 2024-03-27

### Fixed

-   Fixed custom date format throwing error. When customers try to use a custom format like `YYww.E` they were getting an error and also the output date were not correct.

### Added

-   A new hook that subscribes the widget to external events.

## [2.6.2] - 2023-10-13

### Fixed

-   We removed redundant code to improve widget load time in the browser.

## [2.6.1] - 2023-08-30

### Fixed

-   We fixed the issue where date filter does not fully visible when datagrid pagination option is set to virtual scrolling.

## [2.6.0] - 2023-08-10

### Changed

-   We changed the DOM Structure for date filter to appear inline with the container in order to make the component more accessible.

## [2.5.2] - 2023-06-21

### Fixed

-   We fixed issue with initial filter condition.

## [2.5.1] - 2023-05-26

### Changed

-   We changed colors in the structure mode preview for dark and light modes.

-   We replaced glyphicons with internal icons

-   We updated the light and dark icons and tiles for the widget.

## [2.5.0] - 2023-05-01

### Fixed

-   We fixed an issue with widget rendering and performance.

### Breaking changes

-   We introduce a breaking change that affects how widget is reacting on default value changes. Starting with this version, widget use the default value attribute only as an initial value, and any further changes to the default value attribute will be ignored.

## [2.4.2] - 2022-09-29

### Fixed

-   We fixed an issue with DateFilter causing poor page performance (#166116)

## [2.4.1] - 2022-08-11

### Fixed

-   We fixed an issue with sync of widget defaultValue property and current filter value (#151789)

## [2.4.0] - 2022-05-11

### Added

-   We added the options to filter for empty and non-empty values.

## [2.3.1] - 2022-04-13

### Fixed

-   We fixed a bug that was causing errors in Safari when using DateFilter in Datagrid. (Ticket #144874)

## [2.3.0] - 2022-02-10

### Added

-   We added the possibility to apply filter between dates.

### Fixed

-   We fixed an issue with locale date format when typing it manually.

## [2.2.1] - 2022-01-06

### Added

-   We added a class `date-filter-container` to the main container for the date picker calendar.

## [2.2.0] - 2021-12-23

### Added

-   We added dark mode to Structure mode preview.

-   We added dark icons for Tile and List view.

## [2.1.1] - 2021-12-10

### Fixed

-   We fixed an issue with week start day not respecting current app settings (Ticket #136173).

### Changed

-   We aligned week days names with date picker widget from Studio Pro.

## [2.0.2] - 2021-10-13

### Added

-   We added the possibility to store the filter value in an attribute and trigger an onChange event on every filter change.

-   We added a "Enable advanced options" toggle for Studio users.

## [2.0.1] - 2021-10-07

### Fixed

-   We fixed an issue where widgets get duplicate identifiers assigned under certain circumstances which causes inconsistencies in accessibility.

## [2.0.0] - 2021-09-28

### Added

-   We added the possibility to reuse the filter with Gallery.

-   We added a toolbox category and toolbox tile image for Studio & Studio Pro.

### Changed

-   We renamed the widget to Date filter.
