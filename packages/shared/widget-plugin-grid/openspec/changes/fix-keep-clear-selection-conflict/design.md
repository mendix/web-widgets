## Test Cases

Tests live in `packages/shared/widget-plugin-grid/src/selection/__tests__/` (Jest). The keep
predicate is exercised via the updated `SelectionMultiValueBuilder`, which must capture the
function passed to `setKeepSelection` and expose it (e.g. `getKeepSelectionPredicate()`).

### Reproduction Tests

- clear-beats-keep (multi) - Clear empties selection even when keep is enabled (unit)
    - **Given**: A `MultiSelectionHelper` created with `keepSelection: true`, `setup()` run, and
      two items selected.
    - **When**: `clearSelection()` is called.
    - **Then**: `selection.setSelection([])` was called AND, at the moment of the
      reconciliation, the captured keep predicate returns `false` (i.e. the runtime would not
      restore). Selection ends empty.

- clear-beats-keep (single) - Clear/remove empties single selection when keep is enabled (unit)
    - **Given**: A `SingleSelectionHelper` created with `keepSelection: true`, `setup()` run, one
      item selected.
    - **When**: the clear path (`remove()`) is called.
    - **Then**: `setSelection(undefined)` called and the keep predicate returns `false` during
      the clear cycle.

### Edge Cases

- keep-resumes-after-clear - Keep selection re-arms after a clear completes (unit)
    - **Given**: keep enabled, items selected, `clearSelection()` called.
    - **When**: a datasource reconciliation delivers a new selection ref (the `when` guard fires
      on ref change).
    - **Then**: the keep predicate returns `true` again, so a subsequent datasource update would
      retain selection.

- rearm-on-reselect - Keep re-arms even if the user re-selects before the clear lands (unit)
    - **Given**: keep enabled, items selected, `clearSelection()` called (keep now yields).
    - **When**: the next reconciliation delivers a _non-empty_ new selection (the user picked a
      different item before the empty selection ever arrived).
    - **Then**: the keep predicate returns `true` — re-arm keys off the reconciliation (ref
      change), not off emptiness, so the new selection is retained on later paging/refresh.

- double-clear-reentrancy - Two clears before the first reconciliation lands do not leave keep off (unit)
    - **Given**: keep enabled, `clearSelection()` called twice in succession.
    - **When**: the next reconciliation delivers a new selection ref.
    - **Then**: the earlier pending `when` is disposed, exactly one re-arm occurs, and the
      predicate returns `true` at the end.

- clear-without-keep - Clear behaves as today when keep is disabled (unit)
    - **Given**: helper created with `keepSelection: false`.
    - **When**: `clearSelection()` is called.
    - **Then**: `setSelection([])` called, no keep predicate installed, no `when` watcher created.

- dispose-mid-clear - Pending re-arm watcher is cleaned up on teardown (unit)
    - **Given**: keep enabled, `clearSelection()` called, next reconciliation not yet observed.
    - **When**: the disposer returned by `setup()` runs.
    - **Then**: the pending `when` is disposed; no reaction leaks (no re-arm fires afterwards).

### Regression Tests

- existing selection ops unchanged - `selectAll`, `selectNone`, `add`, `remove`, range select,
  `selectionStatus` keep current behavior (unit) — existing `helpers.spec.ts` cases remain green.
    - **Given**: existing selection helper specs.
    - **When**: run after the change.
    - **Then**: all pass unchanged.

- predicate installed once - keep predicate is installed via `setup()`, not the constructor (unit)
    - **Given**: helper created with `keepSelection: true` but `setup()` not yet called.
    - **When**: constructor completes.
    - **Then**: `setKeepSelection` has not been called; calling `setup()` installs it.

## Notes

- Correctness hinges on the transient flag staying `false` long enough to cover the runtime's
  restore. The re-arm fires on the next reconciliation (a new `selection` ref), which is
  necessarily _after_ the runtime has already made its keep decision for that reconciliation — so
  re-arm can never let keep win over the clear it is paired with. This is a Mendix runtime timing
  detail not fully verifiable from unit tests; a manual/E2E verification in the real widget is
  planned (drive a JS clear-selection action with keep enabled) before merge.
- Re-arm compares the observed `selection` **reference** to the one captured at clear time rather
  than inspecting emptiness. Reason: the user may re-select a different item before the empty
  selection ever reconciles; keying off "empty" would strand keep in the `false` state and drop
  that new selection on the next page/refresh. A ref change is the reconciliation signal itself,
  independent of the resulting selection contents.
- The keep flag (`keepActive` observable) and the re-arm `when` live directly on each helper; no
  separate class. `beforeClear()` snapshots the current ref, drops the flag, and installs a fresh
  `when` (disposing any prior pending one, covering re-entrant/double clears).
