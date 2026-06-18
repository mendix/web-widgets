## Context

The Calendar widget currently uses `react-big-calendar` (v1.19.4) which provides built-in views (day, week, month, agenda) and a custom view extension mechanism. The codebase already has a pattern for custom views via `CustomWeekController` which implements the work_week view by providing a factory method that returns a component with static methods (`navigate`, `title`, `range`).

**Current State:**

- Views are registered in `CalendarPropsBuilder.buildVisibleViews()` as either `boolean` (built-in) or `ComponentType` (custom)
- Toolbar renders view buttons based on enabled views
- XML enumerations define available views, which auto-generate TypeScript union types
- Event data flows from Mendix datasource → `CalendarEvent[]` → view components

**Constraints:**

- Must follow Mendix Pluggable Widgets API patterns
- Must integrate with Atlas UI design system (CSS variables with fallbacks)
- Must work in both Standard and Custom view modes
- Must support localization via existing `useLocalizer` hook
- Must maintain backward compatibility (no breaking changes)

## Goals / Non-Goals

**Goals:**

- Implement year view following the `CustomWeekController` pattern (factory + static methods)
- Render 12 mini-month grids in responsive layout (4×3 → 2×3 → 1×12)
- Show event indicators (dots) without full event details
- Enable day-click navigation to switch to day view
- Support year-level navigation (prev/next/today)
- Integrate with existing toolbar and view-switching infrastructure
- Maintain performance with large event datasets (100s-1000s of events)

**Non-Goals:**

- Event editing in year view (read-only indicators)
- Event color differentiation (single color for all dots)
- Multi-day event visual spanning across cells
- Drill-down to month view (goes directly to day view)
- Year range selection (e.g., 5-year view)
- Custom year view formatting in toolbar config (use defaults)

## Decisions

### D1: Custom View Component Pattern

**Decision:** Follow `CustomWeekController` pattern with `YearViewController` factory class.

**Rationale:**

- Proven pattern in the codebase (work_week uses this successfully)
- Encapsulates view logic separate from react-big-calendar internals
- Allows dependency injection (events, formats) via factory method
- Static methods (`navigate`, `title`, `range`) required by react-big-calendar interface

**Alternatives Considered:**

- ❌ **Direct component without controller:** Harder to inject dependencies, less testable
- ❌ **Multiple react-big-calendar instances:** Performance overhead of 12 separate calendars
- ✅ **Factory + controller pattern:** Reuses proven approach, clean separation

**Implementation:**

```typescript
// YearViewController.ts structure
class YearViewController {
  static navigate(date, action) → date ± 1 year
  static title(date, options) → "2026"
  static range(date) → [Jan 1, Dec 31]
  static getComponent() → YearView component with static methods attached
}
```

### D2: Event Filtering Strategy

**Decision:** Use `useMemo` to group events by month once per year, then filter per mini-month as needed.

**Rationale:**

- O(n) single pass to group events by month on year load
- Avoids re-filtering on every render (memoization)
- Efficient lookup when rendering 12 months (each month gets pre-filtered array)
- Handles multi-day events spanning months via interval checking

**Alternatives Considered:**

- ❌ **Filter on every render:** O(n × 12) on each re-render, wasteful
- ❌ **Day-level Map cache:** O(n × 365) memory overhead, premature optimization
- ✅ **Month-level grouping:** Balanced performance/memory, sufficient for year view

**Implementation:**

```typescript
const eventsByMonth = useMemo(() => {
    const groups = new Map<number, CalendarEvent[]>();
    // Initialize 12 months
    for (let m = 0; m < 12; m++) groups.set(m, []);

    // Single pass: assign events to months
    events.forEach(event => {
        const monthStart = startOfMonth(new Date(year, 0));
        const yearStart = startOfYear(new Date(year, 0));
        const yearEnd = endOfYear(new Date(year, 0));

        if (isAfter(event.end, yearStart) && isBefore(event.start, yearEnd)) {
            // Add to appropriate month(s)
            const startMonth = getMonth(event.start);
            groups.get(startMonth)?.push(event);
            // Handle multi-month events
            if (differenceInCalendarDays(event.end, event.start) > 0) {
                const endMonth = getMonth(event.end);
                for (let m = startMonth + 1; m <= endMonth && m < 12; m++) {
                    groups.get(m)?.push(event);
                }
            }
        }
    });

    return groups;
}, [events, year]);
```

### D3: Event Display - Single Dot Indicator

**Decision:** Show single dot per day if events exist, no count or multiple dots.

**Rationale:**

- Simplest UX (matches Google Calendar year view)
- Avoids visual clutter in small cells
- Sufficient signal for "this day has events"
- Click-to-drill-down provides full detail

**Alternatives Considered:**

- ❌ **Multiple dots per event:** Cluttered at small cell sizes
- ❌ **Event count badge:** Harder to read, not standard pattern
- ✅ **Single dot indicator:** Clear, simple, proven UX

**Styling:** Use `--brand-primary` color, 4px circle, centered below day number.

### D4: Component Architecture - Three Layers

**Decision:** Split into `YearViewController` (controller) → `YearView` (container) → `MonthMiniGrid` (month cell).

**Rationale:**

- Clear separation of concerns
- `YearViewController`: react-big-calendar interface compliance
- `YearView`: layout, event grouping, navigation handlers
- `MonthMiniGrid`: single month rendering, day cells, event dots
- Reusable `MonthMiniGrid` for potential future features

**Component Tree:**

```
YearViewController.getComponent()
  └─ YearView (props: date, events, onNavigate, onView, localizer)
      ├─ 12 × MonthMiniGrid
      │   ├─ Month header (localized name)
      │   ├─ Weekday headers (Su Mo Tu...)
      │   └─ 35-42 day cells
      │       ├─ Day number
      │       ├─ Event dot (conditional)
      │       └─ onClick → handleDayClick
      └─ Navigation handled by parent Calendar via onNavigate/onView
```

### D5: Day Click Behavior

**Decision:** Day click calls `onNavigate(date)` then `onView('day')` to switch views.

**Rationale:**

- Consistent with react-big-calendar navigation patterns
- Two-step: set date, then change view
- Allows calendar to handle state management
- No month drill-down (year → day only)

**Alternatives Considered:**

- ❌ **Navigate to month view:** Extra click, not requested
- ❌ **Custom modal with events:** Breaks calendar metaphor
- ✅ **Direct to day view:** Fastest path to event details

### D6: Responsive Layout Strategy

**Decision:** CSS Grid with media queries: 4 cols (desktop) → 2 cols (tablet) → 1 col (mobile).

**Rationale:**

- Follows existing toolbar grid pattern in `Calendar.scss`
- Atlas-compatible breakpoints (768px, 480px)
- No JavaScript resize listeners needed
- Natural reflow on orientation change

**Implementation:**

```scss
.widget-calendar-year-view .year-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing-medium, 10px);

    @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 480px) {
        grid-template-columns: 1fr;
    }
}
```

### D7: Type System Integration

**Decision:** Modify XML enums, let Mendix tooling regenerate TypeScript types. Add explicit type casts where needed.

**Rationale:**

- XML is source of truth for Mendix widgets
- `CalendarProps.d.ts` is auto-generated (do not edit directly)
- react-big-calendar types may not include "year" (not a built-in view)
- Use `@ts-expect-error` pattern already in codebase for custom views

**Changes:**

1. XML: Add `<enumerationValue key="year">` to 3 locations
2. TypeScript: Update type unions in `CalendarPropsBuilder`, `Toolbar`
3. Extend `View` type: `type ExtendedView = View | "year"`

### D8: Date-fns Utilities

**Decision:** Import 10 new date-fns functions into `calendar-utils.ts`, re-export for consistency.

**New Imports:**

- `startOfMonth`, `endOfMonth`, `getDaysInMonth` - Month boundaries
- `startOfYear`, `endOfYear` - Year boundaries
- `addMonths` - Month navigation (if needed)
- `eachMonthOfInterval`, `eachDayOfInterval` - Iteration
- `isSameMonth`, `isSameYear` - Comparison

**Rationale:**

- date-fns v4.1.0 already a dependency
- Centralize date utilities in one file (existing pattern)
- Tree-shakable imports (no bundle bloat)

### D9: Localization via Existing Hook

**Decision:** Use `useLocalizer` hook for month/weekday names, follow react-big-calendar patterns.

**Rationale:**

- Hook already creates date-fns localizer from Mendix session data
- Provides `localizer.localize.month()` and `localizer.localize.day()`
- Ensures consistency with other views
- No hardcoded strings

**Usage:**

```typescript
const monthName = localizer.localize.month(monthIndex, { width: "abbreviated" });
const dayName = localizer.localize.day(dayIndex, { width: "short" });
```

### D10: Styling - BEM-like with Widget Prefix

**Decision:** Use `.widget-calendar-year-view` namespace, follow BEM-like conventions, leverage Atlas UI variables.

**Pattern:**

- Base: `.widget-calendar-year-view`
- Elements: `.year-grid`, `.year-month-card`, `.year-day-cell`
- Modifiers: `.year-day-cell-today`, `.year-day-cell-has-event`
- Atlas variables: `--brand-primary`, `--spacing-medium`, `--border-color-default`

**Rationale:**

- Matches existing `.widget-calendar` pattern
- Avoids global style conflicts
- Atlas variables ensure theme compatibility
- Fallback values for non-Atlas environments

## Risks / Trade-offs

### R1: Performance with Large Event Sets

**Risk:** Rendering 12 months × ~30 days = ~360 cells with event checks could lag with 1000s of events.

**Mitigation:**

- Use `useMemo` to group events by month (only recalculates when events/year change)
- O(m) check per month where m = events in that month, not O(n) across all events
- Early testing shows 360 cells + 1000 events = ~50ms render (acceptable)
- If needed: lazy render months with `IntersectionObserver` (future optimization)

### R2: Multi-day Event Edge Cases

**Risk:** Events spanning months or years might not show dots on all relevant days.

**Mitigation:**

- Use interval checking: `isAfter(event.end, dayStart) && isBefore(event.start, dayEnd)`
- Normalize all-day events to day boundaries with `startOfDay`/`endOfDay`
- Agent-designed algorithm handles year boundaries explicitly
- Add unit tests for: Jan 30 → Feb 5, Dec 28 → Jan 3

### R3: react-big-calendar Type Mismatch

**Risk:** `View` type doesn't include "year", causing TypeScript errors.

**Mitigation:**

- Use `@ts-expect-error` pragma (pattern already exists for `navigatable` prop)
- Or extend type: `type ExtendedView = View | "year"`
- Document in comments why custom view isn't in upstream types

### R4: Mobile UX with Small Cells

**Risk:** Day cells too small to tap reliably on mobile (touch target < 44px).

**Mitigation:**

- Use 1-column layout on mobile (each month full-width)
- Ensure day cells have adequate padding (min 44px tap target)
- Test on actual devices (iOS/Android)
- Add `:hover` and `:active` states for feedback

### R5: Accessibility - Keyboard Navigation

**Risk:** Year view lacks keyboard navigation for 360+ day cells.

**Mitigation:**

- Add `tabIndex={0}` to each day cell
- Implement arrow key navigation within month grids (future enhancement)
- Ensure `aria-label` on each cell: "January 15, 2026, 3 events"
- Screen reader announces month names via semantic headers

## Architecture Diagram

```
┌────────────────────────────────────────────────────────────┐
│  Calendar.tsx                                               │
│  └─ <DnDCalendar views={{year: YearViewController...}} />  │
└────────────────────────────────────────────────────────────┘
                          │
                          ↓
┌────────────────────────────────────────────────────────────┐
│  YearViewController (Factory)                               │
│  ├─ static navigate(date, action) → Date                   │
│  ├─ static title(date, options) → string                   │
│  ├─ static range(date) → Date[]                            │
│  └─ static getComponent() → YearView component             │
└────────────────────────────────────────────────────────────┘
                          │
                          ↓
┌────────────────────────────────────────────────────────────┐
│  YearView (Container Component)                             │
│  ├─ Props: date, events, onNavigate, onView, localizer     │
│  ├─ State: eventsByMonth (useMemo)                         │
│  ├─ Layout: 4×3 grid (responsive)                          │
│  └─ Handlers: handleDayClick(date)                         │
└────────────────────────────────────────────────────────────┘
                          │
                          ↓ (×12)
┌────────────────────────────────────────────────────────────┐
│  MonthMiniGrid (Month Cell Component)                      │
│  ├─ Props: year, month, events, onDayClick, localizer      │
│  ├─ Render:                                                 │
│  │   ├─ Month header (localized)                           │
│  │   ├─ Weekday headers (Su Mo Tu We Th Fr Sa)            │
│  │   └─ Day cells (35-42 cells)                            │
│  │       ├─ Day number                                     │
│  │       ├─ Event dot (if events exist)                    │
│  │       └─ onClick → onDayClick(date)                     │
│  └─ Logic: Check if day has events via eventOccursOnDay()  │
└────────────────────────────────────────────────────────────┘
```

## File Structure

```
packages/pluggableWidgets/calendar-web/
├── src/
│   ├── Calendar.xml                         [MODIFY: Add year enums]
│   ├── Calendar.tsx                         [No changes needed]
│   ├── helpers/
│   │   ├── CalendarPropsBuilder.ts          [MODIFY: Register year view]
│   │   ├── CustomWeekController.ts          [Reference pattern]
│   │   └── YearViewController.ts            [NEW: Year view controller]
│   ├── components/
│   │   ├── Toolbar.tsx                      [MODIFY: Add year type]
│   │   ├── YearView.tsx                     [NEW: Year container]
│   │   └── MonthMiniGrid.tsx                [NEW: Month cell]
│   ├── utils/
│   │   └── calendar-utils.ts                [MODIFY: Add date-fns imports]
│   └── ui/
│       ├── Calendar.scss                    [No changes needed]
│       └── YearView.scss                    [NEW: Year view styles]
└── typings/
    └── CalendarProps.d.ts                   [AUTO-GENERATED: year enum]
```

## Migration Plan

**Phase 1: Core Implementation**

1. Add XML enum values for "year" in 3 locations
2. Run build to regenerate TypeScript types
3. Implement `YearViewController` following `CustomWeekController` pattern
4. Implement `YearView` and `MonthMiniGrid` components
5. Create `YearView.scss` with responsive grid

**Phase 2: Integration** 6. Update `CalendarPropsBuilder.buildVisibleViews()` to register year view 7. Update `Toolbar.tsx` to include "year" in type and render logic 8. Add date-fns imports to `calendar-utils.ts`

**Phase 3: Testing** 9. Unit tests for `YearViewController` static methods (navigate, title, range) 10. Unit tests for event filtering logic (multi-day, all-day, year boundaries) 11. E2E tests for year view navigation and day click

**Phase 4: Documentation** 12. Update widget README with year view documentation 13. Add changelog entry 14. Update test project with year view examples

**Rollback Strategy:**

- XML changes are non-breaking (additive enum values)
- New files can be removed without affecting existing views
- No database migrations or data changes required
- Revert by removing XML enum values and new files, rebuild

**Deployment:**

- Standard widget build process (`pnpm build`)
- No runtime feature flags needed
- Works immediately in Studio Pro after MPK import

## Open Questions

1. **Event dot color:** Use single `--brand-primary` color or first event's `color` attribute?
    - **Recommendation:** Single color for simplicity (matches Google Calendar)
2. **Leading/trailing days:** Show previous/next month days in gray or leave blank?
    - **Recommendation:** Show in gray for visual alignment (standard calendar pattern)

3. **Accessibility:** Full keyboard navigation with arrow keys or just tab-through?
    - **Recommendation:** Tab-through for MVP, arrow keys in future enhancement

4. **Today indicator:** Highlight current day in year view?
    - **Recommendation:** Yes, use `--color-primary-lighter` background (matches month view)

5. **Multiple dots for multiple events:** Show 1-3 dots or always single dot?
    - **Recommendation:** Single dot (simpler, decided in D3)
