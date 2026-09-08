# Data grid 2

A powerful, flexible grid for displaying, sorting, and editing data collections in Mendix web apps.

## Overview

- **Folder**: `datagrid-web`
- **Category**: Data containers
- **Offline capable**: Yes
- **Reference**: [Mendix documentation](https://docs.mendix.com/appstore/modules/data-grid-2)

## XML Properties

### General

- **Data source** (`datasource`; type: datasource, list).
- **Refresh time (in seconds)** (`refreshInterval`; type: integer, default: 0).

### Columns

- **Columns** (`columns`; type: object, list).
- **Show** (`showContentAs`; type: enumeration, default: attribute). Allowed values: `attribute` (Attribute), `dynamicText` (Dynamic text), `customContent` (Custom content).
- **Attribute** (`attribute`; type: attribute, optional, data source: ../datasource). Attribute is required if the column can be sorted or filtered Attribute types: String, AutoNumber, Boolean, DateTime, Decimal, Enum, Integer, Long.
- **Custom content** (`content`; type: widgets, optional, data source: ../datasource).
- **Dynamic text** (`dynamicText`; type: textTemplate, optional, data source: ../datasource).
- **Export value** (`exportValue`; type: textTemplate, optional, data source: ../datasource).
- **Export type** (`exportType`; type: enumeration, default: default). Allowed values: `default` (Default), `number` (Number), `date` (Date), `boolean` (Boolean).
- **Export number format** (`exportNumberFormat`; type: expression, optional). Optional Excel number format for exported numeric values (e.g. "#,##0.00", "$0.00", "0.00%"). See all formats https://docs.sheetjs.com/docs/csf/features/nf/ Returns: String.
- **Export date format** (`exportDateFormat`; type: expression, optional). Excel date format for exported Date/DateTime values (e.g. "yyyy-mm-dd", "dd/mm/yyyy hh mm"). Returns: String.
- **Caption** (`header`; type: textTemplate, optional).
- **Tooltip** (`tooltip`; type: textTemplate, optional, data source: ../datasource).
- **Filter** (`filter`; type: widgets, optional).
- **Visible** (`visible`; type: expression, required, default: true). Returns: Boolean.
- **Can sort** (`sortable`; type: boolean, default: true).
- **Can resize** (`resizable`; type: boolean, default: true).
- **Can reorder** (`draggable`; type: boolean, default: true).
- **Can hide** (`hidable`; type: enumeration, default: yes). Allowed values: `yes` (Yes), `hidden` (Yes, hidden by default), `no` (No).
- **Allow row events** (`allowEventPropagation`; type: boolean, default: true). If set to yes, then all default events on the row, such as "on click" or selection, will be triggered when the user interacts with custom content.
- **Column width** (`width`; type: enumeration, default: autoFill). Allowed values: `autoFill` (Auto-fill), `autoFit` (Auto-fit content), `manual` (Manual).
- **Min width** (`minWidth`; type: enumeration, default: auto). Allowed values: `auto` (Auto), `minContent` (Set by content), `manual` (Manual).
- **Min width value (px)** (`minWidthLimit`; type: integer, default: 100).
- **Column size** (`size`; type: integer, default: 1).
- **Alignment** (`alignment`; type: enumeration, default: left). Allowed values: `left` (Left), `center` (Center), `right` (Right).
- **Dynamic cell class** (`columnClass`; type: expression, optional, data source: ../datasource). Returns: String.
- **Wrap text** (`wrapText`; type: boolean, default: false).
- **Show column filters** (`columnsFilterable`; type: boolean, default: true).

### Events

- **On click trigger** (`onClickTrigger`; type: enumeration, default: single). Allowed values: `single` (Single click), `double` (Double click).
- **On click action** (`onClick`; type: action, optional, data source: datasource).
- **On selection change** (`onSelectionChange`; type: action, optional).
- **On before export** (`onBeforeExport`; type: action, optional).
- **On after export** (`onAfterExport`; type: action, optional).
- **Filters placeholder** (`filtersPlaceholder`; type: widgets, optional).

### Selection

- **Selection** (`itemSelection`; type: selection, data source: datasource).
- **Selection method** (`itemSelectionMethod`; type: enumeration, default: checkbox). Allowed values: `checkbox` (Checkbox), `rowClick` (Row click).
- **Auto select first row** (`autoSelect`; type: boolean, default: false). Automatically select the first row
- **Toggle on click** (`itemSelectionMode`; type: enumeration, default: clear). Defines item selection behavior. Allowed values: `toggle` (Yes), `clear` (No).
- **"Select all" checkbox** (`showSelectAllToggle`; type: boolean, default: true). Displays a checkbox in the grid header that allows selecting or deselecting all rows on the current page.
- **"Select all" across pages** (`enableSelectAll`; type: boolean, default: false). Shows a banner with the option to select all rows across all pages when all rows on the current page are selected.
- **Keep selection** (`keepSelection`; type: boolean, default: false). If enabled, selected items will stay selected unless cleared by the user or a Nanoflow.
- **Show selection count** (`selectionCounterPosition`; type: enumeration, required, default: bottom). Allowed values: `top` (Top), `bottom` (Bottom), `off` (Off).

### Loading state

- **Loading type** (`loadingType`; type: enumeration, required, default: spinner). Allowed values: `spinner` (Spinner), `skeleton` (Skeleton).
- **Show refresh indicator** (`refreshIndicator`; type: boolean, default: false). Show a refresh indicator when the data is being loaded.

### Pagination

- **Page size** (`pageSize`; type: integer, default: 20).
- **Pagination** (`pagination`; type: enumeration, default: buttons). Allowed values: `buttons` (Paging buttons), `virtualScrolling` (Virtual scrolling), `loadMore` (Load more).
- **Custom pagination** (`useCustomPagination`; type: boolean, default: false).
- **Custom pagination** (`customPagination`; type: widgets, optional).
- **Show paging buttons** (`showPagingButtons`; type: enumeration, default: always). Allowed values: `always` (Always), `auto` (Auto).
- **Show number of rows** (`showNumberOfRows`; type: boolean, default: false).
- **Position of pagination** (`pagingPosition`; type: enumeration, default: bottom). Allowed values: `bottom` (Below grid), `top` (Above grid), `both` (Both).
- **Load more caption** (`loadMoreButtonCaption`; type: textTemplate, optional).
- **Page size attribute** (`dynamicPageSize`; type: attribute, optional). Attribute to set the page size dynamically. Attribute types: Integer.
- **Page attribute** (`dynamicPage`; type: attribute, optional). Attribute to set the page dynamically. Attribute types: Integer.
- **Total count** (`totalCountValue`; type: attribute, optional). Attribute to store current total count Attribute types: Integer.
- **Loaded rows** (`dynamicItemCount`; type: attribute, optional). Read-only attribute reflecting the number of rows currently loaded. Attribute types: Integer.

### Appearance

- **Empty list message** (`showEmptyPlaceholder`; type: enumeration, default: none). Allowed values: `none` (None), `custom` (Custom).
- **Empty placeholder** (`emptyPlaceholder`; type: widgets, optional).
- **Dynamic row class** (`rowClass`; type: expression, optional, data source: datasource). Returns: String.

### Advanced

- **Custom row key** (`customRowKey`; type: expression, optional, data source: datasource). Stable identifier for rows to maintain scroll position when using view entities. Returns: String.

### Column capabilities

- **Sorting** (`columnsSortable`; type: boolean, default: true). Enable sorting for all columns unless specified otherwise in the column setting
- **Resizing** (`columnsResizable`; type: boolean, default: true). Enable resizing for all columns unless specified otherwise in the column setting
- **Reordering** (`columnsDraggable`; type: boolean, default: true). Enable reordering for all columns unless specified otherwise in the column setting
- **Hiding** (`columnsHidable`; type: boolean, default: true). Enable hiding for all columns unless specified otherwise in the column setting

### Configuration

- **Store configuration in** (`configurationStorageType`; type: enumeration, default: attribute). When Browser local storage is selected, the configuration is scoped to a browser profile. This configuration is not tied to a Mendix user. Allowed values: `attribute` (Attribute), `localStorage` (Browser local storage).
- **Attribute** (`configurationAttribute`; type: attribute, optional). Attribute containing the personalized configuration of the capabilities. This configuration is automatically stored and loaded. The attribute requires Unlimited String. Attribute types: String.
- **Store filters** (`storeFiltersInPersonalization`; type: boolean, default: true).
- **On change** (`onConfigurationChange`; type: action, optional).

### Aria labels

- **Filter section** (`filterSectionTitle`; type: textTemplate, optional). Assistive technology will read this upon reaching a filtering or sorting section.
- **Export progress** (`exportDialogLabel`; type: textTemplate, optional). Assistive technology will read this upon reaching a export dialog.
- **Cancel data export** (`cancelExportLabel`; type: textTemplate, optional). Assistive technology will read this upon reaching a cancel button.
- **Select row label** (`selectRowLabel`; type: textTemplate, optional). If selection is enabled, assistive technology will read this upon reaching a checkbox.
- **Select all label** (`selectAllRowsLabel`; type: textTemplate, optional). If selection is enabled, assistive technology will read this upon reaching 'Select all' checkbox.
- **Single selection column label** (`singleSelectionColumnLabel`; type: textTemplate, optional). If single selection is enabled, assistive technology will read this for the selection column header.
- **Selecting all label** (`selectingAllLabel`; type: textTemplate, optional). ARIA label for the progress dialog when selecting all items
- **Cancel selection label** (`cancelSelectionLabel`; type: textTemplate, optional). ARIA label for the cancel button in the selection progress dialog

### Captions

- **Row count singular** (`selectedCountTemplateSingular`; type: textTemplate, optional). Must include '%d' to denote number position
- **Row count plural** (`selectedCountTemplatePlural`; type: textTemplate, optional). Must include '%d' to denote number position
- **Select all text** (`selectAllText`; type: textTemplate).
- **Select all template** (`selectAllTemplate`; type: textTemplate). This caption used when total count is available.
- **Select status template** (`allSelectedText`; type: textTemplate).
- **Clear selection label** (`clearSelectionButtonLabel`; type: textTemplate, optional). Customize the label of the 'Clear section' button
