## Why

The "Clear selection" JS action (used by both Data Grid 2 and Gallery) does not clear the
selection when the widget's `Keep selection` property is enabled. Keep selection always wins.

- **Observed**: With `Keep selection` on, invoking the `Clear_Selection` JS action empties the
  selection momentarily, but the previous selection is restored on the next datasource
  reconciliation. The user sees the selection stay put.
- **Expected**: An explicit clear action empties the selection, and keep selection continues to
  apply on subsequent paging/refresh. This matches the `Keep selection` property description:
  "selected items will stay selected unless cleared by the user or a Nanoflow."

## Root Cause

`createSelectionHelper.ts` installs an unconditional keep-selection predicate at helper creation:

```ts
if (config.keepSelection) {
    selection?.setKeepSelection(() => true);
}
```

`setKeepSelection` registers a predicate the Mendix runtime evaluates lazily during each
datasource reconciliation to decide whether to retain the prior selection. Because it returns
`true` unconditionally, the clear action's `setSelection([])` (in `helpers.ts`) is undone on the
next reconciliation — the runtime re-applies the kept selection. There is no path for the clear
action to make the predicate yield.

No existing test caught this: the test util (`SelectionMultiValueBuilder`) stubs
`setKeepSelection` as a no-op, so the keep-vs-clear interaction is never exercised.

## What Changes

Scope: `packages/shared/widget-plugin-grid` only. Both Data Grid 2 and Gallery inherit the fix
through the shared `createSelectionHelper` — no per-widget code changes.

- Replace the constant predicate with one backed by observable state owned by the selection
  helper: a stable `keepSelection` config flag plus a transient "retain now" observable the
  predicate reads live (`setKeepSelection(() => active.get())`).
- `clearSelection()` (Multi) and `remove()`/clear path (Single) drop the transient flag to
  `false` around `setSelection([])`, then re-arm it on the next datasource reconciliation — a
  `when` guard that compares the observed `selection` **reference** against the one snapshotted at
  clear time (the runtime schedules new props, so a fresh ref means the reconciliation ran and the
  runtime's keep decision is already past). This re-arms whether the reconciliation delivers an
  empty selection (clear landed) or a new one (the user re-selected before the clear landed).
- The keep flag and re-arm `when` live directly on each selection helper (`MultiSelectionHelper`,
  `SingleSelectionHelper`); no separate armer class. Install the predicate and manage the `when`
  disposer through the standard `setup()` host lifecycle instead of eagerly in
  `createSelectionHelper`.
- Make the test util capture the predicate so the interaction is testable.

## Impact

- **Widgets affected**: Data Grid 2 (`datagrid-web`), Gallery (`gallery-web`) — behavior only,
  no source changes in those packages.
- **API**: No public API change. `createSelectionHelper` signature unchanged (config still
  carries `keepSelection`).
- **Behavior**: Bug fix — clear action now wins over keep selection, then keep resumes. Not
  breaking; restores the documented contract.
- **Tests**: `widget-plugin-test-utils` `SelectionMultiValueBuilder` gains a real
  `setKeepSelection` capture (was a no-op stub).
