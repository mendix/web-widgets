## ADDED Requirements

### Requirement: Filter Set is saved in personalization

When `storeFiltersInPersonalization` is on and the grid is in Dynamic mode, the personalization blob SHALL include a `dynamicFilters` field containing the Filter Set's serialized rows. When `storeFiltersInPersonalization` is off, `dynamicFilters` SHALL NOT be saved or restored.

#### Scenario: Reload with persistence on

- **WHEN** the user adds two rows and reloads the page
- **THEN** the grid restores the same two rows and filters the data accordingly

#### Scenario: Persistence off

- **WHEN** `storeFiltersInPersonalization` is off and the user reloads
- **THEN** the Filter Set starts empty

### Requirement: Existing saved settings stay valid

The blob's `schemaVersion` SHALL stay `3`, and `dynamicFilters` SHALL be optional. A blob without `dynamicFilters` SHALL restore as an empty Filter Set without discarding any other settings. `dynamicFilters` SHALL NOT be part of `settingsHash`, so editing Filter Fields never resets column widths, order, visibility or sort.

#### Scenario: Upgrade from a previous version

- **WHEN** a user with saved column widths and sort opens the upgraded grid in Dynamic mode
- **THEN** their column widths and sort are restored and the Filter Set is empty

#### Scenario: Developer adds a Filter Field

- **WHEN** the developer adds a new Filter Field and redeploys
- **THEN** users keep their column settings and their saved rows

### Requirement: Invalid saved rows are dropped silently

On restore, rows whose field key no longer exists, or whose data is no longer valid for the field, SHALL be dropped without an error shown to the user. The other rows SHALL restore.

#### Scenario: Filter Field removed

- **WHEN** the developer removes the Filter Field `region` and a user had a saved row for it
- **THEN** that row is gone and the user's other rows remain
