## 1. Test Setup

- [x] 1.1 Widget-level loading, keyboard and event specs (#2573), merged first; green on `main`.
- [x] 1.2 `mobx` 6.12.3; `jest.setup.ts` with `enforceActions: "always"` and `[MobX]` warnings thrown as errors.

## 2. Implementation

- [x] 2.1 Observable selectors and providers.
- [x] 2.2 Shared MobX at runtime through `withSharedLibs`.
- [x] 2.3 `src/core/`: config, props gate, tokens, container, setup host, filter-input service, `ComboboxCore`; `useComboboxCore`; views and editor preview render from the view model.
- [x] 2.4 Open flag, highlight, input text, enter and leave in the Core.
- [x] 2.5 `useComboboxBehavior` (controlled downshift) and `useComboboxPopover`.
- [x] 2.6 Selectors derived from the gate; side effects as setup reactions; placeholder until the first database load.
- [x] 2.7 Lazy-loading state owned by `DatasourceOptionsProvider`.
- [x] 2.8 Reactions that write to Mendix values run after the render commits.
- [x] 2.9 CHANGELOG lines for the two fixes.

## 3. Refactoring

- [x] 3.1 Remove `getSelector`, `useGetSelector`, the two downshift hooks, `useActionEvents`, `useLazyLoading`, `LazyLoadProvider`, the per-family providers and the deprecated selector callbacks.
- [x] 3.2 Remove `SelectionBaseProps` and `A11yStatusMessage` from `src/helpers/types.ts`.

## 4. Verification

- [x] 4.1 Every commit: `tsc --noEmit` clean and `pnpm run test` green. At the tip: 21 suites, 257 tests, 5 snapshots unchanged, no `-u`.
- [x] 4.2 `pnpm run lint`: 0 errors.
- [x] 4.3 `pnpm run release`: the MPK holds `com/mendix/shared/mobx/6.12.3/` and `Combobox.js` imports MobX from it.
- [x] 4.4 E2E locally against the Mendix 11.15 test project: no new failures compared with `main`.
- [ ] 4.5 E2E through CI on the PR with zero visual snapshot changes.
- [ ] 4.6 Manual check of the Studio Pro design-mode preview for the association, database, static and enumeration sources.
