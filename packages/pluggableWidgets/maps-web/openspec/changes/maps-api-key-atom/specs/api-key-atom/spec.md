## ADDED Requirements

### Requirement: API key resolved via computed atom

The Maps container SHALL provide a `ComputedAtom<string | null>` that reactively resolves the API key from widget props.

#### Scenario: Expression value takes priority

- **WHEN** `apiKeyExp.value` is a non-empty string
- **THEN** the atom returns that value

#### Scenario: Falls back to static apiKey

- **WHEN** `apiKeyExp.value` is undefined or empty
- **AND** `apiKey` is a non-empty string
- **THEN** the atom returns the static `apiKey` value

#### Scenario: Returns null when no key available

- **WHEN** both `apiKeyExp.value` and `apiKey` are empty or undefined
- **THEN** the atom returns `null`

### Requirement: API key cached once resolved

Once the atom returns a non-null value, it SHALL cache that value permanently and never revert to `null`.

#### Scenario: Key remains after expression becomes unavailable

- **WHEN** the atom has previously returned a non-null value
- **AND** `apiKeyExp.value` subsequently becomes undefined
- **THEN** the atom still returns the previously cached value

### Requirement: API key atom registered in DI container

The atom SHALL be registered as a `CORE_TOKENS.apiKey` token in the Maps container and injectable into services.

#### Scenario: LocationResolverService uses atom

- **WHEN** `LocationResolverService` needs the API key for geocoding
- **THEN** it reads from the injected `ComputedAtom<string | null>` via `.get()`

### Requirement: Geodecode API key resolved via computed atom

The Maps container SHALL provide a `ComputedAtom<string | null>` that reactively resolves the geodecode API key from widget props, following the same pattern as the main API key atom.

#### Scenario: Expression value takes priority

- **WHEN** `geodecodeApiKeyExp.value` is a non-empty string
- **THEN** the atom returns that value

#### Scenario: Falls back to static geodecodeApiKey

- **WHEN** `geodecodeApiKeyExp.value` is undefined or empty
- **AND** `geodecodeApiKey` is a non-empty string
- **THEN** the atom returns the static `geodecodeApiKey` value

#### Scenario: Returns null when no key available

- **WHEN** both `geodecodeApiKeyExp.value` and `geodecodeApiKey` are empty or undefined
- **THEN** the atom returns `null`

### Requirement: Geodecode API key cached once resolved

Once the geodecode atom returns a non-null value, it SHALL cache that value permanently and never revert to `null`.

#### Scenario: Key remains after expression becomes unavailable

- **WHEN** the atom has previously returned a non-null value
- **AND** `geodecodeApiKeyExp.value` subsequently becomes undefined
- **THEN** the atom still returns the previously cached value

### Requirement: apiKey and geodecodeApiKey removed from MapsConfig

The static `MapsConfig` interface SHALL NOT contain `apiKey` or `geodecodeApiKey` fields. Both keys are resolved reactively via atoms.

#### Scenario: MapsConfig only contains static fields

- **WHEN** `mapsConfig()` is called
- **THEN** the returned object contains `id`, `name`, and `showCurrentLocation` only
