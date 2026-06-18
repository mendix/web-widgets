## ADDED Requirements

### Requirement: Year view displays 12-month grid

The calendar widget SHALL render a year view showing all 12 months of the selected year in a responsive grid layout.

#### Scenario: Desktop layout displays 4 columns

- **WHEN** year view is rendered on a screen width ≥ 769px
- **THEN** the grid displays 4 columns × 3 rows (12 months total)

#### Scenario: Tablet layout displays 2 columns

- **WHEN** year view is rendered on a screen width between 481px and 768px
- **THEN** the grid displays 2 columns × 6 rows (12 months total)

#### Scenario: Mobile layout displays 1 column

- **WHEN** year view is rendered on a screen width ≤ 480px
- **THEN** the grid displays 1 column × 12 rows (12 months total)

#### Scenario: Each month shows localized name

- **WHEN** year view renders a month
- **THEN** the month header displays the localized month name (e.g., "January", "Enero", "Januar") according to the user's locale

### Requirement: Month mini-grids show calendar structure

Each month mini-grid SHALL display a standard calendar layout with weekday headers and day cells.

#### Scenario: Weekday headers are localized

- **WHEN** a month mini-grid is rendered
- **THEN** the weekday headers display localized abbreviated names (e.g., "Su Mo Tu We Th Fr Sa" for English, "Lu Ma Mi Ju Vi Sá Do" for Spanish) according to the user's locale

#### Scenario: Day cells show day numbers

- **WHEN** a month mini-grid renders day cells for the current month
- **THEN** each day cell displays the day number (1-31)

#### Scenario: Leading days from previous month are shown in gray

- **WHEN** a month mini-grid renders and the first day of the month is not Sunday
- **THEN** the grid displays days from the previous month in gray color to complete the first week

#### Scenario: Trailing days from next month are shown in gray

- **WHEN** a month mini-grid renders and the last day of the month does not complete the final week
- **THEN** the grid displays days from the next month in gray color to complete the final week

### Requirement: Event indicators show as dots

Days with events SHALL display a single dot indicator, regardless of the number of events on that day.

#### Scenario: Day with events displays a dot

- **WHEN** a day cell is rendered and one or more events occur on that day
- **THEN** a dot indicator is displayed below the day number using the primary brand color

#### Scenario: Day without events has no dot

- **WHEN** a day cell is rendered and no events occur on that day
- **THEN** no dot indicator is displayed

#### Scenario: Multi-day events show dots on all affected days

- **WHEN** an event spans multiple days (e.g., Jan 15-17)
- **THEN** dots are displayed on all days within the event's date range (Jan 15, 16, and 17)

#### Scenario: All-day events are treated as full-day occurrences

- **WHEN** an event is marked as all-day
- **THEN** the event is considered to occur on each calendar day from start date to end date (inclusive) and dots are displayed accordingly

### Requirement: Day click navigates to day view

Clicking a day cell SHALL navigate the calendar to day view for the selected date.

#### Scenario: User clicks a day in the current month

- **WHEN** user clicks a day cell representing a date in the current month
- **THEN** the calendar switches to day view AND displays the selected date

#### Scenario: User clicks a leading day from previous month

- **WHEN** user clicks a gray day cell from the previous month
- **THEN** the calendar switches to day view AND displays the selected date from the previous month

#### Scenario: User clicks a trailing day from next month

- **WHEN** user clicks a gray day cell from the next month
- **THEN** the calendar switches to day view AND displays the selected date from the next month

### Requirement: Today indicator highlights current day

The current day SHALL be visually highlighted in the year view.

#### Scenario: Current day is highlighted with background color

- **WHEN** year view is rendered and the current date falls within the displayed year
- **THEN** the day cell for today displays a light background color using the primary brand color

#### Scenario: Current day in a different year is not highlighted

- **WHEN** year view displays a year that is not the current year
- **THEN** no day cells are highlighted as "today"

### Requirement: Year navigation via toolbar

Users SHALL be able to navigate between years using previous/next buttons and a today button.

#### Scenario: Previous button navigates to previous year

- **WHEN** user clicks the "Previous" button in year view
- **THEN** the calendar displays the previous year (current year - 1)

#### Scenario: Next button navigates to next year

- **WHEN** user clicks the "Next" button in year view
- **THEN** the calendar displays the next year (current year + 1)

#### Scenario: Today button navigates to current year

- **WHEN** user clicks the "Today" button in year view
- **THEN** the calendar displays the current year

#### Scenario: Toolbar title displays the year

- **WHEN** year view is active
- **THEN** the toolbar center displays the four-digit year (e.g., "2026")

### Requirement: Event filtering by year and month

The calendar widget SHALL efficiently filter events to display only those relevant to each month in the year view.

#### Scenario: Events are filtered to the displayed year

- **WHEN** year view is rendered for year 2026
- **THEN** only events with start or end dates in 2026 are considered for display

#### Scenario: Events are grouped by month for rendering

- **WHEN** year view prepares to render 12 months
- **THEN** events are grouped into 12 collections (one per month) based on which month(s) they occur in

#### Scenario: Multi-month events appear in all relevant months

- **WHEN** an event spans from March 25 to April 5
- **THEN** the event is included in both the March and April event collections

#### Scenario: Event filtering uses memoization to avoid re-computation

- **WHEN** year view re-renders due to non-event prop changes
- **THEN** event filtering is not re-executed if the event list and year have not changed

### Requirement: Keyboard accessibility for day cells

Day cells SHALL be keyboard-accessible for users who navigate without a mouse.

#### Scenario: Day cells are focusable via Tab key

- **WHEN** user presses Tab while focused on a year view element
- **THEN** focus moves to the next day cell in document order

#### Scenario: Focused day cell has visible focus indicator

- **WHEN** a day cell receives keyboard focus
- **THEN** a visible focus outline is displayed around the cell

#### Scenario: Enter or Space key activates day cell

- **WHEN** user presses Enter or Space while a day cell is focused
- **THEN** the calendar navigates to day view for that date (same as clicking)

### Requirement: Screen reader support

The year view SHALL provide appropriate ARIA labels and semantic structure for screen reader users.

#### Scenario: Each day cell has descriptive ARIA label

- **WHEN** a screen reader focuses on a day cell
- **THEN** the ARIA label announces the full date and event count (e.g., "January 15, 2026, 3 events" or "January 15, 2026, no events")

#### Scenario: Month headers are semantic headings

- **WHEN** screen reader navigates the year view structure
- **THEN** month names are announced as headings at the appropriate level

#### Scenario: Weekday headers are announced

- **WHEN** screen reader navigates a month mini-grid
- **THEN** weekday header abbreviations are announced to provide context for day cells

### Requirement: Atlas UI design system integration

The year view SHALL use Atlas UI CSS variables and follow established styling patterns.

#### Scenario: Event dots use primary brand color

- **WHEN** an event dot is rendered
- **THEN** the dot color is determined by the `--brand-primary` CSS variable with fallback to `#0595db`

#### Scenario: Today highlight uses lighter primary color

- **WHEN** the current day is highlighted
- **THEN** the background color is determined by the `--color-primary-lighter` CSS variable

#### Scenario: Month card borders use default border color

- **WHEN** a month mini-grid is rendered
- **THEN** the border color is determined by the `--border-color-default` CSS variable with fallback to `#d7d7d7`

#### Scenario: Grid gaps use standard spacing

- **WHEN** the year grid layout is rendered
- **THEN** gaps between month cards use the `--spacing-medium` CSS variable with fallback to `10px`

### Requirement: Performance with large event datasets

The year view SHALL render efficiently even with large numbers of events (1000+).

#### Scenario: Year view renders in under 200ms with 1000 events

- **WHEN** year view is rendered with 1000 events spread across the year
- **THEN** initial render completes in under 200 milliseconds

#### Scenario: Event filtering is memoized across re-renders

- **WHEN** year view re-renders due to non-event prop changes
- **THEN** event filtering computation is skipped if events and year are unchanged

#### Scenario: Month grids render day cells without per-day event filtering

- **WHEN** a month mini-grid renders 30+ day cells
- **THEN** event presence is checked using pre-filtered month-level event list, not the full year's events
