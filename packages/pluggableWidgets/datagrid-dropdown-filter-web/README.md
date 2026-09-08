# Drop-down filter

Filter Data Grid 2 rows by selecting values from a drop-down list.

## Overview

- **Folder**: `datagrid-dropdown-filter-web`
- **Category**: Data controls
- **Offline capable**: Yes
- **Reference**: [Mendix documentation](https://docs.mendix.com/appstore/modules/data-grid-2#7-2-drop-down-filter)

## XML Properties

### Data source

- **Filter by** (`baseType`; type: enumeration, default: attr). Allowed values: `attr` (Attribute), `ref` (Association).
- **Datasource to Filter** (`linkedDs`; type: datasource, list).
- **Attribute config** (`attrChoice`; type: enumeration, default: auto). "Auto" works only when the widget is placed in a Data grid column. Allowed values: `auto` (Auto), `linked` (Custom).
- **Attribute** (`attr`; type: attribute, data source: linkedDs). Attribute types: Enum, Boolean.
- **Automatic options** (`auto`; type: boolean, default: true). Show options based on the references or the enumeration values and captions.
- **Options** (`filterOptions`; type: object, optional, list).
- **Caption** (`caption`; type: textTemplate).
- **Value** (`value`; type: expression). Returns: String.
- **Entity** (`refEntity`; type: association, required, data source: linkedDs). Set the entity to enable filtering over association.
- **Selectable objects** (`refOptions`; type: datasource, optional, list). The options to show in the Drop-down filter widget.
- **Caption source** (`refCaptionSource`; type: enumeration, default: attr). Allowed values: `attr` (Attribute), `exp` (Expression).
- **Caption** (`refCaption`; type: attribute, required, data source: refOptions). Attribute types: String.
- **Caption** (`refCaptionExp`; type: expression, required, data source: refOptions). Returns: String.
- **Search attribute** (`refSearchAttr`; type: attribute, required, data source: refOptions). Required when Filterable is set to yes Attribute types: String.
- **Use lazy load** (`fetchOptionsLazy`; type: boolean, default: false). Lazy loading enables faster parent loading, but with personalization enabled, value restoration will be limited.

### General

- **Default value** (`defaultValue`; type: expression, optional). Empty option caption will be shown by default or if configured default value matches none of the options Returns: String.
- **Filterable** (`filterable`; type: boolean, default: false).
- **Multiselect** (`multiSelect`; type: boolean, default: false).
- **Empty option caption** (`emptyOptionCaption`; type: textTemplate, optional).
- **Clearable** (`clearable`; type: boolean, default: true).
- **Show selected items as** (`selectedItemsStyle`; type: enumeration, required, default: text). Allowed values: `text` (Text), `boxes` (Labels).
- **Selection method** (`selectionMethod`; type: enumeration, default: checkbox). Allowed values: `checkbox` (Checkbox), `rowClick` (Row click).

### Configurations

- **Saved attribute** (`valueAttribute`; type: attribute, optional). Attribute used to store the last value of the filter. Associations are not supported. Attribute types: String.

### Events

- **On change** (`onChange`; type: action, optional). Action to be triggered when the value or filter changes.

### Accessibility

- **Input caption** (`ariaLabel`; type: textTemplate, optional). Assistive technology will read this upon reaching the input element.

### Texts

- **Empty selection caption** (`emptySelectionCaption`; type: textTemplate, optional). This text is shown if no options are selected. For example 'Select color' or 'No options are selected'.
- **Filter input placeholder** (`filterInputPlaceholderCaption`; type: textTemplate, optional). This text is shown as placeholder for filterable filters. For example 'Type to search'.
