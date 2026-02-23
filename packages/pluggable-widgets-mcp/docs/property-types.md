# Mendix Widget Property Types Reference

This document defines all available property types for Mendix pluggable widgets. Use this reference when defining properties in the JSON schema for XML generation.

> **Note:** XML is generated automatically by the `generate-widget-code` tool. You only need to provide JSON property definitions — no XML knowledge required.

## Property Definition Schema

When defining properties for the XML generator, use this JSON structure:

```json
{
    "key": "propertyName",
    "type": "string",
    "caption": "Display Caption",
    "description": "Optional description shown in Studio Pro",
    "required": false,
    "defaultValue": "optional default"
}
```

---

## Basic Types

### string

Simple text input.

```json
{
    "key": "label",
    "type": "string",
    "caption": "Label",
    "description": "Text label for the widget",
    "defaultValue": "Click me"
}
```

---

### boolean

True/false toggle.

```json
{
    "key": "showIcon",
    "type": "boolean",
    "caption": "Show icon",
    "description": "Display an icon next to the text",
    "defaultValue": true
}
```

---

### integer

Whole number input.

```json
{
    "key": "maxItems",
    "type": "integer",
    "caption": "Maximum items",
    "description": "Maximum number of items to display",
    "defaultValue": 10
}
```

---

### decimal

Decimal number input.

```json
{
    "key": "opacity",
    "type": "decimal",
    "caption": "Opacity",
    "description": "Opacity level (0-1)",
    "defaultValue": 0.8
}
```

---

## Text Types

### textTemplate

Text with parameter substitution. Allows dynamic text with placeholders.

```json
{
    "key": "legend",
    "type": "textTemplate",
    "caption": "Legend",
    "description": "Text template with parameters",
    "required": false
}
```

---

### expression

Dynamic expression that can reference attributes and return computed values.

```json
{
    "key": "visibleExpression",
    "type": "expression",
    "caption": "Visible",
    "description": "Expression to determine visibility",
    "defaultValue": "true"
}
```

**With return type:**

```json
{
    "key": "valueExpression",
    "type": "expression",
    "caption": "Value",
    "returnType": "String"
}
```

---

## Action Types

### action

Event handler that triggers actions (microflows, nanoflows, etc.).

```json
{
    "key": "onClick",
    "type": "action",
    "caption": "On click",
    "description": "Action to execute when clicked",
    "required": false
}
```

---

## Data Types

### attribute

Links to an entity attribute. Must specify allowed attribute types.

```json
{
    "key": "value",
    "type": "attribute",
    "caption": "Value",
    "description": "Attribute to store the value",
    "required": true,
    "attributeTypes": ["String"]
}
```

**Multiple attribute types:**

```json
{
    "key": "numberValue",
    "type": "attribute",
    "attributeTypes": ["Integer", "Decimal", "Long"]
}
```

**Valid attributeTypes:**

- `String`
- `Integer`
- `Long`
- `Decimal`
- `Boolean`
- `DateTime`
- `Enum`
- `HashString`
- `Binary`
- `AutoNumber`

---

### datasource

Data source for list-based widgets.

```json
{
    "key": "dataSource",
    "type": "datasource",
    "caption": "Data source",
    "description": "Source of items to display",
    "isList": true,
    "required": false
}
```

---

### association

Links to an entity association.

```json
{
    "key": "parent",
    "type": "association",
    "caption": "Parent association",
    "required": false
}
```

---

### selection

Represents the selection mode for a widget (e.g., for data grids).

| Field       | Type        | Required | Description                 |
| ----------- | ----------- | -------- | --------------------------- |
| key         | string      | ✅       | camelCase identifier        |
| type        | "selection" | ✅       | Must be "selection"         |
| caption     | string      | ✅       | Display label in Studio Pro |
| description | string      |          | Help text                   |
| required    | boolean     |          | Whether required            |

**Example:**

```json
{
    "key": "selection",
    "type": "selection",
    "caption": "Selection"
}
```

---

## Selection Types

### enumeration

Dropdown with predefined options. Must include `enumValues` array.

```json
{
    "key": "alignment",
    "type": "enumeration",
    "caption": "Alignment",
    "defaultValue": "left",
    "enumValues": [
        { "key": "left", "caption": "Left" },
        { "key": "center", "caption": "Center" },
        { "key": "right", "caption": "Right" }
    ]
}
```

---

### icon

Icon picker.

```json
{
    "key": "icon",
    "type": "icon",
    "caption": "Icon",
    "required": false
}
```

---

### image

Image picker.

```json
{
    "key": "image",
    "type": "image",
    "caption": "Image",
    "required": false
}
```

---

### file

File selector.

```json
{
    "key": "document",
    "type": "file",
    "caption": "Document"
}
```

---

## Container Types

### widgets

Container for child widgets. Used to create widget slots.

```json
{
    "key": "content",
    "type": "widgets",
    "caption": "Content",
    "description": "Widgets to display inside"
}
```

**With datasource reference:**

```json
{
    "key": "content",
    "type": "widgets",
    "caption": "Content",
    "dataSource": "dataSource"
}
```

---

### object

Complex nested property with sub-properties. Used for repeating structures.

```json
{
    "key": "columns",
    "type": "object",
    "caption": "Columns",
    "isList": true,
    "properties": [
        {
            "key": "header",
            "type": "textTemplate",
            "caption": "Header"
        },
        {
            "key": "width",
            "type": "integer",
            "caption": "Width",
            "defaultValue": 100
        }
    ]
}
```

---

## System Properties

System properties are predefined by Mendix. Reference them by key only.

```json
{
    "systemProperties": ["Name", "TabIndex", "Visibility"]
}
```

**Available system properties:**

- `Name` - Widget name in Studio Pro
- `TabIndex` - Tab order for accessibility
- `Visibility` - Conditional visibility settings

---

## Property Groups

Properties can be organized into groups for better Studio Pro UI.

```json
{
    "propertyGroups": [
        {
            "caption": "General",
            "properties": ["label", "showIcon"]
        },
        {
            "caption": "Events",
            "properties": ["onClick", "onHover"]
        }
    ]
}
```

---

## Property Organization

### Auto-Grouping Behavior

If `propertyGroups` is omitted from the widget definition, the `generate-widget-code` tool applies automatic grouping:

- Non-action properties (all types except `action`) are placed in a **"General"** group.
- Action properties (`type: "action"`) are placed in an **"Events"** group.

This means you rarely need to define `propertyGroups` explicitly for simple widgets. Only add it when you need custom group names or a specific ordering of groups.

### Incrementally Updating Properties

Once a widget has been generated with `generate-widget-code`, you do not need to regenerate all files to change the property list. Use the `update-widget-properties` tool to:

- **Add** new properties to an existing widget
- **Remove** properties that are no longer needed
- **Modify** property attributes (e.g., change a caption or default value)

The `update-widget-properties` tool reads the `.widget-definition.json` snapshot saved during `generate-widget-code` and applies only the requested delta, then regenerates the affected files.

> **Requirement:** `generate-widget-code` must have been run at least once before `update-widget-properties` can be used, because it depends on the `.widget-definition.json` snapshot.

---

## Full Widget Definition Example

```json
{
    "name": "TooltipButton",
    "description": "A button with tooltip on hover",
    "properties": [
        {
            "key": "buttonText",
            "type": "textTemplate",
            "caption": "Button text",
            "description": "Text to display on the button"
        },
        {
            "key": "tooltipText",
            "type": "textTemplate",
            "caption": "Tooltip text",
            "description": "Text to show on hover"
        },
        {
            "key": "buttonStyle",
            "type": "enumeration",
            "caption": "Style",
            "defaultValue": "primary",
            "enumValues": [
                { "key": "primary", "caption": "Primary" },
                { "key": "secondary", "caption": "Secondary" },
                { "key": "danger", "caption": "Danger" }
            ]
        },
        {
            "key": "onClick",
            "type": "action",
            "caption": "On click",
            "required": false
        }
    ],
    "systemProperties": ["Name", "TabIndex", "Visibility"]
}
```

---

## Type Quick Reference

| Type           | Use Case         | Requires                |
| -------------- | ---------------- | ----------------------- |
| `string`       | Simple text      | -                       |
| `boolean`      | Toggle           | `defaultValue`          |
| `integer`      | Whole numbers    | -                       |
| `decimal`      | Decimal numbers  | -                       |
| `textTemplate` | Dynamic text     | -                       |
| `expression`   | Computed values  | `returnType` (optional) |
| `action`       | Event handlers   | -                       |
| `attribute`    | Entity binding   | `attributeTypes`        |
| `datasource`   | List data        | `isList: true`          |
| `enumeration`  | Dropdown         | `enumValues`            |
| `widgets`      | Child widgets    | -                       |
| `object`       | Nested structure | `properties`, `isList`  |
| `icon`         | Icon picker      | -                       |
| `image`        | Image picker     | -                       |
| `association`  | Entity relation  | -                       |
| `selection`    | Selection mode   | -                       |
