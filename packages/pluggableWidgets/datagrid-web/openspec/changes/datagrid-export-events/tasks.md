## 1. XML — Declare action properties

- [ ] 1.1 Add `onBeforeExport` property block (type="action", required="false") to the Events `<propertyGroup>` in `src/Datagrid.xml`, with `<actionVariables>` for: `gridName` (String), `columnTitles` (String), `filterCondition` (String), `chunkSize` (Integer), `startTime` (DateTime)
- [ ] 1.2 Add `onAfterExport` property block (type="action", required="false") to the same Events `<propertyGroup>` in `src/Datagrid.xml`, with `<actionVariables>` for: `gridName` (String), `columnTitles` (String), `filterCondition` (String), `chunkSize` (Integer), `exportedItemCount` (Integer), `status` (String), `startTime` (DateTime), `endTime` (DateTime)
- [ ] 1.3 Regenerate `typings/DatagridProps.d.ts` by running `pnpm run build` (or the pluggable-widgets-tools codegen step) and verify `onBeforeExport` and `onAfterExport` appear as `ActionValue<...> | undefined` in `DatagridContainerProps`

## 2. DSExportRequest — Expose public getters

- [ ] 2.1 Add `get loaded(): number` public getter to `DSExportRequest` returning `this.loaded` (the count of rows streamed so far)
- [ ] 2.2 Add `get limit(): number` public getter to `DSExportRequest` returning `this.limit` (the effective rows-per-page after `Math.max`)

## 3. ExportController — Add callback slots and invocation

- [ ] 3.1 Add `private _onBeforeExport: (() => void) | undefined` and `private _onAfterExport: (() => void) | undefined` fields to `ExportController`
- [ ] 3.2 Add `setOnBeforeExport(cb: (() => void) | undefined): void` and `setOnAfterExport(cb: (() => void) | undefined): void` setter methods
- [ ] 3.3 In `exportData()`, before `req.send()`: capture `startTime = new Date()`, derive `columnTitles` from the filtered column properties (`filter(this.properties).map(c => c.header?.value ?? "").join(",")`), derive `filterCondition` as `JSON.stringify(this.datasource.filter ?? null)`, then call `this._onBeforeExport?.()` (fire-and-forget)
- [ ] 3.4 In `exportData()`, after `await req.send()` resolves but before `req = null`: read `req.loaded`, `req.limit`, `req.status` (map `"end"` → `"success"`, `"aborted"` → `"aborted"`), capture `endTime = new Date()`, then call `this._onAfterExport?.()` (fire-and-forget)
- [ ] 3.5 Ensure the same `startTime` Date object is closed over by both `_onBeforeExport` and `_onAfterExport` calls within a single `exportData()` invocation

## 4. useDataExport — Wire props to controller callbacks

- [ ] 4.1 Expand the `Props` type alias in `useDataExport.ts` to include `onBeforeExport` and `onAfterExport` from `DatagridContainerProps`
- [ ] 4.2 Add a `useEffect` that calls `entry.controller.setOnBeforeExport(...)` with a closure over `props.onBeforeExport` — the closure calls `action.execute({ gridName, columnTitles, filterCondition, chunkSize, startTime })` when `action.canExecute` is true; dependency array: `[entry, props.onBeforeExport]`
- [ ] 4.3 Add a `useEffect` that calls `entry.controller.setOnAfterExport(...)` with a closure over `props.onAfterExport` — the closure calls `action.execute({ gridName, columnTitles, filterCondition, chunkSize, exportedItemCount, status, startTime, endTime })` when `action.canExecute` is true; dependency array: `[entry, props.onAfterExport]`
- [ ] 4.4 Pass `onBeforeExport` and `onAfterExport` from `props` into `useDataExport` call in `Datagrid.tsx`

## 5. Tests

- [ ] 5.1 Add unit test: `ExportController` calls `_onBeforeExport` callback once before data is streamed
- [ ] 5.2 Add unit test: `ExportController` calls `_onAfterExport` callback once after `req.send()` resolves on success, with status `"success"`
- [ ] 5.3 Add unit test: `ExportController` calls `_onAfterExport` with status `"aborted"` when `abort()` is called
- [ ] 5.4 Add unit test: `startTime` passed to `_onBeforeExport` closure equals `startTime` passed to `_onAfterExport` closure
- [ ] 5.5 Add unit test: when neither callback is set, `exportData()` completes without errors

## 6. Verify & Cleanup

- [ ] 6.1 Run `pnpm run test` in `packages/pluggableWidgets/datagrid-web` — all tests pass
- [ ] 6.2 Run `pnpm run lint` — no new lint errors
- [ ] 6.3 Update `CHANGELOG.md` with a user-facing entry describing the two new export event actions
