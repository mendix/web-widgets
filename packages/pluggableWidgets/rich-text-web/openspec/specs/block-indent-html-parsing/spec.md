# block-indent-html-parsing Specification

## Purpose

TBD - created by archiving change fix-word-paste-indent-and-markers. Update Purpose after archive.

## Requirements

### Requirement: The indent level is parsed from any CSS length unit

When parsing an element's `margin-left` into the `indent` attribute in `inline` mode, the parser SHALL normalize the declared value to pixels against a 16px root before deriving a level, using the standard CSS absolute-length factors (`px` 1, `pt` 4/3, `pc` 16, `in` 96, `cm` 96/2.54, `mm` 96/25.4, `em` 16, `rem` 16). The level SHALL be `floor(px / 32)`, where 32px is the width of one indent level implied by the render formula `indent * 2em`.

#### Scenario: Points from Microsoft Word

- **WHEN** HTML containing `margin-left: 26.1pt` is parsed
- **THEN** the resulting `indent` attribute is `1`
- **AND** the rendered output is `margin-left: 2em`, not `margin-left: 20em`

#### Scenario: Pixels

- **WHEN** HTML containing `margin-left: 64px` is parsed
- **THEN** the resulting `indent` attribute is `2`

#### Scenario: Inches

- **WHEN** HTML containing `margin-left: 1in` is parsed
- **THEN** the resulting `indent` attribute is `3` (96px / 32px)

#### Scenario: Centimetres

- **WHEN** HTML containing `margin-left: 2cm` is parsed
- **THEN** the resulting `indent` attribute is `2` (≈75.6px / 32px)

#### Scenario: Em round-trip is unchanged

- **WHEN** HTML previously rendered by this widget containing `margin-left: 2em` is parsed
- **THEN** the resulting `indent` attribute is `1`
- **AND** re-rendering produces `margin-left: 2em` (byte-identical round-trip)

#### Scenario: Maximum em round-trip is unchanged

- **WHEN** HTML containing `margin-left: 20em` is parsed
- **THEN** the resulting `indent` attribute is `10`

#### Scenario: Percentage is not resolvable

- **WHEN** HTML containing `margin-left: 25%` is parsed
- **THEN** the resulting `indent` attribute is `0` (percentage resolves against container width, unavailable at parse time)

#### Scenario: Sub-level margin does not indent

- **WHEN** HTML containing `margin-left: 20px` is parsed
- **THEN** the resulting `indent` attribute is `0` (less than one full level; the parser never rounds up)

#### Scenario: Zero margin

- **WHEN** HTML containing `margin-left: 0` is parsed
- **THEN** the resulting `indent` attribute is `0`

#### Scenario: No margin declaration

- **WHEN** an element with no `margin-left` is parsed
- **THEN** the resulting `indent` attribute is `0`

### Requirement: Negative margins do not produce indentation

A negative `margin-left` SHALL parse to indent `0`. The parser SHALL NOT discard the sign and treat the magnitude as a positive indent.

#### Scenario: Word hanging indent

- **WHEN** HTML containing `margin-left: -18pt` is parsed
- **THEN** the resulting `indent` attribute is `0`, not `9`

#### Scenario: Hanging indent alongside a positive margin

- **WHEN** HTML containing `margin-left: 36pt; text-indent: -18pt` is parsed
- **THEN** the `indent` attribute is derived from `margin-left` only
- **AND** `text-indent` does not contribute to the level

### Requirement: The parsed indent level is always within the configured range

The parser SHALL coerce the derived level to a finite integer within `[minIndent, maxIndent]` before storing it on the node. An out-of-range value SHALL NOT be written to the document and left for `renderHTML` to clamp.

#### Scenario: Above-maximum margin is clamped at parse time

- **WHEN** HTML containing `margin-left: 100em` is parsed with `maxIndent: 10`
- **THEN** the stored `indent` attribute is `10`
- **AND** the node's attribute value is `10`, not a larger number that only the renderer clamps

#### Scenario: Non-numeric margin value

- **WHEN** an element's `margin-left` cannot be parsed as a length
- **THEN** the resulting `indent` attribute is `0`

### Requirement: `data-indent` takes precedence over `margin-left` in both style modes

The parser SHALL read `data-indent` first regardless of the configured `styleDataFormat`, and SHALL fall back to `margin-left` only when `styleDataFormat` is `inline` and no `data-indent` is present. This provides one canonical channel for machine-set indent levels.

#### Scenario: `data-indent` honoured in inline mode

- **WHEN** `styleDataFormat` is `inline` and HTML containing `data-indent="2"` is parsed
- **THEN** the resulting `indent` attribute is `2`
- **AND** the rendered output is `margin-left: 4em`

#### Scenario: `data-indent` wins over a conflicting margin

- **WHEN** `styleDataFormat` is `inline` and an element has both `data-indent="1"` and `margin-left: 20em`
- **THEN** the resulting `indent` attribute is `1`

#### Scenario: Class mode parsing is unchanged

- **WHEN** `styleDataFormat` is `class` and HTML containing `data-indent="3"` is parsed
- **THEN** the resulting `indent` attribute is `3`
- **AND** the rendered output carries `data-indent="3"` and class `indent-3`

#### Scenario: Class mode still ignores margin-left

- **WHEN** `styleDataFormat` is `class` and an element has `margin-left: 26.1pt` with no `data-indent`
- **THEN** the resulting `indent` attribute is `0`

#### Scenario: Out-of-range `data-indent` is clamped

- **WHEN** HTML containing `data-indent="99"` is parsed with `maxIndent: 10`
- **THEN** the stored `indent` attribute is `10`

### Requirement: Unit-aware parsing applies to every content source

The parsing rules SHALL apply identically whether the HTML arrives via paste, via the widget's initial `content` value, or via an external value update that calls `setContent`.

#### Scenario: Stored attribute value with point margins

- **WHEN** the widget is initialised with a stored HTML value containing `margin-left: 36pt`
- **THEN** the indent level is derived by unit-aware conversion, exactly as it would be on paste

#### Scenario: External value update with point margins

- **WHEN** the Mendix attribute value changes to HTML containing `margin-left: 36pt` and the editor is not focused
- **THEN** the indent level is derived by unit-aware conversion

### Requirement: Keyboard and toolbar indent behavior is unaffected

Changes to HTML parsing SHALL NOT alter the behavior of `Tab`, `Shift+Tab`, `Ctrl+]`, `Ctrl+[`, or the toolbar indent and outdent buttons.

#### Scenario: Increase indent still steps by one

- **WHEN** the cursor is in a paragraph at indent 0 and the user increases indent
- **THEN** the paragraph renders `margin-left: 2em`, exactly as before this change

#### Scenario: Maximum indent still clamps on repeat

- **WHEN** a paragraph is at `maxIndent` and the user increases indent again
- **THEN** nothing changes
