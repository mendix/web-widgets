## 1. Test Setup

- [x] 1.1 Live-region specs for single with and without a value and for multi, in the Behavior spec.

## 2. Implementation

- [x] 2.1 Behavior composes the released status message; Core, ViewModel and `main.ts` drop `statusMessage` and `ComboboxA11y`.
- [x] 2.2 `src/sandbox/` deleted; `tsconfig.build.json`, `AGENTS.md` updated.
- [x] 2.3 `Deprecated` CHANGELOG entry dropped; legacy class comments reworded.
- [x] 2.4 Design doc status lines.

## 3. Verification

- [x] 3.1 `pnpm run build`, `pnpm run test`, `pnpm run lint` in the three packages: widget-kit 3 tests, combobox-kit 19 suites and 216 tests, combobox-web 51 tests and 5 snapshots unchanged; `tsc --noEmit` clean; lint 0 errors.
- [ ] 3.2 E2E on the PR through CI.
