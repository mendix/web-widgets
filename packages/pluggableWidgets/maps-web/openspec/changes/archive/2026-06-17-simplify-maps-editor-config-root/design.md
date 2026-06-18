## Context

The Maps widget `getProperties()` function in `Maps.editorConfig.ts` contains branching logic for `platform === "desktop"` vs `"web"`. This separation no longer exists — Studio Pro uses a single editor. The `advanced` boolean property gates visibility of `mapProvider` and marker style options, adding unnecessary friction. The static `apiKey` string field should be deprecated in favor of the expression-based `apiKeyExp`.

Current `getProperties()` flow:

```
if (platform === "desktop") {
    // show/hide apiKey vs apiKeyExp (static priority)
    // hide "advanced" prop itself
} else {
    // show/hide apiKey vs apiKeyExp (expression priority)
    // gate mapProvider and marker styles behind "advanced"
}
```

## Goals / Non-Goals

**Goals:**

- Single unified property visibility logic (no platform branching)
- Remove `advanced` property — all options always visible
- `apiKeyExp` always visible (never hidden)
- Deprecation warning when `apiKey` (static string) is used

**Non-Goals:**

- Removing `apiKey` from XML entirely (backward compatibility — existing apps use it)
- Changing runtime behavior (how the key is resolved at runtime stays the same)
- Touching `geodecodeApiKey` / `geodecodeApiKeyExp` show/hide logic beyond removing platform branching

## Decisions

**1. Remove `advanced` from XML entirely**

The property serves no purpose once all options are always shown. Removing it from XML means Mendix will ignore any persisted value in existing apps — no migration needed. The widget typings will regenerate without it.

Alternative considered: Keep in XML but ignore it. Rejected — dead props confuse future developers.

**2. Unified apiKey/apiKeyExp visibility logic**

After removing platform branching, the logic becomes:

- `apiKeyExp` is always shown (never hidden)
- Hide `apiKey` if falsy, show otherwise

This preserves backward compat: users with only `apiKey` set still see their field, plus the new expression field.

**3. Deprecation via `check()` warning**

Add a `"warning"` severity problem in the `check()` function when `values.apiKey` is non-empty. Message directs users to use `apiKeyExp` instead. Using `check()` (not `getProperties()`) because that's where validation problems are surfaced in Studio Pro.

**4. Marker style visibility — always show**

Currently gated behind `!values.advanced` on web platform. After removing `advanced`, `markerStyle`/`customMarker` and `markerStyleDynamic`/`customMarkerDynamic` are always visible (conditional on `markerStyle === "image"` for the custom image field stays).

## Risks / Trade-offs

- **[Breaking: `advanced` prop removed]** → Existing apps with `advanced: true` silently lose the property. No runtime impact — it was editor-only. Studio Pro handles missing props gracefully.
- **[Deprecation noise]** → Users with static `apiKey` see a new warning. This is intentional nudge, not an error. Using `"warning"` severity, not `"error"`.
