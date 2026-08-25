## ADDED Requirements

### Requirement: Keyboard focus survives chip removal

When a selected item (chip) is removed with Backspace or Delete while it holds keyboard focus, focus SHALL remain inside the Combobox. Focus SHALL move to the chip that takes the removed chip's position, or to the chip to its left when the removed chip was the last one, matching the item the widget marks as active. When the removed chip was the only one, focus SHALL move to the filter input. Arrow-key navigation SHALL continue from the newly focused chip without the user re-entering the widget.

#### Scenario: Removing a chip in the middle of the row keeps focus on the row

- **WHEN** a multi-select Combobox has three or more selected chips, the user has moved keyboard focus to a chip that is neither the first nor the last, and presses Backspace or Delete
- **THEN** that chip is removed and keyboard focus moves to the chip that took its position, so the next ArrowLeft/ArrowRight press continues navigating the chips

#### Scenario: Removing the first chip keeps focus on the row

- **WHEN** a multi-select Combobox has two or more selected chips, keyboard focus is on the first chip, and the user presses Backspace or Delete
- **THEN** that chip is removed and keyboard focus moves to the chip that became the first one

#### Scenario: Removing the last chip keeps focus on the row

- **WHEN** a multi-select Combobox has two or more selected chips, keyboard focus is on the last chip, and the user presses Backspace or Delete
- **THEN** that chip is removed and keyboard focus moves to the chip on its left

#### Scenario: Removing the only chip returns focus to the filter input

- **WHEN** a multi-select Combobox has exactly one selected chip, keyboard focus is on it, and the user presses Backspace or Delete
- **THEN** the chip is removed and keyboard focus moves to the filter input

#### Scenario: Focus is never dropped to the page

- **WHEN** a chip is removed by keyboard in any of the situations above
- **THEN** keyboard focus is never left on the document body, so pressing Tab afterwards continues from within the Combobox rather than from the start of the page
