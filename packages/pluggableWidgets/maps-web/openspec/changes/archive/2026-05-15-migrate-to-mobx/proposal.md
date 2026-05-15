## Why

The maps widget currently uses the `useLocationResolver` hook to manage marker state and geocoding. This approach has limitations:

- State logic is tightly coupled to React rendering lifecycle
- Difficult to test in isolation without mounting React components
- Cannot share state logic between different map provider implementations
- No observable/computed pattern for derived state (e.g., filtered markers, bounds calculation)

The gallery widget already uses the container pattern with MobX, providing better testability, state management, and code organization. We need to adopt this same pattern for consistency across widgets.

## What Changes

**Replace React hook with MobX container:**

- Create `MapsContainer` class (similar to `GalleryContainer`) that encapsulates map state logic
- Replace `useLocationResolver` hook with container-based state management
- Implement `createMapsContainer` factory function following gallery pattern
- Use `GateProvider` for props reactivity (same as gallery)

**Observable behavior that tests will verify:**

- Marker locations are resolved from addresses via geocoding API
- Resolved locations are cached and reused on re-render
- State updates trigger component re-renders through MobX observers
- Container can be tested independently with mocked props (no React mounting required)

## Impact

**Affected code:**

- `src/Maps.tsx`: Replace `useLocationResolver` with `useMapsContainer`, wrap component with `ContainerProvider`
- `src/utils/geodecode.ts`: Remove `useLocationResolver` hook (logic moves to service)

**New architecture (following gallery pattern):**

```
src/model/
├── tokens.ts                          # Dependency injection tokens
├── configs/
│   └── Maps.config.ts                 # Map configuration derived from props
├── containers/
│   ├── Root.container.ts              # Shared bindings (datasource atoms, setup)
│   ├── Maps.container.ts              # Main container with binding groups
│   ├── createMapsContainer.ts         # Factory function
│   └── __tests__/
│       └── createMapsContainer.spec.ts
├── services/
│   ├── LocationResolver.service.ts    # Geocoding logic (replaces hook)
│   └── MapsSetup.service.ts           # Setup lifecycle hooks
├── hooks/
│   └── useMapsContainer.ts            # React hook for container
└── models/
    └── locations.model.ts             # MobX atoms for marker state
```

**Dependencies:**

- Add `@mendix/widget-plugin-mobx-kit` (already used by gallery)
- Add `brandi` and `brandi-react` for DI (already used by gallery)
- Add `mobx` and `mobx-react-lite` (already used by gallery)

**Who needs to know:**

- Maps widget maintainers
- Anyone working on state management patterns across widgets
- No breaking changes for widget users (internal refactor only)

## Root Cause

Not applicable (this is an enhancement, not a bug fix). The current implementation works but doesn't follow the architectural pattern established in newer widgets.
