# Changelog

All notable changes to this widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.13.0] - 2024-11-13

### Fixed

-   Fixed issue with xpath when widget has many filters.

## [1.12.2] - 2024-10-31

### Fixed

-   We resolved an issue where the gallery filter was not being applied at first.

-   We fixed an issue with grid wide filters not resetting.

## [1.12.0] - 2024-09-23

### Changed

-   Widget maintenance.

## [1.11.0] - 2024-09-20

### Breaking changes

-   We removed "Filter groups" properties.

## [1.10.0] - 2024-09-13

### Changed

-   Major filter improvement.

### Fixed

-   Personalization sync and other minor fixes.

### Added

-   The “Filter groups” is a new way of configuring header filters of the widget. This way of configuring filters has three main advantages over previous “Grid wide filtering”: 1. More than 4 filters are allowed in the header at the same time. 2. No restriction on filter type. The header can have one, two or more filters of the same data type. 3. Dropdown filters can use associations.

## [1.9.2] - 2024-08-20

### Fixed

-   We fixed an issue where the style property was not applied.

## [1.9.1] - 2024-06-26

### Fixed

-   We fixed an issue where cursor couldn't be moved inside text input fields with arrow keys.

## [1.9.0] - 2024-06-19

### Fixed

-   We fixed an issue with Gallery widget where content may break out of grid boundaries. Thanks to Ronnie van Doorn for the suggestion.

### Changed

-   We update event listener for `Reset_All_Filters` to allow reset to default value.

## [1.8.0] - 2024-04-30

### Changed

-   We have changed the value displayed in the pagination on design mode. Now the value displayed is the page size.

### Added

-   A new property that allows to change the behavior of the item selection.

-   A new property that allows to configure the trigger event for the "on click" action.

## [1.7.0] - 2024-04-09

### Added

-   Limited the number of items rendered on design mode to 3.

## [1.6.0] - 2024-03-27

### Added

-   A new hook that subscribes the widget to external events.

## [1.5.0] - 2024-03-06

### Added

-   We added a new feature to Gallery: Now it is possible to navigate on gallery items using keyboard.

-   We added a new feature to Gallery: You can use the keyboard to select multiple items inside the gallery, just as simple as shift + arrow keys. You can also unselect an item with shift+space.

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
