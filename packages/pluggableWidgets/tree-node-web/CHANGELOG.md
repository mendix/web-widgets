# Changelog

All notable changes to this widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.1] - 2024-11-13

### Fixed

-   We fixed an issue where Tree Nodes resetting it's collapse state while reloading data.

## [1.2.0] - 2024-05-15

### Fixed

-   We fixed an issue with nested Tree Nodes, where the nested empty Tree Node would break its parent behavior.

## [1.1.4] - 2023-10-13

### Fixed

-   We removed redundant code to improve widget load time in the browser.

## [1.1.3] - 2023-08-22

### Fixed

-   We fixed an issue with keyboard input for "form" widgets when they were put into a tree node. Up to this version, pressing "space" or "enter" in widgets like ‘Text box’ or ‘Text area’ was not handled properly, and keyboard input was ignored. The new version should have no issues with keyboard input in child widgets.

-   We fixed an issue with the open/close state for the tree node. This issue was visible when any clickable widget was used to customize the tree node header. Starting from this version, you can choose which part of the header (icon or whole header), when clicked, triggers a collapsed or expanded state for the node.

### Breaking changes

-   We changed the widget HTML. As a result, some CSS selectors may be affected. Please check your custom styles (if used) after updating to this version.

### Added

-   We added the new property "Open node when". This property controls which element (an icon or a whole header), once clicked, will expand or collapse the node.

## [1.1.2] - 2023-08-10

### Fixed

-   We fixed Atlas icon unable to be shown on tree node.

-   We fixed an issue where tree child not directly refreshed after updating the data.

## [1.1.1] - 2023-05-26

### Changed

-   We updated page explorer's caption to display datasource.

-   We updated the light and dark icons and tiles for the widget.

-   We changed colors in the structure mode preview for dark and light modes.

## [1.1.0] - 2021-12-23

### Added

-   We added dark mode to Structure mode preview.

-   We added dark icons for Tile and List view.

## [1.0.2] - 2021-12-03

### Fixed

-   We fixed an issue that causes design properties and styles to not be applied to the widget in Design mode & Studio.

## [1.0.1] - 2021-10-13

### Changed

-   We made the "Enable advanced options" available only for Studio users, keeping all the advanced features available by default in Studio Pro.

## [1.0.0] - 2021-09-28

### Added

-   We added possibility to structure data representing a tree view.
