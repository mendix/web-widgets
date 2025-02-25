# Changelog

All notable changes to this widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.30.1] - 2025-02-25

### Fixed

-   Fixed a layout issue when using "autofit content" in column settings.

-   Fixed a problem where the column didn't set its default value in the personalization if the column is hidden by default.

## [2.30.0] - 2025-02-20

### Changed

-   We have optimized some internal workings to improve export to Excel performance.

-   Column settings related to drop-down filter are moved into dedicated group

### Fixed

-   Accessibility fix regarding keyboard navigation and focus

-   Fixed issue with filters losing focus on refresh

-   Fixed issue with loading indicator not being displayed in some scenarios

-   We fixed an issue where an incorrect filter type was saved to personalization when a column was hidden by default.

### Breaking changes

-   Drop-down filter is rewritten with new, more accurate HTML for better accessibility, which may break existing CSS styling for projects using drop-down filter

-   HTML structure changed, which may affect some CSS and styling

## [2.29.1] - 2025-01-24

### Fixed

-   We fixed the position configuration of paging button that removed on previous version.

## [2.29.0] - 2025-01-21

### Added

-   We introduced a setting to exclude filters from being stored in the Personalization configuration.

-   We have introduced show number of rows for virtual scrolling and load more pagination mode.

## [2.28.2] - 2024-12-12

### Fixed

-   We've stopped showing the loading indicator when all data were already loaded. The loading indicator was incorrectly displayed during client refresh operations involving a microflow.

## [2.28.1] - 2024-11-21

### Fixed

-   We fixed an issue where Export to Excel was not working in certain cases.

## [2.28.0] - 2024-11-13

### Fixed

-   Fixed issue with xpath when widget has many filters.

### Added

-   We have introduced the loading state in Datagrid 2, so that the loading state is displayed on every pagination, filter search, or loading.

### Changed

-   We improved resizing behaviour of the widget. It is now saving personalization settings only at the end of the resizing.

## [2.26.1] - 2024-10-31

### Changed

-   We improved our drop-down filter integration - now the drop-down can store its value in the personalization config. For best results, the new 'Use lazy load' property should be set to false.

### Added

-   We added new 'Use lazy load' property that can be used to improve the end-user experience.

### Fixed

-   We fixed an issue with grid wide filters not resetting.

## [2.24.0] - 2024-09-23

### Added

-   We have introduced support for reference set associations in the linked attribute property.

## [2.23.0] - 2024-09-20

### Fixed

-   We fixed refreshed interval timer being duplicated on pagination click.

### Breaking changes

-   We removed "Filter groups" properties.

## [2.22.0] - 2024-09-13

### Changed

-   Major filter improvement.

### Fixed

-   Personalization and other fixes.

### Added

-   The “Filter groups” is a new way of configuring header filters of the widget. This way of configuring filters has four main advantages over previous “Grid wide filtering”: 1. More than 4 filters are allowed in the header at the same time. 2. No restriction on filter type. The header can have one, two or more filters of the same data type. 3. Dropdown filters can use associations. 4. If personalization is enabled, filter state is saved along with other widget settings.

## [2.21.2] - 2024-08-07

### Fixed

-   We fixed Export to Excel not exporting when datasource had unavailable data.

## [2.21.1] - 2024-07-10

### Fixed

-   We have resolved an issue where the Data Grid would not render in certain cases when a visibility expression was configured on some of its columns.

## [2.21.0] - 2024-07-08

### Fixed

-   Fixed an issue where data could not be exported if some columns used associations.

### Added

-   Added a new "Export value" property for columns with custom content.

## [2.20.0] - 2024-06-19

### Changed

-   We update event listener for `Reset_All_Filters` to allow reset to default value.

## [2.19.0] - 2024-05-27

### Fixed

-   We fixed an issue with Datagrid 2 not working correctly when **Use React client** setting is on.

## [2.18.1] - 2024-05-14

### Fixed

-   Fixed an issue when exporting numbers to excel. Instead of the type number, the value exported was of string type.

## [2.18.0] - 2024-04-30

### Changed

-   We have changed the value displayed in the pagination on design mode. Now the value displayed is the page size.

### Fixed

-   Fixed an issue where pagination buttons wouldn't show up when there's no items in the Datagrid 2 pagination even when button visibility was set to "always".

### Added

-   A new property that allows to change the behavior of the item selection.

-   A new property that controls custom content events.

### Removed

-   We removed the sorting console warnings that were being triggered incorrectly.

## [2.17.0] - 2024-04-17

### Fixed

-   Fixed an issue with default column colors in design mode.

-   Fixed an issue with dynamic text not rendering.

### Changed

-   We have enhanced the swap behavior of the columns, making it more intuitive and user-friendly. This improvement also includes a slight adjustment to the classnames applied to the elements being swapped, providing better control over their styling.

### Added

-   We added the ability to store personalization configuration in the browser's local storage, in addition to the existing option of using an attribute.

## [2.16.1] - 2024-04-16

### Fixed

-   We fixed an issue with sorting by columns that display dynamic text or custom content.

## [2.16.0] - 2024-04-09

### Added

-   Limited the number of items rendered on design mode to 3.

-   We have expanded the pagination options by introducing a new feature called 'Load more'. This option enables users to load additional data with the click of a button. Thank you, @sharadsums, for making this feature.

### Changed

-   Previously, if the attribute configured for storing personalization settings was changed externally, the data grid did not reflect these changes. Moving forward, the data grid widget will now automatically re-read and apply personalization settings whenever the underlying attribute changes.

### Fixed

-   We fixed an issue where the columns exported on ExportToExcel action are not the same as the ones visible on Datagrid 2.

-   We made Visible property of columns required. It is no longer possible to leave the expression empty, therefore you will need to explicitly set a boolean value to set the visibility.

## [2.15.0] - 2024-03-27

### Added

-   A new hook that subscribes the widget to external events.

## [2.14.0] - 2024-03-06

### Fixed

-   We fixed an issue where the columns exported on ExportToExcel action are not the same as the ones visible on Datagrid 2.

## [2.13.0] - 2024-02-05

### Added

-   Minimum width property for columns that use auto-fill. When needed, you can adjust how the column content is rendered on small screen sizes.

-   We add a double click option for datagrid's row selection trigger.

## [2.12.1] - 2024-01-23

### Fixed

-   We fixed an issue where Dynamic text values cells would be blank in exported .xlsx

## [2.12.0] - 2024-01-16

### Added

-   We added pagination visibility configuration named "Show paging buttons" property. User can choose to always show pagination button or automatically hide based on number of data displayed. Thanks to @Andries-Smit for the help on this feature.

### Fixed

-   Fixed an issue with the header when using custom content in the column.

-   Fixed an issue that caused the datagrid to crash after changing column settings when the attribute for saving the configuration was provided.

## [2.11.0] - 2023-12-06

### Added

-   We added a new expression property named "Visible" in columns where the developer can select a column's visibility from the Datagrid. When using Datagrid, sometimes columns don't need to be shown. By adding "Visible" expression the developers can specify when they want to display columns. Special thanks to @Andries-Smit for the help on this feature.

-   Improved keyboard navigation for better accessibility, which was implemented according to the WAI ARIA guide. Now it's possible to use arrows, page up, page down, home, and end buttons to navigate focus within a grid. Additionally, ctrl+home moves focus on the top-left corner (first cell), and ctrl+end moves focus on the bottom-right corner (last cell).

## [2.10.4] - 2023-11-28

### Fixed

-   We fixed an issue where it was not possible to select a column in design mode by clicking on the column row.

## [2.10.3] - 2023-11-21

### Fixed

-   We fixed an issue with clickable rows not having pointer (hand) cursor on hover.

## [2.10.2] - 2023-11-13

### Fixed

-   Fixed a regression that was introduced in 2.10.0, where the column was missing a caption if the caption used parameters.

## [2.10.1] - 2023-11-02

### Fixed

-   We fixed an issue where personalization settings were not always correctly restored.

## [2.10.0] - 2023-10-31

### Added

-   A new API that allows data export from data sources configured in the data grid. Together with this addition, we introduce the "Export_To_Excel" JS action, which is a quick and easy way to export and save data as an XLSX document. This action is distributed as a part of "Data Widgets" module.

## [2.9.0] - 2023-10-13

### Fixed

-   We removed redundant code to improve widget load time in the browser.

-   We fixed an issue where column selector and checkbox icon not aligned with filter control.

-   We fixed issues with filter position overlapping below the next container.

### Changed

-   We changed DOM structure to allow sticky header on virtual scrolling pagination mode.

-   We added keyboard support for multi selection (`Ctrl + A` and `Shift + Click`).

## [2.8.2] - 2023-08-25

### Fixed

-   We fixed an issue where columns, which were configured to be hidden by default, remained visible despite visibility settings.

## [2.8.1] - 2023-08-22

### Fixed

-   We fixed a rendering issue when viewing "Data grid" in "Design mode" showed an error message instead of the actual widget preview.

## [2.8.0] - 2023-08-10

### Changed

-   We improved accessibility of the Datagrid widget.

-   We changed the DOM Structure for filter options to appear inline with the container in order to make the component more accessible.

### Fixed

-   We fixed table header sticky position incorrectly overlap with dropdown.

## [2.7.5] - 2023-07-13

### Fixed

-   We fixed an issue with Datagrid 2 widget unnecessary requesting total count of items in virtual scrolling mode.

## [2.7.4] - 2023-06-28

### Fixed

-   We fixed an issue with text input in columns that has textbox or textarea.

## [2.7.3] - 2023-05-26

### Changed

-   We replaced glyphicons with internal icons

-   We updated page explorer's caption to display datasource.

-   We updated the light and dark icons and tiles for the widget.

-   We changed colors in the structure mode preview for dark and light modes.

### Fixed

-   We fix virtual scrolling issue

## [2.7.1] - 2023-05-02

### Added

-   It is now possible to add Selection helper widget into the header section of Data Grid 2.

## [2.7.0] - 2023-03-29

### Added

-   With the new "Selection" property, it is now possible to make items in the grid selectable.

## [2.6.1] - 2023-03-09

### Added

-   We added a new option for pagination placement: "Both". When enabled, pagination controls will be placed on the top and bottom of the data grid.

## [2.6.0] - 2023-02-17

### Changed

-   Property change: Filtering tab renamed to Grid wide filtering.

-   Property change: Show header filters property renamed to Grid wide filters and now have a description.

-   Property change: Filters property now have a description.

### Added

-   We added new column properties for Drop-down filter that allow filtering over associations.

## [2.4.4] - 2023-01-09

### Fixed

-   We fixed an issue with duplicate id attribute.

## [2.4.3] - 2022-12-12

### Added

-   We added _Refresh time_ setting to Datagrid, this allows automatic data refresh.

### Changed

-   We improved structure preview of the widget in Studio Pro 9.20 and above.

## [2.4.2] - 2022-09-01

### Fixed

-   We fixed the issue with column selector, where the list would go out of the screen, making part of it inaccessible. (Ticket(s) #162255 and #163129)

## [2.4.1] - 2022-07-05

### Fixed

-   We fixed the issue with filtering widgets rendered outside of header cells.

## [2.4.0] - 2022-06-29

### Fixed

-   We fixed the issue with datagrid widget not respecting layout sizing if content is too big.

## [2.3.0] - 2022-04-22

### Added

-   We added a new CSS class to the datagrid widget. That makes it easier to create CSS selector for the custom styling.

### Fixed

-   We fixed an issue with widgets not rendering on full width in datagrid cells. (Ticket #143363)

## [2.2.3] - 2022-04-13

### Fixed

-   We fixed an issue with column hiding behavior. Now user can't uncheck last visible column in the datagrid. (Ticket #144500)

## [2.2.2] - 2022-01-19

### Fixed

-   We fixed an issue with column selector on Windows machines (Ticket #139234).

## [2.2.1] - 2022-01-06

### Changed

-   We changed the icons from front-awesome to be pure SVG.

## [2.2.0] - 2021-12-23

### Added

-   We added "Tooltip" property for column, which allow you to control text that will be seen when hovering cell.

-   We added dark mode to Structure mode preview.

-   We added dark icons for Tile and List view.

## [2.1.0] - 2021-12-03

### Added

-   We added a property to wrap texts in the columns.

## [2.0.3] - 2021-11-16

### Fixed

-   We fixed an issue causing a content inside rows to be re-rendered while using sorting or filtering.

## [2.0.2] - 2021-10-13

### Changed

-   We made the "Enable advanced options" available only for Studio users, keeping all the advanced features available by default in Studio Pro.

## [2.0.1] - 2021-10-07

### Changed

-   We added a check to prevent actions to be triggered while being executed

### Fixed

-   We fixed an issue where widgets get duplicate identifiers assigned under certain circumstances which causes inconsistencies in accessibility.

## [2.0.0] - 2021-09-28

### Added

-   We added new options to allow filtering in multiple attributes. To enable it make sure you have "Show header filters" on.

-   We added a toolbox category and toolbox tile image for Studio & Studio Pro.

### Changed

-   We fixed the positioning of the filters when virtual scrolling was enabled and there was no data being presented.

-   We renamed the advanced settings property to emphasize this property is about the advanced properties' activation.

## [1.2.1] - 2021-07-01

### Changed

-   We fixed an issue with data source default sorting wasn't being applied correctly.

## [1.2.0] - 2021-06-29

### Added

-   We implemented lazy filtering and sorting. Now Data Grid v2 will not load all the data if you have sorting or filtering enabled.

-   We added an option to auto-load values from enumerations in the Data Grid drop-down filter.

-   We added the capability to restore filter values and filtered rows when navigating back from another page.

### Changed

-   We fixed a problem combining a Text Box widget inside a column with an on leave or on change event preventing focus from being lost after triggering the events.

-   We fixed an issue with headers containing attributes in the text template.

-   We prevented settings' on change action to be fired continuously while resizing a column, causing performance issues.

-   We prevented the settings from being overwritten when loading a new value from the settings attribute.

-   We fixed a misalignment between columns when a column header was empty and a filter was placed in it.
