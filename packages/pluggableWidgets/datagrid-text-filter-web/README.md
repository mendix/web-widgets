# Text filter

Filter Data Grid 2 rows by text input, supporting contains, starts with, and equals operations.

## Overview

- **Folder**: `datagrid-text-filter-web`
- **Category**: Data controls
- **Offline capable**: Yes
- **Reference**: [Mendix documentation](https://docs.mendix.com/appstore/modules/data-grid-2#7-4-text-filter)

## XML Properties

### General

- **Filter attributes** (`attrChoice`; type: enumeration, default: auto). Allowed values: `auto` (Auto), `linked` (Custom).
- **Datasource to Filter** (`linkedDs`; type: datasource, list).
- **Attributes** (`attributes`; type: object, optional, list). Select the attributes that the end-user may use for filtering.
- **Attribute** (`attribute`; type: attribute, required, data source: ../linkedDs). Attribute types: String.
- **Default value** (`defaultValue`; type: expression, optional). Returns: String.
- **Default filter** (`defaultFilter`; type: enumeration, default: contains). Allowed values: `contains` (Contains), `startsWith` (Starts with), `endsWith` (Ends with), `greater` (Greater than), `greaterEqual` (Greater than or equal), `equal` (Equal), `notEqual` (Not equal), `smaller` (Smaller than), `smallerEqual` (Smaller than or equal), `empty` (Empty), `notEmpty` (Not empty).
- **Placeholder** (`placeholder`; type: textTemplate, optional).
- **Adjustable by user** (`adjustable`; type: boolean, default: true).

### On change behavior

- **Apply after (ms)** (`delay`; type: integer, default: 500). Wait this period before applying then change(s) to the filter

### Configurations

- **Saved attribute** (`valueAttribute`; type: attribute, optional). Attribute used to store the last value of the filter. Attribute types: String, HashString.

### Events

- **On change** (`onChange`; type: action, optional). Action to be triggered when the value or filter changes.

### Screen reader

- **Comparison button caption** (`screenReaderButtonCaption`; type: textTemplate, optional). Assistive technology will read this upon reaching the comparison button that triggers the filter type drop-down menu.
- **Input caption** (`screenReaderInputCaption`; type: textTemplate, optional). Assistive technology will read this upon reaching the input element.
