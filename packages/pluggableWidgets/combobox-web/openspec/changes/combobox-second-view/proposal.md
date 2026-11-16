## Why

Migration step 7 of `docs/design/headless-combobox.md`, taken before step 6 on purpose: a second View over the ViewModel alone, run against a conformance suite, is the real test of the contract, and it is cheaper to fix the contract before the Core moves to its own package than after. Section 11 of the generic design promises a View author the test suite we use ourselves; until now that suite did not exist, the component specs query Atlas class names and could not take another View.

## Root Cause

Every View-level test was written against the Atlas markup, and the one text a View needs that only downshift produced, the live-region status message, lived inside the Behavior's callback. A View that does not use the Behavior had nothing to announce and nothing to run.

## What Changes

- `src/core/ComboboxCore.ts`: `a11y.statusMessage`, composed from the selection, the open flag and the option count through `t`; the Behavior hands it to downshift instead of composing its own.
- `src/hooks/useComboboxBehavior.ts`: the menu props carry `aria-multiselectable` in multi mode, found by the suite.
- `src/conformance/describeComboboxConformance.tsx` (new): `describeComboboxConformance(name, View)` registers sixteen role-based cases against any component that renders the ViewModel, mounted over a live Core from the props fixtures.
- `src/components/__tests__/ComboboxView.conformance.spec.tsx` (new): the Atlas View runs the suite.
- `src/sandbox/BareView.tsx` (new, with a README): the throwaway second View, plain markup with its own keyboard handling and ARIA, no Behavior, no Popover, no classes; `src/sandbox/__tests__/BareView.spec.tsx` runs the suite against it.

## Impact

- **Code**: one computed on the Core, one attribute in the Behavior, the suite, the sandbox folder. The sandbox is not imported by the widget and is not in the MPK.
- **Behaviour**: the multi-select listbox gains `aria-multiselectable="true"`; the three multi-select snapshots gain that line. The status message has three a11y-only differences from the former callback, listed in `design.md`.
- **Release**: no CHANGELOG entry; the attribute and the announcement wording are not something an app developer configures or styles.
- **Dependencies**: none. The design doc proposed a Material UI View; a hand-rolled one exercises the same ViewModel surface without a dependency, see the decisions.
