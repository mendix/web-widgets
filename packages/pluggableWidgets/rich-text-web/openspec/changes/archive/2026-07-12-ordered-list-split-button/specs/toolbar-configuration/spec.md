# Toolbar Configuration Specification

## ADDED Requirements

### Requirement: Toolbar config supports splitButton action type

The toolbar configuration SHALL support `"splitButton"` as a valid action type for button definitions.

#### Scenario: Split button action type is recognized

- **WHEN** button config has `action: "splitButton"`
- **THEN** toolbar factory renders ToolbarSplitButton component

#### Scenario: Split button config includes dropdown options

- **WHEN** button config has `action: "splitButton"`
- **THEN** button config includes `dropdownOptions` array
- **THEN** each option includes `label`, `value`, `command`, `attrs`, and `icon` fields

### Requirement: Dropdown options support icon field

The ToolbarDropdownOption interface SHALL include an optional `icon` field for visual representation.

#### Scenario: Icon field is optional

- **WHEN** dropdown option is defined
- **THEN** `icon` field may be omitted without error

#### Scenario: Icon field is used when present

- **WHEN** dropdown option includes `icon` field
- **THEN** rendered option displays icon before label

### Requirement: Ordered list button uses split button configuration

The ordered list toolbar button SHALL be configured as a split button with style options.

#### Scenario: Ordered list button has split button action

- **WHEN** toolbar groups are loaded
- **THEN** orderedList button has `action: "splitButton"`

#### Scenario: Ordered list dropdown includes style options

- **WHEN** orderedList button config is accessed
- **THEN** dropdownOptions includes decimal, lower-alpha, and lower-roman
- **THEN** each option has corresponding icon (List-numbers, List-lower-alpha, List-roman)

#### Scenario: Decimal option uses null styleType

- **WHEN** decimal option is selected
- **THEN** `attrs.styleType` is `null` (browser default)

#### Scenario: Lower-alpha option uses styleType attribute

- **WHEN** lower-alpha option is selected
- **THEN** `attrs.styleType` is `"lower-alpha"`

#### Scenario: Lower-roman option uses styleType attribute

- **WHEN** lower-roman option is selected
- **THEN** `attrs.styleType` is `"lower-roman"`

### Requirement: Standalone orderedListStyle button is removed

The toolbar configuration SHALL NOT include standalone `orderedListStyle` dropdown button.

#### Scenario: List group has three buttons

- **WHEN** list toolbar group is rendered
- **THEN** group includes bulletList, orderedList (split), and taskList
- **THEN** group does NOT include standalone orderedListStyle button

### Requirement: Icon mapping helper is available

The toolbar configuration SHALL provide helper function to map list style values to icon names.

#### Scenario: Decimal maps to List-numbers

- **WHEN** helper function receives `"decimal"` or `null`
- **THEN** function returns `"List-numbers"`

#### Scenario: Lower-alpha maps to List-lower-alpha

- **WHEN** helper function receives `"lower-alpha"`
- **THEN** function returns `"List-lower-alpha"`

#### Scenario: Lower-roman maps to List-roman

- **WHEN** helper function receives `"lower-roman"`
- **THEN** function returns `"List-roman"`
