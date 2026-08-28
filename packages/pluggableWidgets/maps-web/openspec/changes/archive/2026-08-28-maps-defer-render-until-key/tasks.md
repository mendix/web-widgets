## 1. Test Setup

- [x] 1.1 Add test: openStreet renders immediately when apiKey is null
- [x] 1.2 Add test: googleMaps does NOT render MapSwitcher when apiKey is null
- [x] 1.3 Add test: googleMaps renders MapSwitcher when apiKey resolves
- [x] 1.4 Add test: mapBox and hereMaps do NOT render when apiKey is null
- [x] 1.5 Add test: mapsToken is passed correctly when key is available

## 2. Implementation

- [x] 2.1 In `MapsWidget`, add early return with empty container when `mapProvider !== "openStreet"` and `apiKey.get()` is null
- [x] 2.2 Ensure the empty container preserves widget dimensions (class, style, width/height props)

## 3. Verification

- [x] 3.1 All new tests passing
- [x] 3.2 Full test suite passes (`pnpm run test`)
- [x] 3.3 TypeScript clean (`tsc --noEmit`)
