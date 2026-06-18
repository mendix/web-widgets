## 1. Create the key atoms

- [ ] 1.1 Create `src/model/atoms/apiKey.atom.ts` with `apiKeyAtom` function that returns `ComputedAtom<string | null>` with caching logic
- [ ] 1.2 Create `src/model/atoms/geodecodeApiKey.atom.ts` with `geodecodeApiKeyAtom` function (same pattern, reads `geodecodeApiKeyExp?.value ?? geodecodeApiKey`)
- [ ] 1.3 Add `apiKey: token<ComputedAtom<string | null>>` and `geodecodeApiKey: token<ComputedAtom<string | null>>` to `CORE_TOKENS` in `src/model/tokens.ts`

## 2. Update MapsConfig

- [ ] 2.1 Remove `apiKey` field from `MapsConfig` interface and `mapsConfig()` function
- [ ] 2.2 Update `createMapsContainer.ts` if it references config.apiKey

## 3. Wire atoms in container

- [ ] 3.1 Bind both atoms in `Maps.container.ts` init phase (need mainGate): `CORE.apiKey` and `CORE.geodecodeApiKey`

## 4. Update consumers

- [ ] 4.1 Update `LocationResolverService` to inject `ComputedAtom<string | null>` for geodecodeApiKey instead of reading `mainGate.props`
- [ ] 4.2 Update `MapsWidget.tsx` — derive `mapsToken` from the apiKey atom (or remove if LeafletMap/GoogleMap will read from atom directly)

## 5. Tests

- [ ] 5.1 Add unit test for `apiKeyAtom`: priority, fallback, null, and caching behavior
- [ ] 5.2 Add unit test for `geodecodeApiKeyAtom`: same scenarios
- [ ] 5.3 Update `LocationResolver` tests to inject atom mock instead of relying on gate props for apiKey
- [ ] 5.4 Run full test suite and fix any failures
