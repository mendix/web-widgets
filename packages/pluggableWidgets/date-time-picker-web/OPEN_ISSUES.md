# Open Issues (pre-release)

Tracked items deferred from spike review. Resolve before releasing to marketplace.

## #1 — No tests

No unit or E2E tests exist. Required before release per repo convention (Jest+RTL unit tests in `src/__tests__/`, Playwright E2E in `e2e/`).

**What to cover:**

- `DatePickerController`: date selection (single/range), `handlePickerChange`, `handleKeyDown` backspace-clear, `UNSAFE_handleChangeRaw`.
- `useSetupProps`: format props per picker type, locale fallback.
- `DateTimePickerContainer`: renders picker, renders validation message when present.
- E2E: open/close calendar, select date, range selection, keyboard navigation.

## #2 — Validation unimplemented

XML exposes `validationType` (none/required/custom) and `customValidation` (boolean expression), but neither is wired in the component. Current behavior: only a passthrough of `validationMessage` string is rendered. `props.name`, `props.id`, `validationType`, and `customValidation` are unused.

**What to implement:**

- `required`: show error when value is empty on blur/submit.
- `custom`: show `validationMessage` when `customValidation` evaluates to `true`.
- Min/max time enforcement (mentioned in source comment at `DateTimePickerContainer.tsx`).

## #3 — Wrong icon asset in structure preview

`src/DateTimePicker.editorConfig.ts` imports `./assets/close.svg` (an X/close glyph) as the calendar button icon in the Studio Pro structure preview. Should be replaced with a calendar SVG.

**File:** `src/assets/close.svg` → replace with calendar icon, or add `calendar.svg` and update the import in `editorConfig.ts`.

## #4 — Dark-mode icon swap is a no-op

`editorConfig.ts:12`: `IconSVG.replace('fill="#000000"', 'fill="#FFFFFF"')` never matches because `close.svg` uses `fill="currentColor"`. Dark and light previews show the same icon.

**Fix:** once #5 is resolved with a proper calendar SVG using `fill="#000000"`, the replace will work correctly. Or use two separate SVG assets (light/dark).
