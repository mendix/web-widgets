# Test Design: Complete MobX Migration and Replace react-leaflet

## CurrentLocationService (6 tests)

- **No request when showCurrentLocation is false** (unit)
    - **Given**: Container with `showCurrentLocation: false`
    - **When**: Service is set up
    - **Then**: `getLocation` not called, `location` is undefined

- **Resolves location when showCurrentLocation is true** (unit)
    - **Given**: Container with `showCurrentLocation: true`
    - **When**: Service is set up
    - **Then**: `getLocation` called once, `location` updated

- **Resolves location when option becomes true** (integration)
    - **Given**: Container with `showCurrentLocation: false`
    - **When**: Props change to `showCurrentLocation: true`
    - **Then**: Location resolved reactively

- **Clears location when option becomes false** (integration)
    - **Given**: Resolved current location
    - **When**: Props change to `showCurrentLocation: false`
    - **Then**: `location` becomes undefined

- **Ignores stale responses** (unit)
    - **Given**: Pending location request
    - **When**: Option disabled before the request resolves
    - **Then**: Late response discarded, `location` stays undefined

- **Logs resolution failures** (unit)
    - **Given**: `getLocation` rejects
    - **When**: Service requests location
    - **Then**: Error logged, `location` stays undefined

## LeafletMap without react-leaflet (15 tests)

- **Structure**: renders `.widget-maps` > `.widget-leaflet-maps-wrapper` > `.leaflet-container`; dimensions and custom class applied (3 tests)
- **Controls**: attribution and zoom controls toggled by props (4 tests)
- **Markers**: custom-icon markers per location, default icon fallback, current location appended, markers re-synced when `locations` prop changes (4 tests)
- **Interaction**: popup with title opens on click; `onClick` fires for title-less markers; `onClick` fires from popup content of titled markers (3 tests)
- **Lifecycle**: map removed from DOM on unmount (1 test)

Structural assertions replace the previous react-leaflet snapshots, which captured wrapper-specific DOM.

## Maps Integration (2 tests)

- **Maps.tsx renders through ContainerProvider** (integration)
    - **Given**: Maps component with mock props
    - **When**: Component renders
    - **Then**: Leaflet container present in DOM

- **Resolved locations reach the map** (integration)
    - **Given**: Static lat/lng marker in props
    - **When**: `LocationResolverService` resolves locations
    - **Then**: Marker rendered on the map (observer re-render)

## Regression Guarantees

- All pre-existing model-layer tests (LocationResolver unit/integration/reactivity, useMapsContainer, data conversion) pass unchanged: 77 tests total across 9 suites
- GoogleMap snapshots untouched
