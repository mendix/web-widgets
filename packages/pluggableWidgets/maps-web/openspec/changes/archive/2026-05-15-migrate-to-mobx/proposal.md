# Migrate Maps Widget to MobX Container Pattern

## Why

Current hook-based state management (`useLocationResolver`) is tightly coupled to React lifecycle, difficult to test in isolation, and inconsistent with gallery widget's MobX container pattern.

## What Changes

Replace `useLocationResolver` hook with MobX container architecture:

- `MapsContainer` + `LocationResolver` service for state management
- `createMapsContainer` factory using brandi DI (matches gallery pattern)
- Observable marker resolution with caching
- `useMapsContainer` hook for React integration

## Impact

- **Affected**: `Maps.tsx`, `utils/geodecode.ts`
- **New**: `src/model/` directory (tokens, containers, services, hooks)
- **Dependencies**: `@mendix/widget-plugin-mobx-kit`, `brandi`, `brandi-react`, `mobx`
- **Breaking**: None (internal refactor only)
