## 1. Test Setup

<!-- RED: Write failing tests first. Do NOT touch package.json in this phase. -->

- [x] 1.1 Add a `renderGoogleMap` marker fixture with no `url`, plus a helper that flushes pending promises inside `act` so `useMapsLibrary("marker")` resolves
- [x] 1.2 Write failing test: default marker (no `url`) constructs exactly one `PinElement` and that instance is `isConnected`
- [x] 1.3 Write failing test: `PinElement.prototype.element` getter is never accessed (install getter spy via `Object.defineProperty`, restore in `afterEach`)
- [x] 1.4 Confirm 1.2 and 1.3 both FAIL on the current `@vis.gl/react-google-maps@0.8.3` — record the failure output in design.md Notes
- [x] 1.5 Add edge case tests: custom-image marker renders `img` and constructs no `PinElement`; mixed list renders one pin and one `img`; current-location marker without `url` gets a pin
- [x] 1.6 Add edge case test: clicking a default pin opens an `InfoWindow` with the marker title
- [x] 1.7 Add regression tests: marker `onClick` fires for image markers; `fitBounds` called when `autoZoom` is true and `setCenter` when false

## 2. Implementation

<!-- GREEN: Make tests pass with minimal code -->

- [x] 2.1 Bump `@vis.gl/react-google-maps` from `^0.8.3` to `^1.9.0` in `package.json`, then run `pnpm install` from the repo root to regenerate `pnpm-lock.yaml`
- [x] 2.2 Confirm tests 1.2 and 1.3 now PASS with no changes to `src/components/GoogleMap.tsx` — if production source edits are required, STOP and re-scope rather than patching around the library
- [x] 2.3 Handle edge cases: get tests 1.5 and 1.6 green
- [x] 2.4 Review each of the six existing `asFragment()` snapshot diffs individually and attribute every change to the 1.x `Map` DOM restructure before regenerating with `pnpm run test -u`
- [x] 2.5 Verify no regressions: tests 1.7 green

## 3. Refactoring

<!-- REFACTOR: Clean up while keeping tests green -->

- [x] 3.1 Extract the shared pin-assertion setup (getter spy install/restore, promise flush) into a local helper in the spec to remove duplication across the new tests
- [x] 3.2 Consolidate marker fixtures so default, image and mixed cases derive from one factory instead of repeating literals
- [x] 3.3 Confirm no unused imports remain (`@googlemaps/jest-mocks` `mockInstances` and `PinElement` are both needed)

## 4. Verification

- [x] 4.1 All new tests passing
- [x] 4.2 Full test suite passes with no regressions — `pnpm run test` in `packages/pluggableWidgets/maps-web` (baseline before this change: 90 tests, 12 suites, 6 snapshots)
- [x] 4.3 `tsc --noEmit` clean after the `@types/google.maps` `^3.54.10` → `^3.64.0` move
- [x] 4.4 Build succeeds — `pnpm turbo build` in the widget package
- [x] 4.5 Manual browser check with a real Google Maps API key: default pins render, console shows no `<gmp-pin>` deprecation warning, and two Maps widgets on one page both initialise (covers the new `@googlemaps/js-api-loader` script path)
- [x] 4.6 Add a CHANGELOG.md entry under `[Unreleased]` describing widget-visible behaviour only — no implementation detail, no dependency names
- [x] 4.7 Code review ready (pending 4.5)

## Notes

<!-- Track test failures, refactoring decisions, blockers. -->

- Do not hand-edit `pnpm-lock.yaml`; it is generated. Repo constraint forbids modifying lockfiles directly, so let `pnpm install` produce it.
- `@mendix/maps-web` is the sole consumer of `@vis.gl/react-google-maps` in the monorepo and no root `pnpm.overrides` entry pins it, so the bump cannot affect other packages.
- Formatting and linting run automatically on edit via Claude Code hooks. Do not invoke `prettier --write` or `pnpm run lint` manually.
- Version bumps in `package.json` `version` field happen at release time, not here. Only the dependency range changes.
- The bump broke `pnpm run build` (`TS2503: Cannot find namespace 'google'`). `1.9.0` bundles its type declarations and dropped the `/// <reference types="google.maps" />` that `0.8.3` leaked to consumers. Fixed by adding `@types/google.maps` to `devDependencies` and `"google.maps"` to `tsconfig.json` `types`. Confirmed bump-caused by reverting to `^0.8.3` and rebuilding green. See design.md.
- `1.9.0`'s `APIProvider` calls `google.maps.Settings.getInstance()`, which `@googlemaps/jest-mocks` does not provide. Stubbed in the spec's `beforeEach`.
- Task 4.5 was run manually by the developer on 2026-08-28 against a real Google Maps API key in Studio Pro and passed. It could not be automated from the agent environment.
- Final state: 99 tests / 12 suites / 6 snapshots green (baseline 90), `tsc --noEmit` clean, `pnpm run build` green, no `src/` changes.
