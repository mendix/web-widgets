## Why

Currently `MapsWidget` renders `MapSwitcher` immediately regardless of whether the API key has resolved. For providers that require a key (Google Maps, MapBox, HERE Maps), this causes the map to initialize with `undefined` as the token, leading to failed tile requests or error screens until the key arrives. OpenStreetMap does not require a key and should render immediately.

## Root Cause

`MapsWidget` passes `apiKey.get() ?? undefined` as `mapsToken` but does not gate rendering on the key being available. The map components attempt to initialize (loading scripts, creating map instances) before the key is ready.

## What Changes

- `MapsWidget` checks whether the API key is required (all providers except `openStreet`)
- If required and `apiKey.get()` is `null`, render a loading/empty state instead of `MapSwitcher`
- OpenStreetMap always renders immediately (no key dependency)

## Impact

- `src/components/MapsWidget.tsx` — add conditional render gate
- No breaking changes; behavior only improves (deferred init vs failed init)
- No new dependencies
