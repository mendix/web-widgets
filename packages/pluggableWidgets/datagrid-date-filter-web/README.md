# Date filter

Filter Data Grid 2 rows by date or date range, using a calendar picker.

## Overview

- **Folder**: `datagrid-date-filter-web`
- **Category**: Data controls
- **Offline capable**: Yes
- **Reference**: [Mendix documentation](https://docs.mendix.com/appstore/modules/data-grid-2#7-1-date-filter)

## XML Properties

### General

- **Filter attributes** (`attrChoice`; type: enumeration, default: auto). Allowed values: `auto` (Auto), `linked` (Custom).
- **Datasource to Filter** (`linkedDs`; type: datasource, list).
- **Attributes** (`attributes`; type: object, optional, list). Select the attributes that the end-user may use for filtering.
- **Attribute** (`attribute`; type: attribute, required, data source: ../linkedDs). Attribute types: DateTime.
- **Default value** (`defaultValue`; type: expression, optional). Returns: DateTime.
- **Default start date** (`defaultStartDate`; type: expression, optional). Returns: DateTime.
- **Default end date** (`defaultEndDate`; type: expression, optional). Returns: DateTime.
- **Default filter** (`defaultFilter`; type: enumeration, default: equal). Allowed values: `between` (Between), `greater` (Greater than), `greaterEqual` (Greater than or equal), `equal` (Equal), `notEqual` (Not equal), `smaller` (Smaller than), `smallerEqual` (Smaller than or equal), `empty` (Empty), `notEmpty` (Not empty).
- **Placeholder** (`placeholder`; type: textTemplate, optional).
- **Adjustable by user** (`adjustable`; type: boolean, default: true).

### Configurations

- **Saved attribute** (`valueAttribute`; type: attribute, optional). Attribute used to store the last value of the filter. Attribute types: DateTime.
- **Saved start date attribute** (`startDateAttribute`; type: attribute, optional). Attribute used to store the last value of the start date filter. Attribute types: DateTime.
- **Saved end date attribute** (`endDateAttribute`; type: attribute, optional). Attribute used to store the last value of the end date filter. Attribute types: DateTime.

### Events

- **On change** (`onChange`; type: action, optional). Action to be triggered when the value or filter changes.

### Screen reader

- **Comparison button caption** (`screenReaderButtonCaption`; type: textTemplate, optional). Assistive technology will read this upon reaching the comparison button that triggers the filter type drop-down menu.
- **Calendar button caption** (`screenReaderCalendarCaption`; type: textTemplate, optional). Assistive technology will read this upon reaching the button that triggers the calendar.
- **Input caption** (`screenReaderInputCaption`; type: textTemplate, optional). Assistive technology will read this upon reaching the input element.
