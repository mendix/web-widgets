# Check box / radio selector

Configurable radio buttons and check box widget

## Overview

- **Folder**: `checkbox-radio-selection-web`
- **Category**: Input elements
- **Offline capable**: Yes
- **Reference**: [Mendix documentation](https://docs.mendix.com/appstore/widgets/checkboxradioselection)

## XML Properties

### Data source

- **Source** (`source`; type: enumeration, required, default: context). Allowed values: `context` (Context), `database` (Database), `static` (Static).
- **Type** (`optionsSourceType`; type: enumeration, required, default: association). Allowed values: `association` (Association), `enumeration` (Enumeration), `boolean` (Boolean).
- **Attribute** (`attributeEnumeration`; type: attribute, required). Attribute types: Enum.
- **Attribute** (`attributeBoolean`; type: attribute, required). Attribute types: Boolean.
- **Selectable objects** (`optionsSourceDatabaseDataSource`; type: datasource, optional, list).
- **Selection type** (`optionsSourceDatabaseItemSelection`; type: selection, data source: optionsSourceDatabaseDataSource).

### Store value

- **Value** (`optionsSourceDatabaseValueAttribute`; type: attribute, data source: optionsSourceDatabaseDataSource). Attribute types: String, Integer, Long, Enum.
- **Target attribute** (`databaseAttributeString`; type: attribute, optional). Attribute types: String, Integer, Long, Enum.

### Attribute

- **Entity** (`attributeAssociation`; type: association, required).
- **Selectable objects** (`optionsSourceAssociationDataSource`; type: datasource, optional, list).

### Caption

- **Caption type** (`optionsSourceAssociationCaptionType`; type: enumeration, default: attribute). Allowed values: `attribute` (Attribute), `expression` (Expression).
- **Caption type** (`optionsSourceDatabaseCaptionType`; type: enumeration, default: attribute). Allowed values: `attribute` (Attribute), `expression` (Expression).
- **Caption** (`optionsSourceAssociationCaptionAttribute`; type: attribute, required, data source: optionsSourceAssociationDataSource). Attribute types: String.
- **Caption** (`optionsSourceDatabaseCaptionAttribute`; type: attribute, required, data source: optionsSourceDatabaseDataSource). Attribute types: String.
- **Caption** (`optionsSourceAssociationCaptionExpression`; type: expression, required, data source: optionsSourceAssociationDataSource). Returns: String.
- **Caption** (`optionsSourceDatabaseCaptionExpression`; type: expression, required, data source: optionsSourceDatabaseDataSource). Returns: String.

### Values

- **Attribute** (`staticAttribute`; type: attribute, required). Attribute types: String, Enum, Integer, Long, Boolean, DateTime, Decimal.
- **Values** (`optionsSourceStaticDataSource`; type: object, required, list).
- **Value** (`staticDataSourceValue`; type: expression). Value to be set
- **Custom content** (`staticDataSourceCustomContent`; type: widgets).
- **Caption** (`staticDataSourceCaption`; type: textTemplate). Caption to be shown

### General

- **No option text** (`noOptionsText`; type: textTemplate, optional).
- **Custom content** (`optionsSourceCustomContentType`; type: enumeration, required, default: no). Allowed values: `yes` (Yes), `no` (No).
- **Custom content** (`optionsSourceAssociationCustomContent`; type: widgets, required, data source: optionsSourceAssociationDataSource).
- **Custom content** (`optionsSourceDatabaseCustomContent`; type: widgets, required, data source: optionsSourceDatabaseDataSource).
- **Render type** (`controlType`; type: enumeration, required, default: checkbox). Allowed values: `checkbox` (Checkbox), `radio` (Radio button).
- **Group name** (`groupName`; type: expression, optional). Name for the group of associated inputs Returns: String.

### Label

- **Label**. Standard Mendix system property.

### Conditional visibility

- **Visibility**. Standard Mendix system property.

### Editability

- **Editable** (`customEditability`; type: enumeration, default: default). Allowed values: `default` (Default), `never` (Never), `conditionally` (Conditionally).
- **Condition** (`customEditabilityExpression`; type: expression, default: false). Returns: Boolean.
- **Read-only style** (`readOnlyStyle`; type: enumeration, default: text). How the checkbox radio selection will appear in read-only mode. Allowed values: `bordered` (Control), `text` (Content only).
- **Editability**. Standard Mendix system property.

- **On change action** (`onChangeEvent`; type: action, optional).
- **On change action** (`onChangeDatabaseEvent`; type: action, optional).

### Accessibility

- **Aria required** (`ariaRequired`; type: expression, default: false). Returns: Boolean.
- **Aria label** (`ariaLabel`; type: textTemplate, optional).

## Additional Notes

A widget for displaying radio button lists (single selection) and checkbox lists (multiple selection) based on different data sources.

## Features

- **Single Selection**: Radio button list for exclusive selection
- **Multiple Selection**: Checkbox list for multiple selection
- **Data Sources**: Support for context (association), database, and static data
- **Custom Content**: Ability to add custom content for options
- **Accessibility**: Full accessibility support with ARIA labels and keyboard navigation

## Configuration

The widget supports various data source types:

- **Context**: Use associations from your entity
- **Database**: Query database for selectable objects
- **Static**: Define static values directly in the widget

## Usage

1. Add the Checkbox Radio Selection widget to your page
2. Configure the data source (Context, Database, or Static)
3. Set up caption and value attributes
4. Configure selection method (single or multiple)
5. Customize styling and accessibility options

For detailed configuration options, please refer to the widget properties in Studio Pro.

## Browser Support

- Modern browsers supporting ES6+
- Internet Explorer 11+ (with polyfills)

## Development

This widget is built using:

- React 18+
- TypeScript
- Mendix Pluggable Widgets API
