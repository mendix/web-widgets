## Why

Users need a year-at-a-glance view to see events across all 12 months simultaneously, enabling high-level planning and quick navigation to specific dates. Currently, the calendar widget only supports day, week, and month views, requiring multiple navigations to see events across different months.

## What Changes

- Add **Year View** to the Calendar widget, available in both Standard and Custom view modes
- Render a 12-month grid (4×3 layout) showing all months of the selected year
- Display event indicators (dots) on days that have events, without showing full event details
- Enable day-cell click navigation: clicking any day switches to day view for that date
- Add "Year" button to toolbar for view switching
- Support previous/next year navigation and "today" button to jump to current year
- Maintain responsive design: 4 columns (desktop), 2 columns (tablet), 1 column (mobile)
- Follow Atlas UI design system and existing calendar styling patterns

## Capabilities

### New Capabilities

- `calendar-year-view`: Year view rendering with 12-month grid, event indicators, day-click navigation, and year-based navigation (previous/next/today)

### Modified Capabilities

- `calendar-view-switching`: Extends existing view enumeration to include "year" alongside day/week/month/work_week/agenda views in both Standard and Custom modes

## Impact

**Code Changes:**

- **XML Configuration** (`Calendar.xml`): Add "year" enum value to `defaultViewStandard`, `defaultViewCustom`, and toolbar `itemType` properties
- **Type Definitions** (`CalendarProps.d.ts`): Auto-generated types will include "year" in view enums
- **View Registration** (`CalendarPropsBuilder.ts`): Update `buildVisibleViews()` to include year view component, update type unions
- **Toolbar** (`Toolbar.tsx`): Add "year" to `ResolvedToolbarItem` type and render logic
- **New Components**: `YearViewController.ts`, `YearView.tsx`, `MonthMiniGrid.tsx`
- **New Utilities**: Date-fns imports for month/year operations (`startOfMonth`, `endOfMonth`, `getDaysInMonth`, etc.)
- **New Styles**: `YearView.scss` with responsive grid layout

**Dependencies:**

- Existing: `react-big-calendar` (already v1.19.4), `date-fns` (already v4.1.0)
- No new dependencies required

**Affected Features:**

- Calendar view switching (adds new view option)
- Toolbar configuration (custom view mode can now include year button)
- Event display logic (adds filtering by year/month for mini-month grids)

**User Experience:**

- No breaking changes
- Additive feature: existing views remain unchanged
- Standard mode users automatically get year view in toolbar
- Custom mode users can configure year view button in toolbar items
