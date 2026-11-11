## 1. Implement guard in QueryParamsService

- [x] 1.1 Route the `sort.sortOrder` reaction handler through a private `applySortOrder(sortOrder)` helper instead of calling `this.query.setSortOrder` directly.
- [x] 1.2 In `applySortOrder`, wrap `this.query.setSortOrder(sortOrder)` in try/catch; on rejection, call `this.query.setSortOrder(undefined)` to fall back to the default order.
- [x] 1.3 Emit a `console.warn` on the catch path explaining the sort order was ignored because it references an attribute that is no longer available, including the caught error.
- [x] 1.4 Add a code comment referencing WC-3520 and the attribute-id-regeneration-on-redeploy root cause.

## 2. Regression test (QueryParams.service.spec.ts)

- [x] 2.1 Build a `queryStub(validIds)` whose `setSortOrder` throws `Sort order item: invalid attribute id '<id>'` for any id not in `validIds`, mirroring the Mendix runtime.
- [x] 2.2 Register an `onReactionError` hook and assert it collected no errors — a plain `expect(...).not.toThrow()` gives a FALSE GREEN because MobX swallows reaction exceptions.
- [x] 2.3 Test: valid sort order is applied to the query unchanged.
- [x] 2.4 Test: a stale/invalid attribute id does not surface a reaction error.
- [x] 2.5 Test: on an invalid id, the query recovers to the default order (`query.applied.at(-1)` is `undefined`).
- [ ] 2.6 Run `cd packages/pluggableWidgets/gallery-web && pnpm run test -t "QueryParamsService"` and confirm all three pass; confirm the suite is RED before the Task 1 fix and GREEN after.

## 3. Widget-level verification

- [x] 3.1 A/B verified against a real test project: crash reproduces without the fix, does not with it. (Initial local MIRA project could not reproduce — storage attribute set to none, no login, no data — so a proper repro project was used.)
- [x] 3.2 Confirm no XML/property schema changes are needed (none — fix is internal to `QueryParamsService`).

## 4. Release hygiene

- [ ] 4.1 Confirm `gallery-web` package.json version bump (patch) is present for the release.
- [x] 4.2 Add a `CHANGELOG.md` entry for `gallery-web` describing the user-facing fix.
- [ ] 4.3 Confirm lint/build pass for `gallery-web` (auto-lint hook runs on edit; verify no outstanding errors).
