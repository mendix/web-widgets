## Context

`datagrid-date-filter-web@3.11.3` depends on `react-datepicker@^6.6.0` plus the community `@types/react-datepicker@^6.2.0`. Upstream is at `9.1.0`. Three majors of drift bring:

- **v7.0.0** — the library was rewritten in TypeScript and began shipping `dist/index.d.ts`. The community types package became redundant and diverges from reality.
- **v7.4.0** — `react-onclickoutside` was dropped (commit `31ff0f8`) in favour of an internal `ClickOutsideWrapper`, removing a transitive dependency.
- **v8.0.0** — `date-fns` bumped to `^4.1.0` (commit `9484932`); React 19 added to the peer range.
- **v9.x** — current line; `DatePicker` is a non-generic class and `DatePickerProps` is a discriminated union keyed on `selectsRange` / `selectsMultiple`.

Two things that would normally make this jump risky do **not** apply:

- **No popper.js migration.** `@floating-ui/react` landed in v5.0.0, so v6.6.0 is already on floating-ui. `popperPlacement`, `popperProps`, `popperContainer`, and `showPopperArrow` all survive in v9; only their underlying option types changed (`popperProps` is now `Omit<UseFloatingOptions, "middleware">`).
- **No CSS class churn.** Diffing `src/stylesheets/datepicker.scss` between `v6.6.0` and `v9.1.0` shows exactly one removed class (`.react-datepicker__week-number--keyboard-selected`, unused here) and eight added. Every selector the widget, the Atlas theme file, and the E2E spec rely on still exists, and `popper_component.tsx` still emits `data-placement`.

The real work is therefore concentrated in TypeScript types across two files.

A close in-repo reference exists: `date-time-picker-web` already runs `react-datepicker@^8.9.0` and shows the target import shape (`import ReactDatePicker, { DatePickerProps, DatePicker } from "react-datepicker"`), the non-generic `createRef<DatePicker>()`, and the `MouseEvent | KeyboardEvent` shape of `onChangeRaw`. It is not a drop-in template — it uses `makeAutoObservable`, holds dates in a local array instead of a filter store, and has no `selectsRange`-vs-single duality driven by a filter function — but it de-risks the API questions.

Constraints:

- Repo pins React to `>=18.0.0 <19.0.0`; v9 peers on `^16.9.0 || ^17 || ^18 || ^19`, so React 18 stays valid.
- `date-fns` versions already vary across the monorepo (`^2.30.0` in two chart widgets, `^3.6.0` here and in `widget-plugin-filtering`, `^4.1.0` in `calendar-web`), so pnpm already resolves multiple majors side by side.
- The widget ships inside the `data-widgets` module; the Atlas theme override lives in that module, not in this package.

## Goals / Non-Goals

**Goals:**

- `react-datepicker@^9.1.0` with the widget's user-visible behavior unchanged.
- Drop `@types/react-datepicker`; consume the library's own types.
- Align `date-fns` on `^4.1.0` for this widget, and widen the `widget-plugin-filtering` peer range to admit it.
- Capture the picker integration contract as a spec so the next bump has a regression baseline.
- Keep the type surface honest — no blanket `any` or `@ts-expect-error` to paper over the union.

**Non-Goals:**

- Bumping `date-time-picker-web` from `^8.9.0` to `^9.1.0`. Separate change; this one is scoped to the widget that is actually behind.
- Refactoring `DatePickerController`, the mobx wiring, or the `withLinkedDateStore` / `withParentProvidedDateStore` HOCs.
- Adopting new v7-v9 features (`selectsMultiple`, `swapRange`, `showIcon`, the `timezone` prop and its optional `date-fns-tz` peer).
- Migrating the other six `widget-plugin-filtering` consumers to date-fns 4.
- Changing the widget's XML property contract.

## Decisions

### Go to 9.1.0 in one step, not 6 → 7 → 8 → 9

The intermediate majors add no value as separate commits: v7's break is the types rename, v8's is date-fns, and none of the removed APIs are reintroduced later. Staging would mean three rounds of snapshot churn for the same end state. Verification comes from the type checker plus the existing test suites rather than from intermediate stops.

_Alternative considered:_ land v8.10.0 first to match `date-time-picker-web`, then v9. Rejected — it defers rather than removes the v9 type work and needs two release cycles for one dependency refresh.

### Replace the type imports rather than shim the old names

v6's community types exported `ReactDatePickerProps<T>` and a generic `declare class ReactDatePicker<...>`. v9 exports `DatePickerProps` (a union) and a non-generic `DatePicker` class, with the class also available as the default export. The two usage sites change like this:

- `DatePicker.tsx`: `Pick<ReactDatePickerProps<boolean>, ...>` → `Pick<DatePickerProps, ...>`; `RefObject<ReactDatePicker<undefined, undefined> | null>` → `RefObject<DatePicker | null>`.
- `DatePickerController.ts`: `interface DatePickerBackendProps extends ReactDatePickerProps, ClassAttributes<ReactDatePicker>` → a type alias intersecting `DatePickerProps` with `ClassAttributes<DatePicker>`, mirroring what `date-time-picker-web` does. This must become a `type` rather than an `interface`, because an interface cannot extend a union.
- `createRef<ReactDatePicker<undefined, undefined>>()` → `createRef<DatePicker>()`.

A local alias re-exporting the new types under the old names was considered and rejected: it would hide the union from `Pick<>`, which is exactly where the compiler needs to see it.

Note the widget's own component is _also_ named `DatePicker` (`src/components/DatePicker.tsx`), so importing the library's `DatePicker` class into that file would collide. Import it aliased there — e.g. `DatePicker as ReactDatePickerClass` — or keep using the default import's instance type. `DatePickerController.ts` has no such collision.

### Cast `onChange` at the props boundary, keep the controller handler polymorphic

v9's `DatePickerProps` is a union whose `onChange` signature depends on `selectsRange`: `(date: Date | null, ...)` when false/absent, `(date: [Date | null, Date | null], ...)` when true. This widget flips `selectsRange` at runtime from the filter function, so one handler must serve both arms — `handlePickerChange` already accepts `Date | [Date | null, Date | null] | null` and branches on `isDate`.

TypeScript cannot verify that a single handler satisfies a runtime-selected union arm, so the assignment needs one narrow cast where the handler is passed to the picker element. `date-time-picker-web` solves the same problem by casting its whole returned props object (`as DatePickerProps` in `useSetupProps.ts`). Prefer the narrower fix here: cast only `onChange` at the JSX site, leaving every other prop type-checked. Document it with a short comment explaining the runtime-selected-arm reason.

_Alternative considered:_ split into two elements, one per mode. Rejected — it would remount the picker on filter-function change, losing focus and input state, and the widget deliberately refocuses instead.

### Narrow `UNSAFE_handleChangeRaw` to the v9 event type

v6 typed `onChangeRaw` loosely enough that `BaseSyntheticEvent` worked. v9 declares `(event?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>, selectionMeta?: { date, formattedDate }) => void`. Change the parameter to the optional union and keep the `event?.type === "change"` guard — the ignore-in-range-mode behavior is unchanged. `date-time-picker-web` already uses this exact signature.

### Drop `useWeekdaysShort` from the passed props

It is no longer part of the public `DatePickerProps` surface in v9 — `Calendar` still accepts it internally, but `DatePickerProps` omits its way around it, so passing it is a type error. The widget passes `useWeekdaysShort={false}`, which is also the library default (day names come from `weekdaysMin`), so removing it is behavior-neutral. Confirm via the day-name row in the refreshed snapshots.

### Bump the widget's date-fns to ^4.1.0; widen the plugin peer range only

`react-datepicker@9` depends on `date-fns@^4.1.0` internally. The widget separately imports `date-fns/locale`, `date-fns/isDate`, and the `Locale` type, and passes locale objects _into_ the picker via `registerLocale` — so a v3/v4 split across that boundary risks `Locale` shape mismatches. Bumping the widget to `^4.1.0` keeps one copy on the path that matters.

`widget-plugin-filtering` declares `date-fns` as a peer _and_ dev dependency but has **zero** `date-fns` imports in `src/` (verified by grep). Widening the peer to `^3.6.0 || ^4.1.0` is enough to keep pnpm quiet without forcing the other six filter widgets to move. date-fns 4's breaking changes are principally the timezone/`TZDate` rework and the removal of the sub-path `esm/` builds; the three call sites here (`locale`, `isDate`, `Locale`) are unaffected.

_Alternative considered:_ let the nested `date-fns@4` copy inside `react-datepicker` serve the picker while the widget stays on v3. Rejected — locale objects would cross versions.

### Refresh snapshots by inspection, not blind `-u`

The three snapshot files total ~560 lines and encode the picker's rendered DOM. Regenerate with `pnpm run test -u`, then read the diff for anything that is a real behavior change — missing `aria-*` attributes on input or button, a changed `role`, a vanished `data-placement`, a portal container that no longer receives children — as opposed to benign class-order or wrapper-nesting churn. Accepting the diff unread is how an accessibility regression ships.

## Risks / Trade-offs

- **The `onChange` cast could mask a genuine mode/handler mismatch** → Keep it scoped to that single prop, never the whole props object, and cover both modes in unit tests (single-date sets arg1; range sets arg1+arg2; null clears both).
- **Snapshot churn hides an accessibility regression** → Assert the a11y contract explicitly rather than trusting snapshots: `aria-expanded` flipping with calendar state, `aria-controls` matching the portal id, and the configured screen-reader captions. The E2E axe scan (`wcag21aa`) is the backstop.
- **Calendar chrome shifts enough to break the E2E screenshot baseline** → The baseline is Linux/CI-generated and cannot be regenerated faithfully on macOS; if `dataGridDateFilter.png` fails, regenerate it in CI rather than locally. Note the second picker-specific screenshot test is already `test.fixme`, so it is not a signal.
- **Popup positioning regresses under the grid's overflow** → `popperProps: { strategy: "fixed" }` still type-checks against `UseFloatingOptions`, but `date-time-picker-web` additionally sets `transform: false` and a `computeStyles`/`gpuAcceleration: false` middleware entry, suggesting it hit positioning artifacts on v8. If the calendar mispositions, that is the known remedy. Verify with the filter inside a scrolled Data Grid header, not just in isolation.
- **date-fns 4 changes locale object shape** → The `Locale` type and `date-fns/locale` entry points are stable across v3→v4; `calendar-web` already runs `^4.1.0` in this repo. Type-check plus the locale unit tests cover it.
- **`widget-plugin-filtering` peer widening ripples to six other filter widgets** → The package has no `date-fns` imports, so widening cannot change its behavior. Still, build the dependent widgets once to confirm no peer-resolution warnings.

## Migration Plan

1. Update `package.json`: `react-datepicker` → `^9.1.0`, `date-fns` → `^4.1.0`, remove `@types/react-datepicker`. Widen the `date-fns` peer in `widget-plugin-filtering`. Install.
2. Fix types in `DatePickerController.ts`, then `DatePicker.tsx` — controller first, since its type alias is the one `DatePicker.tsx`'s props extend. Let `tsc` drive the sequence.
3. Run unit tests, review and refresh snapshots, add explicit a11y and both-modes assertions where snapshots were doing that work implicitly.
4. Build the widget and the dependent filter widgets; confirm no peer warnings and no `react-onclickoutside` in the tree.
5. Verify in a Mendix project: calendar opens via mouse and keyboard, popup escapes grid overflow and survives scroll, both filter modes filter correctly, locale/format behavior holds, Atlas theme still applies.
6. Run E2E; regenerate the screenshot baseline in CI only if it fails for benign chrome reasons.
7. CHANGELOG entry and version bump.

**Rollback:** the change is confined to two source files plus dependency declarations, so reverting the commit and reinstalling restores v6 fully. No data migration, no persisted state, no XML contract change.

## Open Questions

- Does the v9 calendar need the `transform: false` / `gpuAcceleration: false` popper treatment that `date-time-picker-web` carries, or was that specific to that widget's layout? Resolve by testing the unmodified `strategy: "fixed"` config inside a scrolled grid first.
- Should `widget-plugin-filtering` eventually move to `date-fns@^4` outright and drop the dual peer range? Out of scope here; worth a follow-up once the other filter widgets are surveyed.
