# Changelog

All notable changes to this widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [4.0.1] - 2024-12-13

### Breaking changes

-   "The area to open or close the menu" field is now required.

## [4.0.0] - 2024-11-13

### Breaking changes

-   We moved the widget styling to Atlas core to make exclusion variables work. Please update atlas-core module to a minimum 3.15.0 for Studio Pro 10.6.0 and above or 3.12.5 for below to keep the styling intact.

### Added

-   We added a configurable clipping strategy option.

### Fixed

-   We fixed an issue where popup menu would not overflow the parent widget.

## [3.6.1] - 2024-09-18

### Fixed

-   We fixed popup menu getting cut off due to overflow in parent widget.

## [3.6.0] - 2024-08-20

### Added

-   We added a new 'Close on' setting to customize the popup's closing behavior, allowing it to close when clicked or hovered outside the popup.

### Breaking changes

-   The default behavior for closing a popup set to open on 'hover' is now 'hover leave'.

## [3.5.3] - 2024-01-08

### Fixed

-   We fixed an issue where styling classes would apply on popup menu instead of the widget itself.

## [3.5.2] - 2023-09-27

### Fixed

-   We removed redundant code to improve widget load time in the browser.

## [3.5.1] - 2023-08-18

### Fixed

-   We fixed a small performance issue. No visual or behavioral changes.

## [3.5.0] - 2023-06-28

### Changed

-   We changed the DOM Structure to from `div` to `ul` - `li` for accessibility purposes.

### Fixed

-   We have addressed an issue that was causing the popup menu to appear behind other elements, such as modal popups. This fix involved modifying the DOM structure by moving the `popupmenu-menu` element to the same level as the trigger button. As a result, custom styling that targets the popup menu may have been affected.

## [3.4.0] - 2023-06-05

### Changed

-   We updated the light and dark icons and tiles for the widget.

-   We changed colors in the structure mode preview for dark and light modes.

## [3.3.0] - 2023-01-04

### Changed

-   We fixed an issue with widget rendering where pop-up in a column would cause a bug. (Ticket(s) #165858, #166376, #167745)

## [3.2.2] - 2022-02-01

### Fixed

-   We fixed an issue with the popup menu going off the screen when placed on the edge of the page using Firefox on Windows.

## [3.2.1] - 2022-01-19

### Fixed

-   We fixed an issue while showing the popup items using Firefox on Windows (Ticket #139529).

## [3.2.0] - 2021-12-23

### Added

-   We added dark mode to Structure mode preview.

-   We added dark icons for Tile and List view.

## [3.1.1] - 2021-12-03

### Fixed

-   We fixed an issue that causes design properties and styles to not be applied to the widget in Design mode & Studio.

## [3.1.0] - 2021-11-18

### Added

-   We added a visibility property on popup items.

## [3.0.0] - 2021-09-28

### Added

-   We added a toolbox category and toolbox tile image for Studio & Studio Pro.

### Changed

-   We renamed the custom visualization property to enable advanced options.
