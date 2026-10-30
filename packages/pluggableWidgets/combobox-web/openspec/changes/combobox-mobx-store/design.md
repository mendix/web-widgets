## Test Cases

This is a refactor. The existing characterisation tests from `combobox-selector-safety-net` are the net; they pass unchanged. The strict-mode Jest setup is the new guard, and the snapshot hook gets its own spec.

### Regression Tests

- Selector seam unchanged (unit) - every spec under `src/helpers/**/__tests__/` and `src/hooks/__tests__/useGetSelector.spec.tsx`
    - **Given**: the converted store
    - **When**: the suite runs with `enforceActions: "always"`
    - **Then**: 194 tests pass, no `[MobX]` warning is raised, the 5 snapshots are unchanged
- Search-term re-render (unit) - `useGetSelector.spec.tsx` "re-renders the host when the search term changes"
    - **Given**: a rendered `useGetSelector`
    - **When**: `options.setSearchTerm("gree")`
    - **Then**: exactly one extra render, `options.getAll()` returns `["green"]`
- Mutation outside an action fails (unit) - `BaseOptionsProvider.spec.ts` before the test subclass was fixed
    - **Given**: `TestOptionsProvider` assigning `filterType` and `options` directly in its constructor
    - **When**: the suite runs
    - **Then**: 12 failures with "changing (observed) observable values without using an action is not allowed", which proves the guard works

### Snapshot hook (`useObservableSnapshot.spec.tsx`)

- Returns the current value and re-renders once per change
    - **Given**: a store with an observable `term`, a hook reading it
    - **When**: `term` changes inside an action
    - **Then**: the hook returns the new value and the host rendered exactly once more
- Ignores observables the read function does not touch
    - **Given**: the same store
    - **When**: another observable changes
    - **Then**: no re-render
- Stops listening after unmount
    - **Given**: the hook unmounted
    - **When**: `term` changes
    - **Then**: no re-render

### E2E

- `pnpm run e2e` on the PR (CI runs it for changed packages). Visual snapshots must be identical; step 1 changes no DOM.

## Annotation rules applied

- `observable` for primitives and enums the UI reads (`status`, `currentId` of single selectors, `readOnly`, `clearable`, `validation`, style and method flags, `searchTerm`, `filterType`, `emptyCaption`).
- `observable.ref` for arrays (`options`, multi `currentId`) and for every Mendix value: `_attr`, `ds`, `selection`, `formatter`, `customContent`, `attribute`, `emptyValue`, `attributeId`. A Mendix value is never made deep observable.
- `computed` for getters without side effects: `status`, `hasMore`, `isLoading`, `sortOrder`, `datasourceFilter`. `getAll()` stays a method because the lazy-loading branch schedules a datasource filter.
- `action` for every mutating method, including `LazyLoadProvider.getLimit`, which updates its remembered limit.
- `override` on every subclass method or getter that replaces an annotated base member.
- Plain fields, on purpose: the `Map`s shared between a selector and its providers (replaced wholesale in `_updateProps`), `caption`, `options`, `values` (child stores), and `onEnterEvent`, `onLeaveEvent`, `onFilterInputChange`, which the downshift hooks and `useGetSelector` assign during render.

## Notes

- `enforceActions: "always"` only warns in MobX 6. `jest.setup.ts` throws on any `console.warn` that starts with `[MobX]`; that is what makes the guard effective.
- `pnpm run test <path>` does not filter in this package; use `pnpm run test --testPathPatterns <regex>`.
- The step subscribes to the search term only. Every other store change is either a props update, which already re-renders the widget, or a Mendix value write, which re-renders through the client. Subscribing to more would be step 2's ViewModel in disguise.
- `updateProps` still runs during render, as before. The reaction in the snapshot hook only observes the search term, which `updateProps` never writes, so no store update is reported to React while it renders.
- The pinned quirks from `combobox-selector-safety-net` are preserved; none was fixed here.
- Found on the way: two safety-net specs did not pass `tsc --noEmit` (string literals where `ValueStatus` is expected, an `ActionValue` cast). Jest runs through swc without type checking, so CI did not catch it. Fixed on the safety-net branch on 2026-10-30; `pnpm exec tsc --noEmit -p tsconfig.json` is clean on this branch.
