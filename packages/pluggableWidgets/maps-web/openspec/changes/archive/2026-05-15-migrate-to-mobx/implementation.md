## Approach

Follow TDD cycle to migrate from hook-based to container-based architecture:

1. **Foundation first**: Create dependency injection tokens, config, and Root container
2. **Service layer**: Extract geocoding logic from hook to LocationResolver service
3. **Container setup**: Build Maps container with binding groups (following gallery pattern)
4. **Factory function**: Implement createMapsContainer to wire everything together
5. **React integration**: Create useMapsContainer hook and update Maps.tsx
6. **Test-driven**: Write each test, make it pass with minimal code, refactor

**Key principle**: Follow gallery-web pattern exactly—use same DI structure, binding group pattern, and lifecycle hooks.

## Changes

### Phase 1: Foundation Setup

- **`src/model/tokens.ts`** (NEW)
    - Define dependency injection tokens for brandi
    - `CORE_TOKENS`: mainGate, config, setupService
    - `MAPS_TOKENS`: locationResolver, resolvedLocations (computed atom)

- **`src/model/configs/Maps.config.ts`** (NEW)
    - Interface `MapsConfig` with id, name, apiKey
    - Function `mapsConfig(props)` to derive config from props
    - Generate unique ID per instance

- **`src/model/containers/Root.container.ts`** (NEW)
    - Extend brandi `Container`
    - Bind setup service in singleton scope
    - Share bindings across container hierarchy (if needed in future)

### Phase 2: Service Layer

- **`src/model/services/LocationResolver.service.ts`** (NEW)
    - Move logic from `useLocationResolver` hook
    - Class with `@injected` dependencies: mainGate for props
    - Method `resolveLocations()` returns computed atom of resolved markers
    - Handles geocoding via `convertAddressToLatLng` (reuse existing util)
    - MobX observable state for tracking resolution status

- **`src/model/services/MapsSetup.service.ts`** (NEW)
    - Minimal setup service (may just extend base SetupService)
    - Run initialization hooks on mount
    - Used by `useSetup` in component

- **`src/utils/geodecode.ts`** (MODIFY)
    - Remove `useLocationResolver` hook
    - Keep `convertAddressToLatLng` and helper functions (reused by service)
    - Keep cache mechanism (reused by service)

### Phase 3: Container Implementation

- **`src/model/containers/Maps.container.ts`** (NEW)
    - Extend brandi `Container` with Root container as parent
    - Define binding groups (following gallery pattern):
        - `_01_coreBindings`: mainGate, config, locationResolver
        - `_02_locationsBindings`: resolved locations atom
    - Each binding group has `inject()`, `define()`, `init()`, `postInit()` methods
    - Constructor: bind setup service, run define phases
    - `init()` method: run init and postInit phases with dependencies

- **`src/model/containers/createMapsContainer.ts`** (NEW)
    - Factory function matching gallery signature
    - Create Root container instance
    - Derive config from props
    - Create GateProvider for props reactivity
    - Create Maps container with root parent
    - Call `container.init({ props, config, mainGate })`
    - Return `[MapsContainer, GateProvider]` tuple

### Phase 4: Models & Atoms

- **`src/model/models/locations.model.ts`** (NEW)
    - MobX atom for resolved locations
    - Injected with mainGate dependency
    - Computed from props.markers + props.dynamicMarkers
    - Uses LocationResolver service internally

### Phase 5: React Integration

- **`src/model/hooks/useMapsContainer.ts`** (NEW)
    - `useConst(() => createMapsContainer(props))` - stable instance
    - `useSetup(() => container.get(CORE.setupService))` - run setup on mount
    - `useEffect(() => mainProvider.setProps(props))` - sync props
    - Return container

- **`src/Maps.tsx`** (MODIFY)
    - Import `useMapsContainer` and `ContainerProvider` from brandi-react
    - Replace `const [locations] = useLocationResolver(...)` with `const container = useMapsContainer(props)`
    - Wrap return with `<ContainerProvider container={container} isolated>`
    - Extract locations from container via token in child component OR pass through context

### Phase 6: Test Infrastructure

- **`src/utils/mock-container-props.ts`** (NEW)
    - Create `mockContainerProps()` utility (following gallery pattern)
    - Returns valid MapsContainerProps for testing
    - Include datasource mock, markers, apiKey

- **`src/model/containers/__tests__/createMapsContainer.spec.ts`** (NEW)
    - Container creation tests
    - Verify tuple return, gate binding, config initialization

- **`src/model/services/__tests__/LocationResolver.service.spec.ts`** (NEW)
    - Service unit tests
    - Mock geocoding API, test all resolution scenarios

- **`src/model/hooks/__tests__/useMapsContainer.spec.ts`** (NEW)
    - Hook integration tests
    - Use `@testing-library/react-hooks` or similar
    - Verify stable instance, prop updates

## Decisions

### Decision 1: Follow Gallery Pattern Exactly

**Rationale**: Gallery is proven, well-tested, and maintains consistency across widgets. Deviating would create maintenance burden and confusion.

**Alternatives Considered**:

- Simpler DI without brandi (rejected - loses type safety and consistency)
- Custom container structure (rejected - harder to maintain)

**Trade-offs**: More boilerplate initially, but pays off in testability and consistency.

### Decision 2: Reuse Geocoding Utils, Not Rewrite

**Rationale**: `convertAddressToLatLng` and geocoding logic already work. Service will call these utilities rather than reimplementing.

**Alternatives Considered**:

- Rewrite geocoding in service (rejected - unnecessary duplication)

**Trade-offs**: None - this is pure win.

### Decision 3: Service Returns Computed Atom, Not Direct Value

**Rationale**: MobX computed atoms allow downstream components to react automatically when geocoding completes asynchronously.

**Alternatives Considered**:

- Service returns Promise (rejected - loses reactivity)
- Service uses callbacks (rejected - not idiomatic MobX)

**Trade-offs**: Slightly more complex than simple Promise, but enables proper reactive patterns.

### Decision 4: Keep Root Container Minimal Initially

**Rationale**: Maps widget doesn't have complex shared state like gallery (pagination, filtering). Root can stay simple until we need shared bindings.

**Alternatives Considered**:

- Copy all gallery Root bindings (rejected - YAGNI)

**Trade-offs**: May need to add more later if we add features, but start simple.

## Test Status

Track as tests are implemented and pass:

### Container Creation (3 tests)

- [ ] createMapsContainer returns container and gate provider
- [ ] Container binds main gate from provider
- [ ] Container initializes with correct configuration

### LocationResolver Service (5 tests)

- [ ] Service resolves markers with lat/lng directly
- [ ] Service geocodes markers with addresses
- [ ] Service caches geocoding results
- [ ] Service throws error when address provided but no API key
- [ ] Service handles geocoding failures gracefully

### MobX Reactivity (4 tests)

- [ ] Container reacts to prop changes via GateProvider
- [ ] Marker atoms trigger when locations resolve
- [ ] useMapsContainer hook creates stable container instance
- [ ] useMapsContainer updates props on change

### Container Lifecycle (2 tests)

- [ ] Setup service runs on mount
- [ ] Container properly isolates bindings

### Integration (2 tests)

- [ ] Maps.tsx renders with ContainerProvider
- [ ] MapSwitcher receives resolved locations from container

## TDD Cycle Log

**Implementation order** (TDD red-green-refactor):

1. Create tokens.ts (no test - just type definitions)
2. Create Maps.config.ts → test config derivation
3. Create Root.container.ts → test setup service binding
4. Create LocationResolver.service.ts → write & pass service unit tests (5 tests)
5. Create locations.model.ts → test atom reactivity
6. Create Maps.container.ts → test DI bindings
7. Create createMapsContainer.ts → write & pass container tests (3 tests)
8. Create useMapsContainer.ts → write & pass hook tests (2 tests)
9. Update Maps.tsx → write & pass integration tests (2 tests)
10. Refactor: clean up any duplication, improve naming

**Success criteria**: All 17 tests passing, no tests skipped.
