## ADDED Requirements

### Requirement: Locale resolution from page language

The widget SHALL determine its active display language at render time from `document.documentElement.lang`. When that value is empty or unset, it SHALL fall back to `navigator.language`, and when that is also unavailable it SHALL fall back to `en`. The resolved value SHALL be normalized to a lowercase 2-letter language code (region and script subtags discarded, e.g. `de-DE` → `de`, `pt_BR` → `pt`).

#### Scenario: Page language drives the locale

- **WHEN** `document.documentElement.lang` is `"nl"` (or `"nl-NL"`)
- **THEN** the widget resolves the active locale to `nl`

#### Scenario: Empty page language falls back to navigator

- **WHEN** `document.documentElement.lang` is empty or unset
- **AND** `navigator.language` is `"fr-FR"`
- **THEN** the widget resolves the active locale to `fr`

#### Scenario: No signal falls back to English

- **WHEN** neither `document.documentElement.lang` nor `navigator.language` yields a value
- **THEN** the widget resolves the active locale to `en`

### Requirement: Keyed translation lookup with English fallback

The widget SHALL expose a translation function `t(key)` that returns the string for the given dot-namespaced key from the active language bundle. When the active bundle lacks that key, or the resolved locale has no bundle, the function SHALL return the value from the `en` base bundle. The `en` bundle SHALL define every key used by the widget.

#### Scenario: Active bundle provides the string

- **WHEN** the active locale is `de` and its bundle defines `toolbar.bold` as `"Fett"`
- **THEN** `t("toolbar.bold")` returns `"Fett"`

#### Scenario: Missing key falls back to English

- **WHEN** the active locale is `de` and its bundle does not define `toolbar.subscript`
- **AND** the `en` bundle defines `toolbar.subscript` as `"Subscript"`
- **THEN** `t("toolbar.subscript")` returns `"Subscript"`

#### Scenario: Unknown locale uses English

- **WHEN** the resolved locale is `xx` and no `xx` bundle exists
- **THEN** every `t(key)` returns the `en` bundle value

### Requirement: Bundled language coverage

The widget SHALL ship bundled translations for at least `en`, `nl`, `de`, `fr`, and `es`. Translations SHALL be bundled within the widget and require no configuration by the Mendix app developer (no widget XML properties for text).

#### Scenario: Shipped languages available

- **WHEN** the page language is any of `en`, `nl`, `de`, `fr`, or `es`
- **THEN** the toolbar UI renders in that language without any widget property being set

### Requirement: Localized toolbar and dialog UI

All toolbar-facing UI text SHALL be sourced from the translation layer rather than hardcoded English literals. This SHALL cover: toolbar button tooltips, heading and list dropdown labels, table and cell configuration controls (labels, options, placeholders), the link, image, and video dialogs (labels and placeholders), the link bubble menu tooltips, and the status-bar accessible name.

#### Scenario: Button tooltip is localized

- **WHEN** the active locale is `nl` and the user hovers the bold button
- **THEN** the tooltip text is the `nl` translation of "Bold", not the English literal

#### Scenario: Dialog fields are localized

- **WHEN** the active locale is `de` and the user opens the insert-link dialog
- **THEN** the field labels and placeholders render from the `de` bundle (with English fallback for any missing key)

#### Scenario: Status-bar accessible name is localized

- **WHEN** the active locale is `fr`
- **THEN** the status bar's accessible name is the `fr` translation, not the English literal

### Requirement: Provider-independent safe default

Components that consume translations SHALL render the `en` base strings when no translation provider is mounted, so the widget never renders missing or broken text (e.g. in design-time preview or isolated tests).

#### Scenario: No provider renders English

- **WHEN** a toolbar component is rendered without a translation provider in scope
- **THEN** it renders the `en` base strings without throwing
