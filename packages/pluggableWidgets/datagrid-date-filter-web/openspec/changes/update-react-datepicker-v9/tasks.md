## 1. Dependencies

- [ ] 1.1 In `packages/pluggableWidgets/datagrid-date-filter-web/package.json`, set `react-datepicker` to `^9.1.0` and `date-fns` to `^4.1.0`
- [ ] 1.2 Remove the `@types/react-datepicker` devDependency from the same file
- [ ] 1.3 In `packages/shared/widget-plugin-filtering/package.json`, widen the `date-fns` peerDependency to `^3.6.0 || ^4.1.0` and bump its devDependency to `^4.1.0`
- [ ] 1.4 Run `pnpm install` from the repo root and confirm no peer-dependency warnings for the touched packages
- [ ] 1.5 Confirm `react-onclickoutside` is no longer reachable via `react-datepicker` (`pnpm why react-onclickoutside`)

## 2. Type migration — controller

- [ ] 2.1 In `src/helpers/DatePickerController.ts`, change the import to `import ReactDatePicker, { DatePickerProps, DatePicker } from "react-datepicker"`
- [ ] 2.2 Convert `DatePickerBackendProps` from an `interface ... extends` to a `type` alias intersecting `DatePickerProps` with `ClassAttributes<DatePicker>` (an interface cannot extend the v9 union)
- [ ] 2.3 Change `pickerRef` to `createRef<DatePicker>()`, dropping the `<undefined, undefined>` type arguments
- [ ] 2.4 Retype `UNSAFE_handleChangeRaw` to accept `event?: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>` and keep the `event?.type === "change"` range-mode guard
- [ ] 2.5 Verify `handlePickerChange` still accepts `Date | [Date | null, Date | null] | null` and that its `isDate` / null / tuple branches are unchanged

## 3. Type migration — component

- [ ] 3.1 In `src/components/DatePicker.tsx`, import the library types, aliasing the library's `DatePicker` class (the local component shares that name)
- [ ] 3.2 Change `InheritedProps` to `Pick<DatePickerProps, ...>`, dropping the `<boolean>` type argument
- [ ] 3.3 Retype `pickerRef` to `RefObject<`_aliased library class_`| null>`
- [ ] 3.4 Update the `StaticProps` alias to derive from `DatePickerProps`
- [ ] 3.5 Remove the `useWeekdaysShort={false}` prop from the rendered picker (no longer in the public props surface; `false` was already the default)
- [ ] 3.6 Cast only the `onChange` prop at the JSX site to satisfy the runtime-selected union arm, with a comment explaining why; do not cast the whole props object
- [ ] 3.7 Run `pnpm run lint` and a type-check; resolve remaining errors without introducing `any` or `@ts-expect-error`

## 4. Verify date-fns 4 compatibility

- [ ] 4.1 Confirm `src/utils/date-utils.ts` still type-checks — `date-fns/locale` namespace import, the `Locale` type, and `registerLocale`
- [ ] 4.2 Confirm `src/helpers/useSetup.ts`'s `Locale` import from `date-fns` still resolves
- [ ] 4.3 Confirm `src/helpers/DatePickerController.ts`'s `date-fns/isDate` sub-path import still resolves under v4

## 5. Unit tests

- [ ] 5.1 Run `pnpm run test` and catalogue failures before changing anything
- [ ] 5.2 Regenerate snapshots with `pnpm run test -u`, then read the full diff
- [ ] 5.3 In the snapshot diff, confirm no loss of `aria-expanded`, `aria-controls`, `aria-haspopup`, or the screen-reader label wiring on input and toggle button
- [ ] 5.4 Add or strengthen explicit assertions for the toggle button's `aria-expanded` tracking calendar state and `aria-controls` matching the portal container id (per spec: _Calendar toggle button exposes accessible expanded state_)
- [ ] 5.5 Add or strengthen assertions covering both selection modes: single date sets arg1, range sets arg1 and arg2, null clears both (per spec: _Picker change events map onto filter arguments_)
- [ ] 5.6 Assert the day-name row is unchanged after removing `useWeekdaysShort`
- [ ] 5.7 Confirm the full unit suite passes

## 6. Build and downstream check

- [ ] 6.1 Run `pnpm turbo build` in the widget package and confirm a clean build
- [ ] 6.2 Confirm the editor preview's `require("react-datepicker/dist/react-datepicker.css")` still resolves against v9
- [ ] 6.3 Build the other `widget-plugin-filtering` consumers (`datagrid-web`, `datagrid-text-filter-web`, `datagrid-number-filter-web`, `datagrid-dropdown-filter-web`, `gallery-web`, `dropdown-sort-web`) to confirm the peer widening broke nothing

## 7. Manual verification in Studio Pro

- [ ] 7.1 Deploy to a Mendix test project via `MX_PROJECT_PATH` and `pnpm start`
- [ ] 7.2 Verify calendar opens on mouse-down and on Enter/Space from the toggle button, and that focus lands in the picker
- [ ] 7.3 Verify the popup escapes the Data Grid's overflow and stays anchored while the page scrolls (per spec: _Calendar popup renders into a widget-owned portal_)
- [ ] 7.4 If positioning is wrong, apply the `popperProps: { transform: false }` plus `computeStyles` / `gpuAcceleration: false` middleware treatment used by `date-time-picker-web`, and re-verify
- [ ] 7.5 Verify single-date filtering by typed input and by calendar click
- [ ] 7.6 Verify `between` mode: range selection, calendar staying open between endpoints, clear affordance, Backspace clearing, and typing suppressed
- [ ] 7.7 Verify `empty` / `notEmpty` disable the input
- [ ] 7.8 Verify month/year dropdowns, first-day-of-week, and date parsing under a non-`en-US` session locale
- [ ] 7.9 Verify the Atlas theme still applies — including the `.react-datepicker-popper[data-placement^="bottom"]` rule in `data-widgets`' `_date-picker.scss`

## 8. E2E

- [ ] 8.1 Run the E2E suite for the widget
- [ ] 8.2 Confirm the `.react-datepicker__month-select`, `.react-datepicker__year-select`, and `.react-datepicker__day--0NN` selectors still resolve
- [ ] 8.3 Confirm the axe `wcag21aa` scan reports no violations
- [ ] 8.4 If `dataGridDateFilter-chromium-linux.png` fails only from benign calendar-chrome changes, regenerate the baseline in CI — not locally on macOS

## 9. Release prep

- [ ] 9.1 Add a user-facing CHANGELOG entry describing the picker dependency update (behavior, not implementation detail)
- [ ] 9.2 Leave the version bump for release time per repo convention
- [ ] 9.3 Run `pnpm run lint` and `pnpm run verify` for a final check
