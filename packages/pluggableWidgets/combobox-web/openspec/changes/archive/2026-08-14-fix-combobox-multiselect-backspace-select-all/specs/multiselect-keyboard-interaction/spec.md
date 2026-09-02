## ADDED Requirements

### Requirement: Filter input text editing takes precedence over chip navigation

In a multi-select Combobox, keys pressed while the filter input holds an active (non-collapsed) text selection SHALL act on that text and MUST NOT transfer keyboard focus to the selected items (chips). Focus transfer to chips SHALL be permitted only when the filter input is empty, or when the caret is collapsed at position 0, and no modifier key (Shift, Control, Meta, Alt) is held — matching the gating downshift applies to its own dropdown key handling.

#### Scenario: Backspace deletes a full text selection instead of activating a chip

- **WHEN** a multi-select Combobox has at least one selected chip, the user has typed filter text, selected all of it (Ctrl/Cmd+A), and presses Backspace
- **THEN** the filter input is cleared, keyboard focus remains in the filter input, and no chip becomes active

#### Scenario: Cleared text does not reappear after leaving and re-entering the widget

- **WHEN** the user has cleared a full text selection with Backspace, then clicks outside the Combobox and clicks back into the filter input
- **THEN** the filter input is still empty

#### Scenario: Delete behaves identically to Backspace on a full text selection

- **WHEN** a multi-select Combobox has at least one selected chip, the user has typed filter text, selected all of it, and presses Delete
- **THEN** the filter input is cleared, it remains empty after clicking outside and back in, and no chip becomes active

#### Scenario: Partial text selection is not treated as chip navigation

- **WHEN** the user selects part of the filter text starting at position 0 (leaving trailing text unselected) and presses Backspace
- **THEN** only the selected characters are removed, the remaining text is preserved, and no chip becomes active

### Requirement: Backspace on an empty filter input activates the last selected chip

Chip removal by keyboard SHALL remain available: when the filter input is empty, Backspace SHALL make the last selected chip the active item so it can be removed. This behaviour is unchanged by the text-editing precedence rule above.

#### Scenario: Backspace with an empty filter input targets the last chip

- **WHEN** a multi-select Combobox has one or more selected chips and the filter input is empty, and the user presses Backspace
- **THEN** the last selected chip becomes the active item

#### Scenario: Backspace with an empty filter input and no chips does nothing

- **WHEN** a multi-select Combobox has no selected chips and the filter input is empty, and the user presses Backspace
- **THEN** no chip is activated and the widget state is unchanged

### Requirement: ArrowLeft chip navigation requires a collapsed caret

In "boxes" selected-items style, ArrowLeft SHALL move focus to the last selected chip only when the caret is collapsed at position 0. When an active text selection exists, ArrowLeft SHALL follow standard text-field behaviour and MUST NOT transfer focus to the chips.

#### Scenario: ArrowLeft with a collapsed caret at the start reaches the chips

- **WHEN** the selected-items style is "boxes", the caret sits collapsed at position 0 of the filter input, and the user presses ArrowLeft
- **THEN** the last selected chip becomes the active item

#### Scenario: ArrowLeft with an active text selection stays in the filter input

- **WHEN** the selected-items style is "boxes", the filter text is fully selected, and the user presses ArrowLeft
- **THEN** keyboard focus remains in the filter input and no chip becomes active

### Requirement: Single-select behaviour is unaffected

The single-select Combobox SHALL continue to clear its selection when Backspace is pressed with an empty filter input, unchanged by this change.

#### Scenario: Single-select clear-with-Backspace still works

- **WHEN** a clearable single-select Combobox has a selected value and the user presses Backspace with an empty filter input
- **THEN** the selection is cleared and the placeholder is shown
