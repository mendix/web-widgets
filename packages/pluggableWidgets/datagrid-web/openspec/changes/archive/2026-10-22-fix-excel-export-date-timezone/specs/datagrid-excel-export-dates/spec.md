## ADDED Requirements

### Requirement: An exported date cell carries the wall clock the grid displays

When a Data Grid 2 column holding a date value is exported to Excel, the resulting cell SHALL represent the same wall clock the grid renders for that value. The session's UTC offset SHALL NOT appear in the exported cell, whether as a shifted calendar day or as a time component the grid does not show.

This SHALL hold for every session UTC offset, including offsets that are not a whole number of hours, and for values on either side of a daylight-saving transition. Whether the attribute is configured as localized or non-localized SHALL NOT affect the exported wall clock.

#### Scenario: Midnight value with a date-only export format

- **WHEN** an attribute column whose value the grid renders as `1/1/2007` is exported with the export format `dd-MMM-yyyy`
- **THEN** the exported cell holds `01-Jan-2007`, on the same calendar day the grid shows, and carries no time component

#### Scenario: Midnight value across a daylight-saving boundary

- **WHEN** values the grid renders as `3/30/2004` and `9/3/2012` — one in each DST state for the session — are exported with the export format `dd-MMM-yyyy`
- **THEN** both export on their own calendar day, `30-Mar-2004` and `03-Sep-2012`, with no dependence on which offset was in effect

#### Scenario: Non-midnight value with a date-only export format

- **WHEN** a value the grid renders as `1/1/2007 14:35` is exported with the export format `dd-MMM-yyyy`
- **THEN** the exported cell holds `01-Jan-2007` — the time is dropped, and the calendar day is the one the grid shows

#### Scenario: Value with a time-bearing export format

- **WHEN** a value the grid renders as `1/1/2007 14:35` is exported with the export format `dd-MMM-yyyy hh:mm`
- **THEN** the exported cell holds `01-Jan-2007 14:35` — the displayed time is preserved exactly, not shifted by the session offset

#### Scenario: Default export type on a date attribute

- **WHEN** a date attribute column is exported with export type `Default`, so the format is taken from the attribute's own formatter
- **THEN** the exported cell is on the calendar day the grid shows, on the same terms as an explicit date export format

### Requirement: Custom content date strings export on the day the string names

When a column with custom content is exported with export type `Date`, the exported cell SHALL represent the wall clock named by the export value string, regardless of how ECMAScript resolves that string's timezone.

A string carrying an explicit zone, and a date-only ISO string (which ECMAScript defines as UTC), SHALL be taken at the instant it resolves to. Any other string — which ECMAScript parses in the browser's local time — SHALL be re-anchored so its named wall clock survives into the cell.

#### Scenario: Zoneless date and time string

- **WHEN** the export value is `2007-01-01T00:00:00` and the export format is `dd-MMM-yyyy`
- **THEN** the exported cell holds `01-Jan-2007`

#### Scenario: Date-only ISO string

- **WHEN** the export value is `2007-01-01` and the export format is `dd-MMM-yyyy`
- **THEN** the exported cell holds `01-Jan-2007`, including in sessions at a negative UTC offset

#### Scenario: String with an explicit zone

- **WHEN** the export value is `2007-01-01T00:00:00Z` and the export format is `dd-MMM-yyyy`
- **THEN** the exported cell holds `01-Jan-2007`

#### Scenario: Locale-style date string

- **WHEN** the export value is `1/1/2007` and the export format is `dd-MMM-yyyy`
- **THEN** the exported cell holds `01-Jan-2007`

#### Scenario: Unparseable string

- **WHEN** the export value cannot be parsed as a date
- **THEN** the value is exported as a text cell, unchanged, rather than as a date cell
