# Datagrid Web (`@mendix/datagrid-web`)

Data Grid 2 — the primary data table widget for Mendix web apps. Sorting, filtering,
pagination (buttons/virtual scroll/load more), column resize/reorder/hide, row selection
(single/multi, checkbox/click), data export, and personalization (localStorage/attribute).

## Commands

- Test: `cd packages/pluggableWidgets/datagrid-web && pnpm run test`
- Build: `pnpm turbo build` (from widget directory — builds upstream deps automatically)
- Lint: `cd packages/pluggableWidgets/datagrid-web && pnpm run lint`
- E2E: `cd packages/pluggableWidgets/datagrid-web && pnpm run e2e`
- Dev: set `MX_PROJECT_PATH`, then `pnpm run start` inside package dir

**Shared package changes:** `pnpm turbo build` handles workspace dependency ordering automatically — no need to manually build shared packages first.

## Key Concepts

### Gate Pattern (React → MobX bridge)

All MobX stores read props from a `DerivedPropsGate`, never from React props directly.

- `GateProvider` holds a mutable props atom, exposes an immutable `DerivedPropsGate<T>` with `{ readonly props: T }`
- `MainGateProvider` extends this — blocks prop updates during export or select-all to prevent UI flicker
- In `useDatagridContainer`, every React render pushes props through `mainProvider.setProps(props)`
- Stores observe `gate.props` reactively via MobX
- **Two-render cycle:** React props arrive (gate updates, stores still stale) → MobX propagates (stores now fresh). Always use the MobX computed value as an effect dependency, not raw React props

Source: `model/services/MainGateProvider.service.ts`, `widget-plugin-mobx-kit` (`GateProvider`, `DerivedPropsGate`)

### Dependency Injection with Brandi

Two-level container hierarchy, organized by numbered binding groups.

**Container hierarchy:**

```
RootContainer (shared atoms: row count, column count, page size, selection counts, texts)
  └── DatagridContainer (extends root — all feature bindings)
SelectAllModule (separate sub-container, initialized alongside)
```

**Binding groups** in `Datagrid.container.ts` — 9 numbered `BindingGroup` objects, each with lifecycle hooks:

1. `inject()` — declare constructor dependencies (runs once at module load)
2. `define(container)` — bind tokens to factories/classes
3. `init(container, deps)` — bind constants and prop-derived values
4. `postInit(container, deps)` — bootstrap: eagerly resolve services, hydrate state

**Tokens** live in `model/tokens.ts`:

- `CORE_TOKENS` — shared across containers (mainGate, columnsStore, atoms, selection, config, setupService)
- `DG_TOKENS` — datagrid-specific (query, filters, pagination, grid size, row interaction, view models)
- `SA_TOKENS` — select-all module (barStore, emitter, progressService, feature)

**React access:** `createInjectionHooks()` in `model/hooks/injection-hooks.ts` generates typed hooks like `useColumnsStore()`, `usePaginationVM()`, etc.

### SetupComponent Lifecycle

Stores that need MobX reactions/autoruns implement `SetupComponent`:

```
constructor → host.add(this) → setup() called on mount → returns cleanup function → cleanup on unmount
```

- `DatagridSetupService` (extends `SetupHost`) collects all setup components
- `useSetup()` hook in `useDatagridContainer` triggers the lifecycle
- `disposeBatch()` batches multiple cleanup functions into one disposer
- Used by: `ColumnGroupStore`, `DatasourceParamsController`, `DatasourceService`, `GridPersonalizationStore`, `DynamicPaginationFeature`, `SelectAllFeature`, `createSelectionHelper`, `createFocusController`, `createClickActionHelper`

### ComputedAtom Pattern

`ComputedAtom<T>` = `{ get(): T }` — a lightweight read-only interface over MobX `computed()`.

- Factory functions (e.g., `rowsAtom`, `gridStyleAtom`, `pageSizeAtom`) create injectable computed values
- Bound via `toInstance(factoryFn).inTransientScope()` — brandi calls the factory with injected deps
- This is how derived state (rows, column count, page size, grid CSS) flows through DI

## Architecture

### Entry Point Flow

```
Datagrid.tsx (default export)
  → useDatagridContainer(props)         // creates containers + gate provider
    → createDatagridContainer(props)    // RootContainer + DatagridContainer + SelectAllModule
  → ContainerProvider (brandi-react)    // isolated — no inherited bindings
  → DatagridRoot (observer)            // injection hooks, data export, JS actions
    → Widget                           // pure layout composition
```

### Component Tree

```
WidgetRoot              — outer div, CSS classes for selection/export states
├── WidgetTopBar        — top pagination + selection counter
├── WidgetHeader        — filter placeholder (provides FilterAPI + Selection contexts)
├── WidgetContent
│   └── Grid            — role="grid", CSS grid via custom properties
│       ├── GridHeader          — column headers (sort/resize/drag)
│       ├── SelectAllBar        — "select all X items across pages" banner
│       ├── RefreshStatus       — silent refresh indicator
│       └── GridBody            — scrollable body with loading states
│           ├── RowsRenderer    — maps ObjectItem[] → Row → DataCell/CheckboxCell/SelectorCell
│           ├── MockHeader      — invisible header for column size measurement
│           └── EmptyPlaceholder
├── WidgetFooter        — bottom pagination + load more button + selection counter
├── SelectionProgressDialog
└── ExportProgressDialog
```

### Data Flow

```
React props (DatagridContainerProps)
  → MainGateProvider.setProps()
    → DerivedPropsGate (MobX observable)
      → Stores read gate.props reactively
        → ComputedAtoms derive state
          → Observer components re-render
```

Filter flow:

```
Filter widgets (in filtersPlaceholder) → CustomFilterHost.observe() → CombinedFilter
  → DatasourceParamsController → QueryService.setFilter() → datasource re-fetches
```

## DI Binding Groups

| #   | Group           | Key Bindings                                                                                                 | Responsibility                                                               |
| --- | --------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| 01  | Core            | `ColumnGroupStore`, `DatasourceParamsController`, `GridBasicData`, `WidgetRootViewModel`, `GridSizeStore`    | Column state, sort/filter param sync, grid sizing                            |
| 02  | Filter          | `CombinedFilter`, `CustomFilterHost`, `WidgetFilterAPI`                                                      | Filter condition aggregation + context for filter widgets                    |
| 03  | Loader          | `DerivedLoaderController`                                                                                    | Loading states (first load, next batch, refreshing)                          |
| 04  | Empty State     | `EmptyPlaceholderViewModel`, `emptyStateWidgetsAtom`                                                         | Empty message when no items                                                  |
| 05  | Personalization | `GridPersonalizationStore`                                                                                   | Save/restore column order, sizes, sort, filters to localStorage or attribute |
| 06  | Pagination      | `PaginationViewModel`, `PageControlService`, `DynamicPaginationFeature`, page/size atoms                     | All pagination logic (buttons, virtual scroll, load more)                    |
| 07  | Selection       | `SelectionHelper`, `SelectActionsProvider`, `gridStyleAtom`, `rowClassProvider`, `SelectionCounterViewModel` | Row selection state + visual feedback                                        |
| 08  | Row Interaction | `CellEventsController`, `CheckboxEventsController`, `FocusTargetController`, `ClickActionHelper`             | Click, keyboard, and checkbox event handling                                 |
| 09  | Select All      | Imports from `SelectAllModule` sub-container                                                                 | Cross-page "select all" with progress dialog                                 |

## Where to Make Changes

| Task                           | Files to Touch                                                                                                                                                                    |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Add a widget property          | `Datagrid.xml` → auto-generated `typings/DatagridProps.d.ts` → add to `MainGateProps` pick list (if gated) → add to `DatagridConfig` (if static) → wire in relevant binding group |
| Add/modify a column property   | `Datagrid.xml` (columns object) → `helpers/state/column/ColumnStore.tsx` → `helpers/state/column/BaseColumnInfo.ts`                                                               |
| Change pagination behavior     | `features/pagination/pagination.config.ts` → `_06_paginationBindings` in `Datagrid.container.ts`                                                                                  |
| Change selection behavior      | `_07_selectionBindings` → `model/services/SelectionGate.service.ts` → `features/row-interaction/` handlers                                                                        |
| Change virtual scrolling       | `model/stores/GridSize.store.ts` → `model/hooks/useInfiniteControl.tsx` → `model/hooks/useBodyScroll.ts`                                                                          |
| Add a new DI service           | Define token in `model/tokens.ts` → create factory/class → `injected()` call + bind in appropriate `BindingGroup`                                                                 |
| Add a new feature area         | Create folder in `features/` → create `BindingGroup` → add to `groups` array in `Datagrid.container.ts`                                                                           |
| Modify grid CSS layout         | `model/models/grid.model.ts` (`gridStyleAtom`) — uses CSS custom properties on the grid div                                                                                       |
| Change loading states          | `model/services/DerivedLoaderController.ts` → `components/GridBody.tsx` (`ContentGuard`)                                                                                          |
| Modify personalization storage | `helpers/storage/` implementations → `helpers/state/GridPersonalizationStore.ts`                                                                                                  |
| Change filter integration      | `_02_filterBindings` in container → `widget-plugin-filtering` shared package                                                                                                      |

## Workspace Dependencies

| Package                         | What Datagrid Uses                                                                                                                                                                                                                                                                        |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `widget-plugin-grid`            | `DatasourceService` (QueryService), pagination (`PaginationViewModel`, `PageControlService`, page atoms), selection (`SelectActionsProvider`, `SelectionHelper`, `SelectAllService`), keyboard nav (`FocusTargetController`, `VirtualGridLayout`), `ClickActionHelper`, `ProgressService` |
| `widget-plugin-mobx-kit`        | `DerivedPropsGate`/`GateProvider` (gate pattern), `SetupHost`/`SetupComponent`, `ComputedAtom`, `disposeBatch`, `useSetup`, `useConst`, `Emitter`                                                                                                                                         |
| `widget-plugin-filtering`       | `CombinedFilter`, `CustomFilterHost`, `WidgetFilterAPI` — filter aggregation and React context                                                                                                                                                                                            |
| `filter-commons`                | `reduceArray`/`restoreArray` — condition array utilities for column filter merging                                                                                                                                                                                                        |
| `widget-plugin-component-kit`   | `If` — conditional rendering helper                                                                                                                                                                                                                                                       |
| `widget-plugin-hooks`           | `useOnScreen` — visibility detection for infinite scroll trigger                                                                                                                                                                                                                          |
| `widget-plugin-platform`        | `generateUUID` — unique IDs for containers and configs                                                                                                                                                                                                                                    |
| `widget-plugin-external-events` | External event bus for cross-widget communication                                                                                                                                                                                                                                         |

## Filter Widget Integration

Datagrid provides a `WidgetFilterAPI` React context. External filter widgets placed in the `filtersPlaceholder` slot consume it:

1. Datagrid creates `CustomFilterHost` + `WidgetFilterAPI` in `_02_filterBindings`
2. `WidgetHeader` wraps `filtersPlaceholder` children with the FilterAPI context provider
3. Filter widgets (`datagrid-text-filter-web`, `datagrid-number-filter-web`, `datagrid-date-filter-web`, `datagrid-dropdown-filter-web`) use `withFilterAPI` HOC to access the context
4. Each filter registers itself via `CustomFilterHost.observe(key, filter)`
5. `CombinedFilter` merges all column filters (from `ColumnGroupStore.condWithMeta`) + custom filters (from `CustomFilterHost`) into a single `FilterCondition`
6. `DatasourceParamsController` reacts to filter changes and pushes them to `QueryService.setFilter()`

## Testing

- **Unit tests:** Jest + React Testing Library — `src/**/__tests__/*.spec.ts(x)`
- **E2E tests:** Playwright — `e2e/*.spec.js` (DataGrid.spec.js, DataGridSelection.spec.js, filtering/)
- **Test utilities:** `src/utils/test-utils.tsx`, `@mendix/widget-plugin-test-utils`
- **Consistency check:** `src/__tests__/consistency-check.spec.ts` — validates XML ↔ TypeScript prop alignment
- Run unit tests: `cd packages/pluggableWidgets/datagrid-web && pnpm run test`
- Run E2E: `cd packages/pluggableWidgets/datagrid-web && pnpm run e2e`
