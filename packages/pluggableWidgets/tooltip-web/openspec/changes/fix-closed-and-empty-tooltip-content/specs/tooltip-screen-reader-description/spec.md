## MODIFIED Requirements

### Requirement: Tooltip content is available before the tooltip opens

When the content for the selected render method exists, the widget SHALL keep exactly one content element in the DOM, whether or not the tooltip is open. While closed, the element SHALL be hidden with `display: none`, so it cannot take focus or affect keyboard navigation. While open, it SHALL be shown as the tooltip. Text mode content SHALL count as existing only if it is not empty after trimming. When the selected render method has no content, the widget SHALL NOT render the element.

#### Scenario: Tooltip is closed

- **WHEN** the selected render method has content and the tooltip is closed
- **THEN** the content element is in the DOM and hidden with `display: none`

#### Scenario: Tooltip is open

- **WHEN** the tooltip opens
- **THEN** the same element is shown as the tooltip and the content appears exactly once in the DOM

#### Scenario: Tabbing past a trigger with focusable custom content

- **WHEN** the tooltip is closed, custom content contains a button, and the user presses Tab on the trigger
- **THEN** focus moves to the next focusable element after the tooltip, and Shift+Tab from that element moves focus back to the trigger

#### Scenario: Custom widgets across open and close

- **WHEN** the tooltip opens and closes
- **THEN** custom widgets stay mounted and are not remounted

#### Scenario: Text mode with leftover custom content

- **WHEN** the render method is `text`, the text is empty and custom widgets are configured
- **THEN** the content element is not rendered and no description is added

#### Scenario: Whitespace-only text

- **WHEN** the render method is `text` and the text contains only whitespace
- **THEN** the content element is not rendered and no description is added

## ADDED Requirements

### Requirement: Empty rendered content is treated as no content

The widget SHALL treat content as empty when the content element has no text after trimming and contains no image, SVG, video, canvas, iframe or form field. With empty content, the widget SHALL NOT add its id to `aria-describedby` and SHALL NOT open the tooltip. The widget SHALL update this when the rendered content changes. In the Studio Pro preview, content SHALL always count as not empty.

#### Scenario: All custom widgets are hidden

- **WHEN** conditional visibility hides every widget in the custom content
- **THEN** trigger elements do not reference the content element, and focusing, hovering or clicking the trigger does not open a tooltip

#### Scenario: Hidden custom widgets become visible

- **WHEN** a hidden custom content widget becomes visible
- **THEN** trigger elements reference the content element again, and the tooltip can open

#### Scenario: Custom content with only an image

- **WHEN** custom content renders only an image
- **THEN** the content counts as not empty

#### Scenario: Empty custom content in preview

- **WHEN** the widget renders in preview with empty custom content
- **THEN** the custom content drop zone is still shown
