# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Maps widget for Mendix, a pluggable widget that displays locations on interactive maps using either Google Maps or Leaflet/OpenStreetMap. It's part of the larger Mendix web-widgets monorepo.

## Commands

### Development

- `pnpm dev` - Start development server with hot reload
- `pnpm start` - Start Mendix project server

### Build & Release

- `pnpm build` - Build the widget (.mpk file)
- `pnpm release` - Create production release

### Testing & Quality

- `pnpm lint` - Run ESLint on source files
- `pnpm test` - Run Jest unit tests
- `pnpm e2e` - Run Playwright E2E tests in CI mode
- `pnpm e2edev` - Run E2E tests in development mode with preparation steps
- `pnpm verify` - Verify package format

### Formatting

- `pnpm format` - Auto-format code with Prettier

## Architecture

### Widget Structure

The Maps widget follows the Mendix pluggable widget architecture:

- **Maps.tsx** - Main widget container that handles props from Mendix and manages state
- **MapSwitcher.tsx** - Routes between Google Maps and Leaflet implementations based on configuration
- **GoogleMap.tsx** / **LeafletMap.tsx** - Provider-specific map implementations

### Key Features

- Supports multiple map providers (Google Maps, OpenStreetMap via Leaflet, Mapbox, HERE)
- Dynamic markers from Mendix data sources
- GeoJSON feature support for overlays and shapes
- Geocoding for address-to-coordinate conversion
- Current location display
- Customizable zoom, controls, and map behavior

### Data Flow

1. Widget receives configuration and data from Mendix via props (defined in Maps.xml)
2. `useLocationResolver` hook processes markers and handles geocoding if needed
3. `useGeoJSONResolver` hook processes GeoJSON features
4. Map components render locations with appropriate provider SDK

### Testing Strategy

- Unit tests in `src/components/__tests__/` using Jest and React Testing Library
- E2E tests in `e2e/` directory for each map provider
- Tests use `@googlemaps/jest-mocks` for Google Maps API mocking

## Monorepo Context

This widget is part of a pnpm workspace monorepo:

- Root commands affect all packages: `pnpm lint`, `pnpm test`, `pnpm build`
- Widget-specific commands run from this directory
- Shared configurations from `packages/shared/` packages
- Uses `@mendix/pluggable-widgets-tools` for build tooling

## Important Conventions

### Mendix Widget Development

- Property names in Maps.xml must match TypeScript prop types (lowerCamelCase)
- Always check `ActionValue.canExecute` before calling `execute()`
- Handle loading states for Mendix data sources
- Widget ID must be unique across the project

### Code Style

- TypeScript with strict mode enabled
- React functional components with hooks
- SCSS modules for styling following Atlas UI patterns
- No inline styles; use classNames for conditional styling

### Version Management

- Update version in package.json for any runtime changes
- Update CHANGELOG.md following Keep a Changelog format
- Semver: patch for fixes, minor for features, major for breaking changes
