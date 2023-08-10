# Changelog

All notable changes to this widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.8.5] DataWidgets - 2023-08-10

### Fixed

-   We fixed an issue where a data grid's border went missing if the Hiding property (found in Column capabilities) was set to No.

### [2.6.0] DatagridDateFilter

#### Changed

-   We changed the DOM Structure for date filter to appear inline with the container in order to make the component more accessible.

### [2.5.0] DatagridDropdownFilter

#### Changed

-   We changed the DOM Structure for dropdown filter to appear inline with the container in order to make the component more accessible.

### [2.8.0] Datagrid

#### Changed

-   We improved accessibility of the Datagrid widget.

-   We changed the DOM Structure for filter options to appear inline with the container in order to make the component more accessible.

#### Fixed

-   We fixed table header sticky position incorrectly overlap with dropdown.

### [1.3.4] Gallery

#### Fixed

-   We improved accessibility of the Gallery widget.

### [1.1.2] TreeNode

#### Fixed

-   We fixed Atlas icon unable to be shown on tree node.

-   We fixed an issue where tree child not directly refreshed after updating the data.

## [2.8.4] DataWidgets - 2023-07-13

### [2.7.5] Datagrid

#### Fixed

-   We fixed an issue with Datagrid 2 widget unnecessary requesting total count of items in virtual scrolling mode.

### [1.3.3] Gallery

#### Fixed

-   We fixed an issue with Gallery widget unnecessary requesting total count of items in virtual scrolling mode.

## [2.8.3] DataWidgets - 2023-06-28

### [2.7.4] Datagrid

#### Fixed

-   We fixed an issue with text input in columns that has textbox or textarea.

## [2.8.2] DataWidgets - 2023-06-21

### Fixed

-   We fixed popup menu showing on top of datagrid filter in sticky position.

-   We removed dead span styling from module SCSS

### [2.5.2] DatagridDateFilter

#### Fixed

-   We fixed issue with initial filter condition.

### [2.4.3] DatagridDropdownFilter

#### Fixed

-   We fixed issue with initial filter condition.

### [2.4.2] DatagridNumberFilter

#### Fixed

-   We fixed issue with initial filter condition.

### [2.4.2] DatagridTextFilter

#### Fixed

-   We fixed issue with initial filter condition.

## [2.8.1] DataWidgets - 2023-06-09

### [2.4.2] DatagridDropdownFilter

#### Changed

-   We fixed visilibity issue when dropdown filter is used with layers of modals/popups.

## [2.8.0] DataWidgets - 2023-05-26

### [2.5.1] DatagridDateFilter

#### Changed

-   We changed colors in the structure mode preview for dark and light modes.

-   We replaced glyphicons with internal icons

-   We updated the light and dark icons and tiles for the widget.

### [2.4.1] DatagridDropdownFilter

#### Changed

-   We updated the light and dark icons and tiles for the widget.

-   We changed colors in the structure mode preview for dark and light modes.

### [2.4.1] DatagridNumberFilter

#### Changed

-   We updated the light and dark icons and tiles for the widget.

-   We changed colors in the structure mode preview for dark and light modes.

### [2.4.1] DatagridTextFilter

#### Changed

-   We updated the light and dark icons and tiles for the widget.

-   We changed colors in the structure mode preview for dark and light modes.

### [2.7.3] Datagrid

#### Changed

-   We replaced glyphicons with internal icons

-   We updated page explorer's caption to display datasource.

-   We updated the light and dark icons and tiles for the widget.

-   We changed colors in the structure mode preview for dark and light modes.

#### Fixed

-   We fix virtual scrolling issue

### [1.1.1] DropdownSort

#### Changed

-   We updated the light and dark icons and tiles for the widget.

-   We changed colors in the structure mode preview for dark and light modes.

### [1.3.2] Gallery

#### Changed

-   We updated page explorer's caption to display datasource.

-   We updated the light and dark icons and tiles for the widget.

-   We changed colors in the structure mode preview for dark and light modes.

#### Fixed

-   We fix virtual scrolling issue

### [1.0.2] SelectionHelper

#### Changed

-   We updated the light and dark icons and tiles for the widget.

### [1.1.1] TreeNode

#### Changed

-   We updated page explorer's caption to display datasource.

-   We updated the light and dark icons and tiles for the widget.

-   We changed colors in the structure mode preview for dark and light modes.

## [2.7.2] DataWidgets - 2023-05-02

### [2.7.1] Datagrid

#### Added

-   It is now possible to add Selection helper widget into the header section of Data Grid 2.

### [1.3.1] Gallery

#### Changed

-   Minor changes in the internal structure of the widget.

### [1.0.1] SelectionHelper

#### Added

-   It is now possible to add selection helper in the header of the Data Grid 2 widget.

## [2.7.1] DataWidgets - 2023-05-01

### [2.5.0] DatagridDateFilter

#### Fixed

-   We fixed an issue with widget rendering and performance.

#### Breaking changes

-   We introduce a breaking change that affects how widget is reacting on default value changes. Starting with this version, widget use the default value attribute only as an initial value, and any further changes to the default value attribute will be ignored.

### [2.4.0] DatagridDropdownFilter

#### Fixed

-   We fixed an issue with widget rendering and performance.

#### Breaking changes

-   We introduce a breaking change that affects how widget is reacting on default value changes. Starting with this version, widget use the default value attribute only as an initial value, and any further changes to the default value attribute will be ignored.

### [2.4.0] DatagridNumberFilter

#### Fixed

-   We fixed an issue with widget rendering and performance.

#### Breaking changes

-   We introduce a breaking change that affects how widget is reacting on default value changes. Starting with this version, widget use the default value attribute only as an initial value, and any further changes to the default value attribute will be ignored.

### [2.4.0] DatagridTextFilter

#### Fixed

-   We fixed an issue with widget rendering and performance.

#### Breaking changes

-   We introduce a breaking change that affects how widget is reacting on default value changes. Starting with this version, widget use the default value attribute only as an initial value, and any further changes to the default value attribute will be ignored.

## [2.7.0] DataWidgets - 2023-03-29

### [2.7.0] Datagrid

#### Added

-   With the new "Selection" property, it is now possible to make items in the grid selectable.

### [1.3.0] Gallery

#### Added

-   With the new "Selection" property, it is now possible to make items in the gallery selectable. Additionally, it is possible to configure an "On selection change" action that runs when the selection changes.

### [1.0.0] SelectionHelper

#### Added

-   We added Selection helper widget.

## [2.6.1] DataWidgets - 2023-03-09

### [2.6.1] Datagrid

#### Added

-   We added a new option for pagination placement: "Both". When enabled, pagination controls will be placed on the top and bottom of the data grid.

## [2.6.0] DataWidgets - 2023-02-17

### [2.3.0] DatagridDropdownFilter

#### Changed

-   We added support for association filtering.

### [2.6.0] Datagrid

#### Changed

-   Property change: Filtering tab renamed to Grid wide filtering.

-   Property change: Show header filters property renamed to Grid wide filters and now have a description.

-   Property change: Filters property now have a description.

#### Added

-   We added new column properties for Drop-down filter that allow filtering over associations.

## [2.5.9] DataWidgets - 2023-01-09

### [2.4.4] Datagrid

#### Fixed

-   We fixed an issue with duplicate id attribute.

## [2.5.8] DataWidgets - 2022-12-12

### [2.4.3] Datagrid

#### Added

-   We added _Refresh time_ setting to Datagrid, this allows automatic data refresh.

#### Changed

-   We improved structure preview of the widget in Studio Pro 9.20 and above.

## [2.5.7] DataWidgets - 2022-11-24

### Fixed

-   We renamed scss files to avoid duplication (Ticket #169499)

## [2.5.6] DataWidgets - 2022-09-29

### [2.4.2] DatagridDateFilter

#### Fixed

-   We fixed an issue with DateFilter causing poor page performance (#166116)

## [2.5.5] DataWidgets - 2022-09-01

### [2.4.2] Datagrid

#### Fixed

-   We fixed the issue with column selector, where the list would go out of the screen, making part of it inaccessible. (Ticket(s) #162255 and #163129)

## [2.5.4] DataWidgets - 2022-08-11

### [2.4.1] DatagridDateFilter

#### Fixed

-   We fixed an issue with sync of widget defaultValue property and current filter value (#151789)

### [2.2.3] DatagridDropdownFilter

#### Fixed

-   We fixed an issue with sync of widget defaultValue property and current filter value (#151789)

### [2.3.1] DatagridNumberFilter

#### Fixed

-   We fixed an issue with sync of widget defaultValue property and current filter value (#151789)

### [2.3.2] DatagridTextFilter

#### Fixed

-   We fixed an issue with sync of widget defaultValue property and current filter value (#151789)

## [2.5.3] DataWidgets - 2022-07-05

### [2.4.1] Datagrid

#### Fixed

-   We fixed the issue with filtering widgets rendered outside of header cells.

## [2.5.2] DataWidgets - 2022-06-29

### Fixed

-   We fixed an issue with incorrect wrap text being applied. (Ticket #150083)

### [2.4.0] Datagrid

#### Fixed

-   We fixed the issue with datagrid widget not respecting layout sizing if content is too big.

## [2.5.0] DataWidgets - 2022-05-11

### [2.4.0] DatagridDateFilter

#### Added

-   We added the options to filter for empty and non-empty values.

### [2.3.0] DatagridNumberFilter

#### Added

-   We added the options to filter for empty and non-empty values.

### [2.3.0] DatagridTextFilter

#### Added

-   We added the options to filter for empty and non-empty values.

## [2.4.0] DataWidgets - 2022-04-22

### [2.3.0] Datagrid

#### Added

-   We added a new CSS class to the datagrid widget. That makes it easier to create CSS selector for the custom styling.

#### Fixed

-   We fixed an issue with widgets not rendering on full width in datagrid cells. (Ticket #143363)

## [2.3.1] DataWidgets - 2022-04-13

### [2.3.1] DatagridDateFilter

#### Fixed

-   We fixed a bug that was causing errors in Safari when using DateFilter in Datagrid. (Ticket #144874)

### [2.2.2] DatagridDropdownFilter

#### Fixed

-   We fixed this widget to be compatible with strict CSP mode.

### [2.2.3] Datagrid

#### Fixed

-   We fixed an issue with column hiding behaviour. Now user can't uncheck last visible column in the datagrid. (Ticket #144500)

## [2.3.0] DataWidgets - 2022-02-10

### [2.3.0] DatagridDateFilter

#### Added

-   We added the possibility to apply filter between dates.

#### Fixed

-   We fixed an issue with locale date format when typing it manually.

## [2.2.2] DataWidgets - 2022-01-19

### [2.2.1] DatagridDropdownFilter

#### Fixed

-   We fixed an issue when selecting an invalid value for an attribute was cleaning the filter if used in Gallery or Data grid 2 header. Now it will match the correct attribute and apply the filter anyway (Ticket #138870).

### [2.2.2] Datagrid

#### Fixed

-   We fixed an issue with column selector on Windows machines (Ticket #139234).

## [2.2.1] DataWidgets - 2022-01-06

### Fixed

-   We fixed the z-index of filters and column selector while using popup layouts.

### Changed

-   We changed style variables to use `!default` to allow value overriding with Atlas.

### [2.2.1] DatagridDateFilter

#### Added

-   We added a class `date-filter-container` to the main container for the date picker calendar.

### [2.2.1] Datagrid

#### Changed

-   We changed the icons from front-awesome to be pure SVG.

## [2.2.0] DataWidgets - 2021-12-23

### [2.2.0] DatagridDateFilter

#### Added

-   We added dark mode to Structure mode preview.

-   We added dark icons for Tile and List view.

### [2.2.0] DatagridDropdownFilter

#### Added

-   We added dark mode to Structure mode preview.

-   We added dark icons for Tile and List view.

### [2.2.0] DatagridNumberFilter

#### Added

-   We added dark mode to Structure mode preview.

-   We added dark icons for Tile and List view.

### [2.2.0] DatagridTextFilter

#### Added

-   We added dark mode to Structure mode preview.

-   We added dark icons for Tile and List view.

### [2.2.0] Datagrid

#### Added

-   We added "Tooltip" property for column, which allow you to control text that will be seen when hovering cell.

-   We added dark mode to Structure mode preview.

-   We added dark icons for Tile and List view.

### [1.1.0] DropdownSort

#### Added

-   We added dark mode to Structure mode preview.

-   We added dark icons for Tile and List view.

### [1.1.0] Gallery

#### Added

-   We added dark mode to Structure mode preview.

-   We added dark icons for Tile and List view.

### [1.1.0] TreeNode

#### Added

-   We added dark mode to Structure mode preview.

-   We added dark icons for Tile and List view.

## [2.1.1] DataWidgets - 2021-12-10

### [2.1.1] DatagridDateFilter

#### Fixed

-   We fixed an issue with week start day not respecting current app settings (Ticket #136173).

#### Changed

-   We aligned week days names with date picker widget from Studio Pro.

## [2.1.0] DataWidgets - 2021-12-03

### [2.1.0] Datagrid

#### Added

-   We added a property to wrap texts in the columns.

### [1.0.2] TreeNode

#### Fixed

-   We fixed an issue that causes design properties and styles to not be applied to the widget in Design mode & Studio.

## [2.0.3] DataWidgets - 2021-11-16

### Changed

-   We removed the Snippet, Example enumeration and version constant from the module.

### Added

-   We added a .version file inside themesource/datawidgets containing the module version.

### [2.0.3] Datagrid

#### Fixed

-   We fixed an issue causing a content inside rows to be re-rendered while using sorting or filtering.

### [1.0.3] Gallery

#### Fixed

-   We fixed an issue causing a content inside rows to be re-rendered while using filtering.

## [2.0.2] DataWidgets - 2021-10-13

### Filter widgets

#### Added

-   We added the possibility to store the filter value in an attribute and trigger an onChange event on every filter change.

-   We added a "Enable advanced options" toggle for Studio users.

### Data Grid 2, Gallery & Tree Node

#### Changed

-   We made the "Enable advanced options" available only for Studio users, keeping all the advanced features available by default in Studio Pro.

## [2.0.1] DataWidgets - 2021-10-07

### Filter widgets

#### Fixed

-   We fixed an issue where widgets get duplicate identifiers assigned under certain circumstances which causes inconsistencies in accessibility.

### Data Grid 2

#### Changed

-   We added a check to prevent actions to be triggered while being executed

#### Fixed

-   We fixed an issue where widgets get duplicate identifiers assigned under certain circumstances which causes inconsistencies in accessibility.

### Gallery

#### Changed

-   We added a check to prevent actions to be triggered while being executed

## [2.0.0] DataWidgets - 2021-09-28

### Added

-   We added the possibility to reuse all data grid filters with Gallery widget.

-   We added Gallery widget.

-   We added Tree-node widget.

-   We added Drop-down sort widget.

### Changed

-   We renamed Datagrid date filter to Date filter.

-   We renamed Datagrid drop-down filter to Drop-down filter.

-   We renamed Datagrid number filter to Number filter.

-   We renamed Datagrid text filter to Text filter.
