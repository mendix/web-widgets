## 1. Test Setup

<!-- RED: Write failing tests first -->

- [x] 1.1 Update `SelectionMultiValueBuilder` (and single builder if present) in
      `widget-plugin-test-utils` to capture the `setKeepSelection` predicate and expose it
- [x] 1.2 Write failing test: clear-beats-keep for multi selection (predicate returns `false`
      during the clear cycle, selection ends empty)
- [x] 1.3 Write failing test: clear-beats-keep for single selection (`remove()` path)
- [x] 1.4 Add edge-case tests: keep-resumes-after-clear, rearm-on-reselect,
      double-clear-reentrancy, clear-without-keep, dispose-mid-clear
- [x] 1.5 Add regression test: predicate installed via `setup()`, not constructor

## 2. Implementation

<!-- GREEN: Make tests pass with minimal code -->

- [x] 2.1 Add `keepSelection` (stable config) + `keepActive` (observable box) state directly to
      `MultiSelectionHelper`; pass `keepSelection` in via constructor
- [x] 2.2 Implement `setup()` on the helper: install `setKeepSelection(() => keepActive.get())`
      when configured; return disposer that cancels any pending re-arm `when`
- [x] 2.3 Update `clearSelection()` to snapshot the current `selection` ref, drop `keepActive`,
      `setSelection([])`, then re-arm via `when(() => selectionValue !== clearedRef, () =>
keepActive.set(true))` guarded by the config flag
- [x] 2.4 Apply the same flag + re-arm logic to `SingleSelectionHelper` clear path (`remove()`)
- [x] 2.5 Update `createSelectionHelper.ts`: pass `config.keepSelection` to constructors, remove
      the unconditional `setKeepSelection(() => true)`, and `host.add(helper)`
- [x] 2.6 Delete `KeepSelectionArmer.ts` and remove `onReconcile` calls from `updateProps`
- [x] 2.7 Verify no regressions in existing selection specs

## 3. Refactoring

<!-- REFACTOR: Clean up while keeping tests green -->

- [x] 3.1 Clean up implementation; ensure re-entrancy disposer handling is clear (dispose prior
      pending `when` on each `beforeClear`)
- [x] 3.2 Keep the inlined keep/clear logic minimal and consistent across Multi and Single

## 4. Verification

- [x] 4.1 All tests passing (including new tests) — `pnpm run test` in `widget-plugin-grid`
- [x] 4.2 Full test suite passes for `datagrid-web` and `gallery-web` (no regressions) —
      selection-touching suites (row-interaction, item-keyboard) all green; the remaining failing
      suites fail identically on clean `main` due to a pre-existing dual-mendix-version type
      conflict (10.24 vs 11.10) in test helpers, unrelated to this change
- [ ] 4.3 Manual/E2E verify: drive `Clear_Selection` JS action with `Keep selection` enabled in a
      real widget; confirm selection clears and keep resumes on next page change
- [x] 4.4 Add per-widget CHANGELOG entries for `datagrid-web` and `gallery-web`
- [x] 4.5 Code review ready (clean, documented)

## Notes

<!-- Track test failures, refactoring decisions, blockers. -->

- Runtime timing (does the re-arm fire before/after the runtime's keep restore?) is
  the main risk; task 4.3 is the gate that confirms the unit-level approach holds in the real
  runtime.
- Final design: the keep logic is inlined into each helper (no separate class). `beforeClear()`
  snapshots the current `selection` ref, drops the `keepActive` flag, and installs a
  `when(() => selectionValue !== clearedRef, () => keepActive.set(true))`. Rationale: the runtime
  does not mutate the selection in place on `setSelection([])`; it schedules new props, so the
  next reconciliation delivers a fresh `selectionValue` ref. Comparing the ref (rather than
  inspecting emptiness) re-arms on the reconciliation signal itself — correct whether the delivered
  selection is empty (clear landed) or a new selection (the user re-selected before the empty
  landed). Emptiness-based re-arm would strand keep off in the re-select case. The `when`
  self-disposes after firing; `beforeClear()` disposes any prior pending `when` (double/re-entrant
  clears), and `setup()`'s disposer cancels a pending `when` on teardown.
