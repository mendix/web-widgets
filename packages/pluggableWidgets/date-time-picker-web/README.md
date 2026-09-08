# Date Time Picker

Date, time and range picker widget

## Overview

- **Folder**: `date-time-picker-web`
- **Category**: Input elements
- **Offline capable**: Yes
- **Reference**: [Mendix documentation](https://docs.mendix.com/appstore/widgets/datetimepicker)

## XML Properties

### General

- **Picker type** (`type`; type: enumeration, default: date). Allowed values: `date` (Date), `time` (Time), `range` (Range), `datetime` (Date and Time).
- **Date format** (`dateFormat`; type: string, optional, default: MM/dd/yyyy).
- **Time format** (`timeFormat`; type: string, optional, default: hh:mm a).
- **Date time format** (`dateTimeFormat`; type: string, optional, default: MM/dd/yyyy hh:mm a).
- **Placeholder** (`placeholder`; type: expression, optional). Returns: String.

### Data source

- **Value** (`dateAttribute`; type: attribute). Attribute types: DateTime.
- **End value** (`endDateAttribute`; type: attribute, optional). Attribute types: DateTime.

### Label

- **Label**. Standard Mendix system property.

### Editability

- **Editability**. Standard Mendix system property.

### Conditional visibility

- **Visibility**. Standard Mendix system property.

### Validation

- **Validation** (`validationType`; type: enumeration, default: none). Allowed values: `none` (None), `required` (Required), `custom` (Custom).
- **Custom condition** (`customValidation`; type: expression, optional). Returns: Boolean.
- **Message** (`validationMessage`; type: expression, optional). Returns: String.

### Accessibility

- **Aria required** (`ariaRequired`; type: boolean, default: true). Used by assistive technologies to indicate that a field is required.

- **On change** (`onChange`; type: action, optional).
- **On enter** (`onEnter`; type: action, optional).
- **On leave** (`onLeave`; type: action, optional).
