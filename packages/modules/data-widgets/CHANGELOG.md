# Changelog

All notable changes to this widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.30.1] DataWidgets - 2025-02-25

### [2.30.1] Datagrid

#### Fixed

-   Fixed a layout issue when using "autofit content" in column settings.

-   Fixed a problem where the column didn't set its default value in the personalization if the column is hidden by default.

## [2.30.0] DataWidgets - 2025-02-20

### [2.10.0] DatagridDropdownFilter

#### Added

-   New set of settings allowing to make drop-down look and behave similar to combobox widget

#### Changed

-   HTML is changed to meet modern accessibility requirements

### [2.30.0] Datagrid

#### Changed

-   We have optimized some internal workings to improve export to Excel performance.

-   Column settings related to drop-down filter are moved into dedicated group

#### Fixed

-   Accessibility fix regarding keyboard navigation and focus

-   Fixed issue with filters losing focus on refresh

-   Fixed issue with loading indicator not being displayed in some scenarios

#### Breaking changes

-   Drop-down filter is rewritten with new, more accurate HTML for better accessibility, which may break existing CSS styling for projects using drop-down filter

-   HTML structure changed, which may affect some CSS and styling

## [2.29.1] DataWidgets - 2025-01-24

### [2.29.1] Datagrid

#### Fixed

-   We fixed the position configuration of paging button that removed on previous version.

## [2.29.0] DataWidgets - 2025-01-21

### [2.11.1] DatagridDateFilter

#### Fixed

-   We fixed an issue with range date filter working incorrectly in some cases.

### [2.29.0] Datagrid

#### Added

-   We introduced a setting to exclude filters from being stored in the Personalization configuration.

-   We have introduced show number of rows for virtual scrolling and load more pagination mode.

## [2.28.2] DataWidgets - 2024-12-12

### [2.28.2] Datagrid

#### Fixed

-   We've stopped showing the loading indicator when all data were already loaded. The loading indicator was incorrectly displayed during client refresh operations involving a microflow.

## [2.28.1] DataWidgets - 2024-11-21

### Fixed

-   We fixed an issue where css selector "--brand-primary" gets overwrite by datagrid.

### [2.28.1] Datagrid

#### Fixed

-   We fixed an issue where Export to Excel was not working in certain cases.

## [2.28.0] DataWidgets - 2024-11-13

### [2.10.4] DatagridDateFilter

#### Changed

-   We improved type mismatch filter error message.

### [2.9.3] DatagridDropdownFilter

#### Fixed

-   We fixed an issue where filters not able to set guid value for reference selector.

#### Changed

-   We improved type mismatch filter error message.

### [2.8.4] DatagridNumberFilter

#### Changed

-   We improved type mismatch filter error message.

#### Fixed

-   We fixed an issue where onChange wouldn't triggered on empty or not empty filter.

### [2.8.4] DatagridTextFilter

#### Changed

-   We improved type mismatch filter error message.

#### Fixed

-   We fixed an issue where onChange wouldn't triggered on empty or not empty filter.

### [2.28.0] Datagrid

#### Fixed

-   Fixed issue with xpath when widget has many filters.

#### Added

-   We have introduced the loading state in Datagrid 2, so that the loading state is displayed on every pagination, filter search, or loading.

#### Changed

-   We improved resizing behaviour of the widget. It is now saving personalization settings only at the end of the resizing.

### [1.13.0] Gallery

#### Fixed

-   Fixed issue with xpath when widget has many filters.

### [1.2.1] TreeNode

#### Fixed

-   We fixed an issue where Tree Nodes resetting it's collapse state while reloading data.

## [2.26.0] DataWidgets - 2024-10-31

### [2.10.3] DatagridDateFilter

#### Fixed

-   We fixed an issue with grid wide filters not resetting.

### [2.9.2] DatagridDropdownFilter

#### Fixed

-   We fixed an issue where onChange events were not being triggered on dropdown filter.

-   We fixed an issue with dropdown filters in some cases not setting or resetting.

### [2.8.3] DatagridNumberFilter

#### Fixed

-   We fixed an issue with grid wide filters not resetting.

### [2.8.3] DatagridTextFilter

#### Fixed

-   We fixed an issue with grid wide filters not resetting.

### [2.26.1] Datagrid

#### Changed

-   We improved our drop-down filter integration - now the drop-down can store its value in the personalization config. For best results, the new 'Use lazy load' property should be set to false.

#### Added

-   We added new 'Use lazy load' property that can be used to improve the end-user experience.

#### Fixed

-   We fixed an issue with grid wide filters not resetting.

### [1.12.2] Gallery

#### Fixed

-   We resolved an issue where the gallery filter was not being applied at first.

-   We fixed an issue with grid wide filters not resetting.

## [2.24.1] DataWidgets - 2024-10-14

### Fixed

-   We fixed an issue where filters wouldn't reset.

### [2.8.2] DatagridNumberFilter

#### Fixed

-   We fixed an issue where filters wouldn't reset.

### [2.8.2] DatagridTextFilter

#### Fixed

-   We fixed an issue where filters wouldn't reset.

## [2.24.0] DataWidgets - 2024-09-23

### [2.10.2] DatagridDateFilter

#### Changed

-   Widget maintenance.

#### Fixed

-   Fixed issue with "empty" and "not empty" filters showing incorrect results.

### [2.9.1] DatagridDropdownFilter

#### Changed

-   Widget maintenance.

### [2.8.1] DatagridNumberFilter

#### Changed

-   Widget maintenance.

### [2.8.1] DatagridTextFilter

#### Changed

-   Widget maintenance.

### [2.24.0] Datagrid

#### Added

-   We have introduced support for reference set associations in the linked attribute property.

### [1.2.1] DropdownSort

#### Changed

-   Widget maintenance.

### [1.12.0] Gallery

#### Changed

-   Widget maintenance.

## [2.23.0] DataWidgets - 2024-09-20

### Breaking changes

-   We removed "Filter groups" properties.

### [2.10.0] DatagridDateFilter

#### Breaking changes

-   We removed "Group key" property.

### [2.9.0] DatagridDropdownFilter

#### Breaking changes

-   We removed "Group key" property.

### [2.8.0] DatagridNumberFilter

#### Breaking changes

-   We removed "Group key" property.

### [2.8.0] DatagridTextFilter

#### Breaking changes

-   We removed "Group key" property.

### [2.23.0] Datagrid

#### Fixed

-   We fixed refreshed interval timer being duplicated on pagination click.

#### Breaking changes

-   We removed "Filter groups" properties.

### [1.11.0] Gallery

#### Breaking changes

-   We removed "Filter groups" properties.

## [2.22.0] DataWidgets - 2024-09-13

### Changed

-   Improved filters in data widgets.

### [2.9.0] DatagridDateFilter

#### Changed

-   Improved integration with parent widgets.

#### Added

-   Group key -- a new setting to associate the filter with the group (see "Filter groups" in docs for more information).

### [2.8.0] DatagridDropdownFilter

#### Changed

-   Improved integration with parent widgets.

#### Added

-   Group key -- a new setting to associate the filter with the group (see "Filter groups" in docs for more information).

### [2.7.0] DatagridNumberFilter

#### Changed

-   Improved integration with parent widgets.

#### Added

-   Group key -- a new setting to associate the filter with the group (see "Filter groups" in docs for more information).

### [2.7.0] DatagridTextFilter

#### Changed

-   Improved integration with parent widgets.

#### Added

-   Group key -- a new setting to associate the filter with the group (see "Filter groups" in docs for more information).

### [2.22.0] Datagrid

#### Changed

-   Major filter improvement.

#### Fixed

-   Personalization and other fixes.

#### Added

-   The “Filter groups” is a new way of configuring header filters of the widget. This way of configuring filters has four main advantages over previous “Grid wide filtering”: 1. More than 4 filters are allowed in the header at the same time. 2. No restriction on filter type. The header can have one, two or more filters of the same data type. 3. Dropdown filters can use associations. 4. If personalization is enabled, filter state is saved along with other widget settings.

### [1.2.0] DropdownSort

#### Changed

-   Reworked and improved integration with gallery.

### [1.10.0] Gallery

#### Changed

-   Major filter improvement.

#### Fixed

-   Personalization sync and other minor fixes.

#### Added

-   The “Filter groups” is a new way of configuring header filters of the widget. This way of configuring filters has three main advantages over previous “Grid wide filtering”: 1. More than 4 filters are allowed in the header at the same time. 2. No restriction on filter type. The header can have one, two or more filters of the same data type. 3. Dropdown filters can use associations.

## [2.21.4] DataWidgets - 2024-08-20

### [1.9.2] Gallery

#### Fixed

-   We fixed an issue where the style property was not applied.

## [2.21.3] DataWidgets - 2024-08-15

### [2.6.1] DatagridNumberFilter

#### Fixed

-   We fixed an issue with the filter unexpectedly focusing when combined with conditional visibility.

### [2.6.1] DatagridTextFilter

#### Fixed

-   We fixed an issue with the filter unexpectedly focusing when combined with conditional visibility.

## [2.21.2] DataWidgets - 2024-08-07

### [2.21.2] Datagrid

#### Fixed

-   We fixed Export to Excel not exporting when datasource had unavailable data.

## [2.21.1] DataWidgets - 2024-07-10

### [2.7.1] DatagridDropdownFilter

#### Fixed

-   We fixed on change event not triggering for association filters.

### [2.21.1] Datagrid

#### Fixed

-   We have resolved an issue where the Data Grid would not render in certain cases when a visibility expression was configured on some of its columns.

## [2.21.0] DataWidgets - 2024-07-08

### [2.21.0] Datagrid

#### Fixed

-   Fixed an issue where data could not be exported if some columns used associations.

#### Added

-   Added a new "Export value" property for columns with custom content.

## [2.20.1] DataWidgets - 2024-06-26

### [1.9.1] Gallery

#### Fixed

-   We fixed an issue where cursor couldn't be moved inside text input fields with arrow keys.

## [2.20.0] DataWidgets - 2024-06-19

### Added

-   Update JS actions for resetting filters in Data grid 2 and Gallery. `Reset_All_Filters` and `Reset_Filter` now have the option to reset to default filter's value.

-   New JS actions for setting filters in Data grid 2 and Gallery. `Set_Filter` set a single filter to a specific value within Data grid 2 or Gallery.

### Breaking changes

-   Data widgets now use Atlas variables for its styling. This may change how the widgets look depending on the custom variables.

### [2.8.0] DatagridDateFilter

#### Fixed

-   The default filter values are now restored on initial page load.

#### Added

-   A new hook that subscribes the widget to `Set_Filter` action.

#### Changed

-   We update event listener for `Reset_Filter` to allow reset to default value.

### [2.7.0] DatagridDropdownFilter

#### Added

-   A new hook that subscribes the widget to `Set_Filter` action.

#### Changed

-   We update event listener for `Reset_Filter` to allow reset to default value.

### [2.6.0] DatagridNumberFilter

#### Added

-   A new hook that subscribes the widget to `Set_Filter` action.

#### Changed

-   We update event listener for `Reset_Filter` to allow reset to default value.

### [2.6.0] DatagridTextFilter

#### Added

-   A new hook that subscribes the widget to `Set_Filter` action.

#### Changed

-   We update event listener for `Reset_Filter` to allow reset to default value.

### [2.20.0] Datagrid

#### Changed

-   We update event listener for `Reset_All_Filters` to allow reset to default value.

### [1.9.0] Gallery

#### Fixed

-   We fixed an issue with Gallery widget where content may break out of grid boundaries. Thanks to Ronnie van Doorn for the suggestion.

#### Changed

-   We update event listener for `Reset_All_Filters` to allow reset to default value.

## [2.19.1] DataWidgets - 2024-05-27

### [2.19.0] Datagrid

#### Fixed

-   We fixed an issue with Datagrid 2 not working correctly when **Use React client** setting is on.

## [2.19.0] DataWidgets - 2024-05-15

### [2.7.1] DatagridDateFilter

#### Fixed

-   We fixed an issue where the filter type selector was not switching types correctly.

### [1.2.0] TreeNode

#### Fixed

-   We fixed an issue with nested Tree Nodes, where the nested empty Tree Node would break its parent behavior.

## [2.18.1] DataWidgets - 2024-05-14

### [2.18.1] Datagrid

#### Fixed

-   Fixed an issue when exporting numbers to excel. Instead of the type number, the value exported was of string type.

## [2.18.0] DataWidgets - 2024-04-30

### [2.5.1] DatagridNumberFilter

#### Fixed

-   We resolved an issue where the default value was not working in certain cases.

### [2.5.1] DatagridTextFilter

#### Fixed

-   We resolved an issue where the default value was not working in certain cases.

### [2.18.0] Datagrid

#### Changed

-   We have changed the value displayed in the pagination on design mode. Now the value displayed is the page size.

#### Fixed

-   Fixed an issue where pagination buttons wouldn't show up when there's no items in the Datagrid 2 pagination even when button visibility was set to "always".

#### Added

-   A new property that allows to change the behavior of the item selection.

-   A new property that controls custom content events.

#### Removed

-   We removed the sorting console warnings that were being triggered incorrectly.

### [1.8.0] Gallery

#### Changed

-   We have changed the value displayed in the pagination on design mode. Now the value displayed is the page size.

#### Added

-   A new property that allows to change the behavior of the item selection.

-   A new property that allows to configure the trigger event for the "on click" action.

## [2.17.0] DataWidgets - 2024-04-17

### [2.17.0] Datagrid

#### Fixed

-   Fixed an issue with default column colors in design mode.

-   Fixed an issue with dynamic text not rendering.

#### Changed

-   We have enhanced the swap behavior of the columns, making it more intuitive and user-friendly. This improvement also includes a slight adjustment to the classnames applied to the elements being swapped, providing better control over their styling.

#### Added

-   We added the ability to store personalization configuration in the browser's local storage, in addition to the existing option of using an attribute.

## [2.16.1] DataWidgets - 2024-04-16

### [2.16.1] Datagrid

#### Fixed

-   We fixed an issue with sorting by columns that display dynamic text or custom content.

## [2.16.0] DataWidgets - 2024-04-09

### [2.16.0] Datagrid

#### Added

-   Limited the number of items rendered on design mode to 3.

-   We have expanded the pagination options by introducing a new feature called 'Load more'. This option enables users to load additional data with the click of a button. Thank you, @sharadsums, for making this feature.

#### Changed

-   Previously, if the attribute configured for storing personalization settings was changed externally, the data grid did not reflect these changes. Moving forward, the data grid widget will now automatically re-read and apply personalization settings whenever the underlying attribute changes.

#### Fixed

-   We fixed an issue where the columns exported on ExportToExcel action are not the same as the ones visible on Datagrid 2.

-   We made Visible property of columns required. It is no longer possible to leave the expression empty, therefore you will need to explicitly set a boolean value to set the visibility.

### [1.7.0] Gallery

#### Added

-   Limited the number of items rendered on design mode to 3.

## [2.15.0] DataWidgets - 2024-03-27

### Fixed

-   Fixed Datagrid Date Filter custom date formats throwing error. When customers try to use a custom format like `YYww.E` they were getting an error and also the output date were not correct.

### Added

-   New JS actions for resetting filters in Data grid 2 and Gallery. `Reset_All_Filters` resets all filters within Data grid 2 or Gallery. `Reset_Filter` resets a single filter.

### [2.7.0] DatagridDateFilter

#### Fixed

-   Fixed custom date format throwing error. When customers try to use a custom format like `YYww.E` they were getting an error and also the output date were not correct.

#### Added

-   A new hook that subscribes the widget to external events.

### [2.6.0] DatagridDropdownFilter

#### Added

-   A new hook that subscribes the widget to external events.

### [2.5.0] DatagridNumberFilter

#### Added

-   A new hook that subscribes the widget to external events.

### [2.5.0] DatagridTextFilter

#### Added

-   A new hook that subscribes the widget to external events.

### [2.15.0] Datagrid

#### Added

-   A new hook that subscribes the widget to external events.

### [1.6.0] Gallery

#### Added

-   A new hook that subscribes the widget to external events.

## [2.14.0] DataWidgets - 2024-03-06

### [2.14.0] Datagrid

#### Fixed

-   We fixed an issue where the columns exported on ExportToExcel action are not the same as the ones visible on Datagrid 2.

### [1.5.0] Gallery

#### Added

-   We added a new feature to Gallery: Now it is possible to navigate on gallery items using keyboard.

-   We added a new feature to Gallery: You can use the keyboard to select multiple items inside the gallery, just as simple as shift + arrow keys. You can also unselect an item with shift+space.

## [2.13.0] DataWidgets - 2024-02-05

### [2.13.0] Datagrid

#### Added

-   Minimum width property for columns that use auto-fill. When needed, you can adjust how the column content is rendered on small screen sizes.

-   We add a double click option for datagrid's row selection trigger.

## [2.12.1] DataWidgets - 2024-01-23

### [2.12.1] Datagrid

#### Fixed

-   We fixed an issue where Dynamic text values cells would be blank in exported .xlsx

## [2.12.0] DataWidgets - 2024-01-16

### [2.12.0] Datagrid

#### Added

-   We added pagination visibility configuration named "Show paging buttons" property. User can choose to always show pagination button or automatically hide based on number of data displayed. Thanks to @Andries-Smit for the help on this feature.

#### Fixed

-   Fixed an issue with the header when using custom content in the column.

-   Fixed an issue that caused the datagrid to crash after changing column settings when the attribute for saving the configuration was provided.

## [2.11.0] DataWidgets - 2023-12-06

### [2.5.2] DatagridDropdownFilter

#### Fixed

-   We fixed lazy loading in dropdown filter not working issue (Ticket #200943).

### [2.11.0] Datagrid

#### Added

-   We added a new expression property named "Visible" in columns where the developer can select a column's visibility from the Datagrid. When using Datagrid, sometimes columns don't need to be shown. By adding "Visible" expression the developers can specify when they want to display columns. Special thanks to @Andries-Smit for the help on this feature.

-   Improved keyboard navigation for better accessibility, which was implemented according to the WAI ARIA guide. Now it's possible to use arrows, page up, page down, home, and end buttons to navigate focus within a grid. Additionally, ctrl+home moves focus on the top-left corner (first cell), and ctrl+end moves focus on the bottom-right corner (last cell).

## [2.10.4] DataWidgets - 2023-11-28

### [2.10.4] Datagrid

#### Fixed

-   We fixed an issue where it was not possible to select a column in design mode by clicking on the column row.

### [1.4.1] Gallery

#### Fixed

-   We fixed an issue with Gallery widget where infinite scroll was not creating scroll, blocking the user from scrolling and fetching more items.

-   We fixed an editor preview issue with drag-and-drop as well as changed dropzone text to be appropriate.

## [2.10.3] DataWidgets - 2023-11-21

### [2.10.3] Datagrid

#### Fixed

-   We fixed an issue with clickable rows not having pointer (hand) cursor on hover.

## [2.10.2] DataWidgets - 2023-11-13

### [2.10.2] Datagrid

#### Fixed

-   Fixed a regression that was introduced in 2.10.0, where the column was missing a caption if the caption used parameters.

## [2.10.1] DataWidgets - 2023-11-02

### [2.10.1] Datagrid

#### Fixed

-   We fixed an issue where personalization settings were not always correctly restored.

## [2.10.0] DataWidgets - 2023-10-31

### Added

-   A new "Export_To_Excel" JS action

### [2.10.0] Datagrid

#### Added

-   A new API that allows data export from data sources configured in the data grid. Together with this addition, we introduce the "Export_To_Excel" JS action, which is a quick and easy way to export and save data as an XLSX document. This action is distributed as a part of "Data Widgets" module.

### [1.4.0] Gallery

#### Changed

-   To better align with WAI ARIA web standards, in this release we change how items are selected using the keyboard (when selection is enabled): now to select or deselect items, the user should use the "shift+space" keyboard shortcut.

#### Added

-   This version introduces support for the "Select all" keyboard shortcut ("cmd+a" or "ctrl+a") that has effect when selection is enabled for the widget.

-   A new feature: range selection. Starting from this version users may select a "range" of items by clicking on an item while pressing the shift key ("shift+click").

#### Breaking changes

-   To provide a better user experience and improve accessibility support, we introduced some minor changes to widget HTML and CSS. The most notable change is a new div element that will wrap each item if you enable the "On click" event in widget settings.

## [2.9.0] DataWidgets - 2023-10-13

### [2.6.2] DatagridDateFilter

#### Fixed

-   We removed redundant code to improve widget load time in the browser.

### [2.5.1] DatagridDropdownFilter

#### Fixed

-   We removed redundant code to improve widget load time in the browser.

### [2.4.3] DatagridNumberFilter

#### Fixed

-   We removed redundant code to improve widget load time in the browser.

### [2.4.3] DatagridTextFilter

#### Fixed

-   We removed redundant code to improve widget load time in the browser.

### [2.9.0] Datagrid

#### Fixed

-   We removed redundant code to improve widget load time in the browser.

-   We fixed an issue where column selector and checkbox icon not aligned with filter control.

-   We fixed issues with filter position overlapping below the next container.

#### Changed

-   We changed DOM structure to allow sticky header on virtual scrolling pagination mode.

-   We added keyboard support for multi selection (`Ctrl + A` and `Shift + Click`).

### [1.1.2] DropdownSort

#### Fixed

-   We removed redundant code to improve widget load time in the browser.

### [1.3.5] Gallery

#### Fixed

-   We removed redundant code to improve widget load time in the browser.

### [1.0.3] SelectionHelper

#### Fixed

-   We removed redundant code to improve widget load time in the browser.

### [1.1.4] TreeNode

#### Fixed

-   We removed redundant code to improve widget load time in the browser.

## [2.8.8] DataWidgets - 2023-08-30

### [2.6.1] DatagridDateFilter

#### Fixed

-   We fixed the issue where date filter does not fully visible when datagrid pagination option is set to virtual scrolling.

## [2.8.7] DataWidgets - 2023-08-25

### [2.8.2] Datagrid

#### Fixed

-   We fixed an issue where columns, which were configured to be hidden by default, remained visible despite visibility settings.

## [2.8.6] DataWidgets - 2023-08-22

### [2.8.1] Datagrid

#### Fixed

-   We fixed a rendering issue when viewing "Data grid" in "Design mode" showed an error message instead of the actual widget preview.

### [1.1.3] TreeNode

#### Fixed

-   We fixed an issue with keyboard input for "form" widgets when they were put into a tree node. Up to this version, pressing "space" or "enter" in widgets like ‘Text box’ or ‘Text area’ was not handled properly, and keyboard input was ignored. The new version should have no issues with keyboard input in child widgets.

-   We fixed an issue with the open/close state for the tree node. This issue was visible when any clickable widget was used to customize the tree node header. Starting from this version, you can choose which part of the header (icon or whole header), when clicked, triggers a collapsed or expanded state for the node.

#### Breaking changes

-   We changed the widget HTML. As a result, some CSS selectors may be affected. Please check your custom styles (if used) after updating to this version.

#### Added

-   We added the new property "Open node when". This property controls which element (an icon or a whole header), once clicked, will expand or collapse the node.

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
