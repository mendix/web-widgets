## ADDED Requirements

### Requirement: Filter Fields are defined by key, attribute and label

The Filter Set SHALL accept a list of Filter Fields, each with a developer-specified `key` (plain string), an `attribute` (`ListAttributeValue`) and a `label` (string). Rows SHALL refer to a Filter Field by its `key` only. One attribute MAY back several Filter Fields.

#### Scenario: Two Filter Fields on the same attribute

- **WHEN** the Filter Fields contain `{ key: "created", attribute: CreatedDate }` and `{ key: "createdRange", attribute: CreatedDate }`
- **THEN** both fields are offered in the field picker under their own labels, and rows for each are stored under their own key

### Requirement: Filter kind is inferred from the attribute type

Each row's filter store SHALL be created by `attrgroupFilterStore` from the Filter Field's attribute type, unchanged: String and HashString give a text row, AutoNumber, Decimal, Integer and Long give a number row, DateTime gives a date row, and Enum and Boolean give an enumeration row.

#### Scenario: Decimal attribute

- **WHEN** a row selects a Filter Field backed by a Decimal attribute
- **THEN** the row uses a number filter store with the same operators as the Number filter widget

#### Scenario: Attribute that can't be filtered

- **WHEN** a Filter Field's attribute has `filterable = false` or an unsupported type
- **THEN** that field isn't offered in the field picker, and a warning naming the field key is logged once

### Requirement: Operators match the existing filter widgets

Text, number and date rows SHALL offer exactly the operator set of the matching existing filter widget, including "between" for dates. Enumeration rows SHALL have no operator and SHALL always match "is one of" the selected values.

#### Scenario: Enumeration row with several values

- **WHEN** an enumeration row has "Open" and "In progress" selected
- **THEN** the row's condition matches records whose attribute equals "Open" OR "In progress"

### Requirement: Rows combine with AND

The Filter Set's condition SHALL be the AND of the conditions of all rows that have a condition. A row with no value (an incomplete row) SHALL add no condition. An empty Filter Set SHALL produce no condition.

#### Scenario: Two complete rows and one incomplete row

- **WHEN** the Filter Set has "Name contains Jo", "Created ≥ 2026-01-01" and a row with no value
- **THEN** the condition is `Name contains "Jo" AND Created >= 2026-01-01`

#### Scenario: Same field used twice

- **WHEN** two rows both use the "Amount" field, with "> 10" and "< 100"
- **THEN** the condition is `Amount > 10 AND Amount < 100`

### Requirement: Rows apply live with the existing timing

A row's condition SHALL update with the same timing as the matching filter widget: text and number values after a 500 ms debounce, and date and enumeration values immediately. The debounce SHALL NOT be configurable.

#### Scenario: Typing in a text row

- **WHEN** the user types "Jo" into a text row and stops
- **THEN** the Filter Set's condition updates 500 ms after the last keystroke

### Requirement: Adding, removing and clearing rows

The Filter Set SHALL support appending a blank row (no field selected), removing a row by id, and clearing all rows. There SHALL be no limit on the number of rows.

#### Scenario: Clear all

- **WHEN** "Clear all" is triggered on a Filter Set with three rows
- **THEN** the Filter Set has no rows and produces no condition

### Requirement: Changing a row's field

When a row's field changes to a field of the same kind (text, number or date), the row SHALL keep its operator and value. When the kind changes, or when both fields are enumeration fields, the row SHALL reset to the new kind's default operator and an empty value.

#### Scenario: Text field to text field

- **WHEN** a row "First name contains John" is switched to the "Last name" field
- **THEN** the row becomes "Last name contains John" and keeps filtering

#### Scenario: Text field to date field

- **WHEN** a row "Name contains John" is switched to the "Created" field
- **THEN** the row has the date default operator, an empty value, and adds no condition

#### Scenario: Enumeration field to enumeration field

- **WHEN** a row "Status is one of Open" is switched to the "Priority" field
- **THEN** the row has no values selected and adds no condition

### Requirement: Enumeration options replace automatic values

By default, an enumeration row SHALL offer every value of the enumeration or Boolean attribute, in enumeration order, with the Mendix captions. When enumeration options are configured for a Filter Field key, they SHALL replace the automatic values for that field. Options whose field isn't an Enum or Boolean field SHALL be ignored, with a warning logged.

#### Scenario: Custom options

- **WHEN** the options `[{ fieldKey: "status", caption: "Active", value: "open" }]` are configured
- **THEN** the "status" row offers only "Active", which filters on `open`

### Requirement: Filter Set serializes to a plain array

The Filter Set SHALL serialize to an array of `{ field: <key>, data: <FilterData> }`, where `data` is the row store's own `toJSON()` output. Incomplete rows SHALL still be serialized, so the user's rows come back as they left them.

#### Scenario: Round-trip

- **WHEN** a Filter Set with rows "status: Open" and "name contains Jo" is serialized and restored into a new Filter Set with the same Filter Fields
- **THEN** the new Filter Set has the same two rows, in the same order, with the same condition

### Requirement: Invalid rows are dropped silently on restore

On restore, a row SHALL be dropped without user-facing error when its `field` matches no Filter Field, its data isn't valid for the field's kind, or (for enumerations) none of its values are allowed. Values that aren't allowed SHALL be removed from an enumeration row, which is kept if any remain. Input that isn't an array SHALL restore an empty Filter Set.

#### Scenario: Field removed by the developer

- **WHEN** saved data contains a row for field key "region" and no Filter Field has that key
- **THEN** that row is dropped and the other rows restore normally

#### Scenario: Missing data

- **WHEN** the saved data has no Filter Set entry (`undefined`)
- **THEN** the Filter Set restores as empty

### Requirement: Filter Set takes part in view-state hydration

The Filter Set SHALL implement the `CombinedFilter` input contract (`condWithMeta`, `metaKey`, `hydrate`), so that its rows are restored from the datasource's view state when the user navigates back to the page, the same way column and header filters are today.

#### Scenario: Back navigation

- **WHEN** the user applies two rows, leaves the page and navigates back, with personalization storage turned off
- **THEN** the two rows are restored from the datasource filter and its session meta
