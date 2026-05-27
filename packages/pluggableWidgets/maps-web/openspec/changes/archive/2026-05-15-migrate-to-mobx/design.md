# Test Design: MobX Container Migration

## Container Creation (3 tests)

- **createMapsContainer returns container and gate provider** (unit)
    - **Given**: Mock MapsContainerProps
    - **When**: Call `createMapsContainer(props)`
    - **Then**: Returns `[MapsContainer, GateProvider]`

- **Container binds main gate** (unit)
    - **Given**: Container created with props
    - **When**: Resolve `CORE.mainGate`
    - **Then**: Returns provider's gate instance

- **Container initializes with config** (unit)
    - **Given**: Props with name, apiKey, markers
    - **When**: Create container
    - **Then**: Config derived and bound

## LocationResolver Service (5 tests)

- **Resolves markers with lat/lng directly** (unit)
    - **Given**: Markers with latitude/longitude
    - **When**: Service processes markers
    - **Then**: Returns markers without geocoding calls

- **Geocodes markers with addresses** (unit)
    - **Given**: Markers with address, valid API key
    - **When**: Service processes markers
    - **Then**: Calls geocoding API, returns lat/lng

- **Caches geocoding results** (unit)
    - **Given**: Same address geocoded previously
    - **When**: Process markers again
    - **Then**: Returns cached result, no new API call

- **Throws error when address but no API key** (unit)
    - **Given**: Markers with addresses, no API key
    - **When**: Process markers
    - **Then**: Throws "API key required"

- **Handles geocoding failures** (unit)
    - **Given**: Address that fails to geocode
    - **When**: Process markers
    - **Then**: Logs error, excludes failed marker

## MobX Reactivity (4 tests)

- **Container reacts to prop changes** (integration)
    - **Given**: Container with 5 markers
    - **When**: `gateProvider.setProps()` with 10 markers
    - **Then**: Marker count updates to 10

- **useMapsContainer creates stable instance** (integration)
    - **Given**: Component with `useMapsContainer(props)`
    - **When**: Re-render with same prop reference
    - **Then**: Returns same container instance

- **useMapsContainer updates props on change** (integration)
    - **Given**: Component with container
    - **When**: Props change
    - **Then**: Container receives updated props

- **Marker atoms trigger on resolution** (integration)
    - **Given**: Address-based markers
    - **When**: Geocoding completes
    - **Then**: Computed values recompute

## Integration (2 tests)

- **Maps.tsx renders with ContainerProvider** (integration)
    - **Given**: Maps component with props
    - **When**: Component renders
    - **Then**: ContainerProvider wraps children

- **MapSwitcher receives resolved locations** (integration)
    - **Given**: Maps component with container
    - **When**: Component renders
    - **Then**: MapSwitcher receives marker array
