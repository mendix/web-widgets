## 1. Widget XML

- [x] 1.1 Add `onClickTrigger` enumeration property to `src/Calendar.xml` in the "Events" property group, values `single`/`double`, default `double`, with a caption/description explaining the two behaviors
- [x] 1.2 Regenerate `typings/CalendarProps.d.ts` and confirm `onClickTrigger` appears with correct enum type

## 2. Event Handling

- [x] 2.1 In `src/helpers/useCalendarEvents.ts`, read `onClickTrigger` from props in `useCalendarEvents`
- [x] 2.2 In `handleSelectEvent`, branch on `onClickTrigger === "single"`: call `invokeEdit(event)` and `setSelected(event)` immediately, skipping the 250ms timer path
- [x] 2.3 Keep the existing timer-based logic as the `double` (default) branch, unchanged
- [x] 2.4 Guard `handleDoubleClickEvent` to return early in `single` mode (RBC fires `onSelectEvent` first, so edit would otherwise fire twice on a real double-click); `handleKeyPressEvent` needs no change since `single` mode still sets `selected`

## 3. Tests

- [x] 3.1 Add unit tests in `src/helpers/__tests__/useCalendarEvents.spec.ts` covering: single click edits immediately when `onClickTrigger="single"`; single click only selects when `onClickTrigger="double"` (default); double-click edits exactly once in both modes; Enter-to-edit works in both modes. Also added `onClickTrigger: "double"` to the props fixture in `src/__tests__/Calendar.spec.tsx`
- [x] 3.2 Run `pnpm run test` in `packages/pluggableWidgets/calendar-web` and confirm all pass — 39/39 passing, 2 suites

## 4. Docs & Changelog

- [x] 4.1 Add CHANGELOG.md entry under `[Unreleased]` describing the new `onClickTrigger` property (user-facing behavior only)
- [x] 4.2 Update widget README/docs if `onEditEvent` click behavior is documented there — README has no click-behavior documentation, no change needed

## 5. Verification

- [x] 5.1 Build widget (`pnpm turbo build`) — passes, XML validates against the Mendix XSD and typings regenerate. **Manual Studio Pro verification still pending (requires a human):** confirm single-click mode opens edit on first click and double-click mode preserves the two-click/dbl-click behavior
- [x] 5.2 Confirm no regression to `onCreateEvent` slot-click behavior in either mode — covered by parameterized `describe.each` slot-selection tests, passing for both `single` and `double`
