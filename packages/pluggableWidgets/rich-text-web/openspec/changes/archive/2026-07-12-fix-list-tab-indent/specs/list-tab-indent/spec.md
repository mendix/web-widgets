## ADDED Requirements

### Requirement: Tab key increases list item nesting

When cursor is inside a list item (ordered or unordered), pressing Tab key SHALL nest the list item one level deeper by calling Tiptap's `sinkListItem` command.

#### Scenario: Tab in ordered list item

- **WHEN** cursor is in an ordered list item and user presses Tab
- **THEN** list item is nested one level deeper (becomes a sublist)

#### Scenario: Tab in unordered list item

- **WHEN** cursor is in an unordered list item and user presses Tab
- **THEN** list item is nested one level deeper (becomes a sublist)

#### Scenario: Tab in nested list item

- **WHEN** cursor is in an already-nested list item and user presses Tab
- **THEN** list item is nested one additional level deeper

#### Scenario: Tab with cursor at any position in list line

- **WHEN** cursor is anywhere in the list item text (start, middle, end) and user presses Tab
- **THEN** entire list item is nested (not just the text)

### Requirement: Shift+Tab decreases list item nesting

When cursor is inside a nested list item, pressing Shift+Tab SHALL lift the list item one level up by calling Tiptap's `liftListItem` command.

#### Scenario: Shift+Tab in nested ordered list

- **WHEN** cursor is in a nested ordered list item and user presses Shift+Tab
- **THEN** list item is lifted one level up (reduced nesting)

#### Scenario: Shift+Tab in nested unordered list

- **WHEN** cursor is in a nested unordered list item and user presses Shift+Tab
- **THEN** list item is lifted one level up (reduced nesting)

#### Scenario: Shift+Tab at top level has no effect

- **WHEN** cursor is in a top-level list item (not nested) and user presses Shift+Tab
- **THEN** no change occurs (cannot lift beyond list boundary)

### Requirement: Tab in non-list content uses existing indent behavior

When cursor is in paragraph, heading, or blockquote (non-list content), pressing Tab SHALL apply margin-based indentation as before.

#### Scenario: Tab in paragraph

- **WHEN** cursor is in a paragraph and user presses Tab
- **THEN** paragraph receives increased margin-left indentation

#### Scenario: Tab in heading

- **WHEN** cursor is in a heading and user presses Tab
- **THEN** heading receives increased margin-left indentation

#### Scenario: Tab in blockquote

- **WHEN** cursor is in a blockquote and user presses Tab
- **THEN** blockquote receives increased margin-left indentation

### Requirement: Tab only captures when focus is inside editor content

Tab key SHALL only be intercepted for indentation when document focus is inside the editor content area, not when focus is on toolbar buttons or other UI elements.

#### Scenario: Tab on toolbar button

- **WHEN** focus is on a toolbar button and user presses Tab
- **THEN** focus moves to next focusable element (standard browser Tab behavior)

#### Scenario: Tab in editor content

- **WHEN** focus is inside editor content area and user presses Tab
- **THEN** Tab is intercepted for indentation (does not move focus)
