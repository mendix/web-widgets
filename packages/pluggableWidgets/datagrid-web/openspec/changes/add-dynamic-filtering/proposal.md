## Why

Data Grid 2 only supports Fixed Filters (column filters and header filter widgets) that the developer places at design time. End users can't filter on attributes the developer didn't anticipate, or add several conditions on the same attribute. This change adds a Dynamic filters mode in which end users build their own Filter Set from a list of Filter Fields the developer provides.

Vocabulary is in the repo root `CONTEXT.md`. Decisions are in `dynamic-filtering-grill.md` (Q1–Q42), and the XML draft is in `dynamic-filtering-xml-draft.md`, both in this package.

## What Changes

- New property group **General → Filtering** with:
    - `filteringMode`: `fixed` (default) | `dynamic`;
    - `filterFields`: an object list of `key` (string), `attribute` and `label` (textTemplate);
    - `filterFieldOptions`: an object list of `fieldKey`, `caption` and `value` that replaces the automatic values of an enumeration or Boolean field.
- New texts: `addFilterCaption`, `clearFiltersCaption`, `removeFilterAriaLabel`, `filterFieldAriaLabel`.
- In Dynamic mode:
    - the grid header always renders and shows the shared builder below the `filtersPlaceholder` content;
    - column filters are switched off (the header row isn't rendered and column conditions aren't applied);
    - filter widgets in the header render an error (shared Dynamic mode context).
- Studio Pro: Dynamic mode hides column `filter` slots and `columnsFilterable`, and Fixed mode hides the Dynamic properties and texts. New consistency checks for Filter Field keys and option references.
- Persistence: the Filter Set is stored as an optional `dynamicFilters` field in the existing personalization blob. `schemaVersion` stays at 3 and `settingsHash` is unchanged, so no user loses their saved layout.
- The Studio Pro design-mode preview is unchanged.

## Capabilities

### New Capabilities

- `filtering-mode`: the Filtering mode property, the Filter Field configuration, Studio Pro visibility and consistency checks, and runtime behavior per mode (header, column filters, filter widgets).
- `dynamic-filter-persistence`: how the Filter Set is saved in and restored from personalization, and its effect on existing settings.

### Modified Capabilities

None. There are no existing specs in this package, and Fixed mode behavior doesn't change.

## Impact

- `src/Datagrid.xml`, `typings/DatagridProps.d.ts` (generated)
- `src/Datagrid.editorConfig.ts` (visibility, custom captions), `src/consistency-check.ts`
- `src/model/configs/Datagrid.config.ts`, `src/model/containers/Datagrid.container.ts` (CombinedFilter inputs by mode, DynamicFilterSet binding), `src/model/tokens.ts`
- `src/components/WidgetHeader.tsx` (always render in Dynamic mode, builder, Dynamic mode provider), `src/components/Header.tsx` (no column filter row)
- `src/helpers/state/GridPersonalizationStore.ts`, `src/typings/personalization-settings.ts`
- Depends on `@mendix/widget-plugin-filtering` change `add-dynamic-filtering`
- CHANGELOG.md entry; new E2E specs
