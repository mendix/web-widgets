## ADDED Requirements

### Requirement: Platform fires onChangeEvent automatically via XML attribute binding

The `onChangeEvent` action SHALL be declared in the XML with `onChange="onChangeEvent"` on each relevant attribute property (`attributeEnumeration`, `attributeBoolean`, `staticAttribute`, `attributeAssociation`, `databaseAttributeString`). The Mendix platform SHALL fire the action automatically whenever the attribute value is set, without any manual `executeAction()` call in selector code.

#### Scenario: Action fires on enum attribute change

- **WHEN** the user selects a different enum option in the combobox
- **THEN** the platform fires `onChangeEvent` automatically after `attributeEnumeration.setValue()` is called

#### Scenario: Action fires on boolean attribute change

- **WHEN** the user selects a different boolean option in the combobox
- **THEN** the platform fires `onChangeEvent` automatically after `attributeBoolean.setValue()` is called

#### Scenario: Action fires on static attribute change

- **WHEN** the user selects a different option from a static datasource combobox
- **THEN** the platform fires `onChangeEvent` automatically after `staticAttribute.setValue()` is called

#### Scenario: Action fires on association attribute change

- **WHEN** the user selects a different item in an association-backed combobox
- **THEN** the platform fires `onChangeEvent` automatically after `attributeAssociation.setValue()` is called
- **THEN** the platform does NOT fire `onChangeEvent` if the same item is selected again (value unchanged)

#### Scenario: Action fires on database single select attribute change

- **WHEN** the user selects a different item in a database-backed single-select combobox that has `databaseAttributeString` configured
- **THEN** the platform fires `onChangeEvent` automatically after `databaseAttributeString.setValue()` is called
- **THEN** the platform does NOT fire `onChangeEvent` if the same item is selected again (value unchanged)

#### Scenario: Action does not fire when database attribute is not configured

- **WHEN** the database-source combobox is used without `databaseAttributeString` configured
- **THEN** `onChangeEvent` SHALL NOT fire (no attribute to bind to)

### Requirement: No manual executeAction calls in selectors

Selector classes SHALL NOT call `executeAction(this.onChangeEvent)` directly. The `onChangeEvent` field SHALL be removed from all selector classes and their `updateProps` methods.

#### Scenario: Selector setValue does not call executeAction

- **WHEN** `selector.setValue()` is called for any source type (enum, boolean, static, association, database single)
- **THEN** the selector writes the attribute value without calling `executeAction`
- **THEN** the platform fires the action via the XML `onChange` binding

### Requirement: Database multi-select is unaffected

`DatabaseMultiSelectionSelector` SHALL continue to use `onChangeDatabaseEvent` via the Mendix Selection API. No XML `onChange` binding is added for the database multi-select path.

#### Scenario: Database multi-select action unchanged

- **WHEN** the user selects or deselects items in a database-backed multi-select combobox
- **THEN** `onChangeDatabaseEvent` fires via the platform's Selection API
- **THEN** `onChangeEvent` is not involved in this path
