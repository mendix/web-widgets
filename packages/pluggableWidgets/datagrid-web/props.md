# Data Grid 2 Properties

## General

### General

| Property          | Type              | Default | Required | Description              |
| ----------------- | ----------------- | ------- | -------- | ------------------------ |
| `datasource`      | datasource (list) | -       | Yes      | Data source for the grid |
| `refreshInterval` | integer           | `0`     | No       | Refresh time in seconds  |

### Columns

| Property            | Type          | Default | Required | Description          |
| ------------------- | ------------- | ------- | -------- | -------------------- |
| `columns`           | object (list) | -       | Yes      | Column configuration |
| `columnsFilterable` | boolean       | `true`  | No       | Show column filters  |

#### Column Properties

##### General

| Property             | Type         | Default     | Required | Description                                            |
| -------------------- | ------------ | ----------- | -------- | ------------------------------------------------------ |
| `showContentAs`      | enumeration  | `attribute` | No       | How to display column content                          |
| `attribute`          | attribute    | -           | No       | Attribute to display (required if sortable/filterable) |
| `content`            | widgets      | -           | No       | Custom content widgets                                 |
| `dynamicText`        | textTemplate | -           | No       | Dynamic text template                                  |
| `exportValue`        | textTemplate | -           | No       | Value to export                                        |
| `exportType`         | enumeration  | `default`   | No       | Type for export formatting                             |
| `exportNumberFormat` | expression   | -           | No       | Excel number format (e.g. "#,##0.00")                  |
| `exportDateFormat`   | expression   | -           | No       | Excel date format (e.g. "yyyy-mm-dd")                  |
| `header`             | textTemplate | -           | No       | Column caption                                         |
| `tooltip`            | textTemplate | -           | No       | Tooltip text                                           |
| `filter`             | widgets      | -           | No       | Filter widget                                          |
| `visible`            | expression   | `true`      | Yes      | Whether column is visible                              |

**showContentAs values:**

- `attribute` - Attribute: Display bound attribute value
- `dynamicText` - Dynamic text: Display text template
- `customContent` - Custom content: Display nested widgets

**attribute types:**

- String, AutoNumber, Boolean, DateTime, Decimal, Enum, Integer, Long
- Associations: Reference, ReferenceSet

**exportType values:**

- `default` - Default: Infer type from attribute
- `number` - Number: Export as numeric cell
- `date` - Date: Export as date cell
- `boolean` - Boolean: Export as boolean cell

##### Column Capabilities

| Property                | Type        | Default | Required | Description                                           |
| ----------------------- | ----------- | ------- | -------- | ----------------------------------------------------- |
| `sortable`              | boolean     | `true`  | No       | Whether column can be sorted                          |
| `resizable`             | boolean     | `true`  | No       | Whether column can be resized                         |
| `draggable`             | boolean     | `true`  | No       | Whether column can be reordered                       |
| `hidable`               | enumeration | `yes`   | No       | Whether column can be hidden                          |
| `allowEventPropagation` | boolean     | `true`  | No       | Allow row events when interacting with custom content |

**hidable values:**

- `yes` - Yes: Can be hidden, visible by default
- `hidden` - Yes, hidden by default: Can be hidden, hidden by default
- `no` - No: Cannot be hidden

##### Appearance

| Property        | Type        | Default    | Required | Description                       |
| --------------- | ----------- | ---------- | -------- | --------------------------------- |
| `width`         | enumeration | `autoFill` | No       | Column width behavior             |
| `minWidth`      | enumeration | `auto`     | No       | Minimum width behavior            |
| `minWidthLimit` | integer     | `100`      | No       | Minimum width value in pixels     |
| `size`          | integer     | `1`        | No       | Column size (proportional weight) |
| `alignment`     | enumeration | `left`     | No       | Text alignment                    |
| `columnClass`   | expression  | -          | No       | Dynamic CSS class for cells       |
| `wrapText`      | boolean     | `false`    | No       | Whether to wrap text              |

**width values:**

- `autoFill` - Auto-fill: Column takes proportional space
- `autoFit` - Auto-fit content: Column fits content width
- `manual` - Manual: Fixed width set by user

**minWidth values:**

- `auto` - Auto: Automatic minimum width
- `minContent` - Set by content: Minimum width based on content
- `manual` - Manual: Use minWidthLimit value

**alignment values:**

- `left` - Left: Left-align content
- `center` - Center: Center-align content
- `right` - Right: Right-align content

### Events

| Property             | Type        | Default  | Required | Description                              |
| -------------------- | ----------- | -------- | -------- | ---------------------------------------- |
| `onClickTrigger`     | enumeration | `single` | No       | What triggers the on click action        |
| `onClick`            | action      | -        | No       | Action to execute on row click           |
| `onSelectionChange`  | action      | -        | No       | Action to execute when selection changes |
| `filtersPlaceholder` | widgets     | -        | No       | Widgets to show in filters area          |

**onClickTrigger values:**

- `single` - Single click: Trigger on single click
- `double` - Double click: Trigger on double click

## Behavior

### Selection

| Property                   | Type        | Default    | Required | Description                          |
| -------------------------- | ----------- | ---------- | -------- | ------------------------------------ |
| `itemSelection`            | selection   | -          | Yes      | Selection mode                       |
| `itemSelectionMethod`      | enumeration | `checkbox` | No       | How users select rows                |
| `autoSelect`               | boolean     | `false`    | No       | Automatically select first row       |
| `itemSelectionMode`        | enumeration | `clear`    | No       | Toggle selection on click            |
| `showSelectAllToggle`      | boolean     | `true`     | No       | Show "Select all" checkbox in header |
| `enableSelectAll`          | boolean     | `false`    | No       | Enable "Select all" across pages     |
| `keepSelection`            | boolean     | `false`    | No       | Keep selection when data refreshes   |
| `selectionCounterPosition` | enumeration | `bottom`   | Yes      | Where to show selection count        |

**itemSelection values:**

- `None` - None: No selection
- `Single` - Single: Single row selection
- `Multi` - Multi: Multiple row selection

**itemSelectionMethod values:**

- `checkbox` - Checkbox: Select via checkbox column
- `rowClick` - Row click: Select by clicking the row

**itemSelectionMode values:**

- `toggle` - Yes: Clicking selected row deselects it
- `clear` - No: Clicking selected row keeps it selected

**selectionCounterPosition values:**

- `top` - Top: Show selection count above grid
- `bottom` - Bottom: Show selection count below grid
- `off` - Off: Don't show selection count

### Loading State

| Property           | Type        | Default   | Required | Description                           |
| ------------------ | ----------- | --------- | -------- | ------------------------------------- |
| `loadingType`      | enumeration | `spinner` | Yes      | Type of loading indicator             |
| `refreshIndicator` | boolean     | `false`   | No       | Show refresh indicator when reloading |

**loadingType values:**

- `spinner` - Spinner: Show spinner while loading
- `skeleton` - Skeleton: Show skeleton placeholder while loading

### Pagination

| Property                | Type                | Default     | Required | Description                                |
| ----------------------- | ------------------- | ----------- | -------- | ------------------------------------------ |
| `pageSize`              | integer             | `20`        | No       | Number of rows per page                    |
| `pagination`            | enumeration         | `buttons`   | No       | Pagination style                           |
| `useCustomPagination`   | boolean             | `false`     | No       | Use custom pagination widgets              |
| `customPagination`      | widgets             | -           | No       | Custom pagination widgets                  |
| `showPagingButtons`     | enumeration         | `always`    | No       | When to show paging buttons                |
| `showNumberOfRows`      | boolean             | `false`     | No       | Show total number of rows                  |
| `pagingPosition`        | enumeration         | `bottom`    | No       | Where to show pagination                   |
| `loadMoreButtonCaption` | textTemplate        | "Load More" | No       | Caption for load more button               |
| `dynamicPageSize`       | attribute (Integer) | -           | No       | Attribute to set page size dynamically     |
| `dynamicPage`           | attribute (Integer) | -           | No       | Attribute to set current page dynamically  |
| `totalCountValue`       | attribute (Integer) | -           | No       | Attribute to store total count             |
| `dynamicItemCount`      | attribute (Integer) | -           | No       | Read-only attribute with loaded rows count |

**pagination values:**

- `buttons` - Paging buttons: Traditional page navigation buttons
- `virtualScrolling` - Virtual scrolling: Load on scroll
- `loadMore` - Load more: Load more button

**showPagingButtons values:**

- `always` - Always: Always show buttons
- `auto` - Auto: Hide buttons when all rows fit on one page

**pagingPosition values:**

- `bottom` - Below grid: Show pagination below grid
- `top` - Above grid: Show pagination above grid
- `both` - Both: Show pagination above and below grid

### Appearance

| Property               | Type        | Default | Required | Description                     |
| ---------------------- | ----------- | ------- | -------- | ------------------------------- |
| `showEmptyPlaceholder` | enumeration | `none`  | No       | Show message when list is empty |
| `emptyPlaceholder`     | widgets     | -       | No       | Widgets to show when empty      |
| `rowClass`             | expression  | -       | No       | Dynamic CSS class for rows      |

**showEmptyPlaceholder values:**

- `none` - None: No empty message
- `custom` - Custom: Show custom empty placeholder

### Advanced

| Property       | Type       | Default | Required | Description                                    |
| -------------- | ---------- | ------- | -------- | ---------------------------------------------- |
| `customRowKey` | expression | -       | No       | Stable identifier for rows (for view entities) |

## Personalization

### Column Capabilities

| Property           | Type    | Default | Required | Description                                  |
| ------------------ | ------- | ------- | -------- | -------------------------------------------- |
| `columnsSortable`  | boolean | `true`  | No       | Enable sorting for all columns by default    |
| `columnsResizable` | boolean | `true`  | No       | Enable resizing for all columns by default   |
| `columnsDraggable` | boolean | `true`  | No       | Enable reordering for all columns by default |
| `columnsHidable`   | boolean | `true`  | No       | Enable hiding for all columns by default     |

### Configuration

| Property                        | Type               | Default     | Required | Description                                                      |
| ------------------------------- | ------------------ | ----------- | -------- | ---------------------------------------------------------------- |
| `configurationStorageType`      | enumeration        | `attribute` | No       | Where to store personalization settings                          |
| `configurationAttribute`        | attribute (String) | -           | No       | Attribute for personalization config (requires Unlimited String) |
| `storeFiltersInPersonalization` | boolean            | `true`      | No       | Store filter settings in personalization                         |
| `onConfigurationChange`         | action             | -           | No       | Action to execute when configuration changes                     |

**configurationStorageType values:**

- `attribute` - Attribute: Store in Mendix attribute (user-specific)
- `localStorage` - Browser local storage: Store in browser (profile-specific, not user-specific)

## Texts

### Aria Labels

| Property                     | Type         | Default                  | Required | Description                              |
| ---------------------------- | ------------ | ------------------------ | -------- | ---------------------------------------- |
| `filterSectionTitle`         | textTemplate | -                        | No       | Label for filter/sorting section         |
| `exportDialogLabel`          | textTemplate | "Export progress"        | No       | Label for export progress dialog         |
| `cancelExportLabel`          | textTemplate | "Cancel data export"     | No       | Label for cancel export button           |
| `selectRowLabel`             | textTemplate | "Select row"             | No       | Label for row selection checkbox         |
| `selectAllRowsLabel`         | textTemplate | "Select all rows"        | No       | Label for select all checkbox            |
| `singleSelectionColumnLabel` | textTemplate | "Select single row"      | No       | Label for single selection column header |
| `selectingAllLabel`          | textTemplate | "Selecting all items..." | No       | Label for select all progress dialog     |
| `cancelSelectionLabel`       | textTemplate | "Cancel selection"       | No       | Label for cancel selection button        |

### Captions

| Property                        | Type         | Default                                 | Required | Description                                             |
| ------------------------------- | ------------ | --------------------------------------- | -------- | ------------------------------------------------------- |
| `selectedCountTemplateSingular` | textTemplate | "%d row selected"                       | No       | Template for singular selection count (must include %d) |
| `selectedCountTemplatePlural`   | textTemplate | "%d rows selected"                      | No       | Template for plural selection count (must include %d)   |
| `selectAllText`                 | textTemplate | "Select all rows in the data source"    | No       | Text for select all link                                |
| `selectAllTemplate`             | textTemplate | "Select all %d rows in the data source" | No       | Template for select all with count (must include %d)    |
| `allSelectedText`               | textTemplate | "All %d rows selected."                 | No       | Template for all selected status (must include %d)      |
| `clearSelectionButtonLabel`     | textTemplate | "Clear selection"                       | No       | Label for clear selection button                        |
