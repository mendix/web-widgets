## 1. Baseline

- [x] 1.1 Confirm the unit suite is green before any change: `cd packages/pluggableWidgets/combobox-web && pnpm run test`. Baseline: 6 suites, 61 tests, 5 snapshots.
- [x] 1.2 Add `src/helpers/__tests__/fixtures.ts` with a complete `ComboboxContainerProps` builder and per-family presets. No `as any` on the result; cast only where the generated typings and the test builders disagree.

## 2. Characterisation tests (write, run, they must pass on current code)

- [x] 2.1 `src/helpers/__tests__/getSelector.spec.ts`
- [x] 2.2 `src/helpers/Association/__tests__/AssociationSingleSelector.spec.ts`
- [x] 2.3 `src/helpers/Association/__tests__/AssociationMultiSelector.spec.ts`
- [x] 2.4 `src/helpers/EnumBool/__tests__/EnumBoolSingleSelector.spec.ts`
- [x] 2.5 `src/helpers/Static/__tests__/StaticSingleSelector.spec.ts`
- [x] 2.6 `src/helpers/Database/__tests__/DatabaseMultiSelectionSelector.spec.ts`
- [x] 2.7 Extend `src/helpers/Database/__tests__/DatabaseSingleSelectionSelector.spec.ts`
- [x] 2.8 `src/helpers/__tests__/BaseOptionsProvider.spec.ts`
- [x] 2.9 `src/helpers/__tests__/LazyLoadProvider.spec.ts`
- [x] 2.10 `src/helpers/__tests__/datasourceFilter.spec.ts`
- [x] 2.11 `src/hooks/__tests__/useGetSelector.spec.tsx`
- [x] 2.12 Mark every pinned quirk with a `// Quirk:` comment in the test and list it in `design.md` Notes.

## 3. Verification

- [x] 3.1 Full suite green with the new files; no snapshot written or updated (`pnpm run test` without `-u`).
- [x] 3.2 `pnpm run lint` clean in the package.
- [x] 3.3 Mutation check: temporarily break one rule per family (for example invert the boxes-forcing condition in `AssociationMultiSelector`, drop the `setLimit(0)` for read-only in `LazyLoadProvider`) and confirm the matching test fails. Revert.

## Notes

- Baseline before the change: 6 suites, 61 tests, 5 snapshots. After: 16 suites, 194 tests, the same 5 snapshots, none written or updated.
- Lint: 0 errors. The 11 remaining warnings are pre-existing in `src/components/`, `src/hooks/` and `src/helpers/` and were not touched.
- Mutation check (each mutation reverted afterwards): forcing `"text"` instead of `"boxes"` in `AssociationMultiSelector` fails 1 test; dropping the read-only branch in `LazyLoadProvider.getLimit` fails 1; off-by-one in `StaticSingleSelector` index resolution fails 6; `"yes"` instead of `"true"` in `EnumBoolOptionsProvider` fails 1; inverting the selection fallback in `DatabaseMultiSelectionSelector.setValue` fails 2; sending `""` instead of `undefined` from `useGetSelector` fails 1; page size 1 instead of 100 in `BaseDatasourceOptionsProvider.loadMore` fails 1.
- Quirks found while writing the tests, beyond those in `design.md`: `AssociationSingleSelector` and `AssociationMultiSelector` still expose the reference id as `currentId` while unavailable (the subclass overwrites what the base class cleared); the database multi selector never forces the boxes style because the forcing rule runs before the props are copied; without a datasource sort order, caption sorting of chips is descending because `sortOrder` is `undefined` and only `"asc"` sorts ascending.
- `pnpm run test <path>` does not filter in this package; the positional argument is treated as a second Jest project. Use `pnpm run test --testPathPatterns <regex>`.
