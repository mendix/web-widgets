# Datagrid-web Reorganization — Migration Task List

> Companion to [`architecture-reorganization.md`](./architecture-reorganization.md).
> Ordered, incremental, each phase independently shippable. **Do not batch phases into one PR.**
>
> **Global rules for every task**
> - Move files, don't rewrite. Prefer IDE "Move" / a codemod so imports update mechanically.
> - After each task: `pnpm run test` and `pnpm exec tsc --noEmit` must pass; snapshots unchanged
>   (or intentionally re-generated with `pnpm run test -u` and reviewed).
> - Do not touch `dist/`, generated files, or `@mendix/widget-plugin-*` package sources.
> - One phase = one PR. Keep diffs move-only where possible so review stays tractable.

---

## Phase 0 — Guardrails first (no moves yet)

- [ ] **0.1 Snapshot the current graph.** Run the DI graph + a module-import graph and attach
      both to the tracking issue, so cycles are visible before/after.
      _Verify:_ images generated. _Accept:_ four cycles from §2.3 are visible in the "before".
- [ ] **0.2 Baseline green.** Record current `pnpm run test` + `tsc --noEmit` + E2E status.
      _Accept:_ known-good baseline captured; any pre-existing failures noted so they aren't
      blamed on the refactor.
- [ ] **0.3 Add a path alias** (e.g. `@dg/*` → `src/*`) in `tsconfig.json` + jest `moduleNameMapper`,
      OR confirm relative imports only. Decide the import style ONCE up front.
      _Accept:_ a trivial move (one file) resolves under the chosen scheme in both `tsc` and jest.

---

## Phase 1 — `shared/` leaves (very low risk)

Pure leaf move. `typings/` and `ui/` import nothing of ours; `utils/` imports only helpers+typings.

- [ ] **1.1** `typings/` → `shared/types/`
      (`CellComponent.ts`, `GridColumn.ts`, `personalization-settings.ts`, `sorting.ts`, `static-info.ts`)
- [ ] **1.2** `ui/` → `shared/ui/` (`DatagridPreview.scss`) and move `components/icons/`, `components/loader/`,
      `components/PseudoModal.tsx` into `shared/ui/` too (they are presentation primitives, not features).
- [ ] **1.3** `utils/` → `shared/utils/` (`columns-hash.ts`, `test-utils.tsx`).
- [ ] **1.4** Update all import paths (mechanical).
      _Verify:_ `pnpm exec tsc --noEmit && pnpm run test`. _Accept:_ `shared/` imports nothing from
      `features/ | composition/ | shell/`; only leaves remain.

---

## Phase 2 — Dissolve `helpers/` (low risk, removes `model ↔ helpers` cycle)

Every file in `helpers/` is stateful domain code or feature UI. Home each in its owning feature.

- [ ] **2.1** Create `features/columns/` and move:
      `helpers/state/ColumnGroupStore.ts`, `helpers/state/column/ColumnStore.tsx`,
      `helpers/state/column/BaseColumnInfo.ts`, `helpers/ColumnBase.ts`, `helpers/ColumnPreview.tsx`,
      and `helpers/state/GridBasicData.ts`.
- [ ] **2.2** Create `features/sorting/` and move `helpers/state/ColumnsSortingStore.ts`.
- [ ] **2.3** Create `features/filtering/` and move `helpers/state/column/ColumnFilterStore.tsx`.
- [ ] **2.4** Create `features/personalization/` and move `helpers/state/GridPersonalizationStore.ts`
      + the whole `helpers/storage/` dir (`AttributePersonalizationStorage.ts`,
      `LocalStoragePersonalizationStorage.ts`, `PersonalizationStorage.ts`).
- [ ] **2.5** Move `helpers/useDataGridJSActions.ts` to the feature that owns JS-actions
      (likely `features/row-interaction/` — confirm by its imports).
- [ ] **2.6** Delete the now-empty `helpers/` directory.
      _Verify:_ `pnpm exec tsc --noEmit && pnpm run test`. _Accept:_ `helpers/` no longer exists;
      `git grep -n "helpers/"` in `src` returns nothing; no store lives outside a feature.

---

## Phase 3 — Split `tokens.ts` + co-locate DI wiring (the real work; removes `model ↔ features` cycle)

The single highest-leverage change. The container already has `_01`…`_09` binding groups
(`model/containers/Datagrid.container.ts`) — relocate each next to its feature.

- [ ] **3.1** For each feature, create a local `<feature>.tokens.ts` holding only that feature's
      tokens; move them out of `model/tokens.ts`. Suggested split by binding group:
      `_01 core→ data/columns`, `_02 filter→ filtering`, `_03 loader→ data`,
      `_04 emptyState→ empty-state`, `_05 personalization→ personalization`,
      `_06 pagination→ pagination`, `_07 selection→ selection`, `_08 rowInteraction→ row-interaction`,
      `_09 selectAll→ selection`.
- [ ] **3.2** Move each `_0N_*Bindings` group into a `<feature>.container.ts` beside its feature,
      exporting a `BindingGroup`. `Datagrid.container.ts` now imports and composes the groups
      instead of defining them.
- [ ] **3.3** Co-locate the per-feature `injection-hooks.ts` (already exists for empty-message,
      select-all, selection-counter) with each feature; move the relevant hooks out of the central
      `model/hooks/injection-hooks.ts`. Central file keeps only cross-feature hooks.
- [ ] **3.4** Shrink the central token file to cross-feature tokens only
      (`mainGate`, `config`, `setupService`, and other genuinely shared ones).
      _Verify:_ `pnpm exec tsc --noEmit && pnpm run test`; re-run the DI graph.
      _Accept:_ `model/tokens.ts` (or its successor) no longer imports from `features/`;
      the `model ↔ features` cycle is gone in the regenerated graph.

> ⚠️ **Highest-risk task in the whole plan.** DI resolution + `postInit` activation order
> (see reorg doc §2.3 / earlier review) is order-sensitive. After 3.2, explicitly verify the
> boot sequence: `paramsService` and `gridSizeStore` still eager-created; `selectionHelper`
> not resolved before its `postInit` rebind. Add a container smoke test (Phase 5.2) BEFORE
> merging this phase if one doesn't exist.

---

## Phase 4 — `composition/` + `shell/` (medium risk)

- [ ] **4.1** Create `composition/` and move `model/containers/*` → `composition/container/`,
      `model/hooks/useDatagridContainer.ts` + `useInfiniteControl.tsx` → `composition/react/`,
      the shrunk central tokens → `composition/tokens.ts`.
      Note: gate/setup primitives stay in `@mendix/widget-plugin-mobx-kit` — do **not** create a
      local kernel. `MainGateProvider.service.ts` (the local gate *instance*) → `composition/`.
- [ ] **4.2** Distribute remaining `model/`: `models/rows.model.ts` + `services/Datasource*`,
      `DerivedLoaderController` → `features/data/`; `services/SelectionGate` → `features/selection/`;
      `services/Texts.service` → `shared/` or `composition/` (cross-feature); `models/columns.model.ts`
      → `features/columns/`; `models/grid.model.ts` → `shell/` or `features/columns/` (by usage);
      `stores/PageSize.store.ts` → `features/pagination/`; `stores/GridSize.store.ts` → `shell/` or
      `features/columns/`; `configs/Datagrid.config.ts` → `composition/`. Delete empty `model/`.
- [ ] **4.3** Create `shell/` and move the frame components from `components/`:
      `Widget`, `WidgetRoot`, `WidgetHeader`, `WidgetFooter`, `WidgetTopBar`, `WidgetContent`,
      `Grid`, `GridBody`, `GridHeader`, `Header`, `Row`, `RowsRenderer` + `features/base/WidgetRoot.viewModel.ts`.
- [ ] **4.4** Move remaining feature-specific components from `components/` into their slice:
      cells (`DataCell`, `CheckboxCell`, `SelectorCell`, `CellElement`, `CheckboxColumnHeader`) →
      `columns/` or `selection/` by role; `ColumnResizer`, `ColumnSelector`, `ColumnProvider` →
      `columns/`; `Pagination.tsx` → `pagination/`; `ExportAlert` → `data-export/`;
      `RefreshStatus` → `data/`; `EmptyPlaceholder` bits → `empty-state/`. Delete empty `components/`.
- [ ] **4.5** Fix components-as-service-locators: `shell/` frame components receive feature subtrees
      by composition instead of calling `useGridSizeStore()` / importing raw `CORE_TOKENS`.
      _Verify:_ full `pnpm run test` + `tsc --noEmit` + one manual `pnpm start` smoke run.
      _Accept:_ top-level dirs are `composition/ features/ shell/ shared/` (+ entry files); no `model/`,
      no `components/`, no `helpers/`.

---

## Phase 5 — Lock it in (low risk)

- [ ] **5.1 Boundary lint.** Add `eslint-plugin-boundaries` (or `import/no-restricted-paths`)
      encoding the 5 tiers: `shell → features → composition → shared → @mendix/widget-plugin-*`.
      **Allow-list `@mendix/widget-plugin-*` as importable from every layer** (53 legit sites).
      Rules: features cannot import features or shell; nothing imports shell; shared is leaves-only.
      _Verify:_ `pnpm run lint` passes clean; deliberately add a bad import and confirm it errors.
- [ ] **5.2 Container smoke test.** A test that builds the real container via
      `createDatagridContainer` and asserts key tokens resolve + boot order holds (guards the
      Phase 3 activation-order risk against future edits).
- [ ] **5.3 Regenerate the graph** and attach the "after" to the tracking issue.
      _Accept:_ zero directory-level cycles; `model/tokens.ts` hub is gone.
- [ ] **5.4 CHANGELOG.** No user-facing behavior change → note as internal refactor only per
      repo convention (changelogs are user-facing; this may warrant no entry).

---

## Sequencing & scope options

```
Phase 0 (guardrails) ─▶ 1 (shared) ─▶ 2 (helpers) ─▶ 3 (tokens) ─▶ 4 (composition/shell) ─▶ 5 (lock-in)
                                         └─────── reduced scope stops here (~70% value) ───────┘
```

- **Full refactor:** all phases, ~5–6 PRs.
- **Reduced scope (recommended if not actively adding features):** Phases 0 → 2 → 3 → 5.1/5.2 only.
  Captures ~70% of the value (kills 3 of 4 cycles, single store home, tiny token file) for ~30%
  of the risk; skips the large component/frame reshuffle of Phase 4.

## Risk ranking (do the scary one deliberately)

1. **Phase 3** — DI/activation order. Highest risk; add the smoke test first.
2. **Phase 4.4/4.5** — largest diff; component moves + un-service-locating.
3. **Phase 2** — mechanical but touches many stores.
4. **Phase 1, 5** — low risk.
