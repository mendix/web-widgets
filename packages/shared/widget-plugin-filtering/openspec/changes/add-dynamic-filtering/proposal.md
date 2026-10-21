## Why

Data Grid 2 and Gallery only support Fixed Filters, which the app developer places at design time. End users can't filter on attributes the developer didn't anticipate, or combine several conditions on the same attribute. Both widgets are getting a Dynamic filters mode in which end users build their own Filter Set at runtime. The model, the row builder UI and the "Dynamic mode" signal for filter widgets are the same in both, so they belong in this shared package rather than being written twice.

Vocabulary (Fixed Filter, Dynamic Filter, Filter Set, Filter Field, Filtering Mode) is defined in the repo root `CONTEXT.md`. The decisions behind this change are recorded in `packages/pluggableWidgets/datagrid-web/dynamic-filtering-grill.md` (Q1–Q42).

## What Changes

- Add a **Filter Set store**: an observable list of Dynamic Filter rows, combined with AND, that plugs into the existing `CombinedFilter` as one more input and serializes to and from a plain array for persistence.
- Each row creates its filter store through the existing `attrgroupFilterStore` (`stores/input/store-utils.ts`), unchanged, so the filter kind, operators and timing match the column filters exactly.
- Add **Filter Field** configuration types: a developer-specified key, an attribute, a label, and optional enumeration options that replace the automatic values.
- Add a **Dynamic filter builder** React component: an always-visible list of rows (remove, field picker, operator, value), plus "Add filter" and "Clear all". It reuses `InputWithFilters`, `EnumFilterContainer` / the dropdown `Select`, and `DatePicker`.
- Move `DatePicker` (and `CalendarIcon`) from `datagrid-date-filter-web` into this package so rows can reuse it. The date filter widget imports it from here.
- Add a **Dynamic mode context** and a new `APIError`. `withFilterAPI` renders that error for any filter widget placed in the header while the parent is in Dynamic mode.
- Add the `_dynamic-filters.scss` partial to the Data Widgets module theme (`modules/data-widgets/src/themesource/datawidgets/web/`).

## Capabilities

### New Capabilities

- `dynamic-filter-set`: the Filter Set model: Filter Fields, rows, kind inference, operators, AND combination, field changes, enumeration options, serialization, and dropping invalid rows on restore.
- `dynamic-filter-builder`: the builder UI: layout, empty state, add, remove and clear, focus management, accessible labels, and CSS classes.
- `dynamic-mode-signal`: the context that tells child filter widgets the parent is in Dynamic mode, and the error those widgets render.

### Modified Capabilities

None. This package has no specs yet, and Fixed Filter behavior doesn't change.

## Impact

- **This package (`@mendix/widget-plugin-filtering`)**: new modules under `src/dynamic/` (store, types, builder, context), a new error in `src/errors.ts`, a change to `src/helpers/withFilterAPI.tsx`, and new `src/controls/date-picker/`.
- **`datagrid-date-filter-web`**: `DatePicker.tsx` and `CalendarIcon.tsx` move out, and imports are updated. This depends on the pending `update-react-datepicker-v9` change in that package, which must land first, so the move happens on the v9 API.
- **Filter widgets** (`datagrid-text-filter-web`, `-number-`, `-date-`, `-dropdown-`): there's no source change beyond the date picker move, but each needs a rebuild and a CHANGELOG entry so it renders the Dynamic mode error.
- **`modules/data-widgets`**: new theme partial `_dynamic-filters.scss`, imported in `main.scss`.
- **Consumers**: `datagrid-web` and `gallery-web`, each with its own `add-dynamic-filtering` change.
- **Dependencies**: `react-datepicker` moves into this package's dependencies along with `DatePicker`. There are no new third-party packages.
