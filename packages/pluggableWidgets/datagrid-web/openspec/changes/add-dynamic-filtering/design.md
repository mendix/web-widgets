## Context

Data Grid 2 builds its datasource filter in `Datagrid.container.ts`: a `CombinedFilter` with the inputs `[filterHost (CustomFilterHost), columnsStore]`, hydrated from `props.datasource.filter` in `postInit`. Header filter widgets reach the `CustomFilterHost` through the `FilterAPI` context provided by `WidgetHeader.tsx`. Personalization is handled by `GridPersonalizationStore`, which rejects the whole blob if `schemaVersion !== 3` or `settingsHash` doesn't match the columns.

The Filter Set model, builder component, Dynamic mode context and theme partial come from the shared change `@mendix/widget-plugin-filtering` / `add-dynamic-filtering`. This change wires them into the grid.

## Goals / Non-Goals

**Goals:**

- Add the Filtering mode, Filter Fields and texts to the XML, Studio Pro configuration, and checks.
- Wire the shared `DynamicFilterSet` into the grid's filter pipeline and personalization.
- Leave Fixed mode completely unchanged.

**Non-Goals:**

- Shared model and UI behavior (specified in the shared change).
- Studio Pro preview of the builder (Q40), developer defaults (Q22), and a configurable debounce (Q29).

## Decisions

### 1. XML follows the draft

Properties are as in `dynamic-filtering-xml-draft.md`: the **General → Filtering** group (`filteringMode`, `filterFields`, `filterFieldOptions`) and a **Texts → Dynamic filters** group (`addFilterCaption`, `clearFiltersCaption`, `removeFilterAriaLabel`, `filterFieldAriaLabel`). `filterFieldOptions` is top-level because object lists can't be nested.

### 2. Config derives the effective flags

`Datagrid.config.ts` gets `filteringMode` and derives `columnsFilterable = props.filteringMode === "fixed" && props.columnsFilterable`. `Header.tsx` then needs no change, because the column filter row already depends on `columnsFilterable`.

### 3. Container picks inputs by mode

In `init`, the `CombinedFilter` inputs are `[filterHost, columnsStore]` in Fixed mode (unchanged) and `[dynamicFilterSet]` in Dynamic mode. A new token `DG.dynamicFilterSet` is bound to a singleton `DynamicFilterSet`, built from `filterFields` and `filterFieldOptions` mapped to the shared plain config types: `label.value ?? ""`, the option `value.value`, and `caption.value`.

- Leaving out `filterHost` in Dynamic mode makes outdated filter widget builds inert as well (see the shared design).
- Labels and options are `DynamicValue`s. The Filter Field config is passed as a computed derived from the props gate, so translations and expressions that resolve late are picked up.

### 4. Header

`WidgetHeader.tsx`: in Dynamic mode it renders even when `filtersPlaceholder` is empty, wraps the children in the Dynamic mode provider (on) as well as the existing providers, and renders `<DynamicFilterBuilder>` after `{filtersPlaceholder}` inside `div.widget-datagrid-header`.

### 5. Persistence

`GridPersonalizationStorageSettings` gets `dynamicFilters?: Array<{ field: string; data: FilterData }>`.

- `toStorageFormat`: writes `dynamicFilters` only when `storeFilters` is on and the mode is Dynamic.
- `applySettings`: calls `dynamicFilterSet.fromJSON(settings.dynamicFilters)` only when `storeFilters` is on and the mode is Dynamic, and `undefined` restores an empty set.
- `schemaVersion` stays at 3 and `getHash` is untouched (Q30, Q15).
- _Alternative considered_: bump to 4 with a migration. Rejected because it only ever adds an empty array, and a missed migration path would wipe users' layouts.

### 6. Consistency checks and editorConfig

`consistency-check.ts` adds the four checks from the spec. The rule "an option's field must be Enum or Boolean" stays a runtime warning, because preview props don't expose attribute types. `Datagrid.editorConfig.ts` hides properties by mode with `hidePropertiesIn` / `hidePropertyIn` per column `filter`, and adds `getCustomCaption` cases for the two lists.

## Risks / Trade-offs

- [A personalization blob written in Dynamic mode, read after the developer switches back to Fixed] → `dynamicFilters` is ignored in Fixed mode and dropped on the next write. Column filters restore from `columnFilters` as before.
- [Hydration on back navigation after the developer switches mode between deployments] → The `CombinedFilter` count check logs and skips. Only the view state is lost.
- [`DynamicValue` labels loading after first render] → Fields with a label that isn't loaded yet show an empty caption until it resolves, and keys stay stable, so no rows are lost.

## Migration Plan

No data migration. Existing grids default to `fixed`. Rollback is downgrading the widget: older versions ignore the unknown `dynamicFilters` field (they validate only `name`, `settingsHash` and `schemaVersion`).
