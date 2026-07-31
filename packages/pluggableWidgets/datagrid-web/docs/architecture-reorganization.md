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

### 2.6 A large share of the "backend" is NOT local — it lives in `@mendix/widget-plugin-*`
This is the finding that most shapes the proposal. Tracing external imports (non-test):

| Package | Import sites | What comes from it |
|---|---|---|
| `@mendix/widget-plugin-grid` | 72 | selection, select-all, selection-counter, pagination, event-switch, keyboard-navigation, ClickActionHelper — **cross-widget domain logic** |
| `@mendix/widget-plugin-mobx-kit` | 29 | `GateProvider`, `SetupHost`, `disposeBatch`, `useConst`, `useSetup` — **the reactive kernel itself** |
| `@mendix/widget-plugin-filtering` | 16 | filter stores/host — filtering domain |
| `@mendix/widget-plugin-platform` / `-component-kit` / `-hooks` / `filter-commons` | ~20 | shared UI + platform helpers |

**53 of the `src` files import from `@mendix/widget-plugin-*`.** Two consequences:

- **The reactive kernel is already external.** `widget-plugin-mobx-kit` provides the
  gate/setup/dispose primitives. There is nothing local to "extract" as a kernel.
- **Several "features" are adapters, not owners.** `select-all`, `selection-counter`,
  `pagination`, and `row-interaction` are thin local wiring over logic that lives in
  `widget-plugin-grid`. The datagrid-web slice is a *binding layer*; the brain is in the plugin.

datagrid-web is best understood as a **composition layer over shared grid-family
packages**, not a self-contained app. The reorganization must reflect that.

## 3. Proposal: feature-slices over a thin local composition layer

Keep the excellent DI/MobX **pattern**, but stop having one monolithic `model/`. Give every
capability its own model + view + wiring, and recognise the external plugins as the base of
the stack. The top level should name **what the widget does**, not **what React/MobX are**.

```
src/
├── Datagrid.tsx, Datagrid.xml, *.editorConfig.ts        # entry (unchanged)
│
├── composition/                   # pure WIRING — no reactive primitives (those are external)
│   ├── container/                 # Root/Datagrid container assembly, createDatagridContainer
│   ├── tokens.ts                  # ONLY cross-feature tokens (mainGate, config, setupService)
│   └── react/                     # useDatagridContainer
│   #  Gate/Setup/dispose primitives are NOT here — they come from @mendix/widget-plugin-mobx-kit.
│
├── features/                      # each slice = LOCAL WIRING + widget-specific UI over a plugin
│   ├── data/                      # rows.model, DatasourceService, ParamsController, Loader
│   ├── columns/                   # ColumnGroupStore, ColumnStore, ColumnProvider, resizer, selector
│   ├── sorting/                   # ColumnsSortingStore + header sort UI
│   ├── filtering/                 # adapter over @mendix/widget-plugin-filtering + ColumnFilterStore
│   ├── selection/                 # adapter over widget-plugin-grid/{selection,select-all,selection-counter}
│   ├── pagination/                # adapter over widget-plugin-grid/pagination + PageSizeStore + Pagination.tsx
│   ├── row-interaction/           # adapter over grid/event-switch + keyboard-navigation
│   ├── data-export/               # (already good)
│   ├── personalization/           # GridPersonalizationStore + storage/*  (was helpers/)
│   └── empty-state/               # (was empty-message)
│
├── shell/                         # the grid frame: composition-only, no domain logic
│   ├── Widget.tsx  WidgetRoot.tsx  WidgetHeader/Footer/TopBar  Grid  GridBody  GridHeader  Row
│   └── WidgetRoot.viewModel.ts    # (was features/base)
│
└── shared/                        # LOCAL leaves only: imported-by-many, import-nothing-of-ours
    ├── types/     (was typings/)
    ├── ui/        icons/, loader/, PseudoModal, scss
    └── utils/     columns-hash, test-utils
```

> **Why `composition/` and not `kernel/`?** An earlier draft proposed a local `kernel/`.
> That was redundant: the feature-agnostic reactive kernel already exists as
> `@mendix/widget-plugin-mobx-kit`. What remains local is only *wiring* — container
> assembly and cross-feature tokens — so the layer is named for what it does.

### 3.1 The five-tier dependency direction (acyclic)

```
shell  →  features  →  composition  →  shared (local)  →  @mendix/widget-plugin-*  (external base)
  │          │                                                          ▲
  └──────────┴─────────────── may import shared + external ─────────────┘

Rules:
  • features do NOT import each other, and NOTHING imports shell.
  • the external @mendix/widget-plugin-* packages are the allowed-from-anywhere base layer.
  • local `shared/` is leaves only — it must not import from features/composition/shell.
```

### 3.2 Rules that make this hold (and kill the cycles)

1. **Strict dependency direction** as above. Enforce with `eslint-plugin-boundaries` or
   `import/no-restricted-paths`. **The lint config must allow-list `@mendix/widget-plugin-*`
   as an importable base tier from every layer** — otherwise the rule fires on 53 files of
   legitimate external imports.
2. **Delete `helpers/` entirely.** Every file in it is stateful domain code and moves into
   the owning feature (`columns/`, `sorting/`, `personalization/`). "Helpers" and
   "utils-with-state" stop existing. *(Unaffected by the plugin finding — pure local win.)*
3. **One home for each store.** A store lives in its feature. `PageSizeStore → pagination/`,
   `ColumnsSortingStore → sorting/`. No more `model/stores` vs `helpers/state` split.
4. **Split `tokens.ts`.** Today it is the coupling hub because it imports every feature's
   view-model. Instead, each feature declares its **own** `*.tokens.ts` and its own
   `*.container.ts` binding group. (The container code already has `_01`…`_09` binding
   groups — they are begging to be co-located with their features.) `composition/tokens.ts`
   keeps only genuinely cross-feature tokens. **Highest-leverage change** — it removes the
   `model ↔ features` cycle at its source. *(The plugin finding reinforces this: most of what
   a "kernel" would hold isn't even in this repo, so the central token file should be tiny.)*
5. **Components stop being service locators.** Feature components read their own feature's
   co-located injection-hooks; the `shell/` frame receives feature-rendered subtrees by
   composition. `Grid.tsx` in `shell/` should not call `useGridSizeStore`.

### 3.3 Slices are adapters, not owners
Because `widget-plugin-grid` / `-filtering` already own the domain logic for selection,
pagination, keyboard navigation, event handling, and filtering, a **local slice must hold
only wiring + widget-specific UI, and must not re-implement anything the plugin owns.**

- `selection/` **wraps** `widget-plugin-grid/selection` + `select-all.model` +
  `selection-counter` — it does not fork them.
- `pagination/` **wraps** `widget-plugin-grid/pagination` and adds the local `Pagination.tsx`
  and `PageSizeStore`.
- `row-interaction/` **wraps** `grid/event-switch` + `keyboard-navigation`.

This guards against the failure mode where "move everything into feature slices" tempts
contributors to duplicate shared grid logic locally. When a slice grows logic that other
grid-family widgets would want, that logic belongs **upstream in the plugin**, not in the slice.

## 4. Migration path (incremental, no big-bang)

Each step is independently shippable and leaves the widget working.

| Step | Change | Risk | Value |
|------|--------|------|-------|
| 1 | Rename `typings → shared/types`, `ui → shared/ui`, move `utils → shared/utils`. Pure leaf move. | Very low | Immediate clarity |
| 2 | Dissolve `helpers/`: move each store into a new feature folder (`columns/`, `sorting/`, `personalization/`). Path updates only. | Low | Removes `model ↔ helpers` cycle; single store home |
| 3 | Co-locate DI wiring: move each `_0N_*Bindings` group + its tokens next to its feature; shrink the central `tokens.ts` to the cross-feature set. | Medium (the real work) | Removes `model ↔ features` cycle |
| 4 | Introduce `composition/` and `shell/`; move container assembly + frame components. | Medium | Screaming architecture at top level |
| 5 | Add `eslint-plugin-boundaries` rule to lock in the 5-tier layering, **including the `@mendix/widget-plugin-*` allow-listed base tier**. | Low | Prevents regression |

**Reduced-scope option:** if the team is not actively adding features here, doing only
steps 2–3 (kill `helpers/`, split `tokens.ts`) captures roughly 70% of the value for
roughly 30% of the risk. Both steps are untouched by the external-plugin finding.

## 5. Caveats

- This is a large refactor of a **mature, shipping widget** with snapshot and E2E tests.
  The `model/` internals are good — the proposal **redistributes** them, it does not rewrite
  them. Payoff is navigability and testability-in-isolation; cost is a large diff and review
  burden.
- Coupling was traced via static `import` analysis, not runtime. Before committing, confirm
  no reflection / string-based token lookups would break under file moves.
- Renames touch many import paths; do them mechanically (codemod / IDE move) and lean on the
  test suite + `tsc` after each step.
- datagrid-web sits on top of `@mendix/widget-plugin-*` (53 import sites). Treat those
  packages as a fixed base layer for this refactor; any change to them is a separate,
  cross-widget effort with its own review.
