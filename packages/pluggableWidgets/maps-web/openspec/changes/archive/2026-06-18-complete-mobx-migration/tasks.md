# Tasks: Complete MobX Migration and Replace react-leaflet

## 1. Model layer

- [x] 1.1 Add `GetLocationFunction` type, `CORE.getLocationFunction` and `MAPS.currentLocation` tokens
- [x] 1.2 Implement `CurrentLocationService` (reaction on `showCurrentLocation`, stale-request version counter, clear on disable)
- [x] 1.3 Bind `getCurrentUserLocation` in `RootContainer`; register/inject/boot the service in `MapsContainer`
- [x] 1.4 Add `injection-hooks.ts` (`useMainGate`, `useMapsConfig`, `useLocationResolver`, `useCurrentLocation`)

## 2. React layer

- [x] 2.1 Add `MapsWidget` observer component mapping gate props + service state to `MapSwitcher`
- [x] 2.2 Rewrite `Maps.tsx` to `useMapsContainer` + `ContainerProvider` (gallery pattern)
- [x] 2.3 Remove legacy `useLocationResolver`/`isIdenticalMarkers` from `utils/geodecode.ts`

## 3. Replace react-leaflet

- [x] 3.1 Rewrite `LeafletMap.tsx` on the imperative Leaflet API (map per mount, tile-layer sync, marker/viewport sync, DOM popups)
- [x] 3.2 Replace react-leaflet's `TileLayerProps` with `BaseMapLayer` in `utils/leaflet.ts`
- [x] 3.3 Remove `react-leaflet` and `@types/react-leaflet`; add explicit `mobx` and `mobx-react-lite`; update lockfile

## 4. Tests

- [x] 4.1 Add `CurrentLocation.spec.ts` (6 tests) using the `createTestContainer` pattern; extend `test-utils.ts` with `getLocationFunction` override
- [x] 4.2 Rewrite `LeafletMap.spec.tsx` with structural assertions (15 tests); delete react-leaflet snapshots
- [x] 4.3 Add `Maps.spec.tsx` integration tests (2 tests) per archived design doc
- [x] 4.4 Full suite green: 9 suites, 77 tests; `tsc --noEmit` clean; eslint 0 errors

## 5. Documentation

- [x] 5.1 Update CHANGELOG `Unreleased` section
- [x] 5.2 This OpenSpec change

## 6. Out of scope / follow-up

- [ ] 6.1 Migrate `GoogleMap.tsx` consumption to injection hooks (still prop-driven via `MapSwitcher`)
- [ ] 6.2 Consider `useLayoutEffect` in `useMapsContainer` (review-bot suggestion from PR #2255)
- [ ] 6.3 E2E run against a Mendix test project (requires Studio Pro environment)
