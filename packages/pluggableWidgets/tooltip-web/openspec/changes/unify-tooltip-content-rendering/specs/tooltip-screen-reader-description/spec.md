## MODIFIED Requirements

### Requirement: Tooltip content is available before the tooltip opens

When the content for the selected render method exists, the widget SHALL keep exactly one content element in the DOM, whether or not the tooltip is open. While closed, the element SHALL be visually hidden, have `aria-hidden="true"` and be `inert`. While open, it SHALL be shown as the tooltip without those states. When the selected render method has no content, the widget SHALL NOT render the element.

#### Scenario: Tooltip is closed

- **WHEN** the selected render method has content and the tooltip is closed
- **THEN** the content element is in the DOM, visually hidden, `aria-hidden` and `inert`

#### Scenario: Tooltip is open

- **WHEN** the tooltip opens
- **THEN** the same element is shown as the tooltip and the content appears exactly once in the DOM

#### Scenario: Custom content contains a focusable element

- **WHEN** the tooltip is closed and custom content contains a button
- **THEN** pressing Tab does not move focus to that button

#### Scenario: Custom widgets across open and close

- **WHEN** the tooltip opens and closes
- **THEN** custom widgets stay mounted and are not remounted

#### Scenario: Text mode with leftover custom content

- **WHEN** the render method is `text`, the text is empty and custom widgets are configured
- **THEN** the content element is not rendered and no description is added

## ADDED Requirements

### Requirement: Studio Pro preview is not affected by the description

The widget SHALL render preview content once and SHALL NOT manage `aria-describedby` in the Studio Pro preview.

#### Scenario: Custom content in preview

- **WHEN** the widget renders in preview with the `custom` render method
- **THEN** the custom content drop zone appears once and trigger elements get no tooltip description
