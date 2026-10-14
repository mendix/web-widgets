## ADDED Requirements

### Requirement: Table header cells support the same styling as data cells

The Rich Text table editor SHALL apply background color, border color, border style, and border width to header cells (`<th>`) identically to how it applies them to data cells (`<td>`), in both the `inline` and `class` style-data formats.

#### Scenario: Header background color renders in inline format

- **WHEN** the editor is configured with `styleDataFormat: "inline"`
- **AND** a background color is set on a header cell
- **THEN** the rendered `<th>` SHALL include an inline `background-color` in its `style` attribute using the validated color value

#### Scenario: Header border properties render in inline format

- **WHEN** the editor is configured with `styleDataFormat: "inline"`
- **AND** border color, border style, and/or border width are set on a header cell
- **THEN** the rendered `<th>` SHALL include the corresponding validated `border-*` declarations in its `style` attribute

#### Scenario: Header styling renders as data attributes in class format

- **WHEN** the editor is configured with `styleDataFormat: "class"`
- **AND** background color and/or border properties are set on a header cell
- **THEN** the rendered `<th>` SHALL expose the values via `data-background-color` / `data-border-color` / `data-border-style` / `data-border-width` attributes
- **AND** SHALL carry the `has-background-color` and/or `has-cell-border` class
- **AND** SHALL NOT emit the corresponding inline `style` declarations

#### Scenario: Header styling round-trips through parse and serialize

- **WHEN** HTML containing a styled `<th>` (inline or class variant) is parsed into the editor and re-serialized
- **THEN** the header cell's background and border styling SHALL be preserved identically

#### Scenario: Unsafe header values are rejected

- **WHEN** an invalid color, size, or border-style value is applied to a header cell
- **THEN** the unsafe value SHALL be dropped, consistent with the validation applied to data cells

#### Scenario: Configuration UI applies styling to header cells

- **WHEN** the cursor is inside a header cell and a background or border configuration command is executed
- **THEN** the header cell's attributes SHALL be updated and reflected in the rendered `<th>`

#### Scenario: Data cell styling is unchanged

- **WHEN** background or border styling is applied to a data cell in either style-data format
- **THEN** the rendered `<td>` output SHALL be identical to the behavior before header-cell support was added
