## Context

Data Grid 2 has a `data-export` feature (`src/features/data-export/`) that lets external modules (e.g. `data-exporter-web`) stream rows out of the widget. The flow:

1. `useDataExport` creates an `ExportController` on mount, registered in a global window map keyed by `props.name`.
2. An external caller does `getExportRegistry().get("widgetName").exportData(handler, opts)`.
3. `ExportController.exportData()` creates a `DSExportRequest`, streams pages from the Mendix datasource, then restores the datasource view state.
4. `DSExportRequest` tracks `loaded` (rows streamed) and `limit` (rows per page) internally but exposes neither publicly.

There is currently no hook for the widget to observe the start or end of an export. The widget owns `ExportController`, which is the right place to add these hooks, but `ExportController` should not be coupled to Mendix `ActionValue` directly.

## Goals / Non-Goals

**Goals:**

- Fire `onBeforeExport` with context variables just before `req.send()` is called
- Fire `onAfterExport` with outcome variables after the export resolves (success or abort)
- Keep `ExportController` Mendix-API-agnostic (plain callbacks, not `ActionValue`)
- Keep the export path itself unchanged in behavior and performance

**Non-Goals:**

- Awaiting the action callbacks before proceeding (fire-and-forget only)
- Providing an ability to cancel the export from the callback
- Surfacing chunk-level (per-page) events — only start and end
- Changing how external callers trigger the export

## Decisions

### D1 — Plain callbacks on ExportController, not ActionValue

`ExportController` already holds a `ListValue` (Mendix API), so coupling it further with `ActionValue` is technically feasible. However the existing pattern keeps the controller as a data coordinator: it reacts to events, not Mendix props. `useDataExport` is the right place to bridge Mendix props to the controller.

**Decision**: Store `onBeforeExport` and `onAfterExport` as `(() => void) | undefined` on `ExportController`. `useDataExport` creates the closures that call `actionValue.execute(args)` and assigns them via setter methods on the controller. This keeps `ExportController` testable without Mendix mocks.

**Alternative considered**: Pass `ActionValue` directly into the constructor. Rejected because it couples the controller to Mendix types and makes the constructor dependent on optional props that may change between renders.

### D2 — Callback assignment via setter methods, updated on every render

Props can change between renders (e.g. action configuration changed in Studio Pro). The callbacks must always reflect the latest prop values.

**Decision**: `ExportController` exposes `setOnBeforeExport(cb)` and `setOnAfterExport(cb)` setters. `useDataExport` calls these in a `useEffect` that runs whenever `props.onBeforeExport` / `props.onAfterExport` change. This matches the existing pattern of emitting `"sourcechange"` / `"propertieschange"` on every render.

### D3 — startTime captured in ExportController, shared between both callbacks

Both `onBeforeExport` and `onAfterExport` receive `startTime` (so `onAfterExport` callers can compute duration in a single microflow without storing intermediate state). The timestamp must be identical in both calls.

**Decision**: Capture `startTime = new Date()` in `ExportController.exportData()` before calling `onBeforeExport`, then pass the same `Date` object to `onAfterExport`.

### D4 — status: "success" | "aborted" via DSExportRequest.status

`DSExportRequest` already tracks its internal status (`"end"` vs `"aborted"`). After `await req.send()` resolves, the request's final status is readable. Map `"end"` → `"success"` and `"aborted"` → `"aborted"` for the `onAfterExport` variable.

**Decision**: Read `req.status` after `send()` resolves, before nulling `req`. No new state needed on `ExportController`.

### D5 — columnTitles from filtered column properties

The exported columns are the result of `filter(this.properties)` in `exportData()` — only visible, exportable columns. Column headers are in `ColumnsType.header` as `DynamicValue<string>`.

**Decision**: After computing `filter(this.properties)`, derive `columnTitles` as `columns.map(c => c.header?.value ?? "").join(",")`. This runs once per export start, not per page.

### D6 — fileName and sheetName passed from the export caller

The datagrid widget does not know the target file or sheet name — those are decided by the external module that calls `exportData()`. Adding them as widget props would duplicate state that already exists in the caller.

**Decision**: Extend `exportData()` options to accept `fileName?: string` and `sheetName?: string`. Both default to `""` when not provided. `ExportController` forwards them unchanged to the callbacks.

**Alternative considered**: Expose `fileName`/`sheetName` as widget XML properties (configurable in Studio Pro). Rejected because the file name is typically set by the export module, not the grid configuration.

### D7 — DSExportRequest public getters

`exportedItemCount` requires `DSExportRequest.loaded` (currently private). `chunkSize` requires the effective limit (currently private). Both are needed after `send()` resolves, before `req = null`.

**Decision**: Add `get loaded(): number` and `get limit(): number` as public getters on `DSExportRequest`. No behavior change, just access.

## Risks / Trade-offs

- **Action execution order** — `onBeforeExport.execute()` calls are fire-and-forget and may outlive the export itself if they trigger a slow microflow. This is intentional and documented. [Risk: developer expects synchronous "before" semantics] → Mitigation: document clearly that the action fires concurrently with the export.
- **Missing header values** — if a column's `header` DynamicValue is not yet available (status `"loading"`), its title will be an empty string in `columnTitles`. [Risk: incomplete column title list] → Mitigation: acceptable — the export itself has the same constraint on column headers; we use the same value.
- **Empty fileName/sheetName** — when the export caller does not provide these values, they arrive in the action as empty strings. Microflow logic must guard against empty strings if it uses these values to route or name files.
- **Callback mutation during export** — if `setOnAfterExport` is called while an export is in progress (rare), the new callback fires. [Risk: unexpected microflow called] → Mitigation: callbacks are reassigned only when React props change, which requires a re-render; during an export the datasource is locked so this is extremely unlikely.

## Open Questions

- None. All design decisions were finalized during the exploration phase.
