# Changelog

All notable changes to this widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.3.4] - 2025-02-13

### Fixed

-   We fixed an issue where the initial collapsed state sometimes wouldn't update the accordion.

## [2.3.3] - 2024-08-28

### Changed

-   Changed action required to false to avoid unnecessary warnings in the Studio Pro.

## [2.3.2] - 2024-07-19

### Fixed

-   We fixed the issue where in nested mode, the display collapsed/uncollapsed content can be not in sync with the accordion state.

## [2.3.1] - 2023-09-27

### Fixed

-   We removed redundant code to improve widget load time in the browser.

## [2.3.0] - 2023-06-05

### Changed

-   We updated the light and dark icons and tiles for the widget.

-   We changed colors in the structure mode preview for dark and light modes.

## [2.2.0] - 2023-01-30

### Added

-   We added new group property ("Load content") which controls how widgets should be rendered. Use this prop if you have problems with page load time.

## [2.1.2] - 2022-07-14

### Fixed

-   We fixed issue related to rotating icons (180deg) when animations are switched off.

## [2.1.1] - 2022-04-01

### Fixed

-   We fixed this widget to be compatible with strict CSP mode.

## [2.1.0] - 2021-12-23

### Added

-   We added dark mode to Structure mode preview.

-   We added dark icons for Tile and List view.

### Changed

-   We made the "Enable advanced options" available only for Studio users, keeping all the advanced features available by default in Studio Pro.

## [2.0.1] - 2021-10-06

### Fixed

-   We fixed an issue where widgets get duplicate identifiers assigned under certain circumstances which causes inconsistencies in accessibility.

## [2.0.0] - 2021-09-28

### Added

-   We added a toolbox category and toolbox tile image for Studio & Studio Pro.

### Changed

-   We renamed the advanced options property to emphasize this property is about the advanced properties' activation.

-   We made some small code improvement.

## [1.1.1] - 2021-08-16

### Changed

-   We fixed a display issue while using the Accordion in Structure and Design Mode/Studio when there is no group configured.

## [1.1.0] - 2021-07-22

### Added

-   We added a widget property to configure the render mode of the header text.

-   We added widget properties to influence the initial collapsed state for a group.

-   We added widget properties to control the collapse state of a group via an entity attribute.

-   We added a preview for Studio Pro's structure mode.

### Changed

-   We improved widget property & preview descriptions.

## [1.0.0] - 2021-06-29

### Added

-   We added configuration of groups with composable content for header & body.

-   We added conditional visibility for groups based on a Boolean expression.

-   We added support for dynamic classes on groups to apply brand styles for instance.

-   We provided controls to make accordion groups collapsible.

-   We provided controls to influence the collapse behavior by allowing one or more groups to be expanded at the same time.

-   We added support for header icon customization.

-   We added out of the box styles, including animations.
