# Events

Events

## Overview

- **Folder**: `events-web`
- **Category**: Uncategorized
- **Offline capable**: Yes
- **Reference**: [Mendix documentation](https://docs.mendix.com/appstore/widgets/events)

## XML Properties

### Component load

- **Action** (`onComponentLoad`; type: action, optional).
- **Parameter type** (`componentLoadDelayParameterType`; type: enumeration, required, default: number). Allowed values: `number` (Value), `expression` (Expression).
- **Delay** (`componentLoadDelay`; type: integer, required, default: 0). Timer delay to first action execution. Value is in milliseconds. If set to 0, action will be triggered immediately.
- **Delay** (`componentLoadDelayExpression`; type: expression). Timer delay to first action execution. Value is in milliseconds. If set to 0, action will be triggered immediately. Returns: Integer.
- **Repeat** (`componentLoadRepeat`; type: boolean, required, default: false).
- **Parameter type** (`componentLoadRepeatIntervalParameterType`; type: enumeration, required, default: number). Allowed values: `number` (Value), `expression` (Expression).
- **Interval** (`componentLoadRepeatInterval`; type: integer, required, default: 30000). Interval between repeat action execution. Value is in milliseconds.
- **Interval** (`componentLoadRepeatIntervalExpression`; type: expression, optional). Interval between repeat action execution. Value is in milliseconds. Returns: Integer.

### On change

- **Attribute** (`onEventChangeAttribute`; type: attribute, optional). Attribute types: AutoNumber, Binary, Boolean, DateTime, Enum, HashString, Integer, Long, String, Decimal.
- **Action** (`onEventChange`; type: action, optional).
- **Parameter type** (`onEventChangeDelayParameterType`; type: enumeration, required, default: number). Allowed values: `number` (Value), `expression` (Expression).
- **Delay** (`onEventChangeDelay`; type: integer, required, default: 0). Timer delay to first action execution. Value is in milliseconds. If set to 0, action will be triggered immediately.
- **Delay** (`onEventChangeDelayExpression`; type: expression). Timer delay to first action execution. Value is in milliseconds. If set to 0, action will be triggered immediately. Returns: Integer.

## Additional Notes

<!-- TODO: Update marketplace URL -->

Please see [App Events](https://docs.mendix.com/appstore/widgets/) in the Mendix documentation for details.
