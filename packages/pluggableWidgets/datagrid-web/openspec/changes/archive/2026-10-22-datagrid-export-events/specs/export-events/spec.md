## ADDED Requirements

### Requirement: onBeforeExport action fires before export starts

The widget SHALL expose an optional `onBeforeExport` action property. When configured, the widget MUST call `onBeforeExport.execute(args)` once, fire-and-forget, immediately before the first datasource page fetch of an export operation.

The action MUST receive the following variables:

- `gridName` (String) — the Studio Pro widget name (`props.name`)
- `columnTitles` (String) — comma-separated header captions of the visible, exported columns in their current display order (e.g. `"First name,Last Name,Date of Birth"`). Columns hidden by the user SHALL NOT be included.
- `chunkSize` (Integer) — the effective number of rows fetched per datasource request during the export (`Math.max(requestedLimit, 10)`).
- `fileName` (String) — the target file name for the export (e.g. `"export.xlsx"`), as provided by the export caller. SHALL be an empty string when not provided.
- `sheetName` (String) — the target sheet/tab name within the export file (e.g. `"Sheet1"`), as provided by the export caller. SHALL be an empty string when not provided.
- `startTime` (DateTime) — the timestamp captured immediately before `req.send()` is called.

The action execution MUST NOT block or delay the export flow.

#### Scenario: onBeforeExport fires with correct variables on normal export

- **WHEN** a configured `onBeforeExport` action exists and `canExecute` is true
- **AND** an export is triggered on the grid
- **THEN** `onBeforeExport.execute` is called once with `gridName`, `columnTitles`, `chunkSize`, `fileName`, `sheetName`, and `startTime` before any datasource page is fetched

#### Scenario: onBeforeExport is skipped when not configured

- **WHEN** `onBeforeExport` is not configured (optional property absent)
- **AND** an export is triggered
- **THEN** the export proceeds normally with no errors

#### Scenario: onBeforeExport columnTitles excludes hidden columns

- **WHEN** the user has hidden one or more columns
- **AND** an export is triggered
- **THEN** `columnTitles` contains only the headers of the currently visible, exported columns

---

### Requirement: onAfterExport action fires after export completes

The widget SHALL expose an optional `onAfterExport` action property. When configured, the widget MUST call `onAfterExport.execute(args)` once, fire-and-forget, after the export request resolves — whether it completed successfully or was aborted by the user.

The action MUST receive the following variables:

- `gridName` (String) — same as `onBeforeExport.gridName`
- `columnTitles` (String) — same as `onBeforeExport.columnTitles`
- `chunkSize` (Integer) — same as `onBeforeExport.chunkSize`
- `fileName` (String) — same as `onBeforeExport.fileName`
- `sheetName` (String) — same as `onBeforeExport.sheetName`
- `exportedItemCount` (Integer) — total number of rows actually streamed to the export handler before the request ended
- `status` (String) — `"success"` if all rows were exported; `"aborted"` if the user cancelled mid-export
- `startTime` (DateTime) — the same timestamp passed to `onBeforeExport` (enables duration calculation in a single microflow)
- `endTime` (DateTime) — the timestamp captured after the export request's `loadend` event fires

#### Scenario: onAfterExport fires with success status after complete export

- **WHEN** `onAfterExport` is configured and `canExecute` is true
- **AND** the export completes without interruption
- **THEN** `onAfterExport.execute` is called once with `status` equal to `"success"` and `exportedItemCount` equal to the total rows streamed

#### Scenario: onAfterExport fires with aborted status when user cancels

- **WHEN** the user clicks cancel on the export progress dialog mid-export
- **THEN** `onAfterExport.execute` is called once with `status` equal to `"aborted"` and `exportedItemCount` equal to the number of rows streamed before cancellation

#### Scenario: onAfterExport is skipped when not configured

- **WHEN** `onAfterExport` is not configured
- **AND** an export completes or is aborted
- **THEN** no error occurs and the export lifecycle completes normally

#### Scenario: onAfterExport startTime matches onBeforeExport startTime

- **WHEN** both `onBeforeExport` and `onAfterExport` are configured
- **AND** an export runs to completion
- **THEN** the `startTime` value in `onAfterExport` is identical to the `startTime` value in `onBeforeExport`

#### Scenario: onAfterExport endTime is after startTime

- **WHEN** `onAfterExport` fires after a completed export
- **THEN** `endTime` is greater than or equal to `startTime`

---

### Requirement: Both export event actions are optional and independent

The widget SHALL allow `onBeforeExport` and `onAfterExport` to be configured independently. Configuring one MUST NOT require configuring the other.

#### Scenario: Only onBeforeExport configured

- **WHEN** `onBeforeExport` is configured and `onAfterExport` is not
- **AND** an export runs to completion
- **THEN** `onBeforeExport` fires once and no error occurs for the missing `onAfterExport`

#### Scenario: Only onAfterExport configured

- **WHEN** `onAfterExport` is configured and `onBeforeExport` is not
- **AND** an export runs to completion
- **THEN** `onAfterExport` fires once and no error occurs for the missing `onBeforeExport`

#### Scenario: Neither action configured

- **WHEN** neither `onBeforeExport` nor `onAfterExport` is configured
- **AND** an export runs
- **THEN** the export behaves identically to before this feature was introduced
