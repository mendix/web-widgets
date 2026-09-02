# Rich Text Dialog Presentation Specification

## Purpose

Shared presentation behaviour for every Rich Text widget dialog — Image, Video, Link, keyboard-shortcuts help, and confirmation. Defines the `dialogStyle` configuration property (anchored `inline` versus centred `focused`), portal rendering outside the widget's DOM subtree, viewport-bounded height with internal scrolling, focus and Escape handling, stacking order, and selection preservation. Toolbar popovers are explicitly out of scope and keep their anchored presentation.

## Requirements

### Requirement: Dialog style configuration property

The Rich Text widget SHALL expose a `dialogStyle` enumeration property with the values `inline` and `focused`, defaulting to `inline`. The property SHALL select the presentation of the Image, Video and Link dialogs. Existing apps that do not set the property SHALL keep the anchored (inline) presentation.

#### Scenario: Default configuration

- **WHEN** a widget instance does not set `dialogStyle`
- **THEN** the effective value is `inline`
- **AND** the Image, Video and Link dialogs are presented anchored to their trigger

#### Scenario: Focused style selected

- **WHEN** `dialogStyle` is set to `focused`
- **THEN** the Image, Video and Link dialogs are presented as centred modal dialogs over a dimmed overlay

#### Scenario: Property reaches dialogs opened outside the toolbar

- **WHEN** `dialogStyle` is set to `focused` and the user activates Edit on the link bubble menu
- **THEN** the link dialog is presented as a centred modal dialog rather than anchored to the link

### Requirement: Dialogs render outside the widget's DOM subtree

Every Rich Text dialog — Image, Video, Link, keyboard-shortcuts help, and confirmation — SHALL be rendered through a portal into the document body rather than as a DOM descendant of the widget node. This SHALL hold in both dialog styles. No ancestor `overflow`, `transform`, `filter`, `will-change` or `contain` declaration SHALL be able to clip a dialog.

#### Scenario: Widget container clips its own content

- **WHEN** the widget node has `overflow: hidden` and the user opens a dialog whose content extends beyond the widget's bounds
- **THEN** the dialog is rendered in full and is not clipped by the widget node

#### Scenario: Transformed ancestor establishes a containing block

- **WHEN** the widget is placed inside an ancestor that establishes a containing block through a transform, such as a Mendix popup page, and the user opens a dialog
- **THEN** the dialog is rendered in full and is not clipped by that ancestor

#### Scenario: Dialog is not a descendant of the widget node

- **WHEN** any dialog is open in either dialog style
- **THEN** the dialog element is not a descendant of the widget's rendered root element

### Requirement: Dialog height is bounded with internal scrolling

Every Rich Text dialog SHALL bound its own height so that it fits the space available to it, and SHALL scroll its content internally rather than growing past that bound. The dialog title and the dialog action controls SHALL remain visible while the content between them scrolls. The dialog SHALL NOT render at a height that places its action controls outside the viewport.

#### Scenario: Media Library renders many images

- **WHEN** the image dialog's Media Library tab renders embedded content taller than the space available to the dialog
- **THEN** the dialog's height is capped
- **AND** the embedded content area scrolls
- **AND** the Insert and Cancel controls remain visible without scrolling the dialog

#### Scenario: Long embed code in the video dialog

- **WHEN** the video dialog's embed-code tab, its detection status and its warning together exceed the space available to the dialog
- **THEN** the dialog content scrolls and the Insert and Cancel controls remain visible

#### Scenario: Content fits

- **WHEN** a dialog's content is shorter than the space available to it
- **THEN** no internal scrollbar is shown and the dialog is sized to its content

### Requirement: Inline dialog style

In the `inline` dialog style, a dialog SHALL be positioned relative to the element that opened it, SHALL flip and shift to stay within the viewport, and SHALL close when the user presses outside both the dialog and its trigger. The inline style SHALL NOT render an overlay, SHALL NOT dim the page, SHALL NOT lock page scrolling, and SHALL NOT trap focus. An inline dialog SHALL shrink to fit the space available at its resolved placement and scroll internally; it SHALL NOT convert itself into a centred modal when space is short.

#### Scenario: Anchored to its trigger

- **WHEN** `dialogStyle` is `inline` and the user activates the Insert Image toolbar button
- **THEN** the dialog is positioned relative to that button

#### Scenario: Shrink to fit available space

- **WHEN** `dialogStyle` is `inline` and the space at the dialog's resolved placement is smaller than its content height
- **THEN** the dialog's scrollable region is capped to the available height
- **AND** the dialog remains anchored to its trigger
- **AND** no overlay is rendered

#### Scenario: No overlay rendered

- **WHEN** an inline dialog is open
- **THEN** no dimmed overlay element is present
- **AND** page scrolling is not locked

#### Scenario: Outside press closes

- **WHEN** an inline dialog is open and the user presses outside both the dialog and its trigger
- **THEN** the dialog closes

### Requirement: Focused dialog style

In the `focused` dialog style, a dialog SHALL be rendered centred in the viewport above a dimmed overlay that locks page scrolling. The dialog SHALL expose `role="dialog"` with `aria-modal="true"`, SHALL move focus into itself on open, SHALL confine Tab and Shift+Tab navigation to its own focusable elements while open, SHALL close on Escape, and SHALL close when the user presses the overlay. Escape handling SHALL be scoped to the dialog so that editor-level Escape handlers, including the fullscreen exit handler, do not also fire.

#### Scenario: Overlay and centring

- **WHEN** `dialogStyle` is `focused` and the user opens the Image dialog
- **THEN** a dimmed overlay is rendered behind the dialog
- **AND** the dialog is centred in the viewport
- **AND** page scrolling is locked while the dialog is open

#### Scenario: Focus trap

- **WHEN** a focused dialog is open and the user presses Tab from its last focusable element
- **THEN** focus moves to the dialog's first focusable element and does not leave the dialog

#### Scenario: Escape closes only the dialog

- **WHEN** a focused dialog is open while the editor is in fullscreen mode and the user presses Escape
- **THEN** the dialog closes
- **AND** the editor remains in fullscreen mode

#### Scenario: Overlay press closes

- **WHEN** a focused dialog is open and the user presses the overlay outside the dialog
- **THEN** the dialog closes

#### Scenario: Accessible modal semantics

- **WHEN** a focused dialog is open
- **THEN** the dialog element exposes `role="dialog"` and `aria-modal="true"` and is labelled by its title

### Requirement: Help and confirmation dialogs are always focused

The keyboard-shortcuts help dialog and the confirmation dialog SHALL always use the focused presentation regardless of the `dialogStyle` value. They SHALL obtain the portal, height bounding, focus trap, Escape handling and stacking behaviour from the shared dialog presentation rather than from their own implementations.

#### Scenario: Help dialog under the inline style

- **WHEN** `dialogStyle` is `inline` and the user opens the keyboard-shortcuts help dialog
- **THEN** the dialog is rendered centred above a dimmed overlay with a focus trap

#### Scenario: Confirmation dialog under the inline style

- **WHEN** `dialogStyle` is `inline` and a confirmation dialog is shown
- **THEN** the dialog is rendered centred above a dimmed overlay with a focus trap

### Requirement: Consistent dialog stacking

All Rich Text dialogs and dialog overlays SHALL use a single stacking scale that places them above Atlas modal layers, so a dialog opened from a widget inside a popup page is not obscured by that page. Dialog overlays SHALL sit directly beneath their dialog.

#### Scenario: Dialog above a host popup layer

- **WHEN** the widget is placed inside a Mendix popup page and the user opens a dialog
- **THEN** the dialog is painted above the popup and its underlay

#### Scenario: Overlay beneath its dialog

- **WHEN** a focused dialog is open
- **THEN** the overlay is painted beneath the dialog and above the page

### Requirement: Editor selection preserved across dialog interaction

Opening a dialog, interacting with its controls, and confirming it SHALL insert content at the selection that was active in the editor when the dialog opened. This SHALL hold in both dialog styles, including when the focused style moves focus out of the editor into a focus trap.

#### Scenario: Insert at a caret mid-paragraph

- **WHEN** the caret is inside a paragraph, the user opens the Image dialog, enters a URL and confirms
- **THEN** the image is inserted at that caret position

#### Scenario: Insert over a selection in focused style

- **WHEN** `dialogStyle` is `focused`, text is selected, and the user opens the Link dialog and confirms
- **THEN** the link is applied to the previously selected text

### Requirement: Toolbar popovers keep anchored presentation

Toolbar popover controls — colour pickers, toolbar dropdowns, split-button menus, the table grid selector and configuration dropdowns — are not dialogs. They SHALL keep their anchored, non-portalled presentation and SHALL NOT be affected by `dialogStyle` or by the dialog height-bounding behaviour.

#### Scenario: Colour picker under the focused style

- **WHEN** `dialogStyle` is `focused` and the user opens the text colour picker
- **THEN** the picker is presented anchored to its toolbar button with no overlay

#### Scenario: Table grid selector unchanged

- **WHEN** `dialogStyle` is `focused` and the user opens the insert-table grid selector
- **THEN** the selector is presented anchored to its toolbar button with no overlay
