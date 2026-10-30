## Why

The Date Filter widget is pinned to `react-datepicker@^6.6.0`, three major versions behind the current `9.1.0`. Staying on v6 keeps a `react-onclickoutside` transitive dependency that upstream removed in v7.4.0, blocks the React 19 compatibility that v8+ declares, and forces the widget to carry `@types/react-datepicker` because v6 shipped no bundled types. The sibling `date-time-picker-web` widget already runs `^8.9.0`, so the repo maintains two divergent picker APIs.

## What Changes

- Upgrade `react-datepicker` from `^6.6.0` to `^9.1.0` in `datagrid-date-filter-web`.
- Remove the `@types/react-datepicker` devDependency — v7.0.0 onward ships its own `dist/index.d.ts`.
- **BREAKING (internal API only)** Replace the `ReactDatePickerProps` type import with `DatePickerProps`, and the default-export-as-type `ReactDatePicker` instance type with the named `DatePicker` class export. The v9 `DatePicker` class is non-generic, so the `ReactDatePicker<undefined, undefined>` / `ReactDatePickerProps<boolean>` type arguments used in `DatePicker.tsx` and `DatePickerController.ts` must be dropped.
- Adapt `onChange` to the v9 discriminated union: the props type now keys `onChange`'s signature off `selectsRange`/`selectsMultiple`, so the single controller handler that accepts `Date | [Date | null, Date | null] | null` needs an explicit cast at the assignment boundary.
- Adapt `onChangeRaw` to its narrowed v9 signature — `(event?: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>, selectionMeta?) => void` instead of v6's `BaseSyntheticEvent`.
- Remove the `useWeekdaysShort` prop from the picker element: it is no longer part of the public `DatePickerProps` surface in v9.
- Bump `date-fns` from `^3.6.0` to `^4.1.0` in the widget, matching the version `react-datepicker@8+` depends on, and widen the `date-fns` peer range in `@mendix/widget-plugin-filtering` to admit v4.
- Refresh the three Jest snapshots and re-verify the Playwright E2E selectors against v9's rendered DOM.
- Add a user-facing CHANGELOG entry describing the dependency refresh.

## Capabilities

### New Capabilities

- `date-picker-integration`: How the Date Filter widget binds to the third-party `react-datepicker` component — the props contract it passes, the calendar popup/portal and accessibility behavior it depends on, the CSS class names it and the Atlas theme rely on, and the date-library version constraints. Captures behavior that must hold across picker upgrades so future bumps have a regression baseline.

### Modified Capabilities

None. This change alters the widget's third-party integration and internal types; the widget's own filtering behavior, XML property contract, and user-visible interaction model stay the same.

## Impact

**Widget source (`datagrid-date-filter-web`)**

- `src/components/DatePicker.tsx` — type imports, `InheritedProps` pick, `pickerRef` type, removal of `useWeekdaysShort`, `StaticProps` alias.
- `src/helpers/DatePickerController.ts` — `DatePickerBackendProps` alias, `pickerRef` `createRef` type argument, `handlePickerChange` and `UNSAFE_handleChangeRaw` signatures.
- `src/utils/date-utils.ts` — `registerLocale` import still valid; verify `date-fns/locale` `Locale` shape under v4.
- `src/helpers/useSetup.ts` — imports `Locale` from `date-fns`; confirm under v4.
- `src/DatagridDateFilter.editorPreview.tsx` — `require("react-datepicker/dist/react-datepicker.css")`; v9 still publishes this path via its `./dist/` export.
- Three snapshot files under `src/components/__tests__/__snapshots__/`.

**Dependencies**

- `react-datepicker` `^6.6.0` → `^9.1.0`; drops the `react-onclickoutside` transitive (removed upstream in v7.4.0, replaced by an internal `ClickOutsideWrapper`).
- `@types/react-datepicker@^6.2.0` removed.
- `date-fns` `^3.6.0` → `^4.1.0` in the widget; peer range widened in `@mendix/widget-plugin-filtering` (declared as peer + dev only, with zero `src/` imports, so no code change is required there and the other six filter widgets are unaffected).
- `@floating-ui/react` and `clsx` remain bundled deps of `react-datepicker`; v6 already used floating-ui, so no popper.js migration is involved.
- React 18 stays supported — v9 peers on `^16.9.0 || ^17 || ^18 || ^19`, satisfying the repo's `>=18.0.0 <19.0.0` pin.

**Styling**

- `packages/modules/data-widgets/src/themesource/datawidgets/web/_date-picker.scss` targets `.react-datepicker-popper[data-placement^="bottom"]`; v9 still emits `data-placement` from `popper_component.tsx`, so the selector holds. Between v6 and v9 only `.react-datepicker__week-number--keyboard-selected` was dropped and eight class names added (including `__sr-only`, `__header-wrapper`, `__month-select`, `__year-select`), none of which the theme file overrides. Requires visual verification rather than code change.

**Tests**

- `e2e/DataGridDateFilter.spec.js` depends on `.react-datepicker__month-select`, `.react-datepicker__year-select`, and `.react-datepicker__day--0NN` — all present in v9.
- One E2E screenshot baseline (`dataGridDateFilter-chromium-linux.png`) may need regeneration if v9 changes calendar chrome.

**Release**

- Widget version bump from `3.11.3` plus a CHANGELOG entry; the widget is distributed inside the `data-widgets` module.
