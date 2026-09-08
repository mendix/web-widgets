# Gallery

A flexible gallery widget that renders columns, rows and layouts.

## Overview

- **Folder**: `gallery-web`
- **Category**: Data containers
- **Offline capable**: Yes
- **Reference**: [Mendix documentation](https://docs.mendix.com/appstore/modules/gallery)

## XML Properties

### General

- **Filters placeholder** (`filtersPlaceholder`; type: widgets, optional).
- **Content placeholder** (`content`; type: widgets, optional, data source: datasource).
- **Data source** (`datasource`; type: datasource, list).
- **Refresh time (in seconds)** (`refreshInterval`; type: integer, default: 0).

### Columns

- **Desktop columns** (`desktopItems`; type: integer, default: 1).
- **Tablet columns** (`tabletItems`; type: integer, default: 1).
- **Phone columns** (`phoneItems`; type: integer, default: 1).

### Events

- **On click trigger** (`onClickTrigger`; type: enumeration, default: single). Allowed values: `single` (Single click), `double` (Double click).
- **On click action** (`onClick`; type: action, optional, data source: datasource).
- **On selection change** (`onSelectionChange`; type: action, optional).

### Selection

- **Selection** (`itemSelection`; type: selection, data source: datasource).
- **Auto select first item** (`autoSelect`; type: boolean, default: false). Automatically select the first item
- **Toggle on click** (`itemSelectionMode`; type: enumeration, default: clear). Defines item selection behavior. Allowed values: `toggle` (Yes), `clear` (No).
- **Keep selection** (`keepSelection`; type: boolean, default: false). If enabled, selected items will stay selected unless cleared by the user or a Nanoflow.
- **Show selection count** (`selectionCountPosition`; type: enumeration, required, default: bottom). Allowed values: `top` (Top), `bottom` (Bottom), `off` (Off).

### Loading state

- **Loading type** (`loadingType`; type: enumeration, required, default: spinner). Allowed values: `spinner` (Spinner), `skeleton` (Skeleton).
- **Show refresh indicator** (`refreshIndicator`; type: boolean, default: false). Show a refresh indicator when the data is being loaded.

### Pagination

- **Page size** (`pageSize`; type: integer, default: 20).
- **Pagination** (`pagination`; type: enumeration, default: buttons). Allowed values: `buttons` (Paging buttons), `virtualScrolling` (Virtual scrolling), `loadMore` (Load more).
- **Custom pagination** (`useCustomPagination`; type: boolean, default: false).
- **Custom pagination** (`customPagination`; type: widgets, optional).
- **Show paging buttons** (`showPagingButtons`; type: enumeration, default: always). Allowed values: `always` (Always), `auto` (Auto).
- **Show total count** (`showTotalCount`; type: boolean, default: false).
- **Position of pagination** (`pagingPosition`; type: enumeration, default: bottom). Allowed values: `bottom` (Below grid), `top` (Above grid), `both` (Both).
- **Load more caption** (`loadMoreButtonCaption`; type: textTemplate, optional).
- **Page size attribute** (`dynamicPageSize`; type: attribute, optional). Attribute to set the page size dynamically. Attribute types: Integer.
- **Page attribute** (`dynamicPage`; type: attribute, optional). Attribute to set the page dynamically. Attribute types: Integer.
- **Total count** (`totalCountValue`; type: attribute, optional). Attribute to store current total count Attribute types: Integer.
- **Loaded items** (`dynamicItemCount`; type: attribute, optional). Read-only attribute reflecting the number of items currently loaded. Attribute types: Integer.

### Appearance

- **Empty message** (`showEmptyPlaceholder`; type: enumeration, default: none). Allowed values: `none` (None), `custom` (Custom).
- **Empty placeholder** (`emptyPlaceholder`; type: widgets, optional).
- **Dynamic item class** (`itemClass`; type: expression, optional, data source: datasource). Returns: String.

### Advanced

- **Custom item key** (`customItemKey`; type: expression, optional, data source: datasource). Stable identifier for items to maintain scroll position when using view entities. Returns: String.

### Configuration

- **Store configuration in** (`stateStorageType`; type: enumeration, default: attribute). When Browser local storage is selected, the configuration is scoped to a browser profile. This configuration is not tied to a Mendix user. Allowed values: `attribute` (Attribute), `localStorage` (Browser local storage).
- **Attribute** (`stateStorageAttr`; type: attribute, optional). Attribute containing the personalized configuration of the capabilities. This configuration is automatically stored and loaded. The attribute requires Unlimited String. Attribute types: String.
- **On change** (`onConfigurationChange`; type: action, optional).
- **Store filters** (`storeFilters`; type: boolean, default: true).
- **Store sort** (`storeSort`; type: boolean, default: true).

### Aria labels

- **Filter section** (`filterSectionTitle`; type: textTemplate, optional). Assistive technology will read this upon reaching a filtering or sorting section.
- **Empty message** (`emptyMessageTitle`; type: textTemplate, optional). Assistive technology will read this upon reaching an empty message section.
- **Content description** (`ariaLabelListBox`; type: textTemplate, optional). Assistive technology will read this upon reaching gallery.
- **Item description** (`ariaLabelItem`; type: textTemplate, optional, data source: datasource). Assistive technology will read this upon reaching each gallery item.

### Captions

- **Item count singular** (`selectedCountTemplateSingular`; type: textTemplate, optional). Must include '%d' to denote number position
- **Item count plural** (`selectedCountTemplatePlural`; type: textTemplate, optional). Must include '%d' to denote number position
- **Clear selection label** (`clearSelectionButtonLabel`; type: textTemplate, optional). Customize the label of the 'Clear section' button

## Additional Notes

Please see [Gallery](https://docs.mendix.com/appstore/widgets/gallery) in the Mendix documentation for details.
