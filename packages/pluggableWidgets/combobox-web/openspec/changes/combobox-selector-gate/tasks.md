## 1. Test Setup

- [x] 1.1 Baseline on the step 3 tip: 19 suites, 227 tests, 5 snapshots, green; E2E green locally after the app restart.
- [x] 1.2 `src/helpers/__tests__/harness.ts`: the selector resolved from the container with the setup host running.

## 2. Implementation

- [x] 2.1 Gate carries every Mendix value; config carries `clearable`, `captionType`, `customEditability`, `selectedItemsSorting`.
- [x] 2.2 `Selector` seam slimmed; `DatasourceOptionsProvider`, `DatasourceCaptionsProvider`, `BaseOptionsProvider` with abstract `ids`.
- [x] 2.3 Association, database, enumeration and static selectors derived from the gate; side effects in `setup`.
- [x] 2.4 Preview selectors as plain objects under `src/helpers/Preview/`.
- [x] 2.5 Container: `setProps` is the gate alone; selector classes registered with tokens; Core commands bound after `makeObservable`.
- [x] 2.6 Specs adapted at construction; new limit, selection and container cases.

## 3. Verification

- [x] 3.1 `pnpm run test`: 18 suites, 218 tests, 5 snapshots unchanged, no `-u`; `pnpm run test -t "sets option to selected item"` passes in isolation.
- [x] 3.2 `pnpm run lint`: 0 errors; 7 warnings, all pre-existing.
- [x] 3.3 `pnpm exec tsc --noEmit -p tsconfig.json`: clean.
- [x] 3.4 `pnpm run build`: MPK, editor preview and editor config build.
- [ ] 3.5 E2E locally against the test project after an app restart in Studio Pro.
- [ ] 3.6 E2E on the PR through CI with zero visual snapshot changes; waits for the safety-net PR to merge and a rebase on `main`.

## Notes

- One code commit plus this change, on the same branch as steps 1 to 3.
