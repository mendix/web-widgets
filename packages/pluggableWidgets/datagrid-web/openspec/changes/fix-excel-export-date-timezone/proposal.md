## Why

Exporting a Data Grid 2 date column to Excel writes the wrong wall clock. For a value the grid renders as `1/1/2007`, the exported cell holds Excel serial `39082` — `31-Dec-2006`, one full calendar day early. Before the `3.11.0`/`3.11.3` export work the same cell held `39082.958333` (`31-Dec-2006 23:00`), so users saw a stray time instead; the day shift was always present, the earlier serial fraction merely masked which day it landed on. Reported as WC-3536 against a customer app on Mendix 10.24.14, on an attribute with `Localize = OFF`, where no session-timezone conversion is meant to occur at all.

The offset is the session's UTC offset and tracks DST (23:00 in Amsterdam winter, 22:00 in summer), which made this look like a localization bug in the Mendix client or the date picker. It is not: the shift is introduced entirely inside the widget's own export path.

## Root Cause

SheetJS is internally inconsistent about which fields of a JS `Date` represent the sheet's wall clock:

- A **raw `Date`** passed through `utils.aoa_to_sheet` is converted using the `Date`'s **local** fields, producing the correct serial.
- A **cell object** (`{ t: "d", v: Date }`) defers conversion to write time, where the `Date`'s **UTC** fields are read instead.

`cell-readers.ts` builds cell objects, so the export takes the UTC path. The Mendix client hands the widget a local-anchored `Date` — its _local_ fields are the stored value, which is why the grid renders correctly — so reading the UTC fields yields `2006-12-31 23:00`. `stripTime()` then truncated on those same UTC fields, turning the stray hour into the previous calendar day.

Two consequences of the same cause, both confirmed:

1. Date-only formats (`dd-MMM-yyyy`) export the previous day for any midnight value, i.e. for all date-only data. A non-midnight value (`14:35`) lands on the correct day, which is the signature of UTC truncation rather than a plain off-by-one.
2. Time-bearing formats (`dd-MMM-yyyy hh:mm`) skip `stripTime()` via `hasTimeComponent()` and export the time shifted by the offset — `13:35` for a `14:35` value. Not in the original report; found while diagnosing.

`Localize = OFF` is incidental. Localized attributes were affected identically.

## What Changes

- Date values are re-anchored onto UTC from their **local** fields before becoming an Excel cell, so a `t: "d"` cell carries exactly the wall clock the grid displays — independent of the session offset and of DST.
- `stripTime()` keeps operating on UTC fields and now documents that it requires a UTC-anchored input.
- `customContent` date strings are parsed into the same UTC-anchored form. Strings that name a zone, and date-only ISO strings (which ECMAScript defines as UTC), are already anchored and are left alone; only genuinely local-parsed strings are re-anchored.
- Regression coverage that is timezone-agnostic by construction, so it holds under any host offset or DST rule.

## Capabilities

### New Capabilities

- `datagrid-excel-export-dates`: the wall clock a Data Grid 2 date column writes into an exported Excel cell, and its relationship to what the grid displays.

### Modified Capabilities

_None — no existing `openspec/specs/` capability spec documents Data Grid 2 Excel export date behavior, so this is captured as a new capability rather than a delta._

## Impact

- `packages/pluggableWidgets/datagrid-web/src/features/data-export/cell-readers.ts` — the fix site. New `toExcelWallClock()` helper; `parseExportDate()` for the `customContent` path; `attribute` and `customContent` date branches route through them.
- `packages/pluggableWidgets/datagrid-web/src/features/data-export/__tests__/cell-readers.spec.ts` — new `timezone handling` block; five pre-existing tests made timezone-agnostic (see design).
- `packages/pluggableWidgets/datagrid-web/CHANGELOG.md` — user-facing fix entry.
- No XML/property schema changes. No changes to the `Export_To_Excel` JS action or the bundled SheetJS in `@mendix/data-widgets`. No changes to shared packages.
- WC-3536 additionally reports two non-date complaints that this change deliberately does **not** address: long-number precision (already fixed in Data Widgets `3.11.3`) and `TRUE`/`FALSE` vs `Yes`/`No` for boolean columns (a product decision, not a defect — see Open Questions).
