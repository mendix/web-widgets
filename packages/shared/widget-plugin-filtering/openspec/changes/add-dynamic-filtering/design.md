## Context

Both Data Grid 2 and Gallery build their datasource filter with `CombinedFilter` (`stores/generic/CombinedFilter.ts`). It reduces the conditions of its `inputs` into one AND condition, saves per-input meta in `sessionStorage`, and hydrates the inputs back from `datasource.filter` on back navigation. Today the inputs are the `CustomFilterHost` (header filter widgets) and, in Data Grid 2, the columns store.

Filter widgets get their parent through the global filter context (`context.ts`, `com.mendix.widgets.web.filterable.filterContext.v2`) and render through `withFilterAPI`, which already turns a missing context into an `Alert`.

The per-kind stores (`StringInputFilterStore`, `NumberInputFilterStore`, `DateInputFilterStore`, `EnumFilterStore`) already implement the `Filter` interface (`toJSON`, `fromJSON`, `fromViewState`, `condition`), and `attrgroupFilterStore` picks the right one from an attribute type.

Decisions come from the grilling notes (`packages/pluggableWidgets/datagrid-web/dynamic-filtering-grill.md`). This document covers how the shared part implements them.

## Goals / Non-Goals

**Goals:**

- One Filter Set model and one builder component, used unchanged by Data Grid 2 and Gallery.
- Reuse the existing per-kind stores and controls so Dynamic rows behave exactly like the filter widgets.
- Signal Dynamic mode to filter widgets without changing each filter widget's source.

**Non-Goals:**

- Widget XML, editorConfig, consistency checks and persistence wiring. These belong to each widget's own change.
- Developer defaults, association fields, OR between rows, row limits, a configurable debounce (Q22, Q16, Q1, Q41, Q29).
- Studio Pro preview of the builder (Q40).

## Decisions

### 1. `DynamicFilterSet` is a `CombinedFilter` input

`src/dynamic/DynamicFilterSet.ts` is a MobX store exposing `rows`, `addRow()`, `removeRow(id)`, `clear()`, `setField(rowId, key)`, `condWithMeta`, `metaKey = "DynamicFilterSet"`, `hydrate()`, `toJSON()` and `fromJSON()`.

- `condWithMeta` reduces the row conditions with the same `reduceArray` helper `CombinedFilter` uses, so the AND and the meta format are consistent. `hydrate` uses `restoreArray` plus its meta (`[fieldKey, …]`) to recreate rows, then calls each row store's `fromViewState`.
- The widget decides the inputs at container init: in Dynamic mode it's `[dynamicFilterSet]`, in Fixed mode the current inputs. Because the mode is a design-time property, the input count stays stable, which `CombinedFilter.hydrate` requires.
- _Alternative considered_: register each row as a key in `CustomFilterHost`. Rejected: row keys are dynamic, the host's settings buffer assumes stable keys, and Fixed and Dynamic data would mix in one map.

### 2. Rows wrap the existing stores

A row is `{ id, fieldKey | null, store | null }`. `setField` creates the store with `attrgroupFilterStore(attr.type, attr, null)`. For a same-kind change (text, number, date) it copies the operator and value from the old store through `toJSON()`/`fromJSON()` on the new one. Otherwise it starts fresh (Q37). For enumeration fields, it calls `store.setCustomOptions(...)` when options are configured for that key.

- Row ids are generated locally (an incrementing counter) and are never persisted.
- The text and number debounce stays where it is today, in the input controllers, so there's no new timing code.

### 3. Persisted row = `{ field, data: FilterData }`

`toJSON()` returns `Array<{ field: string; data: FilterData }>`, where `data` is the store's own `toJSON()`.

- **This changes the shape in the XML draft**, which was `{ field, operator, values }`. Reusing `FilterData` means no new per-kind serializer, and validation lives in the stores' existing `fromJSON`. The fields are still keyed by the developer key (Q15).
- `fromJSON` drops a row when its key is unknown, when the store rejects the data (detected by the store not reflecting it, or by a guard per kind), or when an enum row ends up with no allowed values (Q5/Q13). Anything that isn't an array means an empty set.

### 4. Filter Field config is plain data

`src/dynamic/typings.ts` defines `FilterFieldConfig { key; attribute: ListAttributeValue; label: string }` and `FilterFieldOption { fieldKey; caption: string; value: string }`. Widgets map their props (`DynamicValue<string>`, expression values) into these, so the shared package doesn't depend on any widget's generated typings. Fields whose attribute isn't filterable, or has an unsupported type, are left out of the picker, with one `console.warn`.

### 5. Builder component

`src/dynamic/DynamicFilterBuilder.tsx` is an `observer` component taking `{ filterSet, fields, texts }`. It renders the markup and classes from the `dynamic-filter-builder` spec. Focus moves are implemented with refs keyed by row id, plus one ref for "Add filter", and run in an effect after the rows change (keyboard or mouse, Q39).

- The enum value control uses the multi-select from `widget-plugin-dropdown-filter` (`TagPicker` or `Select` in multiselect mode, whichever `EnumFilterContainer` uses for `multiselect: true` with the default selection method), driven directly by the row's `EnumFilterStore`.

### 6. `DatePicker` moves here

`DatePicker.tsx`, `CalendarIcon.tsx` and the controller pieces they need move from `datagrid-date-filter-web/src/components` (and `helpers/DatePickerController.ts` if needed) to `src/controls/date-picker/`. `react-datepicker` moves to this package's `dependencies`. The date filter widget imports them from `@mendix/widget-plugin-filtering/controls/date-picker/...`.

- **Ordering**: `datagrid-date-filter-web` has a pending change `update-react-datepicker-v9` that rewrites these files. This move must start after it lands, so the code isn't moved twice.

### 7. Dynamic mode signal

`src/dynamic/context.ts` exports `getGlobalDynamicModeContext()`, registered on `window` under `com.mendix.widgets.web.filterable.dynamicModeContext.v1` the same way `getGlobalFilterContextObject` is, plus a `useDynamicMode()` hook. `withFilterAPI` checks it first and renders `EDYNAMICMODE` (new code `11` in `errors.ts`).

- Defense in depth: in Dynamic mode the widgets also leave `CustomFilterHost` out of the `CombinedFilter` inputs, so even an outdated filter widget build that doesn't know the new context can't affect the data.

### 8. Styles

`modules/data-widgets/src/themesource/datawidgets/web/_dynamic-filters.scss` holds layout only: flex-wrap on the list, a gap from `variables.scss`, `overflow: hidden` and `white-space: nowrap` on rows, and alignment. It uses Bootstrap-style dash class names, not pure BEM (Q42).

## Risks / Trade-offs

- [Old filter widget builds in apps don't know the new context, so they render normally in Dynamic mode] → They're excluded from `CombinedFilter` inputs, so they're inert. The widget CHANGELOGs ask developers to update the Data Widgets module.
- [Copying operator and value via `toJSON`/`fromJSON` across fields of the same kind relies on `FilterData` not containing attribute ids] → Verify for each store in unit tests, and fall back to a reset if a store's data is attribute-bound.
- [Detecting "invalid data" in `fromJSON` per store may not be uniform] → Add a small per-kind validator in `DynamicFilterSet` instead of relying on store side effects.
- [The `DatePicker` move touches a released widget] → It's a pure move with snapshot parity, done after the v9 upgrade.
- [Hydration count mismatch if the mode flips between visits] → `CombinedFilter.hydrate` already logs and skips on a mismatch. Users lose only the view state, not their personalization.

## Open Questions

- None. Resolved during implementation: enum rows render `EnumFilterContainer` with `multiselect` on and `filterable` off, which is the dropdown `Select` with checkboxes. The date picker move covered the whole stack (`DatePicker`, `CalendarIcon`, `DateFilterComponent`, `DatePickerController`, `useDatePickerSetup`, `date-utils`), not just `DatePicker`.
