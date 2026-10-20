## Why

Gallery filters only through filter widgets the developer places in its header at design time. End users can't filter on attributes the developer didn't anticipate, or add several conditions on the same attribute. This change adds the same Dynamic filters mode as Data Grid 2, so end users can build their own Filter Set from Filter Fields the developer provides.

Vocabulary is in the repo root `CONTEXT.md`. Decisions are in `packages/pluggableWidgets/datagrid-web/dynamic-filtering-grill.md` (Q1–Q42). The XML follows `packages/pluggableWidgets/datagrid-web/dynamic-filtering-xml-draft.md`, with the same keys as Data Grid 2.

## What Changes

- New property group **General → Filtering** with `filteringMode` (`fixed` default | `dynamic`), `filterFields` (`key`, `attribute`, `label`) and `filterFieldOptions` (`fieldKey`, `caption`, `value`), with the same keys and semantics as Data Grid 2.
- New texts: `addFilterCaption`, `clearFiltersCaption`, `removeFilterAriaLabel`, `filterFieldAriaLabel`.
- In Dynamic mode:
    - the Gallery header always renders and shows the shared builder below the `filtersPlaceholder` content;
    - filter widgets in the header render an error and don't filter. Header filter widgets are Gallery's only Fixed Filters, so in Dynamic mode the builder is the only way to filter;
    - the Drop-down sort and other header content keep working.
- Studio Pro: Fixed mode hides the Dynamic properties and texts. Dynamic mode hides nothing extra, because Gallery has no column filters. New consistency checks for Filter Field keys and option references.
- Persistence: the Filter Set is stored as an optional `dynamicFilters` field in the existing settings object, controlled by `storeFilters`. `version` stays at 1, so no user loses their saved filters or sort.
- The Studio Pro design-mode preview is unchanged.

## Capabilities

### New Capabilities

- `filtering-mode`: the Filtering mode property, the Filter Field configuration, Studio Pro visibility and consistency checks, and runtime header behavior per mode.
- `dynamic-filter-persistence`: how the Filter Set is saved in and restored from Gallery settings storage.

### Modified Capabilities

None. The existing `keyboard-event-ownership` spec covers keyboard events on gallery items. The builder lives in the header, outside the items, so that spec is unaffected.

## Impact

- `src/Gallery.xml`, `typings/GalleryProps.d.ts` (generated)
- `src/Gallery.editorConfig.ts` (visibility, captions, `check`)
- `src/model/configs/` (Gallery config), `src/model/containers/Gallery.container.ts` (CombinedFilter inputs by mode, DynamicFilterSet binding), `src/model/tokens.ts`
- `src/components/GalleryHeader.tsx` (always render in Dynamic mode, builder, Dynamic mode provider)
- `src/features/settings-storage/GallerySettingsSync.service.ts`
- Depends on `@mendix/widget-plugin-filtering` change `add-dynamic-filtering`
- CHANGELOG.md entry; new E2E specs
