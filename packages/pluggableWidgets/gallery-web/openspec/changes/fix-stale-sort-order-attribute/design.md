## Context

Gallery seeds its sort state directly from `props.datasource.sortOrder` when the widget is (re)constructed:

- `Gallery.container.ts` (`_04_sortBindings.init`) binds `GY.sortHostConfig` to `{ initSort: props.datasource.sortOrder }`, which flows into `SortStoreHost`.
- `QueryParamsService.setup()` runs a MobX `reaction` with `fireImmediately: true` on `this.sort.sortOrder` and forwards whatever it contains straight to `this.query.setSortOrder(sortOrder)` (`Datasource.service.ts`), which ultimately calls the Mendix client's `ListValue.setSortOrder()`.
- Mendix attribute ids (e.g. `attr_kaf_3`) are per-build tokens regenerated on every redeploy. A sort order persisted per-user in a personalization attribute (DB storage) therefore survives across redeploys but its attribute ids do not.
- If the restored `sortOrder` contains an attribute id that is not present in the _current_ build's attribute set, `ListValue.setSortOrder()` throws `Sort order item: invalid attribute id '<id>'` synchronously inside the `fireImmediately` reaction — MobX catches it as an uncaught reaction exception (`onReactionError`), matching the WC-3520 stack trace exactly.

Data Grid 2 does not have this bug because its `ColumnGroupStore.setColumnSettings` drops unknown `columnId`s (with a warning) and its `sortInstructions` getter re-resolves through the live columns before the sort state is ever applied. Gallery has no equivalent live re-resolution step for the props-provided `initSort` path.

**Important lifecycle finding (why the fix is not in `SortOrderStore`):** In the reported repro (MIRA project, empty filter placeholder → no DropdownSort widget configured), `SortStoreHost._store` is `null`, so `SortOrderStore` is never instantiated. The stale sort order flows from `initSort` through the host straight into the `QueryParamsService` reaction, bypassing `SortOrderStore` entirely. A sanitize-on-read fix inside `SortOrderStore` (validated against its `options`) would therefore **never fire** in this configuration — the crash would survive. A diagnostic loop confirmed the stale id reaches `setSortOrder` regardless of whether a sort widget exists. The fix must sit at the choke point every sort path funnels through: the `QueryParamsService` reaction.

## Goals / Non-Goals

**Goals:**

- Prevent an uncaught MobX reaction exception when a restored sort order references an attribute id the current build's runtime rejects — with or without a configured sort widget.
- Recover to a usable state (default/unsorted order) so the Gallery renders instead of breaking.
- Emit a diagnosable signal (`console.warn`) on fallback for support.
- Add a regression test at the correct seam (`QueryParamsService`) proving no reaction error surfaces and the query recovers to the default sort order.

**Non-Goals:**

- Not changing the Mendix client runtime's `ListValue.setSortOrder()` validation behavior itself (out of repo scope) — this fix guards on the sending side only.
- Not changing Data Grid 2's sort behavior (it is already resilient).
- Not addressing _why_ the persisted `sortOrder` contains a stale id (attribute-id regeneration on redeploy is expected Mendix build behavior) — that is outside this widget's control.
- Not changing the persisted personalization storage format (`toJSON`/`fromJSON` in `SortOrderStore`), which already stores indexes rather than raw attribute ids and is proven not to be the leak.
- Not changing shared packages (`widget-plugin-sorting`, `widget-plugin-grid`).

## Decisions

1. **Guard at the `QueryParamsService` sort reaction, not in `SortOrderStore`.**
   The reaction that forwards `sort.sortOrder` → `query.setSortOrder` is the single choke point every sort path passes through, whether or not a DropdownSort widget (and therefore a `SortOrderStore`) exists. The reported repro has no sort widget, so a `SortOrderStore`-level fix would not execute (see Context). Guarding at the reaction is robust to the provenance of the sort order.
   Alternative considered and rejected: sanitize-on-read in `SortOrderStore.sortOrder`. Rejected because it does not cover the no-sort-widget path (the actual repro configuration), and it validates against the store's `options`, which are empty/absent in that configuration.

2. **try/catch around `setSortOrder`, fall back to `undefined` (default order) on rejection.**
   The runtime is the authority on which attribute ids are valid for the current build; catching its rejection is a precise signal (no need to independently re-derive the valid-id set in the widget). On rejection, applying `undefined` clears to the datasource's default order, which is guaranteed valid.

3. **Emit `console.warn` on fallback, not silent drop.**
   Unlike Data Grid 2's silent column-drop, this path is a genuine runtime rejection of persisted state. A warning makes the "why did my sort reset?" support question answerable from the browser console without being user-facing UI noise. It fires only on the (rare) rejection path, not on normal lifecycle transitions.

4. **No change to `Datasource.service.ts` / shared plumbing.**
   The `setSortOrder` pass-through there is generic and shared. The guard belongs in Gallery's own `QueryParamsService`, keeping the fix localized and avoiding behavior changes for other consumers.

## Risks / Trade-offs

- [Risk] Falling back to the default order means a user whose entire persisted sort is stale sees unsorted data on first load after a redeploy.
  → Mitigation: applying the stale order would have crashed the widget entirely; recovering to default is strictly better. The next legitimate sort action re-persists valid ids. No behavior change for the common all-valid case.

- [Risk] A partially-stale sort order (one valid + one stale instruction) is dropped wholesale to `undefined` rather than keeping the valid instruction.
  → Mitigation: the runtime rejects the whole `setSortOrder` call atomically, so per-instruction salvage is not available at this seam without re-implementing the runtime's validation. Wholesale fallback is the safe, simple choice; partial salvage is a possible future enhancement if support data shows it matters.

- [Risk] `console.warn` on every render if the reaction re-fires with a stale value.
  → Mitigation: the reaction only fires on `sort.sortOrder` change; once fallback applies `undefined`, `sortOrder` settles and does not re-trigger. The warning fires once per stale restore, not per render.

## Migration Plan

No data migration needed (in-memory-only defensive fix, no schema/persisted-format change). Standard PR flow:

1. Add regression test at `QueryParams.service.spec.ts` proving a stale attribute id no longer surfaces a reaction error and the query recovers to the default order. (Uses `onReactionError` to assert no uncaught reaction exception — a plain `not.toThrow()` gives a false green because MobX swallows reaction errors.)
2. Implement the guarded `applySortOrder` in `QueryParamsService`.
3. Run the full `gallery-web` test suite.
4. Bump semver (patch) and add `CHANGELOG.md` entry for `gallery-web` (user-facing bug fix) per repo convention.
5. Rollback: revert the single commit/PR; no persisted state or migration to unwind.

## Open Questions

- Should a partially-stale sort order salvage the valid instructions rather than falling back wholesale to default? Deferred pending support data — the runtime rejects atomically, so this needs per-instruction pre-validation to implement.
- Verified against a real repro: the crash reproduces without the fix and does not with it. (The initial local MIRA project could not be made to reproduce — storage attribute set to none, no login, no data — so a proper repro project was used to confirm.)
