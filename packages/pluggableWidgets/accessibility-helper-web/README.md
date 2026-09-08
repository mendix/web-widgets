# Accessibility helper

Set an attribute to a DOM element

## Overview

- **Folder**: `accessibility-helper-web`
- **Category**: Input elements
- **Offline capable**: Yes
- **Reference**: [Mendix documentation](https://docs.mendix.com/appstore/widgets/accessibility-helper)

## XML Properties

- **Target selector** (`targetSelector`; type: string). Selector to find the first HTML element you want to target which must be a valid CSS selector like '.mx-name-texbox1 input'
- **Content** (`content`; type: widgets).
- **HTML Attributes** (`attributesList`; type: object, optional, list).
- **HTML attribute** (`attribute`; type: string). The HTML attribute to be set based on the condition. The following attributes are not allowed: 'class', 'style', 'widgetid', 'data-mendix-id'.
- **Source type** (`valueSourceType`; type: enumeration, default: text). Allowed values: `text` (Text), `expression` (Expression).
- **Expression value** (`valueExpression`; type: expression, optional). Returns: String.
- **Text value** (`valueText`; type: textTemplate, optional).
- **Condition** (`attributeCondition`; type: expression, default: true). Condition to determine if the HTML attribute must be set or not Returns: Boolean.
