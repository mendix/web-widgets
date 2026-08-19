## Why

Developers using the Data Grid 2 export feature have no built-in way to observe export lifecycle — they cannot log when an export starts, how long it takes, how many rows were exported, or under what filter conditions. Adding `onBeforeExport` and `onAfterExport` action properties fills this gap with zero impact on the export path itself.

## What Changes

- Add `onBeforeExport` action property (optional) to Data Grid 2, firing just before the first datasource page fetch, with variables: `gridName`, `columnTitles`, `filterCondition`, `chunkSize`, `startTime`
- Add `onAfterExport` action property (optional) to Data Grid 2, firing after the export completes (success or abort), with variables: `gridName`, `columnTitles`, `filterCondition`, `chunkSize`, `exportedItemCount`, `status`, `startTime`, `endTime`
- Both actions are fire-and-forget — they do not block the export flow
- `onAfterExport` fires on both successful completion and user abort; the `status` variable ("success" | "aborted") distinguishes them
- `columnTitles` reflects only the visible (exported) columns at the time of export, comma-separated
- `filterCondition` is a JSON string in the same format as the personalization storage
- Expose public `loaded` and `limit` getters on `DSExportRequest` (internal refactor, not a public API change)

## Capabilities

### New Capabilities

- `export-events`: Two lifecycle action hooks (`onBeforeExport`, `onAfterExport`) on the Data Grid 2 widget for observing and logging export operations

### Modified Capabilities

<!-- No existing spec-level requirements change — this is a purely additive capability -->

## Impact

- **`src/Datagrid.xml`** — two new `<property>` blocks with `<actionVariables>` added to the Events `<propertyGroup>`
- **`typings/DatagridProps.d.ts`** — auto-regenerated from XML; new `ActionValue` typed props appear
- **`src/features/data-export/ExportController.ts`** — accepts two optional plain-function callbacks; calls them at the right points in `exportData()`
- **`src/features/data-export/DSExportRequest.ts`** — adds `get loaded(): number` and `get limit(): number` public getters
- **`src/features/data-export/useDataExport.ts`** — wires `props.onBeforeExport` / `props.onAfterExport` into `ExportController` callbacks
- No new dependencies; no breaking changes; no runtime performance impact on the export itself
