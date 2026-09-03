# list-marker-format Specification

## Purpose

TBD - created by archiving change list-marker-first-run-format. Update Purpose after archive.

## Requirements

### Requirement: List markers follow the format of the list item's first inline run

The bullet or number of a list item SHALL render with the font size, font weight, font style, color, and font family of the first inline run of that list item's first block. When the first inline run carries none of these formats, the marker SHALL render at the base size and format inherited from the list, exactly as it does today.

Each list item SHALL be evaluated independently, so sibling items in the same list MAY render markers at different formats.

#### Scenario: Enlarging the whole list item enlarges the marker

- **WHEN** a list item's entire text is set to a larger font size
- **THEN** the item's bullet or number renders at that larger font size

#### Scenario: Marker follows bold, italic, color, and font family

- **WHEN** the first inline run of a list item is bold, italic, colored, or set to a different font family
- **THEN** the item's bullet or number renders bold, italic, in that color, and in that font family respectively

#### Scenario: Unformatted list item is unchanged

- **WHEN** a list item's first inline run carries no font size, weight, style, color, or family
- **THEN** the marker renders identically to the current behavior, with no marker format data emitted for that item

#### Scenario: Sibling items format independently

- **WHEN** one item of a list has an enlarged first run and another does not
- **THEN** only the enlarged item's marker is enlarged, and the sibling's marker is unchanged

#### Scenario: Nested list items follow their own first run

- **WHEN** a nested list item's first run is enlarged
- **THEN** that nested item's marker is enlarged, and the parent item's marker is unaffected

### Requirement: Only formatting that covers the first character affects the marker

When a user formats part of a list item's text, the marker SHALL change only if the formatted range includes the item's first character. Formatting that begins after the first character SHALL leave the marker unchanged.

#### Scenario: Formatting only the first character

- **WHEN** the user selects only the first character of a list item and increases its font size
- **THEN** the item's marker renders at the increased font size

#### Scenario: Formatting a later portion of the text

- **WHEN** the user selects a range that starts after the first character and increases its font size
- **THEN** the item's marker is unchanged

#### Scenario: Removing formatting from the first character

- **WHEN** the first run of a list item is enlarged and the user then clears its font size
- **THEN** the marker returns to the base size and the marker format data is removed from that item

### Requirement: Marker format is derived, never stored in the document

Marker format SHALL be computed from the list item's content during rendering. The widget SHALL NOT write marker format into the editor document, SHALL NOT declare it as a node attribute, and SHALL NOT modify stored content as a side effect of loading a document.

Marker format data present in incoming HTML SHALL be ignored when parsing and recomputed when rendering.

#### Scenario: Opening existing content does not modify it

- **WHEN** a document containing lists is loaded into the widget and the user makes no edit
- **THEN** no update is emitted, the bound attribute is not marked as changed, and no change action is triggered

#### Scenario: Legacy content renders correct markers without migration

- **WHEN** content saved before this change, containing an enlarged first run in a list item, is loaded
- **THEN** the marker renders enlarged immediately, with no migration step and no rewrite of the stored value

#### Scenario: Stale marker data in pasted HTML is discarded

- **WHEN** HTML containing marker format data that disagrees with its own list item content is pasted
- **THEN** the pasted marker format data is discarded and the marker format is recomputed from the first inline run

### Requirement: Marker format renders in the live editor, in read-only mode, and in saved HTML

The marker format SHALL be correct in the editor as the user types, in read-only rendering, and in the HTML the widget emits.

Editing a list item's first run SHALL update that item's marker without requiring a reload, re-render of the whole document, or loss of cursor position.

#### Scenario: Marker updates while typing

- **WHEN** the user changes the font size of a list item's first run in the editor
- **THEN** the marker updates immediately and the cursor position is preserved

#### Scenario: Read-only rendering matches the editor

- **WHEN** the same content is rendered in read-only mode
- **THEN** the markers render with the same format as in the editable editor

#### Scenario: Saved HTML carries the marker format

- **WHEN** content with formatted list markers is serialized by the widget
- **THEN** the emitted `<li>` elements carry the marker format data
- **AND** loading that HTML back into the widget reproduces the same marker rendering

#### Scenario: Copied content carries the marker format

- **WHEN** a formatted list is copied out of the editor
- **THEN** the copied HTML carries the marker format data for each item

### Requirement: Marker format renders in both inline and class style modes

Marker format SHALL render correctly whether the widget is configured for inline styles or CSS classes, following the same convention the widget already uses for inline text formatting.

#### Scenario: Inline mode emits inline marker format

- **WHEN** the widget is in inline mode and a list item's first run is formatted
- **THEN** the `<li>` carries the marker format in its inline `style` attribute
- **AND** the marker renders with that format

#### Scenario: Class mode emits a class and data attributes

- **WHEN** the widget is in class mode and a list item's first run is formatted
- **THEN** the `<li>` carries a marker format class and corresponding `data-` attributes
- **AND** the marker renders with that format

#### Scenario: Class mode resolves legacy font family values

- **WHEN** class mode content specifies a font family in the legacy form, without the current font value attribute
- **THEN** the marker still renders in that font family

### Requirement: The list gutter grows to fit an enlarged marker

When a list contains an item whose marker is enlarged, the list SHALL increase its marker gutter so the marker is neither clipped nor overlapping the item text. The gutter SHALL be derived from the largest marker font size among the list's direct list items.

When no item in a list has an enlarged marker, the gutter SHALL be unchanged from its current value.

#### Scenario: Large ordered list numbers are not clipped

- **WHEN** an ordered list contains items whose first runs are set to a large font size
- **THEN** the numbers render fully within the list's gutter without being clipped or overlapping the item text

#### Scenario: Large bullets are not clipped

- **WHEN** a bullet list contains items whose first runs are set to a large font size
- **THEN** the bullets render fully within the list's gutter without overlapping the item text

#### Scenario: Gutter is unchanged for unformatted lists

- **WHEN** a list has no item with an enlarged marker
- **THEN** the list's gutter is identical to the current behavior

#### Scenario: Gutter is sized by the largest marker in the list

- **WHEN** one item of a list has a much larger first run than its siblings
- **THEN** the list's gutter accommodates the largest marker
- **AND** the smaller siblings' markers remain aligned with it

#### Scenario: Gutter coexists with list indent margin

- **WHEN** a list has both a non-zero indent and an enlarged marker
- **THEN** the indent margin and the enlarged gutter both apply, and the markers remain visible and not collapsed against the text

### Requirement: Existing list behavior is preserved

This change SHALL NOT alter marker glyph selection, list nesting, list toggling, or list indentation.

#### Scenario: Nesting level cycling is unchanged

- **WHEN** lists are nested to any depth
- **THEN** the ordered and unordered style cycling by nesting depth behaves exactly as before

#### Scenario: Manual list style overrides are unchanged

- **WHEN** an ordered list has a manually selected numbering style
- **THEN** that style and its nested cycle offset behave exactly as before

#### Scenario: Tab nesting and indent shortcuts are unchanged

- **WHEN** the user nests list items with Tab or indents a list with the indent shortcut
- **THEN** the behavior is unchanged, including when the affected items have formatted markers

#### Scenario: List toggling is unchanged

- **WHEN** the user toggles a bullet or ordered list on or off from the toolbar
- **THEN** the behavior is unchanged

### Requirement: Task lists are excluded

Task list items SHALL NOT receive marker formatting. Their checkbox rendering SHALL be unchanged.

#### Scenario: Formatting a task item's first run leaves the checkbox alone

- **WHEN** the first run of a task list item is enlarged, colored, or bolded
- **THEN** the checkbox renders unchanged
- **AND** no marker format data is emitted for that item

#### Scenario: Task lists nested with other list types are unaffected

- **WHEN** a task list is nested inside a bullet or ordered list with formatted markers
- **THEN** the task items' checkboxes are unchanged while the enclosing list's markers are formatted
