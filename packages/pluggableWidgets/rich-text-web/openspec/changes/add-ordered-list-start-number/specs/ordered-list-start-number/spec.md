## ADDED Requirements

### Requirement: Users can set the start number of an ordered list

The ordered list split-button dropdown SHALL contain a labelled number input that sets the start number of the innermost ordered list containing the cursor.

#### Scenario: Input is shown in the dropdown

- **WHEN** user opens the ordered list dropdown
- **THEN** a number input labelled "Start at" is shown below the style options

#### Scenario: Set start number on a decimal list

- **WHEN** cursor is in a decimal ordered list with three items
- **WHEN** user enters `5` in the start input and presses Enter
- **THEN** the list items are numbered 5, 6, 7
- **THEN** the dropdown closes and focus returns to the editor

#### Scenario: Start number follows list style

- **WHEN** cursor is in a lower-alpha ordered list
- **WHEN** user sets the start number to `3`
- **THEN** the first item is marked `c.`

#### Scenario: Start number on lower-roman list

- **WHEN** cursor is in a lower-roman ordered list
- **WHEN** user sets the start number to `4`
- **THEN** the first item is marked `iv.`

#### Scenario: Nested list changes alone

- **WHEN** cursor is in an ordered list nested inside another ordered list
- **WHEN** user sets the start number to `3`
- **THEN** only the nested list starts at 3
- **THEN** the outer list's start number is unchanged

#### Scenario: Value applied on blur

- **WHEN** user types `8` in the start input
- **WHEN** focus leaves the input without pressing Enter, including by clicking outside the dropdown
- **THEN** the list starts at 8

#### Scenario: Escape discards typed value

- **WHEN** list starts at 2
- **WHEN** user types `9` in the start input and presses Escape
- **THEN** the dropdown closes
- **THEN** the list still starts at 2

#### Scenario: One undo step

- **WHEN** user sets the start number from 1 to 12
- **WHEN** user presses undo once
- **THEN** the list starts at 1 again

### Requirement: Input reflects the current list's start number

The start input SHALL show the start number of the ordered list at the cursor and SHALL be disabled when the cursor is not in an ordered list.

#### Scenario: Shows existing start number

- **WHEN** cursor is in a list loaded from `<ol start="4">`
- **WHEN** user opens the dropdown
- **THEN** the start input shows `4`

#### Scenario: Shows 1 for a list without start attribute

- **WHEN** cursor is in an ordered list without a `start` attribute
- **WHEN** user opens the dropdown
- **THEN** the start input shows `1`

#### Scenario: Disabled outside ordered list

- **WHEN** cursor is in a paragraph, bullet list, or task list
- **WHEN** user opens the dropdown
- **THEN** the start input is disabled

### Requirement: Start number is validated

The start input SHALL accept only whole numbers from 1 to 9999.

#### Scenario: Empty value resets to 1

- **WHEN** list starts at 5
- **WHEN** user clears the start input and presses Enter
- **THEN** the list starts at 1

#### Scenario: Zero or negative value rejected

- **WHEN** list starts at 5
- **WHEN** user enters `0` or `-2` and presses Enter
- **THEN** the list still starts at 5
- **THEN** the input shows `5` again

#### Scenario: Decimal value rejected

- **WHEN** list starts at 5
- **WHEN** user enters `2.5` and presses Enter
- **THEN** the list still starts at 5

#### Scenario: Value above maximum clamped

- **WHEN** user enters `20000` and presses Enter
- **THEN** the list starts at 9999

### Requirement: Start number is persisted in HTML

The start number SHALL be saved as the `start` attribute on `<ol>` in both inline and class style modes, and SHALL be omitted when it is 1.

#### Scenario: Start attribute saved

- **WHEN** user sets the start number to 5
- **THEN** the saved HTML contains `<ol start="5">`

#### Scenario: Start attribute saved in class mode

- **WHEN** widget uses class style mode
- **WHEN** user sets the start number to 5 on a lower-alpha list
- **THEN** the saved HTML `<ol>` has `start="5"` and `data-list-style="lower-alpha"`

#### Scenario: Start of 1 omitted

- **WHEN** list starts at 5
- **WHEN** user sets the start number to 1
- **THEN** the saved `<ol>` has no `start` attribute
- **THEN** the HTML matches a list that never had a start number set

#### Scenario: Stored start restored on load

- **WHEN** stored value contains `<ol start="7"><li>a</li></ol>`
- **WHEN** the editor loads the value
- **THEN** the list item is numbered 7

### Requirement: Start number is not sticky

The start number SHALL apply only to the list it was set on. A newly created ordered list SHALL start at 1.

#### Scenario: New list starts at 1

- **WHEN** user sets one list to start at 5
- **WHEN** user creates a new ordered list elsewhere with the main button
- **THEN** the new list starts at 1

#### Scenario: Toggling list off and on resets start

- **WHEN** list starts at 5
- **WHEN** user toggles the ordered list off and on again
- **THEN** the list starts at 1

### Requirement: Marker gutter fits the start number

The list marker gutter SHALL be wide enough for the largest number in the list, taking the start number into account.

#### Scenario: Wide numbers not clipped

- **WHEN** list has three items and starts at 98
- **THEN** the markers `98.`, `99.`, and `100.` are fully visible and do not overlap the item text
