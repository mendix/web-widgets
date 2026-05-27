# Widget Name Properties

## Property Group Name

### Sub-group Name (optional)

| Property      | Type | Default             | Required | Description                            |
| ------------- | ---- | ------------------- | -------- | -------------------------------------- |
| `propertyKey` | type | `defaultValue` or - | Yes/No   | Description of what this property does |

**Instructions for enumeration properties:**

- Always document enum values below the table using the property key as header
- Format: `enumKey` - Label: Description
- Use the exact key from XML, the Studio Pro label, and explain what it does

**propertyKey values:** (for enumeration types)

- `enumKey` - Label: Description of what this value means

**propertyKey constraints:** (for attribute/expression types)

- Attribute types: List applicable types
- Return type: Expected return type
- Data source: Reference to parent data source if applicable

---

## Property Group Name 2

### Nested Object Properties

For properties of type `object (list)`, document nested properties in a sub-section:

#### Nested Property Group

| Property         | Type | Default        | Required | Description |
| ---------------- | ---- | -------------- | -------- | ----------- |
| `nestedProperty` | type | `defaultValue` | Yes/No   | Description |

---

<!-- ============================================================================ -->
<!-- EXAMPLE - Do not include this section in final documentation                -->
<!-- ============================================================================ -->

## Example (for reference only)

### General

| Property          | Type              | Default | Required | Description                |
| ----------------- | ----------------- | ------- | -------- | -------------------------- |
| `datasource`      | datasource (list) | -       | Yes      | Data source for the widget |
| `refreshInterval` | integer           | `0`     | No       | Refresh time in seconds    |

### Selection

| Property              | Type        | Default    | Required | Description                    |
| --------------------- | ----------- | ---------- | -------- | ------------------------------ |
| `itemSelection`       | selection   | -          | Yes      | Selection mode for grid rows   |
| `itemSelectionMethod` | enumeration | `checkbox` | No       | How users select rows          |
| `autoSelect`          | boolean     | `false`    | No       | Automatically select first row |

**itemSelectionMethod values:**

- `checkbox` - Checkbox: Select via checkbox column
- `rowClick` - Row click: Select by clicking the row

### Columns

| Property  | Type          | Default | Required | Description          |
| --------- | ------------- | ------- | -------- | -------------------- |
| `columns` | object (list) | -       | Yes      | Column configuration |

#### Column Properties

| Property        | Type        | Default     | Required | Description                   |
| --------------- | ----------- | ----------- | -------- | ----------------------------- |
| `showContentAs` | enumeration | `attribute` | No       | How to display column content |
| `attribute`     | attribute   | -           | No       | Attribute to display          |
| `sortable`      | boolean     | `true`      | No       | Whether column can be sorted  |

**showContentAs values:**

- `attribute` - Attribute: Display bound attribute value
- `dynamicText` - Dynamic text: Display text template
- `customContent` - Custom content: Display nested widgets

**attribute constraints:**

- Attribute types: String, Boolean, DateTime, Integer
- Associations: Reference, ReferenceSet
