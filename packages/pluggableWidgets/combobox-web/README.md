# Combo box

Configurable Combo box widget with suggestions and autocomplete.

## Overview

- **Folder**: `combobox-web`
- **Category**: Input elements
- **Offline capable**: Yes
- **Reference**: [Mendix documentation](https://docs.mendix.com/appstore/widgets/combobox)

## XML Properties

### Data source

- **Source** (`source`; type: enumeration, required, default: context). Allowed values: `context` (Context), `database` (Database), `static` (Static).
- **Type** (`optionsSourceType`; type: enumeration, required, default: association). Allowed values: `association` (Association), `enumeration` (Enumeration), `boolean` (Boolean).
- **Attribute** (`attributeEnumeration`; type: attribute, required). Attribute types: Enum.
- **Attribute** (`attributeBoolean`; type: attribute, required). Attribute types: Boolean.
- **Selectable objects** (`optionsSourceDatabaseDataSource`; type: datasource, optional, list).
- **Selection type** (`optionsSourceDatabaseItemSelection`; type: selection, data source: optionsSourceDatabaseDataSource).

### Caption

- **Caption type** (`optionsSourceAssociationCaptionType`; type: enumeration, default: attribute). Allowed values: `attribute` (Attribute), `expression` (Expression).
- **Caption type** (`optionsSourceDatabaseCaptionType`; type: enumeration, default: attribute). Allowed values: `attribute` (Attribute), `expression` (Expression).
- **Caption** (`optionsSourceAssociationCaptionAttribute`; type: attribute, required, data source: optionsSourceAssociationDataSource). Attribute types: String.
- **Caption** (`optionsSourceDatabaseCaptionAttribute`; type: attribute, required, data source: optionsSourceDatabaseDataSource). Attribute types: String.
- **Caption** (`optionsSourceAssociationCaptionExpression`; type: expression, required, data source: optionsSourceAssociationDataSource). Returns: String.
- **Caption** (`optionsSourceDatabaseCaptionExpression`; type: expression, required, data source: optionsSourceDatabaseDataSource). Returns: String.

### Store value

- **Target** (`databaseAttributeString`; type: attribute, optional). Attribute types: String, Integer, Long, Enum.
- **Value** (`optionsSourceDatabaseValueAttribute`; type: attribute, data source: optionsSourceDatabaseDataSource). Attribute types: String, Integer, Long, Enum.

### Attribute

- **Entity** (`attributeAssociation`; type: association, required).
- **Selectable objects** (`optionsSourceAssociationDataSource`; type: datasource, optional, list).

### Values

- **Attribute** (`staticAttribute`; type: attribute, required). Attribute types: String, Enum, Integer, Long, Boolean, DateTime, Decimal.
- **Values** (`optionsSourceStaticDataSource`; type: object, required, list).
- **Value** (`staticDataSourceValue`; type: expression). Value to be set
- **Custom content** (`staticDataSourceCustomContent`; type: widgets).
- **Caption** (`staticDataSourceCaption`; type: textTemplate). Caption to be shown

### General

- **Placeholder text** (`emptyOptionText`; type: textTemplate, optional).
- **No options text** (`noOptionsText`; type: textTemplate, optional).
- **Clearable** (`clearable`; type: boolean, default: true).
- **Custom content** (`optionsSourceAssociationCustomContentType`; type: enumeration, required, default: no). Allowed values: `yes` (Yes), `listItem` (List items only), `no` (No).
- **Custom content** (`optionsSourceAssociationCustomContent`; type: widgets, required, data source: optionsSourceAssociationDataSource).
- **Custom content** (`optionsSourceDatabaseCustomContentType`; type: enumeration, required, default: no). Allowed values: `yes` (Yes), `listItem` (List items only), `no` (No).
- **Custom content** (`optionsSourceDatabaseCustomContent`; type: widgets, required, data source: optionsSourceDatabaseDataSource).
- **Custom content** (`staticDataSourceCustomContentType`; type: enumeration, default: no). Allowed values: `yes` (Yes), `listItem` (List items only), `no` (No).
- **Show footer** (`showFooter`; type: boolean, default: false).
- **Footer content** (`menuFooterContent`; type: widgets, optional).

### Multiple-selection (reference set)

- **Selection method** (`selectionMethod`; type: enumeration, required, default: checkbox). Allowed values: `checkbox` (Checkbox), `rowclick` (Row click).
- **Show selected items as** (`selectedItemsStyle`; type: enumeration, required, default: text). Allowed values: `text` (Text), `boxes` (Labels).
- **Show select all** (`selectAllButton`; type: boolean, required, default: false). Add a button to select/deselect all options.
- **Caption for select all** (`selectAllButtonCaption`; type: textTemplate, required).

### Label

- **Label**. Standard Mendix system property.

### Conditional visibility

- **Visibility**. Standard Mendix system property.

### Editability

- **Editable** (`customEditability`; type: enumeration, default: default). Allowed values: `default` (Default), `never` (Never), `conditionally` (Conditionally).
- **Condition** (`customEditabilityExpression`; type: expression, default: false). Returns: Boolean.
- **Read-only style** (`readOnlyStyle`; type: enumeration, default: text). How the combo box will appear in read-only mode. Allowed values: `bordered` (Control), `text` (Content only).
- **Editability**. Standard Mendix system property.

- **On change** (`onChangeEvent`; type: action, optional).
- **On selection** (`onChangeDatabaseEvent`; type: action, optional). This event happens when "selection of" this widget changes or initializes.
- **On enter** (`onEnterEvent`; type: action, optional).
- **On leave** (`onLeaveEvent`; type: action, optional).
- **On filter input change** (`onChangeFilterInputEvent`; type: action, optional).

### Accessibility

- **Aria required** (`ariaRequired`; type: expression, default: false). Returns: Boolean.

### Aria labels

- **Aria label** (`ariaLabel`; type: textTemplate, optional). Used to describe the combo box.
- **Clear selection button** (`clearButtonAriaLabel`; type: textTemplate, optional). Used to clear all selected values.
- **Remove value button** (`removeValueAriaLabel`; type: textTemplate, optional). Used to remove individual selected values when using labels with multi-selection.

### Accessibility status message

- **Selected value** (`a11ySelectedValue`; type: textTemplate, optional). Output example: "Selected value: Avocado, Apple, Banana."
- **Options available** (`a11yOptionsAvailable`; type: textTemplate, optional). Output example: "Number of options available: 1"
- **Instructions** (`a11yInstructions`; type: textTemplate, optional). Instructions to be read after announcing the status.

### Performance

- **Lazy loading** (`lazyLoading`; type: boolean, default: true).
- **Loading type** (`loadingType`; type: enumeration, required, default: spinner). Allowed values: `spinner` (Spinner), `skeleton` (Skeleton).

### Multiple-selection

- **Selected items sorting** (`selectedItemsSorting`; type: enumeration, required, default: none). How selected items should be sorted. Allowed values: `caption` (Caption), `none` (Default).

### Filter

- **Filter type** (`filterType`; type: enumeration, default: contains). Allowed values: `contains` (Contains (fuzzy)), `containsExact` (Contains (exact)), `startsWith` (Starts-with), `none` (None).
- **Debounce interval** (`filterInputDebounceInterval`; type: integer, required, default: 200). The debounce interval for each filter input change event triggered in milliseconds.

## Additional Notes

<!-- TODO: Update marketplace URL -->

Please see [Combo box](https://docs.mendix.com/appstore/widgets/combobox) in the Mendix documentation for details.
