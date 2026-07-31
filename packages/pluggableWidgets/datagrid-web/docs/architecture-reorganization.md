# Datagrid-web — Proposed Source Reorganization

> **Status:** Proposal / RFC. Nothing here is implemented yet.
> **Scope:** `packages/pluggableWidgets/datagrid-web/src` file/module organization only.
> This does **not** propose rewriting the DI/MobX architecture — that internal design
> (gate → atoms → stores → view-models, wired with `brandi` + `@mendix/widget-plugin-mobx-kit`)
> is sound. The proposal is about **where files live** and **which direction dependencies flow**.

## 1. Current module tree

```
src/
├── Datagrid.tsx, Datagrid.xml, Datagrid.editorConfig.ts, ...   # widget entry + Studio Pro config
├── components/   (43 files, ~2144 LOC)   presentational + container React components
│   ├── Grid, GridBody, GridHeader, Header, Row, RowsRenderer, DataCell, ...
│   ├── icons/, loader/
│   └── __tests__/
├── features/     (32 files, ~3037 LOC)   feature slices (partial)
│   ├── base/            WidgetRoot.viewModel
│   ├── data-export/     controller, request, dialog, hooks
│   ├── row-interaction/ cell/checkbox event controllers + handlers
│   ├── select-all/      container, viewModels, dialogs, hooks
│   ├── selection-counter/, empty-message/, pagination/
├── model/        (24 files, ~2248 LOC)   DI + MobX "backend"
│   ├── containers/  Root / Datagrid / createDatagridContainer
│   ├── models/      rows, columns, grid atoms
│   ├── stores/      GridSize, PageSize          ← stores location #1
│   ├── services/    Datasource, Selection, Texts, Loader, MainGate, Setup
│   ├── hooks/       injection-hooks, useDatagridContainer
│   ├── configs/, tokens.ts
├── helpers/      (13 files, ~1297 LOC)
│   ├── state/       ColumnGroup, ColumnsSorting, GridBasicData, GridPersonalization, column/*  ← stores location #2
│   ├── storage/     personalization storage
│   └── ColumnBase, useDataGridJSActions
├── typings/  (leaf), ui/ (scss), utils/ (columns-hash, test-utils)
```

## 2. Critical assessment

The `model/` layer is genuinely well-designed. The problems are in the **top-level
organization** and in **boundary leakage** between directories.

### 2.1 Three competing organizing principles at the top level
- `components/` is organized **by technical type** (all React together).
- `features/` is organized **by feature slice**.
- `model/` + `helpers/` are organized **by architectural layer**.

A reader cannot form one mental model. To understand "selection" you must visit
`features/select-all/`, `features/selection-counter/`,
`model/services/SelectionGate.service.ts`, `components/SelectorCell.tsx` +
`CheckboxCell.tsx`, and `helpers/state/` for sorting. One capability is smeared across
four taxonomies.

### 2.2 Stateful MobX stores live in (at least) three places
- `model/stores/` — `GridSize.store.ts`, `PageSize.store.ts` (2 stores)
- `helpers/state/` — `ColumnGroupStore`, `ColumnsSortingStore`, `GridBasicData`,
  `GridPersonalizationStore`, `column/ColumnStore`, `column/ColumnFilterStore` (6 stores)
- plus observable **view-models** in `features/*` and observable **services** in `model/services/*`.

There is no principled reason `PageSizeStore` lives in `model/stores/` but
`ColumnsSortingStore` lives in `helpers/state/`. This is the clearest symptom that
**`helpers/` is a junk drawer** that accreted stateful domain code belonging to the model.

### 2.3 Four directory-level dependency cycles
Confirmed by tracing non-test `import` statements:

- `components ↔ features`
- `model ↔ features`
- `model ↔ helpers`
- indirect `components → model → features → components`

The hub is **`model/tokens.ts`**, which imports view-models from `features/` and stores
from `helpers/`, while those same features import back from `model/`. `brandi` DI tokens
**soften** this (coupling is often to token identity, not concrete classes), but the
module graph is still cyclic — no layer can be understood or extracted in isolation.

### 2.4 Components are service locators, not presentational
Components make ~16 direct imports from `model/` and ~8 from `features/`. Examples:
`Grid.tsx` calls `useGridSizeStore()` / `useGridStyle()`; `ColumnProvider.tsx` imports raw
`CORE_TOKENS`. The "components are dumb" principle is violated — they reach into the DI
container mid-render, which is what makes `components ↔ features` cyclic.

### 2.5 `features/` is a false promise
It looks like feature-slicing, but only the **late-added** capabilities live there
(data-export, select-all, selection-counter, pagination, empty-message, row-interaction).
The **core** capabilities they'd naturally own (columns, rows, sorting, filtering, the grid
shell) are scattered into `components/`, `helpers/state/`, and `model/`. The codebase is
feature-sliced for new features and layer-sliced for core ones.

## 3. Proposed reorganization: commit to feature-slices + a thin shared kernel

Keep the excellent `model/` **internal** pattern, but stop having one monolithic `model/`.
Give every capability its own model + view + wiring, backed by a small shared kernel.
The top level should name **what the widget does**, not **what React/MobX are**.

```
src/
├── Datagrid.tsx, Datagrid.xml, *.editorConfig.ts        # entry (unchanged)
│
├── kernel/                        # reusable DI/MobX/gate machinery — feature-agnostic
│   ├── container/                 # Root/Datagrid container assembly, createDatagridContainer
│   ├── gate/                      # MainGateProvider, gate types  (was model/services/MainGate*)
│   ├── tokens.ts                  # ONLY cross-feature tokens (mainGate, config, setupService)
│   └── react/                     # useDatagridContainer, useSetup bindings
│
├── features/                      # EVERY capability is a slice; each owns its full stack
│   ├── data/                      # datasource, rows, query params, loader
│   │   ├── rows.model.ts  DatasourceService  DatasourceParamsController  DerivedLoaderController
│   │   ├── data.tokens.ts  data.container.ts  useData.ts   # feature-local wiring
│   │   └── __tests__/
│   ├── columns/                   # ColumnGroupStore, ColumnStore, ColumnProvider, resizer, selector
│   ├── sorting/                   # ColumnsSortingStore + header sort UI
│   ├── filtering/                 # ColumnFilterStore + filter host wiring
│   ├── selection/                 # MERGE select-all + selection-counter + SelectionGate + Selector/CheckboxCell
│   ├── pagination/                # pagination atoms/config/VM + Pagination.tsx + PageSizeStore
│   ├── row-interaction/           # (already good — keep, add its Cell components)
│   ├── data-export/               # (already good)
│   ├── personalization/           # GridPersonalizationStore + storage/*  (was helpers/)
│   └── empty-state/               # (was empty-message)
│
├── shell/                         # the grid frame: composition-only, no domain logic
│   ├── Widget.tsx  WidgetRoot.tsx  WidgetHeader/Footer/TopBar  Grid  GridBody  GridHeader  Row
│   └── WidgetRoot.viewModel.ts    # (was features/base)
│
└── shared/                        # true leaves: imported-by-many, import-nothing-of-ours
    ├── types/     (was typings/)
    ├── ui/        icons/, loader/, PseudoModal, scss
    └── utils/     columns-hash, test-utils
```

### 3.1 Rules that make this hold (and kill the cycles)

1. **Strict dependency direction:** `shell → features → kernel → shared`.
   Features may depend on the kernel and shared, **never on each other or on shell**.
   Shell composes features, but no feature imports shell.
   Enforce with `eslint-plugin-boundaries` or `import/no-restricted-paths` so cycles
   cannot silently return.
2. **Delete `helpers/` entirely.** Every file in it is stateful domain code and moves into
   the owning feature (`columns/`, `sorting/`, `personalization/`). "Helpers" and
   "utils-with-state" stop existing.
3. **One home for each store.** A store lives in its feature. `PageSizeStore → pagination/`,
   `ColumnsSortingStore → sorting/`. No more `model/stores` vs `helpers/state` split.
4. **Split `tokens.ts`.** Today it is the coupling hub because it imports every feature's
   view-model. Instead, each feature declares its **own** `*.tokens.ts` and its own
   `*.container.ts` binding group. (The container code already has `_01`…`_09` binding
   groups — they are begging to be co-located with their features.) `kernel/tokens.ts`
   keeps only genuinely cross-feature tokens. **This is the highest-leverage change** — it
   removes the `model ↔ features` cycle at its source.
5. **Components stop being service locators.** Feature components read their own feature's
   co-located injection-hooks; the `shell/` frame receives feature-rendered subtrees by
   composition. `Grid.tsx` in `shell/` should not call `useGridSizeStore` — the pagination
   and columns features should hand it what it needs.

### 3.2 Target dependency direction (acyclic)

```
shell  ──▶  features  ──▶  kernel  ──▶  shared
  │            │                          ▲
  └────────────┴──────────────────────────┘
         (both may import shared)

features do NOT import each other, and NOTHING imports shell.
```

## 4. Migration path (incremental, no big-bang)

Each step is independently shippable and leaves the widget working.

| Step | Change | Risk | Value |
|------|--------|------|-------|
| 1 | Rename `typings → shared/types`, `ui → shared/ui`, move `utils → shared/utils`. Pure leaf move. | Very low | Immediate clarity |
| 2 | Dissolve `helpers/`: move each store into a new feature folder (`columns/`, `sorting/`, `personalization/`). Path updates only. | Low | Removes `model ↔ helpers` cycle; single store home |
| 3 | Co-locate DI wiring: move each `_0N_*Bindings` group + its tokens next to its feature; shrink `model/tokens.ts` to the kernel set. | Medium (the real work) | Removes `model ↔ features` cycle |
| 4 | Introduce `kernel/` and `shell/`; move container assembly + frame components. | Medium | Screaming architecture at top level |
| 5 | Add `eslint-plugin-boundaries` rule to lock in layering. | Low | Prevents regression |

**Reduced-scope option:** if the team is not actively adding features here, doing only
steps 2–3 (kill `helpers/`, split `tokens.ts`) captures roughly 70% of the value for
roughly 30% of the risk.

## 5. Caveats

- This is a large refactor of a **mature, shipping widget** with snapshot and E2E tests.
  The `model/` internals are good — the proposal **redistributes** them, it does not rewrite
  them. Payoff is navigability and testability-in-isolation; cost is a large diff and review
  burden.
- Coupling was traced via static `import` analysis, not runtime. Before committing, confirm
  no reflection / string-based token lookups would break under file moves.
- Renames touch many import paths; do them mechanically (codemod / IDE move) and lean on the
  test suite + `tsc` after each step.
