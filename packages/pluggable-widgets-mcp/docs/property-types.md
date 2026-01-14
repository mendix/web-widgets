# Mendix Widget Property Types Reference

This document defines all available property types for Mendix pluggable widgets. Use this reference when defining properties in the JSON schema for XML generation.

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

**XML Output:**

```xml
<property key="label" type="string" defaultValue="Click me">
    <caption>Label</caption>
    <description>Text label for the widget</description>
</property>
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

**XML Output:**

```xml
<property key="showIcon" type="boolean" defaultValue="true">
    <caption>Show icon</caption>
    <description>Display an icon next to the text</description>
</property>
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

**XML Output:**

```xml
<property key="maxItems" type="integer" defaultValue="10">
    <caption>Maximum items</caption>
    <description>Maximum number of items to display</description>
</property>
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

**XML Output:**

```xml
<property key="legend" type="textTemplate" required="false">
    <caption>Legend</caption>
    <description>Text template with parameters</description>
</property>
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

**XML Output (with returnType):**

```xml
<property key="valueExpression" type="expression">
    <caption>Value</caption>
    <returnType type="String" />
</property>
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

**XML Output:**

```xml
<property key="onClick" type="action" required="false">
    <caption>On click</caption>
    <description>Action to execute when clicked</description>
</property>
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

**XML Output:**

```xml
<property key="value" type="attribute" required="true">
    <caption>Value</caption>
    <description>Attribute to store the value</description>
    <attributeTypes>
        <attributeType name="String" />
    </attributeTypes>
</property>
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

**XML Output:**

```xml
<property key="dataSource" type="datasource" isList="true" required="false">
    <caption>Data source</caption>
    <description>Source of items to display</description>
</property>
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

### entity

Entity selector.

```json
{
    "key": "targetEntity",
    "type": "entity",
    "caption": "Target entity"
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

**XML Output:**

```xml
<property key="alignment" type="enumeration" defaultValue="left">
    <caption>Alignment</caption>
    <enumerationValues>
        <enumerationValue key="left">Left</enumerationValue>
        <enumerationValue key="center">Center</enumerationValue>
        <enumerationValue key="right">Right</enumerationValue>
    </enumerationValues>
</property>
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

**XML Output:**

```xml
<property key="content" type="widgets">
    <caption>Content</caption>
    <description>Widgets to display inside</description>
</property>
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

**XML Output:**

```xml
<property key="columns" type="object" isList="true">
    <caption>Columns</caption>
    <properties>
        <propertyGroup caption="Column">
            <property key="header" type="textTemplate">
                <caption>Header</caption>
            </property>
            <property key="width" type="integer" defaultValue="100">
                <caption>Width</caption>
            </property>
        </propertyGroup>
    </properties>
</property>
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

**XML Output:**

```xml
<propertyGroup caption="Common">
    <systemProperty key="Name" />
    <systemProperty key="TabIndex" />
</propertyGroup>
<propertyGroup caption="Visibility">
    <systemProperty key="Visibility" />
</propertyGroup>
```

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
