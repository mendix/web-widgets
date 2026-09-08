# Range Slider

Change range of values using a slider

## Overview

- **Folder**: `range-slider-web`
- **Category**: Input elements
- **Offline capable**: Yes

## XML Properties

### Data source

- **Lower bound attribute** (`lowerBoundAttribute`; type: attribute). The lower bound value on the slider Attribute types: Integer, Long, Decimal.
- **Upper bound attribute** (`upperBoundAttribute`; type: attribute). The upper bound value on the slider Attribute types: Integer, Long, Decimal.

### General

- **Enable advanced options** (`advanced`; type: boolean, default: false).
- **Minimum value type** (`minValueType`; type: enumeration, default: static). Allowed values: `static` (Static), `dynamic` (Dynamic), `expression` (Expression).
- **Minimum value** (`staticMinimumValue`; type: decimal, default: 0).
- **Minimum value** (`minAttribute`; type: attribute, optional). Attribute types: Decimal, Integer, Long.
- **Minimum value** (`expressionMinimumValue`; type: expression, optional). Returns: Decimal.
- **Maximum value type** (`maxValueType`; type: enumeration, default: static). Allowed values: `static` (Static), `dynamic` (Dynamic), `expression` (Expression).
- **Maximum value** (`staticMaximumValue`; type: decimal, default: 100).
- **Maximum value** (`maxAttribute`; type: attribute, optional). Attribute types: Integer, Long, Decimal.
- **Maximum value** (`expressionMaximumValue`; type: expression, optional). Returns: Decimal.
- **Step size type** (`stepSizeType`; type: enumeration, default: static). Allowed values: `static` (Static), `dynamic` (Dynamic), `expression` (Expression).
- **Step size** (`stepValue`; type: decimal, default: 1).
- **Step size** (`stepAttribute`; type: attribute, optional). Attribute types: Integer, Long, Decimal.
- **Step size** (`expressionStepSize`; type: expression, optional). Returns: Decimal.
- **Show tooltip** (`showTooltip`; type: boolean, default: true).
- **Lower bound tooltip type** (`tooltipTypeLower`; type: enumeration, default: value). By default tooltip shows current value. Choose 'Custom' to create your own template. Allowed values: `value` (Value), `customText` (Custom).
- **Tooltip** (`tooltipLower`; type: textTemplate, optional).
- **Upper bound tooltip type** (`tooltipTypeUpper`; type: enumeration, default: value). By default tooltip shows current value. Choose 'Custom' to create your own template. Allowed values: `value` (Value), `customText` (Custom).
- **Tooltip** (`tooltipUpper`; type: textTemplate, optional).
- **Tooltip always visible** (`tooltipAlwaysVisible`; type: boolean, default: false). When enabled tooltip is always visible to the user
- **Label**. Standard Mendix system property.

### Editability

- **Editability**. Standard Mendix system property.

### Visibility

- **Visibility**. Standard Mendix system property.

### Track

- **Number of markers** (`noOfMarkers`; type: integer, default: 1). Marker ticks on the slider (visible when larger than 0)
- **Decimal places** (`decimalPlaces`; type: integer, default: 0). Number of decimal places for marker values
- **Orientation** (`orientation`; type: enumeration, default: horizontal). If orientation is 'Vertical', make sure that parent or slider itself has fixed height Allowed values: `horizontal` (Horizontal), `vertical` (Vertical).
- **Height unit** (`heightUnit`; type: enumeration, default: percentage). Allowed values: `percentage` (Percentage), `pixels` (Pixels).
- **Height** (`height`; type: integer, default: 100).

### Events

- **On change** (`onChange`; type: action, optional).
