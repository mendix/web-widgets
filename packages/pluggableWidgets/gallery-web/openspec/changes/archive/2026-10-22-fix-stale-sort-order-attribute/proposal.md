## Why

Gallery widget throws an uncaught MobX reaction error — `Sort order item: invalid attribute id '<id>'` — when the sort order restored from `datasource.sortOrder` on a subsequent app run/session references an attribute id that is no longer valid. Mendix attribute ids are per-build tokens that are regenerated on redeploy, so a sort order persisted in a personalization attribute (DB, per-user) can reference an id that no longer exists in the current build. Gallery forwards this restored sort order into `ListValue.setSortOrder()` without guarding against rejection, so the invalid id reaches the Mendix client runtime, `setSortOrder` throws synchronously inside a `fireImmediately` MobX reaction, and MobX surfaces it as an uncaught reaction exception that breaks the widget. Data Grid 2 does not exhibit this bug because it re-resolves restored sort state against its live columns before applying it (WC-3520).

## What Changes

- `QueryParamsService` (Gallery) guards the forwarding of sort order to `ListValue.setSortOrder()`: if the runtime rejects the sort order (invalid/stale attribute id), the error is caught and the query falls back to the default (unsorted) order instead of letting the exception escape the reaction.
- A `console.warn` is emitted on fallback so the reset is diagnosable in support scenarios, rather than failing silently or crashing.
- Add regression coverage in `gallery-web` proving a restored sort order with a stale attribute id no longer surfaces an uncaught reaction error and recovers to the default sort order.

## Capabilities

### New Capabilities

- `gallery-sort-order-validation`: Gallery-specific behavior that guards the application of a restored (persisted or props-provided) sort order to the datasource, recovering to the default sort order if the runtime rejects a sort instruction whose attribute id is no longer valid, mirroring the resilience Data Grid 2 already has.

### Modified Capabilities

_None — no existing `openspec/specs/` capability spec currently documents Gallery sort-order restoration behavior, so this is captured as a new capability rather than a delta._

## Impact

- `packages/pluggableWidgets/gallery-web/src/model/services/QueryParams.service.ts` — the fix site. The `sortOrder` reaction now forwards through a guarded `applySortOrder` helper (try/catch around `setSortOrder`, fall back to `undefined` on rejection).
- `packages/pluggableWidgets/gallery-web/src/model/services/__tests__/QueryParams.service.spec.ts` — new regression test.
- `packages/pluggableWidgets/gallery-web/CHANGELOG.md` — user-facing fix entry.
- No XML/property schema changes. No breaking changes to widget public API. No changes to shared packages (`widget-plugin-sorting`, `widget-plugin-grid`). Fix is defensive and localized to Gallery's `QueryParamsService`.
