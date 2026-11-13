## Test Cases

Nothing may change in behaviour, so every suite moves with its code and passes without edits beyond import paths, and the widget's suite runs against the built package.

### Regression Tests

- Widget renders the same DOM (unit) - `combobox-web/src/__tests__/SingleSelection.spec.tsx`, `MultiSelection.spec.tsx`, `StaticSelection.spec.tsx`
    - **Given**: the widget over `@mendix/combobox-kit/dist`, the floating hook mocked through the package path
    - **When**: the 51 cases run
    - **Then**: all pass, the five snapshots are identical
- Core, selectors, Behavior, parts, conformance (unit) - `combobox-kit/src/**/__tests__`, `src/sandbox/__tests__`
    - **Given**: the moved specs with their imports rewritten
    - **Then**: 19 suites, 226 cases pass; the Behavior spec hosts `ComboboxView` over `useComboboxCore` and asserts the same things it did over the widget
- Snapshot hook (unit) - `widget-kit/src/__tests__/useObservableSnapshot.spec.tsx`
    - **Then**: the 3 cases pass as before
- Typings copy (unit, new) - `combobox-kit/src/typings/__tests__/ComboboxProps.spec.ts`
    - **Given**: the copy in the package and the file the widget generates from `Combobox.xml`
    - **Then**: byte-for-byte equal

### E2E

- `pnpm run e2e` locally against the test project after an app restart, then on the PR through CI. This change changes no DOM; the visual snapshots must be identical.

## Decisions

- **Two packages, not one.** The envelope, the input facet, the focus helper and the snapshot hook are what a second widget needs and nothing a combobox view author needs; they go to `@mendix/widget-kit`. Everything that knows a combobox goes to `@mendix/combobox-kit`. The names follow the repository's kits (`widget-plugin-component-kit`, `widget-plugin-mobx-kit`); `widget-kit` is the one the others extend.
- **Built like the shared plugin packages.** `tsc` into `dist`, `"./*"` exports, `typesVersions` for the `node` resolution the widgets use. The root entry needs its own `typesVersions` key because TypeScript pushes the `types` path through the wildcard as well. The compiler options are written out instead of extending the shared preset: the preset pins `jsxFactory`, which the automatic runtime rejects, and `isolatedModules`, which rejects the `mendix` const enums the preview container reads. Class fields keep assignment semantics (`useDefineForClassFields: false`), as the widget build had them.
- **The generated typings are copied, and the copy is guarded.** The core takes `ComboboxContainerProps`, which the widget build generates from the XML, and the package cannot depend on the widget (a cycle). A `.ts` copy in the package emits its declarations; a spec compares it with the generated file so the two cannot drift silently. The narrower config type of the generic design removes the copy later.
- **The stylesheet stays in the widget.** The MPK is what ships CSS and the client merges it into one `widgets.css`; a `tsc` build does not carry `.scss`, and a view in the app project styles against classes the MPK already loaded. The class map in the package and the stylesheet in the widget are coupled by name, which the E2E visual snapshots pin.
- **The sandbox is tested but not built.** `BareView` proves the contract and must not reach `dist` or the MPK.
- **The widget specs stay in the widget.** They render the widget's default export with the unavailable placeholder and the trial registry around the view; they are the host's tests. They mock the package's floating hook with a factory that requires the package's `__mocks__` file, which the build emits for that reason.

## Notes

- Lint in the package reports the seven warnings the widget reported before, all in moved files; the widget keeps two of them.
- The pre-existing `collectCoverage` validation warning of the tools' Jest base config appears in the packages too.
