## Test Cases

### Regression Tests

- Released live-region text (unit) - `combobox-kit/src/hooks/__tests__/useComboboxBehavior.spec.tsx`
    - **Given**: the Atlas View over a live Core
    - **When**: a single-select with a value, a single-select without one, and a multi-select with two values are opened
    - **Then**: the status region reads "Selected value: Formatted green. Options available: 3. Use arrows", "No options selected.Options available: 3. Use arrows" (the released concatenation, without a space) and "Selected value: Apple,Banana. Options available: 4. Use arrows"
- Conformance (unit) - `combobox-kit/src/atlas/__tests__/ComboboxView.conformance.spec.tsx`
    - **Then**: the sixteen cases still pass for the Atlas View, the live-region case included

- Database single first load (unit) - `combobox-kit/src/helpers/Database/__tests__/DatabaseSingleSelectionSelector.spec.ts`
    - **Given**: a database single-select over a loading datasource
    - **When**: the first load runs, ends, and a later reload runs
    - **Then**: `status` is `"unavailable"` during the first load, `"available"` after it with the bound option as `currentId`, and `"loading"` during the later reload

The three `a11y.statusMessage` cases in `ComboboxCore.spec.tsx` are removed with the computed.

## Decisions

- **Parity over the contract.** A View without the Behavior is not shipped, so nothing reads `a11y.statusMessage`. It returns with that View, and the released wording becomes its first test.
- **Keep the data attributes.** They are additive, the widget's SCSS depends on them, and the modifier classes are still emitted, so app CSS sees a superset of the released markup. Only the announcement of a removal goes.
- **A flag, not a derivation, for the first load.** Whether the datasource has loaded before is history, which a computed over the current props cannot see; one observable set by a `when` is the smallest state that restores the released placeholder. It never resets, as the released status never went back to `"unavailable"` on a reload. The multi-select needs nothing: the released one was `"available"` while loading, and the View renders `"loading"` the same way.
- **Keep the conformance suite.** It tests the shipped View through roles and found the `aria-multiselectable` gap; it does not depend on the sandbox.
