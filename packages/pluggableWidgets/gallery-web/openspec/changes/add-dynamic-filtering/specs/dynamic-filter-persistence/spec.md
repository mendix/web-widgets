## ADDED Requirements

### Requirement: Filter Set is saved in Gallery settings

When `storeFilters` is on and the Gallery is in Dynamic mode, the settings object SHALL include a `dynamicFilters` field containing the Filter Set's serialized rows. When `storeFilters` is off, `dynamicFilters` SHALL NOT be saved or restored. `storeSort` SHALL behave as today in both modes.

#### Scenario: Reload with persistence on

- **WHEN** the user adds two rows and reloads the page
- **THEN** the Gallery restores the same two rows and filters the items accordingly

#### Scenario: Persistence off

- **WHEN** `storeFilters` is off and the user reloads
- **THEN** the Filter Set starts empty

### Requirement: Existing saved settings stay valid

The settings object's `version` SHALL stay `1`, and `dynamicFilters` SHALL be optional. Settings without `dynamicFilters` SHALL restore as an empty Filter Set without discarding the saved sort or filters.

#### Scenario: Upgrade from a previous version

- **WHEN** a user with a saved sort opens the upgraded Gallery in Dynamic mode
- **THEN** their sort is restored and the Filter Set is empty

### Requirement: Invalid saved rows are dropped silently

On restore, rows whose field key no longer exists, or whose data is no longer valid for the field, SHALL be dropped without an error shown to the user. The other rows SHALL restore.

#### Scenario: Filter Field removed

- **WHEN** the developer removes the Filter Field `region` and a user had a saved row for it
- **THEN** that row is gone and the user's other rows remain
