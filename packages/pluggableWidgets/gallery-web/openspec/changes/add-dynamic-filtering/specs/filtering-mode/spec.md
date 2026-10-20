## ADDED Requirements

### Requirement: Filtering mode property

The widget SHALL have a `filteringMode` enumeration property with the values `fixed` ("Fixed filters", default) and `dynamic` ("Dynamic filters"), in a new **General → Filtering** group placed after **Columns**. Only one mode SHALL be active at a time. Switching mode SHALL keep the configuration of the other mode.

#### Scenario: Existing gallery after upgrade

- **WHEN** an app with an existing Gallery is upgraded
- **THEN** the Gallery is in Fixed mode and behaves exactly as before

### Requirement: Filter Field configuration

The widget SHALL have a `filterFields` object list with `key` (required string), `attribute` (required, datasource-bound; String, AutoNumber, Boolean, DateTime, Decimal, Enum, Integer, Long; no associations) and `label` (required textTemplate). It SHALL have a `filterFieldOptions` object list with `fieldKey` (required string), `caption` (textTemplate) and `value` (String expression). Keys and semantics SHALL match Data Grid 2.

#### Scenario: Labels are translatable

- **WHEN** a Filter Field's label has Dutch and English translations
- **THEN** the field picker shows the label in the user's language

### Requirement: Studio Pro visibility follows the mode

In Fixed mode, Studio Pro SHALL hide `filterFields`, `filterFieldOptions` and the Dynamic filters texts. `filtersPlaceholder` SHALL never be hidden. Filter Field items SHALL be captioned `label (key)` and option items `fieldKey: caption`.

#### Scenario: Fixed mode

- **WHEN** Filtering mode is Fixed filters
- **THEN** "Filter fields", "Enumeration options" and the Dynamic filters texts aren't shown

### Requirement: Consistency checks

Studio Pro SHALL report an error when a Filter Field `key` is empty, when two Filter Fields share a `key`, when Filtering mode is Dynamic and `filterFields` is empty, or when a `filterFieldOptions` `fieldKey` matches no Filter Field key.

#### Scenario: Dynamic mode without fields

- **WHEN** Filtering mode is Dynamic filters and no Filter Fields are configured
- **THEN** Studio Pro shows an error on "Filter fields"

### Requirement: Header renders the builder in Dynamic mode

In Dynamic mode, the Gallery header (`widget-gallery-header`) SHALL always render, even when `filtersPlaceholder` is empty, and SHALL render the shared Dynamic filter builder after the `filtersPlaceholder` content. The builder's texts SHALL come from `addFilterCaption`, `clearFiltersCaption`, `removeFilterAriaLabel` and `filterFieldAriaLabel`.

#### Scenario: Empty slot, Dynamic mode

- **WHEN** the Gallery is in Dynamic mode and nothing is placed in the header
- **THEN** the header renders with only the "Add filter" button

### Requirement: Filter widgets in the header show an error in Dynamic mode

In Dynamic mode the header SHALL provide the shared Dynamic mode context, so any filter widget placed in `filtersPlaceholder` renders the Dynamic mode error. Header filter widget conditions SHALL NOT be applied in Dynamic mode. Other header content, including the Drop-down sort, SHALL render and work as usual.

#### Scenario: Leftover header filter

- **WHEN** the header contains a Text filter and the Gallery is in Dynamic mode
- **THEN** the Text filter renders the error alert and doesn't filter the items

#### Scenario: Sorting in Dynamic mode

- **WHEN** the header contains a Drop-down sort and the Gallery is in Dynamic mode
- **THEN** the Drop-down sort works as in Fixed mode

### Requirement: Datasource filter in Dynamic mode

In Dynamic mode the datasource filter SHALL be the Filter Set's condition only, and SHALL update live as rows change.

#### Scenario: Add a row

- **WHEN** the user adds a row "Price > 100"
- **THEN** the Gallery reloads showing only items with a price above 100
