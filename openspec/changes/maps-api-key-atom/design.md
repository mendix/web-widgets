## Context

Currently `MapsConfig.apiKey` is set once at container creation: `props.apiKeyExp?.value ?? props.apiKey`. Since `apiKeyExp` is a `DynamicValue<string>`, its `.value` can be `undefined` on the first render and resolve later. The static snapshot misses this.

The datagrid widget uses `ComputedAtom<T>` (from `@mendix/widget-plugin-mobx-kit`) for reactive derived values in the DI container. Pattern: a function that returns `computed(() => ...)`, registered as a constant binding.

## Goals / Non-Goals

**Goals:**

- API key resolved reactively from `mainGate.props`
- Priority: `apiKeyExp?.value` > `apiKey` > `null`
- Once a non-null value is observed, it's cached permanently
- Atom registered in DI container via a token, consumed by services

**Non-Goals:**

- Changing how the key is used downstream (geocoding, tile layers still receive `string | undefined`)
- Making `geodecodeApiKey` an atom (separate concern, can follow same pattern later)

## Decisions

**1. Use `ComputedAtom<string | null>` with closure-based caching**

A plain closure variable caches the first non-null result. Once set, the computed short-circuits without accessing `gate.props`, so MobX drops the dependency and the atom never re-evaluates.

```ts
function apiKeyAtom(gate: DerivedPropsGate<MapsContainerProps>): ComputedAtom<string | null> {
    let cached: string | null = null;
    return computed(() => {
        if (cached !== null) return cached;
        const value = (gate.props.apiKeyExp?.value ?? gate.props.apiKey) || null;
        if (value) cached = value;
        return value;
    });
}
```

Alternative considered: `observable.box` + `runInAction`. Rejected — unnecessary complexity; a plain variable achieves the same "cache forever" behavior because MobX naturally stops tracking deps that aren't read.

**2. Register as `CORE.apiKey` token**

Add `apiKey: token<ComputedAtom<string | null>>(label("apiKey"))` to `CORE_TOKENS`. Bind in container init phase since it depends on `mainGate`.

**3. Remove `apiKey` from `MapsConfig`**

The static config no longer holds the key. `MapsConfig` keeps `id`, `name`, `showCurrentLocation`.

**4. Update consumers**

- `LocationResolverService.apiKey` computed → reads from injected atom `.get()`
- `MapsWidget.tsx` `mapsToken` prop → reads from atom via hook or passes through from LocationResolver (depends on whether view needs it directly)

## Risks / Trade-offs

- **[Closure mutation inside computed]** → Writing to a plain variable inside a computed is safe because MobX only tracks observable reads, not plain variable writes. The write is idempotent (set once, never again).
- **[Null initial state]** → Downstream consumers must handle `null`. The tile layer and geocoding already handle undefined keys gracefully (no-op until key arrives).
