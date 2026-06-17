## 1. Remove `advanced` property

- [x] 1.1 Remove `advanced` property definition from `src/Maps.xml`
- [x] 1.2 Remove `advanced` from `mock-container-props.ts`

## 2. Rewrite `getProperties()` in `src/Maps.editorConfig.ts`

- [x] 2.1 Remove the `platform` parameter and all platform branching (`if (platform === "desktop") / else`)
- [x] 2.2 Unify apiKey/apiKeyExp visibility: always show `apiKeyExp`, hide `apiKey` when it's falsy (only show if user has a value set)
- [x] 2.3 Remove all `advanced`-gated hiding logic (mapProvider, markerStyle, customMarker)
- [x] 2.4 Keep remaining conditional logic: Google-only props, OpenStreet hides apiKey, address/latLng toggle, customMarker conditional on style "image", geodecode keys hidden when no address markers

## 3. Add deprecation warning

- [x] 3.1 In `check()`, add a warning-severity problem when `values.apiKey` is non-empty, message: "Static API key is deprecated. Use the 'API Key' expression instead."

## 4. Cleanup and verify

- [x] 4.1 Regenerate typings (ensure `advanced` is gone from `MapsPreviewProps` and `MapsContainerProps`)
- [x] 4.2 Run lint and fix any issues
- [x] 4.3 Run tests and update snapshots if needed
