# Drop-down sort

Adds sorting functionality to Gallery widget.

## Overview

- **Folder**: `dropdown-sort-web`
- **Category**: Data controls
- **Offline capable**: Yes
- **Reference**: [Mendix documentation](https://docs.mendix.com/appstore/modules/gallery#4-1-drop-down-sort)

## XML Properties

### General

- **Datasource to sort** (`linkedDs`; type: datasource, list).
- **Attributes** (`attributes`; type: object, optional, list). Select the attributes that the end-user may use for sorting
- **Attribute** (`attribute`; type: attribute, required, data source: ../linkedDs). Attribute types: AutoNumber, Decimal, Integer, Long, String, DateTime, Boolean, Enum.
- **Caption** (`caption`; type: textTemplate, required).
- **Empty option caption** (`emptyOptionCaption`; type: textTemplate, optional).

### Accessibility

- **Sort order button caption** (`screenReaderButtonCaption`; type: textTemplate, optional). Assistive technology will read this upon reaching the sort order button.
- **Input caption** (`screenReaderInputCaption`; type: textTemplate, optional). Assistive technology will read this upon reaching the input element.
