## ADDED Requirements

### Requirement: Ordered lists cycle through numbering styles by nesting depth

Ordered lists (`<ol>`) SHALL automatically cycle through numbering styles based on nesting level using CSS descendant selectors.

#### Scenario: Level 1 ordered list uses decimal

- **WHEN** an ordered list is at the top level (not nested)
- **THEN** list items display with decimal numbering (1, 2, 3)

#### Scenario: Level 2 ordered list uses lower-alpha

- **WHEN** an ordered list is nested one level deep inside another ordered list
- **THEN** list items display with lower-alpha numbering (a, b, c)

#### Scenario: Level 3 ordered list uses lower-roman

- **WHEN** an ordered list is nested two levels deep
- **THEN** list items display with lower-roman numbering (i, ii, iii)

#### Scenario: Level 4 ordered list cycles back to decimal

- **WHEN** an ordered list is nested three levels deep
- **THEN** list items display with decimal numbering (1, 2, 3)

#### Scenario: Level 5 ordered list cycles to lower-alpha

- **WHEN** an ordered list is nested four levels deep
- **THEN** list items display with lower-alpha numbering (a, b, c)

#### Scenario: Level 6 ordered list cycles to lower-roman

- **WHEN** an ordered list is nested five levels deep
- **THEN** list items display with lower-roman numbering (i, ii, iii)

### Requirement: Unordered lists cycle through bullet styles by nesting depth

Unordered lists (`<ul>`) SHALL automatically cycle through bullet styles based on nesting level using CSS descendant selectors.

#### Scenario: Level 1 unordered list uses disc

- **WHEN** an unordered list is at the top level (not nested)
- **THEN** list items display with disc bullets (●)

#### Scenario: Level 2 unordered list uses circle

- **WHEN** an unordered list is nested one level deep inside another unordered list
- **THEN** list items display with circle bullets (○)

#### Scenario: Level 3 unordered list uses square

- **WHEN** an unordered list is nested two levels deep
- **THEN** list items display with square bullets (■)

#### Scenario: Level 4 unordered list cycles back to disc

- **WHEN** an unordered list is nested three levels deep
- **THEN** list items display with disc bullets (●)

### Requirement: Inline styles override CSS defaults

When a list element has an inline `style="list-style-type: ..."` attribute, that style SHALL take precedence over CSS auto-cycle rules.

#### Scenario: Manually styled list preserves inline style

- **WHEN** an ordered list has `style="list-style-type: upper-roman;"`
- **THEN** list displays with upper-roman (I, II, III) regardless of nesting depth

#### Scenario: Nested list without inline style uses auto-cycle

- **WHEN** parent list has inline style but nested child list has no inline style
- **THEN** child list uses CSS auto-cycle rules based on its depth

### Requirement: Task lists remain unstyled

Task lists with `data-type="taskList"` SHALL remain unstyled with `list-style: none`, unaffected by auto-cycle rules.

#### Scenario: Task list ignores auto-cycle

- **WHEN** a list has `data-type="taskList"` attribute
- **THEN** list displays with no bullet/number markers (checkboxes only)

### Requirement: Mixed list types cycle independently

When ordered and unordered lists are mixed (e.g., `<ul>` inside `<ol>`), each list type SHALL follow its own cycle sequence.

#### Scenario: Ordered list inside unordered list starts at decimal

- **WHEN** an `<ol>` is nested inside a `<ul>`
- **THEN** ordered list uses decimal (1, 2, 3) regardless of parent's depth

#### Scenario: Unordered list inside ordered list starts at disc

- **WHEN** a `<ul>` is nested inside an `<ol>`
- **THEN** unordered list uses disc (●) regardless of parent's depth
