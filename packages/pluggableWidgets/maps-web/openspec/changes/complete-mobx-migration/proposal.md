# Complete MobX Migration and Replace react-leaflet

## Why

The `migrate-to-mobx` change (archived 2026-05-15) introduced the model layer — `MapsContainer`, `LocationResolverService`, `useMapsContainer` — but `Maps.tsx` still runs on the legacy `useLocationResolver` hook, so the new architecture is dead code. Additionally, `react-leaflet` (v4) pins the widget to a React-lifecycle-driven map wrapper that conflicts with observable-driven updates, carries a known default-icon bug we work around, and is the only reason `@types/react-leaflet` and the react-leaflet ESM transform exist in the toolchain.

## What Changes

Wire the MobX container into the widget and render Leaflet directly:

- `Maps.tsx` creates the container via `useMapsContainer` and provides it through `ContainerProvider` (mirrors `Gallery.tsx`)
- New `MapsWidget` observer component reads `mainGate.props` + services and renders `MapSwitcher`
- New `CurrentLocationService` replaces the `useEffect`/`useState` current-location logic; reacts to `showCurrentLocation`, clears the location when disabled, discards stale responses via a version counter
- New `injection-hooks.ts` (`useMainGate`, `useMapsConfig`, `useLocationResolver`, `useCurrentLocation`) following the gallery pattern
- `LeafletMap.tsx` rewritten on the imperative Leaflet API: map instance created once per mount, tile layer synced on provider/token change, markers + viewport synced on location changes; identical DOM structure (`.widget-maps`, `.widget-leaflet-maps-wrapper`, `.widget-leaflet-maps`) so existing SCSS applies
- `utils/geodecode.ts`: legacy `useLocationResolver` and `isIdenticalMarkers` removed
- `utils/leaflet.ts`: `BaseMapLayer` type based on `leaflet`'s `TileLayerOptions` instead of react-leaflet's `TileLayerProps`

## Impact

- **Affected**: `Maps.tsx`, `components/LeafletMap.tsx`, `utils/geodecode.ts`, `utils/leaflet.ts`, `model/tokens.ts`, `model/containers/*`
- **New**: `components/MapsWidget.tsx`, `model/services/CurrentLocation.service.ts`, `model/hooks/injection-hooks.ts`
- **Dependencies**: removed `react-leaflet`, `@types/react-leaflet`; added explicit `mobx`, `mobx-react-lite` (previously transitive)
- **Behavior change**: disabling `showCurrentLocation` at runtime now removes the current-location marker (previously it persisted); titled-marker popups otherwise behave as before
- **Breaking**: None (internal refactor; widget XML/props unchanged)
