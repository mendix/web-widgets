## ADDED Requirements

### Requirement: Ctrl+] adds margin to the current list

When the cursor is inside a list of any type (ordered, unordered, or task) at any nesting depth, pressing `Ctrl+]` (Mod-] — Cmd-] on macOS) SHALL increase the `margin-left` of the nearest list node by one indent step, clamped to the configured maximum. The margin SHALL be applied only to the list node, never to the inner paragraph, so no double indentation occurs. The command SHALL NOT nest the list, change the DOM structure, or advance the numbering/bullet cycle.

#### Scenario: Ctrl+] on a top-level ordered list

- **WHEN** the cursor is in a top-level ordered list and the user presses `Ctrl+]`
- **THEN** the `<ol>` receives increased `margin-left` (one step)
- **AND** the DOM list structure is unchanged
- **AND** the inner paragraph does not receive its own margin

#### Scenario: Ctrl+] on a nested list

- **WHEN** the cursor is in a nested list and the user presses `Ctrl+]`
- **THEN** the nearest (innermost) list node receives increased `margin-left`
- **AND** no structural nesting occurs

#### Scenario: Ctrl+] on an unordered list

- **WHEN** the cursor is in a bullet list and the user presses `Ctrl+]`
- **THEN** the `<ul>` receives increased `margin-left`

#### Scenario: Ctrl+] on a task list

- **WHEN** the cursor is in a task list and the user presses `Ctrl+]`
- **THEN** the task list container node receives increased `margin-left`
- **AND** the inner paragraph does not receive its own margin

#### Scenario: Ctrl+] accumulates on repeat

- **WHEN** the user presses `Ctrl+]` three times in a list
- **THEN** the list margin increases by three steps

#### Scenario: Ctrl+] respects the maximum

- **WHEN** the list is already at the maximum indent
- **THEN** pressing `Ctrl+]` leaves the margin unchanged

### Requirement: Ctrl+[ removes margin from the current list

When the cursor is inside a list, pressing `Ctrl+[` (Mod-[ — Cmd-[ on macOS) SHALL decrease the `margin-left` of the nearest list node by one indent step, clamped at zero. It SHALL NOT unlist the item, lift nesting, or produce a negative margin.

#### Scenario: Ctrl+[ decreases existing margin

- **WHEN** a list has `margin-left` greater than zero and the user presses `Ctrl+[`
- **THEN** the list margin decreases by one step

#### Scenario: Ctrl+[ at zero margin is a no-op

- **WHEN** a list has zero margin and the user presses `Ctrl+[`
- **THEN** nothing changes (the item is not unlisted and margin does not go negative)

### Requirement: Ctrl+] and Ctrl+[ indent non-list blocks

When the cursor is in a paragraph, heading, or blockquote (not a list), `Ctrl+]` and `Ctrl+[` SHALL apply the existing margin-based block indentation (the same effect the toolbar indent buttons and paragraph Tab produce).

#### Scenario: Ctrl+] in a paragraph

- **WHEN** the cursor is in a paragraph and the user presses `Ctrl+]`
- **THEN** the paragraph receives increased `margin-left`

#### Scenario: Ctrl+[ in a heading at zero indent

- **WHEN** the cursor is in a heading at zero indent and the user presses `Ctrl+[`
- **THEN** nothing changes

### Requirement: Tab and word navigation are unaffected

The list margin shortcut SHALL NOT alter Tab behavior or cursor navigation shortcuts.

#### Scenario: Tab still nests list items

- **WHEN** the cursor is in a list item and the user presses Tab
- **THEN** the list item is nested structurally (unchanged `sinkListItem` behavior)

#### Scenario: Shift+Tab still lifts list items

- **WHEN** the cursor is in a nested list item and the user presses Shift+Tab
- **THEN** the list item is lifted (unchanged `liftListItem` behavior)

#### Scenario: Ctrl+Arrow still navigates by word

- **WHEN** the cursor is in a list and the user presses `Ctrl+ArrowLeft` or `Ctrl+ArrowRight`
- **THEN** the cursor moves by word (standard navigation), not the list margin

### Requirement: List margin renders in both inline and class modes

The list margin SHALL render correctly whether the widget is configured for inline styles or CSS classes, and SHALL stack with the list marker gutter rather than replacing it.

#### Scenario: Inline mode renders margin-left on the list

- **WHEN** the widget is in inline mode and a list has a non-zero indent
- **THEN** the list element renders an inline `margin-left` and the markers remain visible

#### Scenario: Class mode shifts the list without collapsing markers

- **WHEN** the widget is in class mode and a list has a non-zero indent
- **THEN** the list is shifted right (via margin) and the numbers/bullets are not collapsed against the text

#### Scenario: Margin coexists with list style type

- **WHEN** an ordered list has both a `listStyleType` and a non-zero indent
- **THEN** both the list style and the margin render together on the same `<ol>`

### Requirement: Toolbar indent buttons remain paragraph-only

The toolbar increase-indent and decrease-indent buttons SHALL continue to affect only paragraphs, headings, and blockquotes; they SHALL NOT add margin to lists.

#### Scenario: Toolbar increase-indent in a list does not margin the list

- **WHEN** the cursor is in a list and the user clicks the toolbar increase-indent button
- **THEN** the list node does not receive a margin change
