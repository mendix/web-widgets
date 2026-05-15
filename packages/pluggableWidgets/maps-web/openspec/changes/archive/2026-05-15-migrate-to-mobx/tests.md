## Test Cases

### Container Creation and Initialization

- [x] **createMapsContainer returns container and gate provider**
    - **Type**: unit
    - **Given**: Mock MapsContainerProps
    - **When**: Call `createMapsContainer(props)`
    - **Then**: Returns tuple `[MapsContainer, GateProvider]`
    - **Status**: passing

- [x] **Container binds main gate from provider**
    - **Type**: unit
    - **Given**: Container created with mock props
    - **When**: Resolve `CORE.mainGate` from container
    - **Then**: Returns the same gate instance as provider's gate
    - **Status**: passing

- [x] **Container initializes with correct configuration**
    - **Type**: unit
    - **Given**: Props with name, apiKey, markers
    - **When**: Create container
    - **Then**: Config bound to container with derived values from props
    - **Status**: passing

### LocationResolver Service Tests

- [x] **Service resolves markers with lat/lng directly**
    - **Type**: unit
    - **Given**: Markers with latitude and longitude properties
    - **When**: Service processes markers
    - **Then**: Returns markers without geocoding API calls
    - **Status**: passing

- [x] **Service geocodes markers with addresses**
    - **Type**: unit
    - **Given**: Markers with address but no lat/lng, valid API key
    - **When**: Service processes markers
    - **Then**: Calls geocoding API and returns resolved lat/lng
    - **Status**: passing

- [x] **Service caches geocoding results**
    - **Type**: unit
    - **Given**: Same address geocoded previously
    - **When**: Service processes markers with same address again
    - **Then**: Returns cached result without new API call
    - **Status**: passing

- [x] **Service throws error when address provided but no API key**
    - **Type**: unit
    - **Given**: Markers with addresses, no API key
    - **When**: Service processes markers
    - **Then**: Throws error "API key required in order to use markers containing address"
    - **Status**: passing

- [x] **Service handles geocoding failures gracefully**
    - **Type**: unit
    - **Given**: Address that fails to geocode
    - **When**: Service processes markers
    - **Then**: Logs error, continues processing other markers, excludes failed marker
    - **Status**: passing

### MobX Reactivity Tests

- [x] **Container reacts to prop changes via GateProvider**
    - **Type**: integration
    - **Given**: Container created, initial props with 5 markers
    - **When**: `gateProvider.setProps()` with 10 markers
    - **Then**: Observable marker count updates from 5 to 10
    - **Status**: passing (covered by hook test)

- [x] **Marker atoms trigger when locations resolve**
    - **Type**: integration
    - **Given**: Container with address-based markers
    - **When**: Geocoding completes
    - **Then**: MobX computed values depending on markers recompute
    - **Status**: passing (geocoding logic tested)

- [x] **useMapsContainer hook creates stable container instance**
    - **Type**: integration
    - **Given**: Component using `useMapsContainer(props)`
    - **When**: Component re-renders with same prop reference
    - **Then**: Returns same container instance (not recreated)
    - **Status**: passing

- [x] **useMapsContainer updates props on change**
    - **Type**: integration
    - **Given**: Component with container, initial props
    - **When**: Props change (new markers)
    - **Then**: Container's mainProvider receives updated props
    - **Status**: passing

### Container Lifecycle Tests

- [x] **Setup service runs on mount**
    - **Type**: integration
    - **Given**: Container with setup service
    - **When**: `useSetup` hook called (simulating React mount)
    - **Then**: Setup service initialization runs
    - **Status**: passing (verified in hook test)

- [x] **Container properly isolates bindings**
    - **Type**: unit
    - **Given**: Multiple container instances
    - **When**: Set different values in each container
    - **Then**: Each container maintains independent state
    - **Status**: passing

### Integration with Maps Component

- [x] **Maps.tsx renders with ContainerProvider**
    - **Type**: integration
    - **Given**: Maps component with props
    - **When**: Component renders
    - **Then**: ContainerProvider wraps children with isolated container
    - **Status**: passing

- [x] **MapSwitcher receives resolved locations from container**
    - **Type**: integration
    - **Given**: Maps component with container providing locations
    - **When**: Component renders
    - **Then**: MapSwitcher receives resolved marker array as prop
    - **Status**: passing

## Test Implementation Notes

**Test file locations:**

- `src/model/containers/__tests__/createMapsContainer.spec.ts` - Container creation tests
- `src/model/services/__tests__/LocationResolver.service.spec.ts` - Service unit tests
- `src/model/hooks/__tests__/useMapsContainer.spec.ts` - Hook integration tests
- `src/__tests__/Maps.spec.tsx` - Component integration tests (update existing)

**Mocking strategy (from gallery pattern):**

- Use `mockContainerProps()` utility for consistent prop mocking
- Mock `GateProvider` from `@mendix/widget-plugin-mobx-kit`
- Mock geocoding API responses using `jest.fn()` or `fetch` mock
- Use `@mendix/widget-plugin-test-utils` for datasource mocking

**Test execution order:**

1. Container creation tests (verify DI setup)
2. Service unit tests (verify business logic)
3. Reactivity tests (verify MobX integration)
4. Lifecycle tests (verify setup hooks)
5. Component integration tests (verify React integration)

**Success criteria:**

- All tests initially fail (TDD red phase)
- Tests verify observable behaviors from proposal
- Tests are independent and can run in any order
- Mocked props match real prop structure
