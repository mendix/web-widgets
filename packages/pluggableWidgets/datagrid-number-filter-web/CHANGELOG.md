# Changelog

All notable changes to this widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.8.4] - 2024-11-13

### Changed

-   We improved type mismatch filter error message.

### Fixed

-   We fixed an issue where onChange wouldn't triggered on empty or not empty filter.

### Breaking changes

-   We improved accessibility for the filter type select button - the select menu shows on enter, space, and arrow keys.

### Added

-   We improved screen reader integration.

## [2.8.3] - 2024-10-31

### Fixed

-   We fixed an issue with grid wide filters not resetting.

## [2.8.2] - 2024-10-14

### Fixed

-   We fixed an issue where filters wouldn't reset.

## [2.8.1] - 2024-09-23

### Changed

-   Widget maintenance.

## [2.8.0] - 2024-09-20

### Breaking changes

-   We removed "Group key" property.

## [2.7.0] - 2024-09-13

### Changed

-   Improved integration with parent widgets.

### Added

-   Group key -- a new setting to associate the filter with the group (see "Filter groups" in docs for more information).

## [2.6.1] - 2024-08-15

### Fixed

-   We fixed an issue with the filter unexpectedly focusing when combined with conditional visibility.

## [2.6.0] - 2024-06-19

### Added

-   A new hook that subscribes the widget to `Set_Filter` action.

### Changed

-   We update event listener for `Reset_Filter` to allow reset to default value.

## [2.5.1] - 2024-04-30

### Fixed

-   We resolved an issue where the default value was not working in certain cases.

## [2.5.0] - 2024-03-27

### Added

-   A new hook that subscribes the widget to external events.

## [2.4.3] - 2023-10-13

### Fixed

-   We removed redundant code to improve widget load time in the browser.

## [2.4.2] - 2023-06-21

### Fixed

-   We fixed issue with initial filter condition.

## [2.4.1] - 2023-05-26

### Changed

-   We updated the light and dark icons and tiles for the widget.

-   We changed colors in the structure mode preview for dark and light modes.

## [2.4.0] - 2023-05-01

### Fixed

-   We fixed an issue with widget rendering and performance.

### Breaking changes

-   We introduce a breaking change that affects how widget is reacting on default value changes. Starting with this version, widget use the default value attribute only as an initial value, and any further changes to the default value attribute will be ignored.

## [2.3.1] - 2022-08-11

### Fixed

-   We fixed an issue with sync of widget defaultValue property and current filter value (#151789)

## [2.3.0] - 2022-05-11

### Added

-   We added the options to filter for empty and non-empty values.

## [2.2.0] - 2021-12-23

### Added

-   We added dark mode to Structure mode preview.

-   We added dark icons for Tile and List view.

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

-   We renamed the widget to Number filter.
