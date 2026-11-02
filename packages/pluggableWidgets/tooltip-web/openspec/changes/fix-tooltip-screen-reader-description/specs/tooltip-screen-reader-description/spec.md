## ADDED Requirements

### Requirement: Tooltip content is available before the tooltip opens

When the widget has tooltip content, it SHALL keep that content in the DOM in a visually hidden element, whether or not the visible tooltip is open. The hidden element SHALL have `aria-hidden="true"`. When the widget has no tooltip content, it SHALL NOT render the hidden element.

#### Scenario: Tooltip is closed

- **WHEN** the widget has tooltip content and the tooltip is closed
- **THEN** the hidden element contains the content and no visible tooltip is rendered

#### Scenario: Custom render method

- **WHEN** the render method is `custom` and custom content is configured
- **THEN** the hidden element contains the custom content

#### Scenario: No content

- **WHEN** the widget has no tooltip content
- **THEN** the hidden element is not rendered

### Requirement: Focusable trigger elements are described by the tooltip

The widget SHALL add the hidden element's id to `aria-describedby` on every focusable element inside the trigger.

#### Scenario: Trigger with several focusable elements

- **WHEN** the trigger contains several buttons and links
- **THEN** each of them references the hidden element through `aria-describedby`

#### Scenario: Element mounts later

- **WHEN** a focusable element is added to the trigger after the widget has mounted
- **THEN** that element also references the hidden element

### Requirement: Existing descriptions are preserved

The widget SHALL keep other ids in `aria-describedby` on trigger elements. When the description no longer applies, the widget SHALL remove only its own id, and SHALL remove the attribute only if no other ids remain.

#### Scenario: Element already has a description

- **WHEN** a focusable trigger element already has an `aria-describedby` value
- **THEN** the attribute contains the existing value and the tooltip id

#### Scenario: Attribute is reset

- **WHEN** a trigger widget replaces the `aria-describedby` value of its element
- **THEN** the widget adds the tooltip id back without removing the new value

#### Scenario: Tooltip content is removed

- **WHEN** tooltip content is no longer available
- **THEN** the original `aria-describedby` value is left in place, and the attribute is removed from elements that only referenced the tooltip
