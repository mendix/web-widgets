# Changelog

All notable changes to this widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.4.1] - 2023-11-28

### Fixed

-   We fixed an issue with Gallery widget where infinite scroll was not creating scroll, blocking the user from scrolling and fetching more items.

-   We fixed an editor preview issue with drag-and-drop as well as changed dropzone text to be appropriate.

## [1.4.0] - 2023-10-31

### Changed

-   To better align with WAI ARIA web standards, in this release we change how items are selected using the keyboard (when selection is enabled): now to select or deselect items, the user should use the "shift+space" keyboard shortcut.

### Added

-   This version introduces support for the "Select all" keyboard shortcut ("cmd+a" or "ctrl+a") that has effect when selection is enabled for the widget.

-   A new feature: range selection. Starting from this version users may select a "range" of items by clicking on an item while pressing the shift key ("shift+click").

### Breaking changes

-   To provide a better user experience and improve accessibility support, we introduced some minor changes to widget HTML and CSS. The most notable change is a new div element that will wrap each item if you enable the "On click" event in widget settings.

## [1.3.5] - 2023-10-13

### Fixed

-   We removed redundant code to improve widget load time in the browser.

## [1.3.4] - 2023-08-10

### Fixed

-   We improved accessibility of the Gallery widget.

## [1.3.3] - 2023-07-13

### Fixed

-   We fixed an issue with Gallery widget unnecessary requesting total count of items in virtual scrolling mode.

## [1.3.2] - 2023-05-26

### Changed

-   We updated page explorer's caption to display datasource.

-   We updated the light and dark icons and tiles for the widget.

-   We changed colors in the structure mode preview for dark and light modes.

### Fixed

-   We fix virtual scrolling issue

## [1.3.1] - 2023-05-02

### Changed

-   Minor changes in the internal structure of the widget.

## [1.3.0] - 2023-03-29

### Added

-   With the new "Selection" property, it is now possible to make items in the gallery selectable. Additionally, it is possible to configure an "On selection change" action that runs when the selection changes.

## [1.2.0] - 2022-06-13

### Fixed

-   We removed "widget-gallery-filter" element from DOM if no filters has been provided.

## [1.1.0] - 2021-12-23

### Added

-   We added dark mode to Structure mode preview.

-   We added dark icons for Tile and List view.

## [1.0.3] - 2021-11-16

### Fixed

-   We fixed an issue causing a content inside rows to be re-rendered while using filtering.

## [1.0.2] - 2021-10-13

### Changed

-   We made the "Enable advanced options" available only for Studio users, keeping all the advanced features available by default in Studio Pro.

## [1.0.1] - 2021-10-07

### Changed

-   We added a check to prevent actions to be triggered while being executed

## [1.0.0] - 2021-09-28

### Added

-   Added multiple filtering options

-   Added responsiveness for Desktop, Tablet and Phones

-   Added possibility to reuse filters from Data Grid.
