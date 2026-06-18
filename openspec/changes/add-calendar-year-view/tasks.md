## 1. XML Configuration and Type Setup

- [x] 1.1 Add `<enumerationValue key="year">Year</enumerationValue>` to `defaultViewStandard` enum in Calendar.xml (lines ~82-89)
- [x] 1.2 Add `<enumerationValue key="year">Year</enumerationValue>` to `defaultViewCustom` enum in Calendar.xml (lines ~91-100)
- [x] 1.3 Add `<enumerationValue key="year">Year view button</enumerationValue>` to toolbar `itemType` enum in Calendar.xml (lines ~150-164)
- [x] 1.4 Run build to regenerate TypeScript types in `typings/CalendarProps.d.ts` and verify "year" appears in union types
- [x] 1.5 Update `defaultView` type in CalendarPropsBuilder.ts line 11 to include `"year"`
- [x] 1.6 Update `ResolvedToolbarItem` type in Toolbar.tsx line 51 to include `"year"` in itemType union

## 2. Date Utilities

- [x] 2.1 Add new date-fns imports to `calendar-utils.ts`: `startOfMonth`, `endOfMonth`, `getDaysInMonth`, `startOfYear`, `endOfYear`
- [x] 2.2 Add additional date-fns imports: `addMonths`, `isSameMonth`, `isSameYear`, `getYear`, `getMonth`, `setDate`
- [x] 2.3 Add iteration helpers: `eachMonthOfInterval`, `eachDayOfInterval` (if needed)
- [x] 2.4 Re-export all new date-fns functions from `calendar-utils.ts` for consistent import patterns

## 3. YearViewController Implementation

- [x] 3.1 Create `src/helpers/YearViewController.ts` file with class skeleton
- [x] 3.2 Implement `static navigate(date: Date, action: NavigateAction): Date` method (PREV: -1 year, NEXT: +1 year, TODAY: current date)
- [x] 3.3 Implement `static title(date: Date, options: any): string` method to return four-digit year string
- [x] 3.4 Implement `static range(date: Date): Date[]` method to return [Jan 1, Dec 31] for the year
- [x] 3.5 Implement `static getComponent()` factory method that returns YearView component with static methods attached
- [x] 3.6 Add TypeScript interface for YearViewController return type following CustomWeekController pattern

## 4. YearView Container Component

- [x] 4.1 Create `src/components/YearView.tsx` file with component skeleton
- [x] 4.2 Extract year from `date` prop using `getYear()`
- [x] 4.3 Implement `useMemo` hook to group events by month (0-11) with Map<number, CalendarEvent[]>
- [x] 4.4 Handle multi-month events in event grouping (check if event spans multiple months)
- [x] 4.5 Implement `handleDayClick(date: Date)` that calls `onNavigate(date)` then `onView('day')`
- [x] 4.6 Render 12 `MonthMiniGrid` components in a grid container, passing month-specific events
- [x] 4.7 Add className `widget-calendar-year-view` to root div
- [x] 4.8 Pass `localizer` prop to MonthMiniGrid for localization

## 5. MonthMiniGrid Component

- [x] 5.1 Create `src/components/MonthMiniGrid.tsx` file with component skeleton
- [x] 5.2 Implement props interface: `year`, `month`, `events`, `onDayClick`, `localizer`
- [x] 5.3 Get localized month name using `localizer.format()` method
- [x] 5.4 Render month header with localized name
- [x] 5.5 Render weekday headers (Su Mo Tu We Th Fr Sa) using `localizer.format()` with weekday pattern
- [x] 5.6 Calculate first day of month and total days using `startOfMonth()` and `getDaysInMonth()`
- [x] 5.7 Render leading days from previous month in gray (if first day is not Sunday)
- [x] 5.8 Render current month day cells (1 through getDaysInMonth)
- [x] 5.9 Render trailing days from next month in gray (to complete final week)
- [x] 5.10 Implement event checking for each day using `eventOccursOnDay()` helper
- [x] 5.11 Render event dot indicator (4px circle) below day number if events exist
- [x] 5.12 Highlight today's date with `year-day-cell-today` class using `isSameDay()`
- [x] 5.13 Add onClick handler to each day cell that calls `onDayClick(date)`
- [x] 5.14 Add ARIA label to each day cell: "Month DD, YYYY, N events" (or "no events")

## 6. Event Filtering Utilities

- [x] 6.1 Create helper function `eventOccursOnDay(dayDate: Date, event: CalendarEvent): boolean` in MonthMiniGrid.tsx
- [x] 6.2 Implement day boundary checks using `startOfDay()` and `endOfDay()`
- [x] 6.3 Handle all-day events by normalizing start/end to day boundaries
- [x] 6.4 Handle multi-day events using interval overlap check: `isAfter(event.end, dayStart) && isBefore(event.start, dayEnd)`
- [ ] 6.5 Add unit tests for edge cases: same-day events, multi-day events, all-day events, month-spanning events

## 7. Year View Styles (YearView.scss)

- [x] 7.1 Create `src/ui/YearView.scss` file with `.widget-calendar-year-view` namespace
- [x] 7.2 Implement `.year-grid` with CSS Grid: `repeat(4, 1fr)` columns, `var(--spacing-medium, 10px)` gap
- [x] 7.3 Add media query for tablet: `@media (max-width: 768px)` with `repeat(2, 1fr)`
- [x] 7.4 Add media query for mobile: `@media (max-width: 480px)` with `1fr` single column
- [x] 7.5 Style `.year-month-card` with border, padding, border-radius, and hover effect
- [x] 7.6 Style `.year-month-header` for month name (centered, bold)
- [x] 7.7 Style `.year-month-content` as 7-column grid for weekday cells
- [x] 7.8 Style `.year-day-cell` with flexbox centering, padding, font-size
- [x] 7.9 Style `.year-day-cell-today` with `--color-primary-lighter` background
- [x] 7.10 Style `.year-day-cell-has-event` with event dot (4px circle, `--brand-primary` color)
- [x] 7.11 Style `.year-day-cell-other-month` for leading/trailing days (gray color)
- [x] 7.12 Add `:hover` and `:focus-visible` states with `--focus-outline`
- [x] 7.13 Import YearView.scss in YearView.tsx component

## 8. View Registration and Integration

- [x] 8.1 Import `YearViewController` in CalendarPropsBuilder.ts
- [x] 8.2 Update `buildVisibleViews()` method to include year view for Standard mode: `year: YearViewController.getComponent()`
- [x] 8.3 Update `buildVisibleViews()` method for Custom mode: check if toolbar items include "year", return YearViewController or false
- [x] 8.4 Add "year" to the filter array in line ~318 of CalendarPropsBuilder.ts
- [x] 8.5 Update type cast in line ~65 of CalendarPropsBuilder.ts to include `"year"`
- [ ] 8.6 Update `safeDefaultView` logic (lines 63-66) to handle "year" as a valid default view

## 9. Toolbar Integration

- [x] 9.1 Update `renderItem()` switch statement in Toolbar.tsx to add case for "year"
- [x] 9.2 Render year view button with localized caption or custom caption from toolbar config
- [x] 9.3 Add onClick handler that calls `onView('year')` when year button is clicked
- [x] 9.4 Apply "active" class when `view === 'year'`
- [ ] 9.5 Test year button rendering in both Standard and Custom modes

## 10. TypeScript Type Fixes

- [ ] 10.1 Add `@ts-expect-error` comment or type extension if react-big-calendar's `View` type doesn't include "year"
- [ ] 10.2 Create `type ExtendedView = View | "year"` if needed for type compatibility
- [ ] 10.3 Fix any TypeScript errors in CalendarPropsBuilder related to year view type
- [ ] 10.4 Fix any TypeScript errors in Toolbar.tsx related to year view type
- [ ] 10.5 Verify build completes without TypeScript errors: `pnpm build`

## 11. Unit Tests

- [ ] 11.1 Create `src/helpers/__tests__/YearViewController.spec.ts`
- [ ] 11.2 Test `navigate()` method: PREV subtracts 1 year, NEXT adds 1 year, TODAY returns current date
- [ ] 11.3 Test `title()` method: returns four-digit year string
- [ ] 11.4 Test `range()` method: returns [Jan 1, Dec 31] for given year
- [ ] 11.5 Create `src/components/__tests__/YearView.spec.tsx`
- [ ] 11.6 Test event grouping by month with mock events
- [ ] 11.7 Test handleDayClick calls onNavigate and onView with correct arguments
- [ ] 11.8 Test multi-day event handling (event spans multiple months)
- [ ] 11.9 Create `src/components/__tests__/MonthMiniGrid.spec.tsx`
- [ ] 11.10 Test month name localization
- [ ] 11.11 Test weekday header rendering
- [ ] 11.12 Test leading/trailing days are rendered in gray
- [ ] 11.13 Test event dot appears when day has events
- [ ] 11.14 Test today highlight appears on current date
- [ ] 11.15 Test day click handler invocation
- [ ] 11.16 Run unit tests: `pnpm test`

## 12. E2E Tests

- [ ] 12.1 Add E2E test: Switch to year view from toolbar in Standard mode
- [ ] 12.2 Add E2E test: Verify 12 month grids are rendered
- [ ] 12.3 Add E2E test: Click a day cell and verify navigation to day view
- [ ] 12.4 Add E2E test: Click previous year button and verify year decrements
- [ ] 12.5 Add E2E test: Click next year button and verify year increments
- [ ] 12.6 Add E2E test: Click today button and verify current year is displayed
- [ ] 12.7 Add E2E test: Verify event dots appear on days with events
- [ ] 12.8 Add E2E test: Verify today's date is highlighted
- [ ] 12.9 Add E2E test: Year view in Custom mode with configured toolbar
- [ ] 12.10 Run E2E tests: `pnpm run e2e`

## 13. Accessibility Improvements

- [ ] 13.1 Add `tabIndex={0}` to day cells to make them keyboard-focusable
- [ ] 13.2 Add `role="button"` to day cells for semantic meaning
- [ ] 13.3 Implement `aria-label` on each day cell with format "Month DD, YYYY, N events"
- [ ] 13.4 Add keyboard event handler for Enter/Space keys on day cells
- [ ] 13.5 Ensure focus outline is visible on focused day cells (`:focus-visible` in SCSS)
- [ ] 13.6 Add semantic heading level to month headers (h3 or h4)
- [ ] 13.7 Test keyboard navigation with Tab key through all day cells
- [ ] 13.8 Test screen reader announces dates and event counts correctly

## 14. Performance Optimization

- [ ] 14.1 Verify `useMemo` is used for event grouping by month
- [ ] 14.2 Verify month-level event arrays are memoized (don't recalculate on every render)
- [ ] 14.3 Test render performance with 1000+ events (should be <200ms)
- [ ] 14.4 Use React DevTools Profiler to identify any unnecessary re-renders
- [ ] 14.5 Consider lazy rendering for month grids if performance is poor (future optimization)

## 15. Documentation and Polish

- [ ] 15.1 Update widget README.md with year view documentation
- [ ] 15.2 Add year view usage examples to README
- [ ] 15.3 Update CHANGELOG.md with new year view feature
- [ ] 15.4 Add screenshots of year view to docs (if applicable)
- [ ] 15.5 Test year view in Mendix test project (`MX_PROJECT_PATH`)
- [ ] 15.6 Verify year view works in both light and dark themes
- [ ] 15.7 Test responsive behavior on actual mobile/tablet devices
- [ ] 15.8 Verify localization works for non-English locales (Spanish, German, etc.)

## 16. Final Verification

- [ ] 16.1 Build widget: `pnpm build` completes without errors
- [ ] 16.2 Verify MPK file is generated in `dist/` directory
- [ ] 16.3 Import MPK into Mendix Studio Pro test project
- [ ] 16.4 Test year view in Standard mode in Mendix app
- [ ] 16.5 Test year view in Custom mode with toolbar configuration
- [ ] 16.6 Verify backward compatibility: existing views still work
- [ ] 16.7 Verify no breaking changes: existing calendar configurations work unchanged
- [ ] 16.8 Test all navigation flows: day→year, week→year, month→year, year→day
- [ ] 16.9 Test with edge case dates: leap years, DST transitions, year boundaries
- [ ] 16.10 Run full test suite: `pnpm test` and `pnpm run e2e`
