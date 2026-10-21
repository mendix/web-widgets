## Context

Gallery builds its datasource filter in `Gallery.container.ts`: a `CombinedFilter` with the inputs `[filterHost (CustomFilterHost)]`, hydrated from `props.datasource.filter` in `postInit`. Header filter widgets reach the host through the `FilterAPI` context in `GalleryHeader.tsx`, which also provides the sort and selection contexts. Settings are synced by `GallerySettingsSyncService` as `{ version: 1, filters?, sort? }`. On a version mismatch it **resets the storage** (`setData(null)`).

The Filter Set model, builder, Dynamic mode context and theme partial come from the shared change `@mendix/widget-plugin-filtering` / `add-dynamic-filtering`. The Data Grid 2 change `add-dynamic-filtering` wires the same pieces into the grid, and this change mirrors it for Gallery.

## Goals / Non-Goals

**Goals:**

- The same properties, texts and behavior as Data Grid 2, so developers configure both widgets the same way.
- Wire `DynamicFilterSet` into Gallery's filter pipeline and settings storage.
- Leave Fixed mode, sorting and selection unchanged.

**Non-Goals:**

- Shared model and UI behavior (specified in the shared change).
- Studio Pro preview of the builder (Q40), developer defaults (Q22), and a configurable debounce (Q29).

## Decisions

### 1. Same XML as Data Grid 2

The property keys, captions, descriptions and attribute types are copied from the Data Grid 2 change, so docs and developer habits carry over. The **General → Filtering** group goes after **Columns**, and **Texts → Dynamic filters** after the existing text groups.

### 2. Container picks inputs by mode

`init` binds `GY.combinedFilterConfig` with `inputs: [filterHost]` in Fixed mode and `[dynamicFilterSet]` in Dynamic mode. A new token `GY.dynamicFilterSet` is bound to a singleton `DynamicFilterSet`, built from `filterFields` and `filterFieldOptions` mapped to the shared plain config, derived from the props gate so late-resolving `DynamicValue`s update.

### 3. Header

`GalleryHeader.tsx`: in Dynamic mode it renders even when `filtersPlaceholder` is empty, adds the Dynamic mode provider (on) next to the existing filter, sort and selection providers, and renders `<DynamicFilterBuilder>` after `{filtersPlaceholder}` inside `section.widget-gallery-header`.

- The sort context keeps being provided, so the Drop-down sort works in both modes.

### 4. Settings storage

`GallerySettingsSyncService` gets the `DynamicFilterSet` as an extra `Serializable` dependency and the mode in its config.

- `toJSON`: adds `dynamicFilters` when `storeFilters` is on and the mode is Dynamic.
- `fromJSON`: calls `dynamicFilterSet.fromJSON(data.dynamicFilters)` under the same conditions.
- `schemaVersion` stays at 1. A bump would make `_validate` fail and **erase** every user's stored settings (Q30).

### 5. editorConfig

`Gallery.editorConfig.ts` hides the Dynamic properties and texts in Fixed mode, adds custom captions for the two lists, and extends `check` with the four consistency checks. The checks should be a small shared helper if Data Grid 2's implementation is easy to share, otherwise a copy (two short functions).

## Risks / Trade-offs

- [A Gallery in Dynamic mode with existing header filters silently loses filtering for users who relied on them] → The header filter widgets render a visible error in the running app, which the developer will see when testing. The CHANGELOG explains the mode.
- [Settings written in Dynamic mode, read after switching back to Fixed] → `dynamicFilters` is ignored and dropped on the next write, and `filters` restores as before.
- [Copying the consistency-check logic between widgets] → Accepted for v1. Consider moving it to the shared package if a third consumer appears.

## Migration Plan

No data migration. Existing galleries default to `fixed`. Rollback is downgrading the widget: older versions ignore the unknown `dynamicFilters` field.
