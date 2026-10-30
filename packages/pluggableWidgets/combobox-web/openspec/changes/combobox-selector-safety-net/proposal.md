## Why

The selectors, options providers and captions providers under `src/helpers/` are the model of the combobox: they turn Mendix values into options, captions, a current value and status, and write selections back. Any refactoring of that layer (a different state container, a split of the families, a fix to one of the quirks below) has no net under it. Unit coverage today is 29 component cases on `SingleSelection`, `MultiSelection` and `StaticSelection`, plus 20 helper cases that only cover the database selector and its utils. The association, static, enumeration and boolean selectors have no direct tests. Neither do lazy loading, the filter-input debounce, the limit management in `LazyLoadProvider`, the client-side filter modes, or the re-render side channel in `useGetSelector`.

## Root Cause

The `Selector` interface in `src/helpers/types.ts` was always the seam between model and UI, but it was only ever exercised indirectly through the React components. Behaviour that lives purely in the selectors (status transitions, limit arithmetic, caption resolution for items outside the datasource, debounce of the datasource filter, the "forced to boxes" rule for multi-select) is therefore unprotected. A refactoring that changes any of it would only be caught, if at all, by an E2E run or by hand in Studio Pro.

## What Changes

This change adds tests only. No production code changes.

- `src/helpers/__tests__/fixtures.ts`: one shared builder for `ComboboxContainerProps` with per-family presets (association single and multi, enumeration, boolean, static, database single and multi), so every selector test starts from a complete, valid prop set.
- Characterisation tests at the `Selector` seam, one spec per family:
    - `src/helpers/__tests__/getSelector.spec.ts`
    - `src/helpers/Association/__tests__/AssociationSingleSelector.spec.ts`
    - `src/helpers/Association/__tests__/AssociationMultiSelector.spec.ts`
    - `src/helpers/EnumBool/__tests__/EnumBoolSingleSelector.spec.ts`
    - `src/helpers/Static/__tests__/StaticSingleSelector.spec.ts`
    - `src/helpers/Database/__tests__/DatabaseMultiSelectionSelector.spec.ts`
    - extra cases in `src/helpers/Database/__tests__/DatabaseSingleSelectionSelector.spec.ts`
- Characterisation tests for the pieces that sit under the selectors:
    - `src/helpers/__tests__/BaseOptionsProvider.spec.ts` (filter modes and search-term trigger)
    - `src/helpers/__tests__/LazyLoadProvider.spec.ts` (limit arithmetic)
    - `src/helpers/__tests__/datasourceFilter.spec.ts`
    - `src/hooks/__tests__/useGetSelector.spec.tsx` (instance stability, re-render side channel, filter-input debounce)

## Impact

- **Code**: new test files and one fixture module only. `src/helpers/`, `src/hooks/`, `src/components/` and the E2E suite are untouched.
- **Behaviour**: none. Every test must pass on the current code without modification. Where a test pins down a quirk (for example `StaticSingleSelector` keeps a stale `currentId` when the attribute is cleared externally), the quirk is marked in the test and listed in `design.md` under Notes, so a refactoring preserves it and a later change can fix it deliberately.
- **Release**: no CHANGELOG entry. Nothing user-facing changes.
- **Dependencies**: none added.
