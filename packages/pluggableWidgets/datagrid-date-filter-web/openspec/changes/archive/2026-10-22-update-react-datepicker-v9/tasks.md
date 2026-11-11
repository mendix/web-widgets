## 1. Dependencies

- [x] 1.1 In `packages/pluggableWidgets/datagrid-date-filter-web/package.json`, set `react-datepicker` to `^9.1.0` and `date-fns` to `^4.1.0`
- [x] 1.2 Remove the `@types/react-datepicker` devDependency from the same file
- [x] 1.3 In `packages/shared/widget-plugin-filtering/package.json`, widen the `date-fns` peerDependency to `^3.6.0 || ^4.1.0` and bump its devDependency to `^4.1.0`
- [x] 1.4 Run `pnpm install` from the repo root and confirm no peer-dependency warnings for the touched packages
- [x] 1.5 Confirm `react-onclickoutside` is no longer reachable via `react-datepicker` (`pnpm why react-onclickoutside`)

## 2. Type migration — controller

- [x] 2.1 In `src/helpers/DatePickerController.ts`, change the import to `import ReactDatePicker, { DatePickerProps, DatePicker } from "react-datepicker"`
- [x] 2.2 Convert `DatePickerBackendProps` from an `interface ... extends` to a `type` alias intersecting `DatePickerProps` with `ClassAttributes<DatePicker>` (an interface cannot extend the v9 union)
- [x] 2.3 Change `pickerRef` to `createRef<DatePicker>()`, dropping the `<undefined, undefined>` type arguments
- [x] 2.4 Retype `UNSAFE_handleChangeRaw` to accept `event?: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>` and keep the `event?.type === "change"` range-mode guard
- [x] 2.5 Verify `handlePickerChange` still accepts `Date | [Date | null, Date | null] | null` and that its `isDate` / null / tuple branches are unchanged

## 3. Type migration — component

- [x] 3.1 In `src/components/DatePicker.tsx`, import the library types, aliasing the library's `DatePicker` class (the local component shares that name)
- [x] 3.2 Change `InheritedProps` to `Pick<DatePickerProps, ...>`, dropping the `<boolean>` type argument
- [x] 3.3 Retype `pickerRef` to `RefObject<`_aliased library class_`| null>`
- [x] 3.4 Update the `StaticProps` alias to derive from `DatePickerProps`
- [x] 3.5 Remove the `useWeekdaysShort={false}` prop from the rendered picker (no longer in the public props surface; `false` was already the default)
- [x] 3.6 ~~Cast only the `onChange` prop at the JSX site~~ — superseded: a cast cannot work here. The union is
      discriminated on `selectsRange`, and our `selectsRange` is a runtime `boolean`, which matches no single arm.
      Resolved with zero casts instead: narrow the discriminant at the JSX site with
      `selectsRange={props.selectsRange || undefined}` (type `true | undefined`, so the range arm is selected;
      the picker treats an absent value as `false`), and declare our own `onChange` as `PickerChangeHandler`,
      which accepts `Date | [Date | null, Date | null] | null` and is therefore assignable to either arm.
- [x] 3.7 Run `pnpm run lint` and a type-check; resolve remaining errors without introducing `any` or `@ts-expect-error`
      — `tsc --noEmit` is clean and lint reports 0 errors, with no suppressions and no casts

## 4. Verify date-fns 4 compatibility

- [x] 4.1 Confirm `src/utils/date-utils.ts` still type-checks — `date-fns/locale` namespace import, the `Locale` type, and `registerLocale`
- [x] 4.2 Confirm `src/helpers/useSetup.ts`'s `Locale` import from `date-fns` still resolves
- [x] 4.3 Confirm `src/helpers/DatePickerController.ts`'s `date-fns/isDate` sub-path import still resolves under v4

## 5. Unit tests

- [x] 5.1 Run `pnpm run test` and catalogue failures before changing anything
- [x] 5.2 Regenerate snapshots with `pnpm run test -u`, then read the full diff — **no snapshot changes at all**: the
      closed-picker markup is byte-identical to v6. The 5 failures were the locale weekday tests, and the cause was
      _not_ locale registration (month names localise correctly under date-fns 4). Two v9 DOM changes broke the
      tests' structural navigation:
      (a) `.react-datepicker__day-names` moved out of `.react-datepicker__header` into a new
      `role="table"` > `role="rowgroup"` wrapper, so `header.lastChild` is now the month/year dropdown container
      (hence the concatenated month names and years in the received value);
      (b) each day name now renders a visually hidden full weekday name (`.react-datepicker__sr-only`, e.g. "Sunday")
      next to an `aria-hidden` abbreviation ("Su"), so the row's `textContent` is `"SundaySuMondayMo…"`.
- [x] 5.3 In the snapshot diff, confirm no loss of `aria-expanded`, `aria-controls`, `aria-haspopup`, or the screen-reader label wiring on input and toggle button — all retained; snapshots unchanged
- [x] 5.4 Add or strengthen explicit assertions for the toggle button's `aria-expanded` tracking calendar state and `aria-controls` matching the portal container id (per spec: _Calendar toggle button exposes accessible expanded state_)
- [x] 5.5 Add or strengthen assertions covering both selection modes: single date sets arg1, range sets arg1 and arg2, null clears both (per spec: _Picker change events map onto filter arguments_) — new `src/helpers/__tests__/DatePickerController.spec.ts`
- [x] 5.6 Assert the day-name row is unchanged after removing `useWeekdaysShort` — the locale tests now read the
      `aria-hidden` abbreviations per column, plus a new test asserting the columns' accessible names
- [x] 5.7 Confirm the full unit suite passes — 68 passed, 9 snapshots passed
- [x] 5.8 Keep the `calendar toggle button` block last in `DatagridDateFilter.spec.tsx`: rendering the widget advances
      React's `useId` counter, which the filter-selector snapshots capture verbatim, so inserting renders earlier in
      the file churns unrelated snapshots

## 6. Build and downstream check

- [x] 6.1 Run `pnpm turbo build` in the widget package and confirm a clean build
- [x] 6.2 Confirm the editor preview's `require("react-datepicker/dist/react-datepicker.css")` still resolves against v9
      — it does, via the bundler. Verified in the output rather than by assumption: the widget CSS contains 278
      `react-datepicker` rules including v9's new `.react-datepicker__sr-only`, and the editor-preview bundle inlines
      the stylesheet.
      **Caveat worth knowing:** v9 added an `exports` map whose subpath entry uses the legacy _trailing-slash_ form
      (`"./dist/": "./dist/"`). Node 17+ dropped support for that form, so `require.resolve` of the CSS fails under
      plain Node with `ERR_PACKAGE_PATH_NOT_EXPORTED`. Rollup's resolver still honours it, so our build and Jest are
      fine — but any future tool that strictly follows Node resolution would break on this import.
- [x] 6.3 Build the other `widget-plugin-filtering` consumers (`datagrid-web`, `datagrid-text-filter-web`, `datagrid-number-filter-web`, `datagrid-dropdown-filter-web`, `gallery-web`, `dropdown-sort-web`) to confirm the peer widening broke nothing — all built clean

## 7. Manual verification in Studio Pro

> **Blocked — needs a workstation with Studio Pro.** `MX_PROJECT_PATH` is unset and no Mendix test project for this
> widget is checked out locally, so none of 7.1–7.9 could be executed. The widget does build and deploy-package
> cleanly (`pnpm turbo build`, `pnpm run verify`), so this section is purely the interactive pass.

- [ ] 7.1 Deploy to a Mendix test project via `MX_PROJECT_PATH` and `pnpm start`
- [ ] 7.2 Verify calendar opens on mouse-down and on Enter/Space from the toggle button, and that focus lands in the picker
- [ ] 7.3 Verify the popup escapes the Data Grid's overflow and stays anchored while the page scrolls (per spec: _Calendar popup renders into a widget-owned portal_)
- [ ] 7.4 If positioning is wrong, add `transform: false` to the existing `popperProps` (which already sets
      `strategy: "fixed"`). **Do not copy `date-time-picker-web`'s `popperModifiers` entry**: v9 replaced Popper.js
      with Floating UI (`@floating-ui/react`), so `popperProps` is `Omit<UseFloatingOptions, "middleware">` and
      `popperModifiers` is a Floating UI `Middleware[]`. `computeStyles` / `gpuAcceleration` are Popper-only options;
      that sibling widget's entry is a Popper-era leftover with `fn: () => ({})`, i.e. a no-op. `transform: false`
      is the option that actually changes positioning (top/left instead of a `translate()` transform).
- [ ] 7.5 Verify single-date filtering by typed input and by calendar click
- [ ] 7.6 Verify `between` mode: range selection, calendar staying open between endpoints, clear affordance, Backspace clearing, and typing suppressed
- [ ] 7.7 Verify `empty` / `notEmpty` disable the input
- [ ] 7.8 Verify month/year dropdowns, first-day-of-week, and date parsing under a non-`en-US` session locale
- [ ] 7.9 Verify the Atlas theme still applies — including the `.react-datepicker-popper[data-placement^="bottom"]` rule in `data-widgets`' `_date-picker.scss`

## 8. E2E

> **8.1 / 8.3 / 8.4 blocked — the Docker daemon is not running**, and `run-e2e` needs it to bring up the Mendix app.

- [ ] 8.1 Run the E2E suite for the widget
- [x] 8.2 Confirm the `.react-datepicker__month-select`, `.react-datepicker__year-select`, and `.react-datepicker__day--0NN` selectors still resolve — verified against the actual v9 DOM (dumped from a jsdom render of the widget with the calendar open), not just from the changelog: all four selectors the spec uses are present and unchanged
- [ ] 8.3 Confirm the axe `wcag21aa` scan reports no violations.
      Note: the scan runs on `/` with the calendar **closed**, so it does not cover the calendar markup — which is
      exactly where v9 changed roles (it now emits `role="table"` / `rowgroup` / `row` / `columnheader` / `gridcell`
      and a `role="dialog" aria-modal="true"` wrapper). Consider opening the calendar before the scan so this pass
      actually exercises the new structure.
- [ ] 8.4 If `dataGridDateFilter-chromium-linux.png` fails only from benign calendar-chrome changes, regenerate the baseline in CI — not locally on macOS

## 9. Release prep

- [x] 9.1 Add a user-facing CHANGELOG entry describing the picker dependency update (behavior, not implementation detail)
- [x] 9.2 Leave the version bump for release time per repo convention — version left at 3.11.3
- [x] 9.3 Run `pnpm run lint` and `pnpm run verify` for a final check — lint: 0 errors (3 pre-existing import/order
      warnings in `DatagridDateFilter.spec.tsx`); verify: success
