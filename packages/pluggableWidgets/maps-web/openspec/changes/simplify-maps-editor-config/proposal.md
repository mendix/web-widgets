## Why

The Maps widget editor config still has a web/desktop platform split that no longer exists in modern Studio Pro. This adds dead code paths and hides useful properties (like `mapProvider`) behind an "advanced" toggle that confuses users. Additionally, `apiKey` (static string) should be deprecated in favor of `apiKeyExp` (expression) for flexibility.

## What Changes

- **BREAKING**: Remove the `advanced` boolean property from XML and editor config. Properties gated behind it (`mapProvider`, marker styles) become always visible.
- Remove the platform `"web"` / `"desktop"` conditional branching in `getProperties()`. All property visibility logic uses a single unified path.
- Stop hiding `apiKeyExp` — it is always shown as the primary API key field.
- Add a deprecation warning when the static `apiKey` property has a value, guiding users to use the `apiKeyExp` expression field instead.

## Capabilities

### New Capabilities

- `editor-config-simplified`: Unified property visibility logic without platform branching, removal of `advanced` toggle, and `apiKey` deprecation warning.

### Modified Capabilities

_(none — no existing specs)_

## Impact

- `src/Maps.xml` — remove `advanced` property definition
- `src/Maps.editorConfig.ts` — rewrite `getProperties()` logic, add deprecation check to `check()`
- `typings/MapsProps.d.ts` — regenerated (loses `advanced` prop)
- Any container/config code referencing `props.advanced` (likely none beyond editor config)
