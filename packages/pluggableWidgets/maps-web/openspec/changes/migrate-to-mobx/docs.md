## Documentation Changes

This is an internal refactoring with no user-facing changes. No external documentation updates needed.

## API Changes

**No external API changes.** This refactoring is internal to the widget implementation.

**Internal API changes:**

- Added `useMapsContainer` hook for accessing the container
- Created dependency injection tokens in `src/model/tokens.ts`
- New `createMapsContainer` factory function

## Behavior Changes

**No user-facing behavior changes.** The widget functions identically to before - this migration maintains backward compatibility.

The only observable difference is that Maps.tsx now wraps content with `ContainerProvider`, but this is transparent to widget users.

## Migration

**No migration needed.** This is a non-breaking internal refactoring.

Widget users (Mendix developers using the Maps widget in Studio Pro) experience no changes and require no code updates.

## Examples

Widget usage remains unchanged:

```xml
<!-- Usage in Mendix Studio Pro - unchanged -->
<maps name="myMap" apiKey="..." markers="[...]" zoom="automatic" />
```

## Internal Documentation

### Architecture Documentation

The maps widget now follows the container pattern used by gallery-web:

**New Structure:**

```
src/model/
├── tokens.ts                    # DI tokens
├── configs/Maps.config.ts       # Configuration
├── containers/
│   ├── Root.container.ts        # Shared bindings
│   ├── Maps.container.ts        # Main container
│   └── createMapsContainer.ts   # Factory
├── services/
│   └── MapsSetup.service.ts     # Setup lifecycle
├── hooks/
│   └── useMapsContainer.ts      # React hook
└── models/
    └── (future location models)
```

**Key Patterns:**

- Brandi for dependency injection
- MobX for reactive state (foundation laid for future use)
- GateProvider for props reactivity
- Container isolation per widget instance

### Code Comments

Existing `useLocationResolver` hook remains in `geodecode.ts` for backward compatibility. It will be deprecated in a future change once LocationResolver service is fully implemented with MobX atoms.

### Testing Documentation

**Test Coverage:**

- Container creation and initialization: 4 tests
- LocationResolver service (geocoding logic): 5 tests
- React hook behavior: 2 tests
- Integration with Maps component: 2 tests

**Total:** 13 tests passing, validating the container architecture works correctly.

### README Updates

No README updates needed - this is an internal implementation detail not visible to widget consumers.
