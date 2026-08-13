## Why

The `apiKey` is currently stored as a static field in `MapsConfig`, snapshot at container creation time. Since `apiKeyExp` is a `DynamicValue<string>` that may not be resolved on first render, the config can lock in `undefined` and miss the actual key. The key needs to be a reactive computed atom that resolves lazily and caches once available.

## What Changes

- Remove `apiKey` from `MapsConfig` (static config object)
- Create an `apiKeyAtom` as a `ComputedAtom<string | null>` registered in the DI container
- The atom prioritizes `apiKeyExp?.value`, falls back to `apiKey` (static), returns `null` when neither is available
- Once a non-null value is observed, the atom caches it permanently (never reverts to null)
- Update `LocationResolverService` to consume the atom instead of reading `mainGate.props` directly for the API key

## Capabilities

### New Capabilities

- `api-key-atom`: Reactive, cached API key resolution via a MobX computed atom in the Maps DI container

### Modified Capabilities

_(none)_

## Impact

- `src/model/configs/Maps.config.ts` — remove `apiKey` field
- `src/model/tokens.ts` — add token for apiKey atom
- `src/model/containers/Maps.container.ts` — bind the atom
- `src/model/services/LocationResolver.service.ts` — use atom instead of `mainGate.props` for apiKey
- `src/components/MapsWidget.tsx` — remove `mapsToken` prop derivation (now handled by atom)
