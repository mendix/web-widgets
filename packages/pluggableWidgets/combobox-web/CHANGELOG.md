# Changelog

All notable changes to this widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

-   We added lazy loading feature. By default it is turned off. When turned on, the items will be loaded in batches when scrolling.

### Breaking

-   The Combo box now uses Atlas variables for its styling. This may change how the widget looks depending on the custom variables.

## [1.5.0] - 2024-05-06

### Added

-   We added readonly style to the combobox configuration.

## [1.4.0] - 2024-04-19

### Changed

-   We made accessibility text as optional.

-   We are no longer retrieving full dropdown options list if the combobox is readonly.

### Added

-   We improved accessibility on combobox by removing a duplicated aria-expanded from combobox widget.

### Fixed

-   We fixed an issue with the sorting of the displayed selected items in Multi Selection, where the sorting of selected items did not match the sorting in the menu.

## [1.3.1] - 2024-04-08

### Fixed

-   We fixed scrollbar click issue causing combobox to close.

## [1.3.0] - 2024-04-03

### Fixed

-   We fixed sorting on combobox, now the sorting follows the default when the combobox opens, and follow a sorted ranking when any input is given.

-   We fixed focusable element not able to have focus if being placed on custom footer.

### Added

-   We added static values feature support.

## [1.2.0] - 2024-02-27

### Fixed

-   We fixed no options text not shown on single selection.

### Changed

-   We made a minor change on the configuration labels.

### Added

-   We added database list feature support.

## [1.1.3] - 2024-01-22

### Fixed

-   We fixed dropdown options directly closing when clicking on scrollbar if placed in popup dialog

## [1.1.2] - 2024-01-19

### Fixed

-   We fixed selected options not showing for custom content type "yes"

## [1.1.1] - 2024-01-15

### Changed

-   We changed **Select/Unselect button** caption into **Show Select all** for easier understanding

## [1.1.0] - 2024-01-14

### Added

-   We added a new property named **Show footer**, enabling the Combobox widget to display a footer within its menu. When **Show footer** is set to **Yes**, developers can include custom footer content such as text, buttons, links, etc.

-   We added a new property named **Select/Unselect button**, enabling the Combobox widget to display a select/unselect all button on the top of the menu list.

### Fixed

-   Sorting of the search results now follow the sort order set for Selectable objects.

-   We removed the clear button on selected item labels in read-only state.

-   We fixed the positioning of the menu when it is flipped and collides with top of the viewport.

-   We fixed single selection combo box losing focus after selecting an item.
