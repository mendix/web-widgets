## Purpose

Editor config property visibility logic for the Maps widget. Defines how properties are shown/hidden in Studio Pro based on widget configuration state.

## Requirements

### Requirement: No platform branching in property visibility

The `getProperties()` function SHALL NOT branch on the `platform` parameter. All property visibility logic MUST use a single unified code path.

#### Scenario: Same properties shown regardless of platform argument

- **WHEN** `getProperties()` is called with platform `"web"` or `"desktop"`
- **THEN** the returned properties are identical for both values

### Requirement: Advanced property removed

The widget XML SHALL NOT define an `advanced` property. The editor config SHALL NOT reference `advanced` in any visibility logic.

#### Scenario: mapProvider always visible

- **WHEN** the widget is placed on a page
- **THEN** the `mapProvider` property is visible without any toggle

#### Scenario: Marker style options always visible

- **WHEN** a static or dynamic marker is configured
- **THEN** the `markerStyle` / `markerStyleDynamic` and `customMarker` / `customMarkerDynamic` properties are visible (custom marker still conditional on style being "image")

### Requirement: apiKeyExp always visible

The `apiKeyExp` expression property SHALL never be hidden by `getProperties()`, except when `mapProvider` is `"openStreet"` (OpenStreetMap requires no API key).

#### Scenario: Fresh widget shows expression field

- **WHEN** a new Maps widget is placed on a page with no configuration
- **THEN** `apiKeyExp` is visible to the user

#### Scenario: apiKeyExp visible even when apiKey has value

- **WHEN** `apiKey` (static) has a value set
- **THEN** `apiKeyExp` remains visible

#### Scenario: apiKeyExp hidden for OpenStreetMap

- **WHEN** `mapProvider` is `"openStreet"`
- **THEN** both `apiKey` and `apiKeyExp` are hidden (no API key needed)

### Requirement: Static apiKey deprecation warning

The `check()` function SHALL return a warning-severity problem when `values.apiKey` is non-empty, informing the user that the static API key is deprecated and `apiKeyExp` (expression) should be used instead.

#### Scenario: Warning shown when static apiKey is set

- **WHEN** `values.apiKey` is a non-empty string
- **THEN** `check()` returns a problem with `severity: "warning"` on property `"apiKey"` with a message indicating deprecation

#### Scenario: No warning when apiKey is empty

- **WHEN** `values.apiKey` is empty or undefined
- **THEN** no deprecation warning is returned

### Requirement: apiKey hidden when empty

The static `apiKey` field SHALL be hidden when it has no value. It SHALL only be shown when the user already has a value configured (for backward compatibility).

#### Scenario: apiKey hidden when empty

- **WHEN** `values.apiKey` is falsy (empty or undefined)
- **THEN** `apiKey` is hidden from the properties panel

#### Scenario: apiKey visible when it has a value

- **WHEN** `values.apiKey` is a non-empty string
- **THEN** `apiKey` is visible (for backward compatibility with existing configurations)
