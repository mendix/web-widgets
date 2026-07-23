# Rich Text Help Shortcuts

## Purpose

Provide a toolbar help button and keyboard-shortcuts modal for the Rich Text widget so users can discover the editor's keyboard shortcuts from within the editor. This capability defines the help button's configuration property, its visibility gating, the modal's behavior and accessibility, and the catalog of shortcuts it displays.

## Requirements

### Requirement: Help button configuration property

The Rich Text widget SHALL expose a `helpButton` boolean property (default `true`) that controls whether the keyboard-shortcuts help button is available. In Studio Pro this property SHALL be shown only when the toolbar `preset` is `custom`, consistent with the other toolbar-group toggles.

#### Scenario: Default value

- **WHEN** the widget is added to a page without changing the property
- **THEN** `helpButton` defaults to `true`

#### Scenario: Property visibility in Studio Pro

- **WHEN** the toolbar `preset` is not `custom`
- **THEN** the `helpButton` property is hidden in the Studio Pro property editor

#### Scenario: Property visible under custom preset

- **WHEN** the toolbar `preset` is `custom`
- **THEN** the `helpButton` property is visible in the Studio Pro property editor

### Requirement: Help button visibility gating

The help button SHALL render in the toolbar only when `helpButton` is not disabled AND the full set of toolbar groups is shown (preset `full`, or `custom` preset with every toolbar group enabled). Under any smaller toolbar (basic/standard presets, or custom with fewer groups) the help button SHALL NOT render.

#### Scenario: Full preset shows the button

- **WHEN** the toolbar preset is `full` and `helpButton` is `true`
- **THEN** the help button ("?") is rendered in the toolbar

#### Scenario: Basic and standard presets hide the button

- **WHEN** the toolbar preset is `basic` or `standard`
- **THEN** the help button is not rendered, regardless of the `helpButton` value

#### Scenario: Custom preset with all groups shows the button

- **WHEN** the preset is `custom` and every toolbar group is enabled and `helpButton` is `true`
- **THEN** the help button is rendered

#### Scenario: Custom preset missing a group hides the button

- **WHEN** the preset is `custom` and at least one toolbar group is disabled
- **THEN** the help button is not rendered

#### Scenario: Help button disabled

- **WHEN** `helpButton` is `false`
- **THEN** the help button is not rendered even under the full toolbar

### Requirement: Keyboard-shortcuts modal

Activating the help button SHALL open a centered modal dialog that lists available keyboard shortcuts. The dialog SHALL be dismissible by clicking outside it and by pressing Escape, matching the widget's existing dialog behavior.

#### Scenario: Open modal

- **WHEN** the user clicks the help button
- **THEN** a centered modal dialog listing keyboard shortcuts is displayed

#### Scenario: Close by clicking outside

- **WHEN** the modal is open and the user clicks outside the dialog
- **THEN** the modal closes

#### Scenario: Close with Escape

- **WHEN** the modal is open and the user presses Escape
- **THEN** the modal closes and focus returns to a sensible element

### Requirement: Modal accessibility

The modal SHALL be accessible: it SHALL use `role="dialog"` with `aria-modal="true"`, have an accessible name (dialog title), manage focus on open, and support keyboard dismissal.

#### Scenario: Dialog semantics

- **WHEN** the modal is open
- **THEN** it exposes `role="dialog"`, `aria-modal="true"`, and an accessible name referencing the dialog title

#### Scenario: Focus on open

- **WHEN** the modal opens
- **THEN** focus moves into the dialog

### Requirement: Shortcut catalog

The modal SHALL display a static, manually maintained catalog of keyboard shortcuts grouped into categories: Formatting, Paragraph, History, and Accessibility navigation. The catalog SHALL include, at minimum: bold, italic, underline, strikethrough, superscript, subscript; indent and outdent; undo and redo; and the accessibility navigation shortcuts (focus toolbar via Alt+F10, focus status bar via Alt+F11, return to editor / exit fullscreen via Escape).

The category titles and shortcut labels SHALL be localized through the widget's translation layer, resolved from the active page language with English fallback. Key combination strings (e.g. `Alt+F10`) are not translated. The set of categories, shortcuts, and their key combinations is unchanged by localization.

#### Scenario: Formatting shortcuts listed

- **WHEN** the modal is open
- **THEN** the Formatting category lists bold, italic, underline, and strikethrough with their key combinations

#### Scenario: Paragraph shortcuts listed

- **WHEN** the modal is open
- **THEN** the Paragraph category lists indent and outdent with their key combinations

#### Scenario: History shortcuts listed

- **WHEN** the modal is open
- **THEN** the History category lists undo and redo with their key combinations

#### Scenario: Accessibility navigation shortcuts listed

- **WHEN** the modal is open
- **THEN** the Accessibility category lists focus toolbar (Alt+F10), focus status bar (Alt+F11), and return-to-editor/exit-fullscreen (Escape)

#### Scenario: Catalog text is localized

- **WHEN** the active page language is `nl` and the modal is open
- **THEN** the category titles and shortcut labels render in Dutch (English fallback for any missing key), while the key combination strings remain unchanged
