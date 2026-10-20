## 0. Prerequisite

- [ ] 0.1 `@mendix/widget-plugin-filtering` change `add-dynamic-filtering` sections 1, 2 and 4 are done (Dynamic mode signal, Filter Set model, builder)

## 1. XML and Studio Pro

- [ ] 1.1 Add the **General → Filtering** group (`filteringMode`, `filterFields`, `filterFieldOptions`) to `src/Gallery.xml`, with the same keys as Data Grid 2
- [ ] 1.2 Add the **Texts → Dynamic filters** group (`addFilterCaption`, `clearFiltersCaption`, `removeFilterAriaLabel`, `filterFieldAriaLabel`)
- [ ] 1.3 Regenerate typings with a build, and update `utils/mock-container-props.ts`
- [ ] 1.4 `Gallery.editorConfig.ts`: hide the Dynamic properties and texts in Fixed mode, and add custom captions for both lists
- [ ] 1.5 `Gallery.editorConfig.ts` `check`: empty key, duplicate key, Dynamic with no fields, dangling option `fieldKey`
- [ ] 1.6 Unit tests for visibility and each check

## 2. Runtime wiring

- [ ] 2.1 Add `filteringMode` to the Gallery config
- [ ] 2.2 `tokens.ts` / `Gallery.container.ts`: bind `DynamicFilterSet` from the mapped Filter Field config, and choose `CombinedFilter` inputs by mode
- [ ] 2.3 `GalleryHeader.tsx`: always render in Dynamic mode, add the Dynamic mode provider, and render `DynamicFilterBuilder` after `filtersPlaceholder` with the texts from props
- [ ] 2.4 Unit tests: header rendered with an empty slot, header filter widget shows the error, Drop-down sort still works, datasource filter equals the Filter Set's condition

## 3. Persistence

- [ ] 3.1 `GallerySettingsSyncService`: add optional `dynamicFilters` in `toJSON`/`fromJSON`, gated by `storeFilters` and the mode, keeping `version: 1`
- [ ] 3.2 Unit tests: round-trip, settings without `dynamicFilters` keep sort and filters, an unknown field key is dropped, `storeFilters` off

## 4. Release notes and E2E

- [ ] 4.1 CHANGELOG.md (Unreleased): "We added a Dynamic filters mode that lets end users build their own filters from attributes you choose."
- [ ] 4.2 Test project: add a page with a Gallery in Dynamic mode (text, number, date and enum Filter Fields, one with enumeration options), a Drop-down sort, and a header filter widget for the error case
- [ ] 4.3 E2E specs (following `docs/requirements/e2e-test-guidelines.md`): add and remove rows, AND of two rows, reload restores rows, header filter error, sort works in Dynamic mode
