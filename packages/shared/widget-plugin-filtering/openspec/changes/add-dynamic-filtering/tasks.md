## 1. Dynamic mode signal

- [x] 1.1 Add `EDYNAMICMODE` (code 11) to `src/errors.ts` with a message that names the fix (remove the filter widget or switch Filtering mode to Fixed filters)
- [x] 1.2 Add `src/dynamic/context.ts` with `getGlobalDynamicModeContext()` (window-registered, `...dynamicModeContext.v1`) and `useDynamicMode()`
- [x] 1.3 Make `withFilterAPI` render the `EDYNAMICMODE` alert when Dynamic mode is on, before reading the filter context
- [x] 1.4 Unit tests: no provider, provider off, provider on

## 2. Filter Set model

- [x] 2.1 Add `src/dynamic/typings.ts` (`FilterFieldConfig`, `FilterFieldOption`, persisted row type)
- [x] 2.2 Implement `DynamicFilterSet` with rows, `addRow`, `removeRow`, `clear`, and `setField` using `attrgroupFilterStore`, leaving out fields that can't be filtered (with a warning)
- [x] 2.3 Implement field changes: same kind (text, number, date) carries operator and value over, everything else resets, enum to enum always resets
- [x] 2.4 Apply enumeration options with `EnumFilterStore.setCustomOptions`, ignoring (with a warning) options for fields that aren't Enum or Boolean
- [x] 2.5 Implement `condWithMeta` / `metaKey` / `hydrate` using `reduceArray` / `restoreArray`
- [x] 2.6 Implement `toJSON` / `fromJSON` (`{ field, data: FilterData }[]`) with silent dropping of invalid rows and filtering of enum values that aren't allowed
- [x] 2.7 Unit tests for every scenario in `specs/dynamic-filter-set/spec.md`

## 3. Date picker move (after `update-react-datepicker-v9` lands in `datagrid-date-filter-web`)

- [x] 3.1 Move `DatePicker.tsx`, `CalendarIcon.tsx` and the controller pieces they need into `src/controls/date-picker/`, and add `react-datepicker` to dependencies
- [x] 3.2 Update `datagrid-date-filter-web` imports, and keep its snapshots unchanged
- [x] 3.3 Add a CHANGELOG entry to `datagrid-date-filter-web` only if user-visible behavior changes (none expected)

## 4. Builder component

- [x] 4.1 Add `src/dynamic/DynamicFilterBuilder.tsx` with list markup, row control order (remove, field, operator, value) and class names
- [x] 4.2 Wire value controls: `InputWithFilters` for text and number, shared `DatePicker` + `FilterSelector` for dates, the dropdown multi-select for enumerations, and the dropdown `Select` as the field picker
- [x] 4.3 Empty state: only "Add filter", with "Clear all" hidden until there's a row
- [x] 4.4 Focus management after add, remove and clear
- [x] 4.5 Accessible names: the remove label + field label, and the field picker label
- [x] 4.6 RTL tests for every scenario in `specs/dynamic-filter-builder/spec.md`

## 5. Styles and filter widgets

- [x] 5.1 Add `_dynamic-filters.scss` to `modules/data-widgets/src/themesource/datawidgets/web/` and import it in `main.scss`
- [x] 5.2 Add CHANGELOG entries to the text, number, date and dropdown filter widgets: "We added an error message when the widget is placed in a Data Grid 2 or Gallery that uses Dynamic filters."
- [x] 5.3 Build the package and all four filter widgets (`pnpm turbo build`) and run their unit tests
