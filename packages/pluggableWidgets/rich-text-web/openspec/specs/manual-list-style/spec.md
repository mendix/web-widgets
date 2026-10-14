# Manual List Style Specification

## Purpose

Manual ordered list style override via toolbar dropdown. Users can force decimal, lower-alpha, or lower-roman numbering instead of auto-cycle behavior.

## Requirements

### Requirement: Users can manually set ordered list style via toolbar dropdown

When cursor is in an ordered list, a toolbar dropdown SHALL appear with options to set the list's numbering style to decimal (auto-cycle), lower-alpha, or lower-roman.

#### Scenario: Dropdown visible when in ordered list

- **WHEN** cursor is inside an ordered list
- **THEN** "Numbering Style" dropdown button is visible in toolbar

#### Scenario: Dropdown hidden when not in ordered list

- **WHEN** cursor is in paragraph, unordered list, or task list
- **THEN** "Numbering Style" dropdown button is hidden

#### Scenario: Dropdown shows three style options

- **WHEN** user clicks "Numbering Style" dropdown
- **THEN** dropdown displays options: "1, 2, 3" (decimal), "a, b, c" (lower-alpha), "i, ii, iii" (lower-roman)

#### Scenario: Dropdown shows checkmark on current style

- **WHEN** ordered list has no `listStyleType` attribute
- **THEN** dropdown shows checkmark next to "1, 2, 3" (decimal/auto-cycle default)

#### Scenario: Dropdown shows checkmark on manual style

- **WHEN** ordered list has `listStyleType="lower-alpha"` attribute
- **THEN** dropdown shows checkmark next to "a, b, c" (lower-alpha)

### Requirement: Users can convert ordered list to lower-alpha via dropdown

Selecting "a, b, c" from dropdown SHALL convert entire ordered list to lower-alpha numbering style.

#### Scenario: Convert decimal list to lower-alpha

- **WHEN** cursor is in decimal list (1, 2, 3) and user selects "a, b, c" from dropdown
- **THEN** entire list converts to lower-alpha numbering (a, b, c)

#### Scenario: Lower-alpha attribute stored in HTML

- **WHEN** list is converted to lower-alpha
- **THEN** `<ol>` element has `listStyleType="lower-alpha"` attribute stored as `data-list-style="lower-alpha"` (class mode) or inline style (inline mode)

### Requirement: Users can convert ordered list to lower-roman via dropdown

Selecting "i, ii, iii" from dropdown SHALL convert entire ordered list to lower-roman numbering style.

#### Scenario: Convert decimal list to lower-roman

- **WHEN** cursor is in decimal list (1, 2, 3) and user selects "i, ii, iii" from dropdown
- **THEN** entire list converts to lower-roman numbering (i, ii, iii)

#### Scenario: Lower-roman attribute stored in HTML

- **WHEN** list is converted to lower-roman
- **THEN** `<ol>` element has `listStyleType="lower-roman"` attribute stored as `data-list-style="lower-roman"` (class mode) or inline style (inline mode)

### Requirement: Users can revert manual style to auto-cycle via dropdown

Selecting "1, 2, 3" from dropdown SHALL remove manual style override and revert list to auto-cycle behavior.

#### Scenario: Revert lower-alpha to auto-cycle

- **WHEN** cursor is in lower-alpha list and user selects "1, 2, 3" from dropdown
- **THEN** `listStyleType` attribute is removed and list uses auto-cycle (decimal at top level)

#### Scenario: Auto-cycle applies after revert

- **WHEN** manual style is removed from nested list at level 2
- **THEN** list displays with lower-alpha (auto-cycle for level 2)

### Requirement: Manual styles use cycle offset for nested lists

When an ordered list has manual `listStyleType` attribute, nested children SHALL continue cycle from parent's position in sequence.

#### Scenario: Lower-alpha nested children start at lower-roman

- **WHEN** ordered list has `listStyleType="lower-alpha"` (cycle position 2) and contains nested ordered list without attribute
- **THEN** nested list displays with lower-roman (cycle position 3)

#### Scenario: Lower-roman nested children start at decimal

- **WHEN** ordered list has `listStyleType="lower-roman"` (cycle position 3) and contains nested ordered list without attribute
- **THEN** nested list displays with decimal (cycle position 4, cycle repeats)

#### Scenario: Decimal nested children start at lower-alpha

- **WHEN** ordered list has explicit `listStyleType="decimal"` (cycle position 1) and contains nested ordered list without attribute
- **THEN** nested list displays with lower-alpha (cycle position 2)

### Requirement: Manual styles support both inline and class-based modes

OrderedListStyled extension SHALL output manual styles as inline `style="list-style-type: ..."` or class-based `data-list-style="..." class="list-style-..."` depending on widget configuration.

#### Scenario: Inline mode outputs inline style

- **WHEN** widget configured with `styleDataFormat="inline"` and list has `listStyleType="lower-alpha"`
- **THEN** HTML output is `<ol style="list-style-type: lower-alpha;">`

#### Scenario: Class mode outputs data attribute and class

- **WHEN** widget configured with `styleDataFormat="class"` and list has `listStyleType="lower-alpha"`
- **THEN** HTML output is `<ol data-list-style="lower-alpha" class="list-style-lower-alpha">`

#### Scenario: Parse inline style on load

- **WHEN** HTML contains `<ol style="list-style-type: lower-roman;">`
- **THEN** extension parses and stores `listStyleType="lower-roman"` attribute

#### Scenario: Parse data attribute on load

- **WHEN** HTML contains `<ol data-list-style="lower-alpha">`
- **THEN** extension parses and stores `listStyleType="lower-alpha"` attribute

### Requirement: Regular numbered list button creates decimal list without attribute

The existing "Numbered List" toolbar button SHALL continue creating ordered lists with no `listStyleType` attribute (uses auto-cycle).

#### Scenario: Numbered list button creates decimal list

- **WHEN** cursor is in paragraph and user clicks "Numbered List" button
- **THEN** ordered list is created with decimal numbering (1, 2, 3) and no `listStyleType` attribute

#### Scenario: Dropdown shows decimal as active for attribute-less list

- **WHEN** ordered list has no `listStyleType` attribute
- **THEN** dropdown displays checkmark next to "1, 2, 3" (decimal)
