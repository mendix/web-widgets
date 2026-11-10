## Test Cases

The characterisation specs from `combobox-selector-safety-net` stay the net, adapted at their construction only: `createSelector(props)` resolves the selector from the container and runs the setup host, `setProps(next)` stands for the next render. Every behavioural expectation that is not listed under Behaviour changes below holds unchanged.

### Regression Tests

- Views render the same DOM (unit) - `src/__tests__/*.spec.tsx`
    - **Given**: the views over the derived selectors
    - **When**: the 29 component cases run
    - **Then**: all pass, the 5 snapshots are unchanged
- Selector seam (unit) - `src/helpers/**/__tests__/*.spec.ts*`
    - **Given**: every family through the harness, `enforceActions: "always"`
    - **When**: status, value, captions, filtering, limit, lazy loading, writes
    - **Then**: the pinned expectations hold, no `[MobX]` warning

### New cases

- Association: no items requested while a datasource without lazy loading is loading; the page limit kept and nothing requested from an unpaged datasource while a lazy one is loading; client-side filtering with an expression caption even when lazy loading is on.
- Database single: the datasource selection is the value when no attribute is bound; an unchanged attribute value leaves the selection alone across a props push; loading status while the datasource loads.
- Container: a props push reaches the selector through the gate; the selector's side effects start with the setup host and not before.
- `useComboboxCore`: a props push during render is reflected in the ViewModel of that render.

### E2E

- `pnpm run e2e` locally against the test project after an app restart, then on the PR through CI. Snapshots must be identical; this change changes no DOM. The local run on 2026-11-02 was green.

## Decisions

- **Derive, do not copy.** A selector is a set of computeds over `gate.props` and the frozen config, the pattern of `rows.model.ts` and `items.model.ts` in the data grid and gallery. The only state left is the search term and the "page requested" marker of lazy loading.
- **Mendix values behind plain getters.** A computed that returns a Mendix value object would compare it by identity and hide a change made in place, which the test builders do and which the design doc's rule 5 warns about. `attr`, `ds`, `selection` and the like are plain getters, so every computed that uses them reads `gate.props` itself.
- **Side effects as setup reactions.** The datasource limit is an autorun over the wanted limit; the filter is a reaction on the search term; the database single selector syncs the datasource selection in a reaction keyed on the attribute value and the page ids (structural comparison, so a props push without a change fires nothing). They run on mount for the first props and synchronously inside each props push afterwards. Before, the same writes ran during the first render too.
- **Family-neutral providers through `MappedGate`.** The association and database selectors map their props into `DatasourceSource` and `CaptionSource`, so one options provider and one captions provider serve both families. The mapped props object is new on every gate change, which is what the providers want.
- **The loaded page is latched.** A datasource mid-reload may report no items; the provider keeps the previous page until the next one arrives, which is what the database selector's "skip while loading" guard protected, without freezing the rest of the selector.
- **The static config grows by what the selectors read once.** `clearable`, the caption type, the editability rule and the chip sorting are simple-type properties, so they are read once like the rest.
- **The specs go through the container.** A harness that resolves the selector from `createComboboxContainer` tests the wiring as well as the class: a selector that forgets to register with the setup host, or a token that is bound wrong, fails here first.
- **Preview selectors are plain objects.** They take the preview props once and never change, so they need neither MobX nor a gate.

## Behaviour changes

Deliberate, each one a candidate the safety-net change had rated. Flipped expectations are marked in the specs.

1. **Static: an external clear clears the selection.** The old selector kept a stale `currentId` when the attribute was emptied by a microflow (safety-net quirk 1, rated medium). A derivation cannot keep stale state; the CHANGELOG records the fix.
2. **Database single: `status` is `"loading"` while the datasource loads.** It was `"unavailable"` on the first load and frozen at the previous value on later reloads. The views treat `"loading"` like `"available"`, so the widget renders with the previous page instead of a placeholder on the first load. Reverted for the first load in `combobox-parity-release`: the placeholder shows until the first page arrives.
3. **Database single without a bound attribute takes the datasource selection as its value.** Before, the value only existed after `setValue` in the same page visit, so a reload showed nothing selected. The CHANGELOG records the fix (`combobox-parity-release`).
4. **Enumeration: `clearable` while unavailable is the configured value**, not `true` (a pinned quirk with no effect, since nothing renders in that status). Likewise `readOnly` and `validation` read the attribute in every status.
5. **The lazy-loading limit never-shrink rule is gone.** `LazyLoadProvider` remembered a limit that was overwritten with the current one on every update, so the rule never applied.

Not changed on purpose: chip sorting without a datasource sort order is still descending (quirk 2); the forced boxes style was already resolved in the config by step 2 (quirk 3); a missing `emptyOptionText` still makes a selector unavailable; a read-only control still limits its datasource to zero items.

## Notes

- The Core bound its commands before `makeObservable`, so the first `ComboboxCore` instance in a process carried the unwrapped prototype methods and `highlight` from a downshift effect tripped strict mode. The full suite passed by ordering; `pnpm run test -t "sets option to selected item"` failed on the step 3 tip. Binding after `makeObservable` fixes it; with it, the component specs pass in any order.
- brandi rejects a class whose instance has a protected member named `valueOf`, since `Object.valueOf` is public; the database helper is `optionValue`.
- Test count: 227 on the step 3 tip, minus the 9 `LazyLoadProvider` cases and 6 cases on fields that moved to the config, plus 6 new cases, equals 218.
