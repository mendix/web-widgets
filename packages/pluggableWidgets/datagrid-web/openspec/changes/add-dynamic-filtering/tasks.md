## 0. Prerequisite

- [ ] 0.1 `@mendix/widget-plugin-filtering` change `add-dynamic-filtering` sections 1, 2 and 4 are done (Dynamic mode signal, Filter Set model, builder)

## 1. XML and Studio Pro

- [ ] 1.1 Add the **General → Filtering** group (`filteringMode`, `filterFields`, `filterFieldOptions`) to `src/Datagrid.xml` as in `dynamic-filtering-xml-draft.md`
- [ ] 1.2 Add the **Texts → Dynamic filters** group (`addFilterCaption`, `clearFiltersCaption`, `removeFilterAriaLabel`, `filterFieldAriaLabel`)
- [ ] 1.3 Regenerate typings with a build, and update `utils/test-utils.tsx` mock props
- [ ] 1.4 `Datagrid.editorConfig.ts`: hide properties by mode, and add custom captions for Filter Fields (`label (key)`) and options (`fieldKey: caption`)
- [ ] 1.5 `consistency-check.ts`: empty key, duplicate key, Dynamic with no fields, dangling option `fieldKey`
- [ ] 1.6 Unit tests for the editorConfig visibility and each consistency check

## 2. Runtime wiring

- [ ] 2.1 `Datagrid.config.ts`: add `filteringMode` and derive `columnsFilterable` as false in Dynamic mode
- [ ] 2.2 `tokens.ts` / `Datagrid.container.ts`: bind `DynamicFilterSet` from the mapped Filter Field config, and choose `CombinedFilter` inputs by mode
- [ ] 2.3 `WidgetHeader.tsx`: always render in Dynamic mode, add the Dynamic mode provider, and render `DynamicFilterBuilder` after `filtersPlaceholder` with the texts from props
- [ ] 2.4 Unit tests: column filter row hidden in Dynamic mode, header rendered with an empty slot, header filter widget shows the error, datasource filter equals the Filter Set's condition

## 3. Persistence

- [ ] 3.1 Add optional `dynamicFilters` to `GridPersonalizationStorageSettings`, keeping `schemaVersion: 3`
- [ ] 3.2 `GridPersonalizationStore`: write and apply `dynamicFilters` only in Dynamic mode with `storeFiltersInPersonalization` on
- [ ] 3.3 Unit tests: round-trip, a blob without `dynamicFilters` keeps column settings, an unknown field key is dropped, persistence off

## 4. Release notes and E2E

- [ ] 4.1 CHANGELOG.md (Unreleased): "We added a Dynamic filters mode that lets end users build their own filters from attributes you choose."
- [ ] 4.2 Test project: add a page with a grid in Dynamic mode (text, number, date and enum Filter Fields, one with enumeration options) and a header filter widget for the error case
- [ ] 4.3 E2E specs (following `docs/requirements/e2e-test-guidelines.md`): add and remove rows, AND of two rows, reload restores rows, header filter error, focus after remove
