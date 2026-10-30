## Context

The Excel export path for a Data Grid 2 column is:

- `cell-readers.ts` → `readChunk()` builds, per row, an array of `ExcelCell` objects (`{ t, v, z }`).
- `Export_To_Excel.js` (in `@mendix/data-widgets`) feeds those arrays to `utils.aoa_to_sheet` / `utils.sheet_add_aoa`, then `writeFileXLSX`.
- The SheetJS build used is bundled as `packages/modules/data-widgets/src/javascriptsource/datawidgets/actions/xlsx-export-tools.js` (132 KB, minified, exports only `utils` and `writeFileXLSX`).

The decisive finding came from a throwaway node harness that imported that exact bundle and inspected the resulting `xl/worksheets/sheet1.xml`:

| input to SheetJS                           | conversion used  | serial for local-midnight `2007-01-01` |
| ------------------------------------------ | ---------------- | -------------------------------------- |
| raw `Date` via `aoa_to_sheet`              | **local** fields | `39083` — correct                      |
| cell object `{ t: "d", v: Date }` at write | **UTC** fields   | `39082.958333333336` — wrong           |

`sheet_add_aoa` treats a non-`Date` object as an already-built cell and assigns it through untouched, so conversion is deferred to `write_ws_xml_cell`, which takes the UTC path. The harness reproduced the customer's baseline serial to the digit — `39082.958333333336`, and `…916666` for both summer rows — confirming the loop matched the reported failure rather than something nearby.

Given that, the `Date` the widget receives must be **local-anchored**: only a local-anchored `2007-01-01 00:00` yields `39082.9583` under UTC-field conversion (a UTC-anchored one yields `39083`). That is consistent with the grid rendering `1/1/2007` correctly, and it means nothing upstream of the widget — not the date picker, not the client's `EditableValue` — applies a spurious shift. The `Localize = OFF` detail in the report is a red herring; the same defect applies to localized attributes.

## Goals / Non-Goals

**Goals:**

- An exported `t: "d"` cell carries the same wall clock the grid displays, for both date-only and time-bearing export formats.
- Correct under any session UTC offset, including fractional offsets and DST transitions.
- Regression coverage that cannot silently pass because of the host machine's timezone.

**Non-Goals:**

- Not patching or upgrading the bundled SheetJS, and not changing `Export_To_Excel.js`. The inconsistency is upstream behavior; the widget adapts to the documented-by-experiment contract of the API it calls.
- Not switching the export to raw `Date` values (the local-field path). That would discard the per-cell `z` format the `3.11.0`/`3.11.3` work introduced, since `aoa_to_sheet` assigns its own default date format to raw dates.
- Not addressing WC-3536's boolean complaint (product decision) or its long-number complaint (already fixed in `3.11.3`).
- Not changing how the grid itself renders dates.

## Decisions

1. **Re-anchor local fields onto UTC at the point a `Date` enters the export, via `toExcelWallClock()`.**
   Establishes a single invariant for the rest of the module: _every `Date` reaching `excelDate()` is UTC-anchored, and its UTC fields are the wall clock Excel must show._ `stripTime()` therefore keeps its existing UTC getters unchanged and simply gains a doc comment stating the precondition. This keeps the diff small and makes the two branches (`stripTime` vs. keep-time) correct by the same rule.
   Alternative considered and rejected: subtract `getTimezoneOffset()` in milliseconds. Rejected as it is the same operation expressed less legibly, and it invites the classic error of using the offset of the wrong instant across a DST boundary.

2. **Apply the same treatment to the time-bearing branch, not just `stripTime()`.**
   `hasTimeComponent(format)` previously passed the raw value straight through, exporting `13:35` for a `14:35` value. The bug is in the shared conversion, not in the truncation, so both branches must be anchored. Fixing only the reported (date-only) symptom would have left a second wrong-time defect in place.

3. **`customContent` date strings get a zone-aware parse (`parseExportDate()`), not a blanket re-anchor.**
   ECMAScript parses date-only ISO forms (`YYYY`, `YYYY-MM`, `YYYY-MM-DD`) as **UTC**, but ISO forms carrying a time and no offset as **local**. A blanket re-anchor is therefore wrong for `"2024-06-15"`: it would produce `14-Jun-2024` in every negative-offset zone — a regression introduced by the fix itself, caught before landing. `parseExportDate()` re-anchors only strings that JS parsed locally; strings with an explicit `Z`/`±hh:mm`, and date-only ISO strings, are passed through as-is.

4. **Timezone-agnostic tests via local `Date` construction, not a pinned `process.env.TZ`.**
   Inputs are built with `new Date(2007, 0, 1)` and asserted against `new Date(Date.UTC(2007, 0, 1))`, which holds under every offset by construction. Pinning `TZ` in `jest.setup.ts` was rejected because it is package-global and would change the environment for unrelated date-filter specs. The suite was instead executed under eight zones — `Europe/Amsterdam`, `America/New_York`, `America/Anchorage`, `Pacific/Kiritimati` (+14), `Pacific/Niue` (−11), `Asia/Kathmandu` (+5:45), `Australia/Lord_Howe` (+10:30, 30-minute DST), `UTC` — as the guard against a TZ-sensitive green.

5. **Five pre-existing tests were rewritten, not relaxed.**
   They fed `new Date("2024-06-15T10:30:00Z")` — a UTC instant — into the _attribute_ reader, a shape the Mendix client never produces, and their expectations encoded the buggy UTC truncation. They passed in `Europe/Amsterdam` but failed under `Pacific/Kiritimati` and `Pacific/Niue` once the fix was in, because `10:30Z` falls on a different local date there. Their inputs are now local-constructed to match how the client supplies values. No assertion was weakened.

## Risks / Trade-offs

- [Risk] A future SheetJS upgrade changes the `t: "d"` write-path conversion to use local fields, at which point the re-anchoring would itself introduce an offset.
  → Mitigation: the invariant is documented at `toExcelWallClock()` with the reason. The timezone-agnostic tests fail loudly under any host offset if the contract flips, rather than passing on a `UTC` CI box and breaking for customers.

- [Risk] `parseExportDate()` cannot know the intended wall clock of a `customContent` string that names a non-UTC offset (`2007-01-01T00:00:00+05:00`); it keeps the instant, so the cell shows the UTC wall clock rather than the `+05:00` one.
  → Mitigation: preserves existing behavior for such strings, so no regression. Unlikely in practice — the export-value expression is user-authored text and typically zoneless or already formatted.

- [Trade-off] Exported dates now differ from previous releases for every non-UTC session. That is the point of the fix, but it means a customer comparing old and new exports sees every date column shift.
  → Mitigation: called out in the changelog as a fix rather than a silent change.

- [Note] `exportType = "default"` on a _Date and time_ attribute whose formatter config is not `custom` yields `format === undefined`, so `hasTimeComponent()` is false and the time is stripped. Pre-existing behavior, unchanged here, and out of scope for WC-3536 — recorded as an Open Question.

## Migration Plan

No data migration (pure in-memory conversion; no persisted format, XML property, or public API change).

1. Add the failing `timezone handling` tests at the `cell-readers` seam; confirm RED (7 failures matching the reported symptom).
2. Implement `toExcelWallClock()` and route the `attribute` date branch through it.
3. Add `parseExportDate()` for the `customContent` branch, including the date-only-ISO guard.
4. Make the five TZ-fragile pre-existing tests local-anchored.
5. Run the full `datagrid-web` suite under the eight timezones above.
6. Rebuild the widget into a Mendix 10.24.16 project and verify the produced `.xlsx` serials directly.
7. Add the `CHANGELOG.md` entry. Version bump happens at release time per repo convention.
8. Rollback: revert the single commit/PR; nothing persisted to unwind.

## Open Questions

- Should the boolean export type keep writing a typed Excel boolean (`TRUE`/`FALSE`) or switch to text matching the grid's `Yes`/`No`? Excel renders a boolean cell as `TRUE`/`FALSE` by definition, so matching the grid means giving up the boolean type. Referred to the PM on WC-3536; deliberately not implemented either way here.
- Should `exportType = "default"` on a _Date and time_ attribute preserve the time component? Currently it strips it whenever the formatter config is not `custom`. Not part of the reported issue; deferred.
- Verified against the reporter's own app (Mendix 10.24.16, `DataGrid2Issues` module): the three date rows exported as `39083` / `38076` / `41155` — `01-Jan-2007`, `30-Mar-2004`, `03-Sep-2012` — matching the grid, with no time component and no serial fraction.
