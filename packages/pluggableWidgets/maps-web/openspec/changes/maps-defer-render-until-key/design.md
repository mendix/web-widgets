## Test Cases

### Reproduction Tests

- renders map immediately for openStreet provider (unit)
    - **Given**: `mapProvider` is `"openStreet"`, `apiKey.get()` returns `null`
    - **When**: `MapsWidget` renders
    - **Then**: `MapSwitcher` is rendered

- does not render map when key is null for googleMaps (unit)
    - **Given**: `mapProvider` is `"googleMaps"`, `apiKey.get()` returns `null`
    - **When**: `MapsWidget` renders
    - **Then**: `MapSwitcher` is NOT rendered, empty container is rendered instead

- renders map when key becomes available for googleMaps (unit)
    - **Given**: `mapProvider` is `"googleMaps"`, `apiKey.get()` initially returns `null`
    - **When**: `apiKey.get()` resolves to `"my-key"`
    - **Then**: `MapSwitcher` is rendered with `mapsToken="my-key"`

### Edge Cases

- renders map when key is null for mapBox (unit)
    - **Given**: `mapProvider` is `"mapBox"`, `apiKey.get()` returns `null`
    - **When**: `MapsWidget` renders
    - **Then**: `MapSwitcher` is NOT rendered

- renders map when key is null for hereMaps (unit)
    - **Given**: `mapProvider` is `"hereMaps"`, `apiKey.get()` returns `null`
    - **When**: `MapsWidget` renders
    - **Then**: `MapSwitcher` is NOT rendered

### Regression Tests

- still passes mapsToken to MapSwitcher when key is available (unit)
    - **Given**: `mapProvider` is `"googleMaps"`, `apiKey.get()` returns `"token-123"`
    - **When**: `MapsWidget` renders
    - **Then**: `MapSwitcher` receives `mapsToken="token-123"`

## Notes

The gate is purely in `MapsWidget` (observer component). No changes needed in `MapSwitcher`, `LeafletMap`, or `GoogleMap`. The loading state is just the widget container div with appropriate dimensions (no spinner needed — key resolves within one tick in practice).
