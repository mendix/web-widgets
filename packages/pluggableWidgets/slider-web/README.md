# Slider

Change a number value using a slider

## Overview

- **Folder**: `slider-web`
- **Category**: Input elements
- **Offline capable**: Yes

## XML Properties

### Data source

- **Value attribute** (`valueAttribute`; type: attribute). Attribute types: Integer, Long, Decimal.

### General

- **Enable advanced options** (`advanced`; type: boolean, default: false).
- **Minimum value type** (`minValueType`; type: enumeration, default: static). Allowed values: `static` (Static), `dynamic` (Dynamic), `expression` (Expression).
- **Minimum value** (`staticMinimumValue`; type: decimal, default: 0). The minimum value of the slider.
- **Minimum value** (`minAttribute`; type: attribute, optional). The minimum value of the slider. Attribute types: Decimal, Integer, Long.
- **Minimum value** (`expressionMinimumValue`; type: expression, optional). The minimum value of the slider. Returns: Decimal.
- **Maximum value type** (`maxValueType`; type: enumeration, default: static). Allowed values: `static` (Static), `dynamic` (Dynamic), `expression` (Expression).
- **Maximum value** (`staticMaximumValue`; type: decimal, default: 100). The maximum value of the slider.
- **Maximum value** (`maxAttribute`; type: attribute, optional). The maximum value of the slider. Attribute types: Integer, Long, Decimal.
- **Maximum value** (`expressionMaximumValue`; type: expression, optional). The maximum value of the slider. Returns: Decimal.
- **Step size type** (`stepSizeType`; type: enumeration, default: static). Allowed values: `static` (Static), `dynamic` (Dynamic), `expression` (Expression).
- **Step size** (`stepValue`; type: decimal, default: 1). Value to be added or subtracted on each step the slider makes. Must be greater than zero, and max - min should be evenly divisible by the step value.
- **Step size** (`stepAttribute`; type: attribute, optional). Value to be added or subtracted on each step the slider makes. Must be greater than zero, and max - min should be evenly divisible by the step value. Attribute types: Integer, Long, Decimal.
- **Step size** (`expressionStepSize`; type: expression, optional). Value to be added or subtracted on each step the slider makes. Must be greater than zero, and max - min should be evenly divisible by the step value. Returns: Decimal.
- **Show tooltip** (`showTooltip`; type: boolean, default: true).
- **Tooltip type** (`tooltipType`; type: enumeration, default: value). By default tooltip shows current value. Choose 'Custom' to create your own template. Allowed values: `value` (Current value), `customText` (Custom).
- **Tooltip** (`tooltip`; type: textTemplate, optional).
- **Tooltip always visible** (`tooltipAlwaysVisible`; type: boolean, default: false). When enabled tooltip is always visible to the user
- **Label**. Standard Mendix system property.

### Editability

- **Editability**. Standard Mendix system property.

### Visibility

- **Visibility**. Standard Mendix system property.

### Track

- **Number of markers** (`noOfMarkers`; type: integer, default: 2). The number of marker ticks that appear along the slider’s track. (Visible when larger than 0)
- **Decimal places** (`decimalPlaces`; type: integer, default: 0). Number of decimal places for marker values
- **Orientation** (`orientation`; type: enumeration, default: horizontal). The orientation of the slider. If ‘Vertical’, make sure to set the either the height of the parent or slider to a fixed height. Allowed values: `horizontal` (Horizontal), `vertical` (Vertical).
- **Height unit** (`heightUnit`; type: enumeration, default: percentage). Allowed values: `percentage` (Percentage), `pixels` (Pixels).
- **Height** (`height`; type: integer, default: 100).

### Events

- **On change** (`onChange`; type: action, optional).
