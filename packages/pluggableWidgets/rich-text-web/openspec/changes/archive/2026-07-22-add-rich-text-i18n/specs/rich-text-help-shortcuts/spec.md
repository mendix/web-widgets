## MODIFIED Requirements

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
