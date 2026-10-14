## ADDED Requirements

### Requirement: Calendar popup renders into a widget-owned portal

The widget SHALL render the calendar popup into a portal container it owns and identifies, so the popup escapes the Data Grid's clipping and scrolling ancestors. The portal container element SHALL carry the same id that the calendar toggle button references via `aria-controls`.

#### Scenario: Popup escapes grid overflow

- **WHEN** the filter is placed in a Data Grid header and the user opens the calendar
- **THEN** the calendar is rendered inside the widget's portal container rather than inline in the filter cell
- **AND** the full calendar is visible without being clipped by the grid's overflow

#### Scenario: Popup positioning survives page scroll

- **WHEN** the calendar is open and the surrounding page scrolls
- **THEN** the calendar stays anchored below the start of the filter input

#### Scenario: Popup content is only mounted while expanded

- **WHEN** the calendar is closed
- **THEN** no calendar content is present in the portal container

### Requirement: Calendar toggle button exposes accessible expanded state

The widget SHALL render a calendar toggle button that announces its popup relationship and current expanded state to assistive technology. The button SHALL reflect `aria-expanded` matching whether the calendar is open, reference the portal container through `aria-controls`, declare `aria-haspopup`, and carry a configurable accessible label.

#### Scenario: Expanded state tracks calendar visibility

- **WHEN** the user opens the calendar
- **THEN** the toggle button reports `aria-expanded` as true
- **AND** when the calendar closes the button reports `aria-expanded` as false

#### Scenario: Author-configured screen reader captions are used

- **WHEN** the widget is configured with a screen reader calendar caption and input caption
- **THEN** the toggle button uses the calendar caption as its accessible name
- **AND** the picker input is labelled by the input caption

#### Scenario: Default captions when unconfigured

- **WHEN** no screen reader captions are configured
- **THEN** the toggle button falls back to "Show calendar"
- **AND** the input falls back to a "date filter" label

### Requirement: Keyboard and pointer activation of the calendar

The widget SHALL open the calendar and move focus into the picker when the toggle button is activated by pointer or by keyboard. Pointer activation SHALL be handled on mouse-down rather than click to avoid racing the calendar's outside-click dismissal. Keyboard activation SHALL respond to Enter and Space and SHALL suppress the default browser action.

#### Scenario: Mouse activation opens the calendar

- **WHEN** the user presses the mouse down on the calendar toggle button while the calendar is closed
- **THEN** the picker receives focus and the calendar opens

#### Scenario: Mouse-down while already open does not re-focus

- **WHEN** the user presses the mouse down on the toggle button while the calendar is already open
- **THEN** the widget does not re-issue a focus request

#### Scenario: Enter and Space open the calendar

- **WHEN** the toggle button has focus and the user presses Enter or Space
- **THEN** the default action and propagation are suppressed
- **AND** the picker receives focus and the calendar opens

### Requirement: Single-date and range filter modes drive the picker

The widget SHALL configure the picker for range selection when the active filter function is `between`, and for single-date selection otherwise. In range mode the picker SHALL receive start and end dates and SHALL offer a clear affordance; in single-date mode it SHALL receive one selected date. When the filter function is `empty` or `notEmpty` the picker SHALL be disabled.

#### Scenario: Between filter selects a range

- **WHEN** the active filter function is `between`
- **THEN** the picker operates in range mode with the filter's first and second arguments as start and end dates
- **AND** a clear affordance is available

#### Scenario: Non-range filter selects a single date

- **WHEN** the active filter function is any comparison other than `between`, `empty`, or `notEmpty`
- **THEN** the picker operates in single-date mode with the filter's first argument as the selected date

#### Scenario: Emptiness filters disable the picker

- **WHEN** the active filter function is `empty` or `notEmpty`
- **THEN** the picker input is disabled

#### Scenario: Switching filter function refocuses the picker

- **WHEN** the user changes the filter function from the filter selector
- **THEN** the picker receives focus

### Requirement: Picker change events map onto filter arguments

The widget SHALL translate the picker's selection callback into filter argument updates for both selection modes. A single `Date` SHALL set the first filter argument. A start/end pair SHALL set the first and second arguments, mapping absent endpoints to undefined. A null selection SHALL clear both arguments.

#### Scenario: Single date selection sets one argument

- **WHEN** the picker reports a single `Date` selection
- **THEN** the filter's first argument is set to that date

#### Scenario: Range selection sets both arguments

- **WHEN** the picker reports a start/end pair
- **THEN** the filter's first argument is the start date and the second is the end date
- **AND** a null endpoint becomes undefined

#### Scenario: Cleared selection resets both arguments

- **WHEN** the picker reports a null selection
- **THEN** both filter arguments are cleared

#### Scenario: Calendar stays open after picking a date

- **WHEN** the user selects a date in the calendar
- **THEN** the calendar remains open so a range can be completed

### Requirement: Range mode restricts direct text entry

In range selection mode the widget SHALL suppress raw text input changes on the picker input, and SHALL clear the filter when Backspace is pressed while the input has focus.

#### Scenario: Typing is suppressed in range mode

- **WHEN** the picker is in range mode and a raw input change event occurs
- **THEN** the change is prevented

#### Scenario: Backspace clears a range

- **WHEN** the picker is in range mode and the user presses Backspace with the input focused
- **THEN** the filter is cleared

#### Scenario: Typing is allowed in single-date mode

- **WHEN** the picker is in single-date mode
- **THEN** raw text entry into the input is not suppressed

### Requirement: Session locale and date format configure the calendar

The widget SHALL derive the calendar's locale, first day of week, and accepted date formats from the active Mendix session locale. Short day and month tokens SHALL be widened so values with leading zeros parse, uppercase day-of-week tokens SHALL be lowercased to match the picker's format standard, and both the widened and original patterns SHALL be accepted when they differ. Date parsing SHALL be strict. The month and year selectors SHALL be rendered as dropdowns.

#### Scenario: Session locale registers the calendar locale

- **WHEN** the session locale language tag matches an available date library locale
- **THEN** that locale is registered and passed to the picker
- **AND** the calendar's first day of week comes from the session locale

#### Scenario: Short format tokens accept padded input

- **WHEN** the session date pattern uses single `d` or `M` tokens
- **THEN** the picker accepts both the widened pattern and the original session pattern

#### Scenario: Uppercase day-of-week token is normalized

- **WHEN** the session date pattern contains an uppercase `E`
- **THEN** the pattern passed to the picker uses a lowercase `e`

#### Scenario: Month and year are chosen from dropdowns

- **WHEN** the calendar is open
- **THEN** month and year are selectable via dropdown selects rather than scroll lists

### Requirement: Picker stylesheet and class names remain available to the theme

The widget SHALL depend on the picker's published stylesheet entry point, and the calendar markup SHALL keep the class names that the Data Widgets Atlas theme and the widget's own styles target. The popup wrapper SHALL continue to expose its resolved placement as a data attribute so placement-conditional theme rules apply.

#### Scenario: Stylesheet import path resolves

- **WHEN** the widget or its editor preview imports the picker's distributed stylesheet
- **THEN** the import resolves against the installed picker package

#### Scenario: Theme-targeted class names are present

- **WHEN** the calendar is rendered
- **THEN** the month select, year select, day, day-name, week, month container, header, and popper wrapper class names targeted by the theme are present

#### Scenario: Placement is exposed for conditional styling

- **WHEN** the calendar opens below the input
- **THEN** the popup wrapper exposes a placement data attribute beginning with `bottom`

### Requirement: Picker dependency stays on a supported, current major

The widget SHALL depend on a `react-datepicker` major that is actively supported, SHALL rely on the picker's bundled TypeScript types rather than a separate community types package, and SHALL declare a `date-fns` version compatible with the one the picker itself depends on. The picker SHALL NOT pull in a `react-onclickoutside` transitive dependency.

#### Scenario: Types come from the picker package

- **WHEN** the widget imports the picker's prop and instance types
- **THEN** those types resolve from the picker package's own type declarations
- **AND** no separate community types package is installed for it

#### Scenario: Date library versions agree

- **WHEN** dependencies are installed
- **THEN** the `date-fns` major the widget declares matches the major the picker depends on

#### Scenario: Removed transitive dependency is absent

- **WHEN** the dependency tree is inspected
- **THEN** `react-onclickoutside` is not present via the picker

#### Scenario: React version support is retained

- **WHEN** the widget is built against the repository's supported React version
- **THEN** the picker's peer range admits that version
