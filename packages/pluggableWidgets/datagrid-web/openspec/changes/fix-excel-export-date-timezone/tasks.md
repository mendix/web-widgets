## 1. Establish a feedback loop and confirm the root cause

- [x] 1.1 Build a node harness that imports the real bundled SheetJS (`packages/modules/data-widgets/src/javascriptsource/datawidgets/actions/xlsx-export-tools.js`), writes a workbook, and reads the serials back out of `xl/worksheets/sheet1.xml`. Capture the write via a `globalThis.saveAs` shim, since the bundle has no `fs` binding and `writeFileXLSX` otherwise throws `cannot save file`.
- [x] 1.2 Confirm the harness reproduces the reported failure exactly, not something nearby: baseline serial `39082.958333333336` for a local-midnight `2007-01-01`, and `…916666` for both summer rows.
- [x] 1.3 Establish which fields SheetJS reads: a raw `Date` through `aoa_to_sheet` converts on **local** fields (`39083`, correct); a `{ t: "d", v: Date }` cell object converts at write time on **UTC** fields (`39082.9583`, wrong).
- [x] 1.4 Confirm from the differential that the `Date` the widget receives is local-anchored, so no layer upstream of the widget applies a shift and `Localize = OFF` is not implicated.
- [x] 1.5 Confirm the predicted discriminator: a non-midnight (`14:35`) value lands on the correct day while midnight values shift back — the signature of UTC truncation rather than a plain off-by-one.

## 2. Regression tests first (`cell-readers.spec.ts`)

- [x] 2.1 Add a `timezone handling` describe block whose inputs are built with the local `Date` constructor and whose expectations are `Date.UTC(...)`, making every case timezone-agnostic by construction.
- [x] 2.2 Cover midnight values in both DST states (`2007-01-01`, `2004-03-30`, `2012-09-03`) with a date-only export format.
- [x] 2.3 Cover a non-midnight value with a date-only format, and the same value with a time-bearing format (`dd-MMM-yyyy hh:mm`).
- [x] 2.4 Cover `exportType = "default"` on a date attribute.
- [x] 2.5 Cover the `customContent` date paths: zoneless date-and-time, zoneless afternoon time, date-only ISO, explicit-zone, and locale-style strings.
- [x] 2.6 Confirm the suite is RED before the fix — 7 failures, each matching the reported symptom (`Expected 2007-01-01T00:00:00.000Z / Received 2006-12-31T00:00:00.000Z`).

## 3. Implement the fix (`cell-readers.ts`)

- [x] 3.1 Add `toExcelWallClock(date)`, re-anchoring the `Date`'s local fields onto UTC, with a comment explaining the SheetJS contract and why the raw value cannot be passed through.
- [x] 3.2 Document on `stripTime()` that it expects a UTC-anchored input; leave its UTC getters unchanged.
- [x] 3.3 Route the `attribute` date branch through `toExcelWallClock()` for **both** the `stripTime` and the `hasTimeComponent` paths, so time-bearing formats stop exporting a shifted time.
- [x] 3.4 Add `parseExportDate(value)` for the `customContent` branch, re-anchoring only strings ECMAScript parsed locally.
- [x] 3.5 Guard date-only ISO forms (`YYYY`, `YYYY-MM`, `YYYY-MM-DD`) in `parseExportDate()` — ECMAScript parses them as UTC, so re-anchoring them would export the previous day in every negative-offset session. Verify the `EXPLICIT_ZONE` pattern does not false-match a bare `YYYY-MM-DD`.

## 4. Verify

- [x] 4.1 Rewrite the five pre-existing tests that fed `new Date("2024-06-15T10:30:00Z")` into the attribute reader so their inputs are local-constructed; their expectations encoded the buggy UTC truncation and broke under extreme offsets. Do not weaken any assertion.
- [x] 4.2 Run the full `datagrid-web` suite under `Europe/Amsterdam`, `America/New_York`, `America/Anchorage`, `Pacific/Kiritimati`, `Pacific/Niue`, `Asia/Kathmandu`, `Australia/Lord_Howe` and `UTC` — 235/235 green in each.
- [x] 4.3 Re-run the Task 1 harness against the fixed conversion: `39083` / `38076` / `41155` for the date-only cases and `39083.60763888889` for the time-bearing case.
- [x] 4.4 Rebuild the widget into the reporter's app on Mendix 10.24.16 and confirm the deployed bundle actually replaced the old one before trusting the export.
- [x] 4.5 Export from the running app and dump the `.xlsx`: three date cells at `39083` / `38076` / `41155`, format `dd-MMM-yyyy`, flagged date-only with no time component.
- [x] 4.6 Confirm eslint and `tsc --noEmit` are clean for both changed files.
- [x] 4.7 Confirm no debug instrumentation was left behind (the diagnosis used an external harness under `/tmp`, so nothing was added to `src/`).

## 5. Release hygiene

- [x] 5.1 Add a `CHANGELOG.md` entry for `datagrid-web` under `[Unreleased]`, describing the user-facing behavior only.
- [x] 5.2 Confirm no XML/property schema change is needed (none — the fix is internal to `cell-readers.ts`).
- [x] 5.3 Confirm no change is needed in `@mendix/data-widgets` (`Export_To_Excel.js` and the bundled SheetJS are untouched).
- [ ] 5.4 Confirm the `datagrid-web` patch version bump is present at release time, per repo convention that bumps happen at release rather than during development.

## 6. Out of scope for this change (WC-3536 also covers these)

- [x] 6.1 Long-number precision — already fixed in Data Widgets `3.11.3`; re-confirmed in the verification export (19-digit account numbers exact, as text cells).
- [ ] 6.2 Boolean `TRUE`/`FALSE` vs the grid's `Yes`/`No` — product decision referred to the PM on WC-3536. Not implemented in either direction here.
