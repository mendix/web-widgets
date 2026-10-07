## ADDED Requirements

### Requirement: Class format emits no inline sizing on tables

When configured with `styleDataFormat: "class"`, the serialized `<table>` SHALL NOT contain `width`, `min-width` or `min-height` declarations in a `style` attribute. Table sizing SHALL be expressed only through `data-width`, `data-min-width` and `data-min-height`.

#### Scenario: Explicit table width

- **WHEN** the format is `class` and a table has width `600px`
- **THEN** the serialized `<table>` has `data-width="600px"`
- **AND** its `style` attribute, if present, contains no `width` declaration

#### Scenario: Explicit table minimum height

- **WHEN** the format is `class` and a table has minimum height `300px`
- **THEN** the serialized `<table>` has `data-min-height="300px"`
- **AND** its `style` attribute, if present, contains no `min-height` declaration

#### Scenario: Column-derived fixed width

- **WHEN** the format is `class`, the table has no explicit width, and every column has a non-percentage width
- **THEN** the serialized `<table>` has `data-width` set to the sum of the column widths in pixels
- **AND** no `width` declaration in `style`

#### Scenario: Column-derived minimum width

- **WHEN** the format is `class`, the table has no explicit width, and at least one column has no width or a percentage width
- **THEN** the serialized `<table>` has `data-min-width` set to the derived minimum width in pixels
- **AND** no `min-width` declaration in `style`

#### Scenario: Explicit width wins over derived width

- **WHEN** the format is `class` and a table has both an explicit width and column widths
- **THEN** `data-width` holds the explicit width
- **AND** `data-min-width` is absent

#### Scenario: No style attribute when nothing else needs it

- **WHEN** the format is `class` and a table has only sizing and class-format styling
- **THEN** the serialized `<table>` has no `style` attribute

### Requirement: Class format emits no inline sizing on columns

When configured with `styleDataFormat: "class"`, each `<col>` SHALL carry its width in a `data-col-width` attribute and SHALL NOT carry a `style` attribute.

#### Scenario: Column with a width

- **WHEN** the format is `class` and a column has width `250px`
- **THEN** the corresponding `<col>` has `data-col-width="250px"` and no `style` attribute

#### Scenario: Column with a percentage width

- **WHEN** the format is `class` and a column has width `50%`
- **THEN** the corresponding `<col>` has `data-col-width="50%"` and no `style` attribute

#### Scenario: Column without a width

- **WHEN** the format is `class` and a column has no width
- **THEN** the corresponding `<col>` has neither `data-col-width` nor `style`

### Requirement: Class format emits no inline sizing on cells

When configured with `styleDataFormat: "class"`, `<td>` and `<th>` SHALL carry width and height only in `data-cell-width` and `data-cell-height` and SHALL NOT contain `width` or `height` declarations in a `style` attribute.

#### Scenario: Data cell with width and height

- **WHEN** the format is `class` and a `<td>` has width `250px` and height `80px`
- **THEN** the serialized `<td>` has `data-cell-width="250px"` and `data-cell-height="80px"`
- **AND** it has no `style` attribute

#### Scenario: Header cell behaves identically

- **WHEN** the format is `class` and a `<th>` has width `250px` and height `80px`
- **THEN** the serialized `<th>` has `data-cell-width="250px"` and `data-cell-height="80px"`
- **AND** it has no `style` attribute

### Requirement: Stylesheet renders class-format sizing

The widget stylesheet SHALL apply class-format sizing attributes as the matching CSS properties: `data-width` as table `width`, `data-min-width` as table `min-width`, `data-min-height` as table `min-height`, `data-col-width` as `<col>` `width`, `data-cell-width` as cell `width`, and `data-cell-height` as cell `height`. Lengths in any CSS unit and percentages SHALL be accepted.

#### Scenario: Table width is applied

- **WHEN** class-format content with `<table data-width="600px">` is rendered inside the widget in a browser supporting typed `attr()`
- **THEN** the table's computed width is 600px

#### Scenario: Column width is applied

- **WHEN** class-format content with `<col data-col-width="250px">` is rendered
- **THEN** that column renders 250px wide

#### Scenario: Percentage value is applied

- **WHEN** class-format content with `<col data-col-width="50%">` is rendered
- **THEN** that column takes 50% of the table width

#### Scenario: Cell height is applied

- **WHEN** class-format content with `<td data-cell-height="80px">` is rendered
- **THEN** the cell renders at least 80px tall

#### Scenario: Editor and saved output look the same

- **WHEN** a table is sized in the editor in class format, saved, and shown in a read-only widget
- **THEN** table, column and cell sizes match what the editor showed

### Requirement: Drag resize stays live in class format

Dragging a table resize handle in `class` format SHALL preview the size live and, on release, SHALL leave the table sized by its data attributes, with no leftover inline sizing on the element.

#### Scenario: Live preview while dragging

- **WHEN** the format is `class` and the user drags the width handle
- **THEN** the table width follows the pointer during the drag

#### Scenario: Committed state after release

- **WHEN** the user releases the handle
- **THEN** the table has `data-width` set to the new width
- **AND** the table element's inline style contains no `width` or `min-height`

#### Scenario: Clearing a size

- **WHEN** the format is `class` and the user clears the table width
- **THEN** `data-width` is removed, or replaced by the column-derived value
- **AND** the table renders at the column-derived size

### Requirement: Previously saved class-format content still loads

Content saved before this change, which carries both inline sizing and `data-*` sizing, SHALL load with its sizes intact and SHALL be re-serialized without inline sizing.

#### Scenario: Legacy table loads and is normalized

- **WHEN** the format is `class` and HTML containing `<table style="width: 600px" data-width="600px">` is loaded and re-serialized
- **THEN** the output `<table>` has `data-width="600px"`
- **AND** no `width` declaration in `style`

#### Scenario: Legacy cell loads and is normalized

- **WHEN** the format is `class` and HTML containing `<td style="width: 250px" data-cell-width="250px">` is loaded and re-serialized
- **THEN** the output `<td>` has `data-cell-width="250px"` and no `style` attribute
- **AND** the matching `<col>` has `data-col-width="250px"`

### Requirement: Inline format sizing is unchanged

When configured with `styleDataFormat: "inline"`, table, column and cell sizing SHALL continue to be serialized as inline `style` declarations, and no sizing data attributes SHALL be emitted.

#### Scenario: Inline table and column

- **WHEN** the format is `inline` and a table has width `600px` with a `250px` column
- **THEN** the `<table>` has `width: 600px` in `style` and the `<col>` has `width: 250px` in `style`
- **AND** neither element has `data-width`, `data-min-width` or `data-col-width`

### Requirement: Class-format border defaults

In `class` format, a table or cell carrying `has-table-border`, `has-cell-border` or `has-border` SHALL render any border property that has no data attribute with the same default as inline format: width `1px`, style `solid`, and the default neutral border color.

#### Scenario: Only border color set

- **WHEN** class-format content has `<table class="has-table-border" data-border-color="#c45100">`
- **THEN** the table border renders as `1px solid #c45100`

#### Scenario: Only border width set

- **WHEN** class-format content has `<td class="has-cell-border" data-border-width="4px">`
- **THEN** the cell border renders 4px wide, solid, in the default neutral border color

#### Scenario: All border properties set

- **WHEN** class-format content has `data-border-width="4px"`, `data-border-style="dotted"` and `data-border-color="#c45100"`
- **THEN** the border renders as `4px dotted #c45100`
