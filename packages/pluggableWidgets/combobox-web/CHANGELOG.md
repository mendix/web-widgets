# Changelog

All notable changes to this widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.2.0] - 2025-02-04

### Added

-   We added a new "Selected items sorting" property to set the display order of the selected items. "Caption" based sorting display for selected items now possible for combobox with multiple selection.

### Changed

-   Database multi selection will no longer display selected value sorted by the caption. The default behavior is to display them based on selection order, unless the new "Selected items sorting" configurations are set to "Caption".

## [2.1.4] - 2025-01-29

### Fixed

-   We fixed an issue where combobox does not show initial caption correctly for database source.

-   We fixed an issue where combobox caption expression does not load correctly.

### Changed

-   We remove default value from database source configuration.

## [2.1.3] - 2024-12-11

### Fixed

-   We fixed an issue where placeholder failed to shown on database source.

## [2.1.2] - 2024-12-09

### Fixed

-   We fixed an issue where onchange event on database source triggered directly onload.

-   We fixed an issue where selected value sometimes shows unavailable text on lazy loaded content.

## [2.1.1] - 2024-11-15

### Fixed

-   We fixed an issue where database optional value attribute breaks on runtime when not being set.

-   We fixed an issue where custom content not shown on design preview and runtime for database datasource.

## [2.1.0] - 2024-10-29

### Added

-   We added support for attribute with **Long** type.

### Changed

-   We make **Value** no longer required if the **Target attribute** is not set for database datasource.

-   We restructure **Attribute** group configuration and rename it as **Store value**.

## [2.0.2] - 2024-10-03

### Fixed

-   We fixed an issue where the onChange event was not being triggered when selecting an item for the first time.

-   We fixed an issue where the combo box values would not refresh after toggling its read-only state.

## [2.0.1] - 2024-08-16

### Fixed

-   We fixed an issue with the toolbar visibility when a combobox menu overlays it.

## [2.0.0] - 2024-08-09

### Added

-   We added the ability to auto label combobox, based on the set attributes.

-   We implement the selection API for combobox that use database datasource, which allows the widget selection to be listened into.

### Fixed

-   We fixed a11y issue where aria-required not applied in the widget.

## [1.6.3] - 2024-08-07

### Added

-   We added a new filter type, 'Contains (exact),' as an option to provide a more strict search ranking.

## [1.6.2] - 2024-07-16

### Changed

-   Due to technical limitation, it is not possible to use lazy load on caption type = expression. Thus, we removed lazy loading for this configuration.

## [1.6.1] - 2024-06-28

### Changed

-   We changed the default value for lazy loading. From now on, lazy loading will be true by default.

-   We fixed an issue where in some cases the clear button is rendered outside of a combobox.

## [1.6.0] - 2024-06-19

### Changed

-   We changed how input filtering works for lazy loading. if set to true, then the filter will works by retrieving directly from datasource, otherwise it works by scanning the current loaded data.

### Added

-   We added Spinner and Skeleton loaders in addition to lazy loading feature. The default loader is spinner, and skeleton can also be selected. This improves UX when loading more content.

-   We added lazy loading feature. By default it is turned off. When turned on, the items will be loaded in batches when scrolling.

## # Breaking

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
