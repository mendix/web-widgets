# Progress circle

Displays a progress in a circle

## Overview

- **Folder**: `progress-circle-web`
- **Category**: Display
- **Offline capable**: Yes
- **Reference**: [Mendix documentation](https://docs.mendix.com/appstore/widgets/progress-circle)

## XML Properties

### General

- **Type** (`type`; type: enumeration, default: static). Allowed values: `static` (Static), `dynamic` (Dynamic), `expression` (Expression).
- **Current value** (`staticCurrentValue`; type: integer, default: 50).
- **Current value** (`dynamicCurrentValue`; type: attribute, optional). Attribute types: Decimal, Integer, Long.
- **Current value** (`expressionCurrentValue`; type: expression, optional). Returns: Decimal.
- **Minimum value** (`staticMinValue`; type: integer, default: 0).
- **Minimum value** (`dynamicMinValue`; type: attribute, optional). Attribute types: Decimal, Integer, Long.
- **Minimum value** (`expressionMinValue`; type: expression, optional). Returns: Decimal.
- **Maximum value** (`staticMaxValue`; type: integer, default: 100).
- **Maximum value** (`dynamicMaxValue`; type: attribute, optional). Attribute types: Decimal, Integer, Long.
- **Maximum value** (`expressionMaxValue`; type: expression, optional). Returns: Decimal.
- **Visibility**. Standard Mendix system property.

### Events

- **On click** (`onClick`; type: action, optional).

### Progress Label

- **Show label** (`showLabel`; type: boolean, default: false).
- **Label type** (`labelType`; type: enumeration, default: text). Allowed values: `text` (Text), `percentage` (Percentage), `custom` (Custom).
- **Label text** (`labelText`; type: textTemplate, optional).
- **Custom label** (`customLabel`; type: widgets, optional).
