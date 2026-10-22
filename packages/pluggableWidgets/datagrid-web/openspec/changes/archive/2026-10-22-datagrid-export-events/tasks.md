## 1. XML — Declare action properties

- [ ] 1.1 Add `onBeforeExport` property block (type="action", required="false") to the Events `<propertyGroup>` in `src/Datagrid.xml`, with `<actionVariables>` for: `gridName` (String), `columnTitles` (String), `chunkSize` (Integer), `fileName` (String), `sheetName` (String), `startTime` (DateTime)
- [ ] 1.2 Add `onAfterExport` property block (type="action", required="false") to the same Events `<propertyGroup>` in `src/Datagrid.xml`, with `<actionVariables>` for: `gridName` (String), `columnTitles` (String), `chunkSize` (Integer), `fileName` (String), `sheetName` (String), `exportedItemCount` (Integer), `status` (String), `startTime` (DateTime), `endTime` (DateTime)
- [ ] 1.3 Regenerate `typings/DatagridProps.d.ts` by running `pnpm run build` (or the pluggable-widgets-tools codegen step) and verify `onBeforeExport` and `onAfterExport` appear as `ActionValue<...> | undefined` in `DatagridContainerProps`

## 2. DSExportRequest — Expose public getters

- [ ] 2.1 Add `get loaded(): number` public getter to `DSExportRequest` returning `this.loaded` (the count of rows streamed so far)
- [ ] 2.2 Add `get limit(): number` public getter to `DSExportRequest` returning `this.limit` (the effective rows-per-page after `Math.max`)

## 3. ExportController — Add NanoEvents and public on()

- [ ] 3.1 Add `beforeexport: (args: BeforeExportArgs) => void` and `afterexport: (args: AfterExportArgs) => void` to the `ControllerEvents` interface
- [ ] 3.2 Add a public `on<K>(event: K, handler: ControllerEvents[K]): Unsubscribe` method (mirrors existing `emit()`)
- [ ] 3.3 In `exportData()`, before `handler(req)`: capture `startTime = new Date()`, derive `columnTitles` from the filtered column properties, read `fileName`/`sheetName` from options (default `""`), then `this.emitter.emit("beforeexport", { ... })`
- [ ] 3.4 In `exportData()`, after `await req.send()` resolves but before `req = null`: read `req.loaded`/`req.status` (map `"end"` → `"success"`, `"aborted"` → `"aborted"`), capture `endTime = new Date()`, then `this.emitter.emit("afterexport", { ... })`
- [ ] 3.5 Ensure the same `startTime` Date object is passed to both `beforeexport` and `afterexport` within a single `exportData()` invocation

## 4. useDataExport — Wire props to controller via ref + subscription

- [ ] 4.1 Expand the `Props` type alias in `useDataExport.ts` to include `onBeforeExport` and `onAfterExport` from `DatagridContainerProps`
- [ ] 4.2 Store `props.onBeforeExport` and `props.onAfterExport` in `useRef`s updated on every render (outside effects)
- [ ] 4.3 Add a `useEffect([entry])` that subscribes to `"beforeexport"` via `entry.controller.on(...)` — the handler reads the latest `ActionValue` from the ref and calls `action.execute(...)` when `action.canExecute` is true; return the unsubscribe function as cleanup
- [ ] 4.4 Add a `useEffect([entry])` that subscribes to `"afterexport"` via `entry.controller.on(...)` — same pattern; return the unsubscribe function as cleanup
- [ ] 4.5 Pass `onBeforeExport` and `onAfterExport` from `props` into `useDataExport` call in `Datagrid.tsx`

## 5. Tests

- [ ] 5.1 Add unit test: `ExportController` emits `"beforeexport"` once before `send()` is called (subscriber fires before send)
- [ ] 5.2 Add unit test: `ExportController` emits `"afterexport"` once after `req.send()` resolves on success, with `status: "success"`
- [ ] 5.3 Add unit test: `ExportController` emits `"afterexport"` with `status: "aborted"` when request ends in aborted state
- [ ] 5.4 Add unit test: `startTime` in `"beforeexport"` args is the same object reference as `startTime` in `"afterexport"` args
- [ ] 5.5 Add unit test: when neither callback is set, `exportData()` completes without errors

## 6. Verify & Cleanup

- [ ] 6.1 Run `pnpm run test` in `packages/pluggableWidgets/datagrid-web` — all tests pass
- [ ] 6.2 Run `pnpm run lint` — no new lint errors
- [ ] 6.3 Update `CHANGELOG.md` with a user-facing entry describing the two new export event actions
