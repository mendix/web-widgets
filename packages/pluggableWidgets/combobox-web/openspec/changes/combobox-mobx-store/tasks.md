## 1. Test Setup

- [x] 1.1 Add `mobx` and `@mendix/widget-plugin-mobx-kit` to `package.json` (approved by Roman on 2026-10-29), `pnpm i`.
- [x] 1.2 Add `jest.config.js` and `jest.setup.ts` with `enforceActions: "always"` and the `[MobX]` warning turned into an error; switch the `test` script to `jest --projects jest.config.js`.
- [x] 1.3 Baseline under the new config: 16 suites, 194 tests, 5 snapshots, green.

## 2. Implementation

- [x] 2.1 Convert the base providers: `BaseOptionsProvider`, `BaseDatasourceOptionsProvider`, `LazyLoadProvider`.
- [x] 2.2 Convert the captions and values providers of every family.
- [x] 2.3 Convert the selectors: association single and multi, enumeration and boolean, static, database single and multi, plus `AssociationOptionsProvider`, `EnumBoolOptionsProvider`, `StaticOptionsProvider`.
- [x] 2.4 Fix the one test fixture that mutated observables outside an action (`BaseOptionsProvider.spec.ts`); no expectation changed.
- [x] 2.5 Commit the store conversion with the `setState({})` trigger still in place; suite green.
- [x] 2.6 Add `useObservableSnapshot` with its spec; replace the trigger in `useGetSelector`; commit separately.

## 3. Refactoring

- [x] 3.1 Remove the shadowing field redeclarations in `StaticOptionsProvider`.
- [ ] 3.2 Step 2: remove `onAfterSearchTermChange` from the `OptionsProvider` interface, its base implementation and its two tests, and introduce the props gate.

## 4. Verification

- [x] 4.1 `pnpm run test`: 17 suites, 197 tests, 5 snapshots unchanged, no `-u`.
- [x] 4.2 `pnpm run lint`: 0 errors; the remaining warnings are pre-existing and in untouched files.
- [x] 4.3 `pnpm run build`: MPK builds.
- [ ] 4.4 E2E on the PR through CI with zero visual snapshot changes; local run against Studio Pro after a rebuild of the widget.

## Notes

- Three commits as rule 3 of the design doc asks: dependencies and strict mode, store conversion, snapshot hook.
- Lint warning count moved from 11 to 12 in untouched files between the two branches; none is in a converted file.
