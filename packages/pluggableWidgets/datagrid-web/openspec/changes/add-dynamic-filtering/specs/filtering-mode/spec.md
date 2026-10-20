## ADDED Requirements

### Requirement: Filtering mode property

The widget SHALL have a `filteringMode` enumeration property with the values `fixed` ("Fixed filters", default) and `dynamic` ("Dynamic filters"), in a new **General → Filtering** group placed after **Columns**. Only one mode SHALL be active at a time. Switching mode SHALL keep the configuration of the other mode.

#### Scenario: Existing grid after upgrade

- **WHEN** an app with an existing Data Grid 2 is upgraded
- **THEN** the grid is in Fixed mode and behaves exactly as before

### Requirement: Filter Field configuration

The widget SHALL have a `filterFields` object list with `key` (required string), `attribute` (required, datasource-bound, same attribute types as the column `attribute`, no associations) and `label` (required textTemplate). It SHALL have a `filterFieldOptions` object list with `fieldKey` (required string), `caption` (textTemplate) and `value` (String expression).

#### Scenario: Labels are translatable

- **WHEN** a Filter Field's label has Dutch and English translations
- **THEN** the field picker shows the label in the user's language

### Requirement: Studio Pro visibility follows the mode

In Fixed mode, Studio Pro SHALL hide `filterFields`, `filterFieldOptions`, and the Dynamic filters texts. In Dynamic mode it SHALL hide each column's `filter` slot and `columnsFilterable`. `filtersPlaceholder` SHALL never be hidden. Filter Field items SHALL be captioned `label (key)` and option items `fieldKey: caption`.

#### Scenario: Switching to Dynamic

- **WHEN** the developer sets Filtering mode to Dynamic filters
- **THEN** the column filter slots and "Column filters" disappear, and "Filter fields" and "Enumeration options" appear

### Requirement: Consistency checks

Studio Pro SHALL report an error when a Filter Field `key` is empty, when two Filter Fields share a `key`, when Filtering mode is Dynamic and `filterFields` is empty, or when a `filterFieldOptions` `fieldKey` matches no Filter Field key.

#### Scenario: Duplicate key

- **WHEN** two Filter Fields both have the key `status`
- **THEN** Studio Pro shows an error on the second one saying keys must be unique

#### Scenario: Dangling option

- **WHEN** an enumeration option has `fieldKey` `priority` and no Filter Field has that key
- **THEN** Studio Pro shows an error on that option

### Requirement: Header renders the builder in Dynamic mode

In Dynamic mode, the grid header (`widget-datagrid-header`) SHALL always render, even when `filtersPlaceholder` is empty, and SHALL render the shared Dynamic filter builder after the `filtersPlaceholder` content. The builder's texts SHALL come from `addFilterCaption`, `clearFiltersCaption`, `removeFilterAriaLabel` and `filterFieldAriaLabel`.

#### Scenario: Empty slot, Dynamic mode

- **WHEN** the grid is in Dynamic mode and nothing is placed in the header
- **THEN** the header renders with only the "Add filter" button

#### Scenario: Buttons in the header

- **WHEN** the header contains an action button and the grid is in Dynamic mode
- **THEN** the action button renders first and the builder renders below it

### Requirement: Column filters are off in Dynamic mode

In Dynamic mode, the grid SHALL NOT render the column filter row and SHALL NOT apply column filter conditions, whatever the value of `columnsFilterable` or any configured column `filter` content.

#### Scenario: Leftover column filter

- **WHEN** a column still has a Text filter configured from Fixed mode and the grid is switched to Dynamic mode
- **THEN** no column filter row is shown and that filter has no effect on the data

### Requirement: Filter widgets in the header show an error in Dynamic mode

In Dynamic mode the header SHALL provide the shared Dynamic mode context, so any filter widget placed in `filtersPlaceholder` renders the Dynamic mode error. Header filter widget conditions SHALL NOT be applied in Dynamic mode. Other header content SHALL render as usual.

#### Scenario: Leftover header filter

- **WHEN** the header contains a Drop-down filter and the grid is in Dynamic mode
- **THEN** the Drop-down filter renders the error alert and doesn't filter the data

### Requirement: Datasource filter in Dynamic mode

In Dynamic mode the datasource filter SHALL be the Filter Set's condition only, and SHALL update live as rows change.

#### Scenario: Add a row

- **WHEN** the user adds a row "Status is one of Open"
- **THEN** the grid reloads showing only records with status Open
