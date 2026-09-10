## ADDED Requirements

### Requirement: Studio Pro presentation name

The widget SHALL present itself to app developers as "Option Selector" in every design-time surface: the Studio Pro
toolbox entry, the Marketplace listing title, and the design-time placeholder captions shown in the page editor when no
caption is configured.

#### Scenario: Toolbox entry

- **WHEN** an app developer opens the Studio Pro toolbox and browses the "Input elements" category
- **THEN** the widget is listed as "Option Selector"
- **AND** it is not listed under "Check box / radio selector" or "Checkbox Radio Selection"

#### Scenario: Design-time placeholder captions

- **WHEN** the widget is placed on a page with no caption attribute configured
- **THEN** the structure preview and editor preview show "Option Selector" as the fallback caption
- **AND** the custom-content dropzones read "Configure the option selector: Place widgets here"

#### Scenario: Marketplace listing

- **WHEN** the widget is published to the Mendix Marketplace
- **THEN** the listing under component number 245825 is titled "Option Selector"
- **AND** a new listing is NOT created

### Requirement: Discoverability by control type

The widget description SHALL name both control types it renders — checkbox and radio button — so that a developer
searching the Studio Pro toolbox or the Marketplace for either term finds the widget under its new name.

#### Scenario: Searching for the old control names

- **WHEN** a developer types "checkbox" or "radio" into the Studio Pro toolbox search
- **THEN** "Option Selector" appears in the results, matched via its description

#### Scenario: Description is present

- **WHEN** the widget XML is inspected
- **THEN** `<description>` is non-empty
- **AND** it contains the words "checkbox" and "radio button"

### Requirement: Stable widget identity across a rename

Renaming the widget's presentation SHALL NOT change any value that an existing app resolves the widget by. The
following are frozen: the widget ID `com.mendix.widget.web.checkboxradioselection.CheckboxRadioSelection`, the
`clientModule name` / `widgetFile path` / `file path` entries in `package.xml`, `package.json`'s `widgetName`,
`mxpackage.name`, `mpkName`, `packagePath` and `marketplace.appNumber`, the npm package name
`@mendix/checkbox-radio-selection-web`, the package folder name, and the `widget-checkbox-radio-selection*` CSS class
prefix.

#### Scenario: Existing app upgrades to the renamed version

- **WHEN** an app already using the widget imports the MPK built after the rename
- **THEN** every existing widget instance on every page still resolves and renders
- **AND** no page reconfiguration is required
- **AND** custom CSS targeting `widget-checkbox-radio-selection*` classes still applies

#### Scenario: Generated artifacts are unaffected

- **WHEN** the package is rebuilt after the rename
- **THEN** `typings/CheckboxRadioSelectionProps.d.ts` is regenerated with identical content
- **AND** the generated locale file is still named
  `com.mendix.widget.web.checkboxradioselection.checkboxradioselection.json`

### Requirement: Stable help URL

The widget's `helpUrl` SHALL continue to resolve to `https://docs.mendix.com/appstore/widgets/checkboxradioselection`.
The documentation page may be retitled to "Option Selector", but its URL slug is a contract shared with Studio Pro's
help action and MUST NOT change as part of a display-name rename.

#### Scenario: Developer opens widget help from Studio Pro

- **WHEN** a developer triggers the help action on the widget in Studio Pro
- **THEN** the browser opens `https://docs.mendix.com/appstore/widgets/checkboxradioselection`
