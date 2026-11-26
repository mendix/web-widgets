## 1. Test Setup

- [x] 1.1 Baseline on the selector-gate tip: 18 suites, 218 tests, 5 snapshots, green; `tsc --noEmit` clean; local E2E green.
- [x] 1.2 `OptionContent` spec written against the placement matrix before the providers lost `render`.

## 2. Implementation

- [x] 2.1 `src/components/classes.ts`: `ComboboxClassKey`, `ComboboxClasses`, `comboboxClasses(prefix)`, with today's names as values.
- [x] 2.2 ViewModel and providers: `content?` holds custom content only, `selectedCaption: string`; `CaptionsProvider.customContent(id)` replaces `render`; preview providers return the dropzone as content.
- [x] 2.3 `Caption` and `OptionContent` components; the views render captions and custom content per `hints.customContent`.
- [x] 2.4 Behavior getters carry `data-open`, `data-readonly`, `data-lazy`, `data-highlighted`, `data-selected`, `data-active`; `aria-selected` always present.
- [x] 2.5 Views, wrappers, loaders and icons read `classes` and set the View-side data attributes; the only literal `widget-combobox` strings left outside the map are the two of the unavailable placeholder, which the wrapper renders.
- [x] 2.6 `src/ui/Combobox.scss` translated per the table in design.md; no rule added or removed except the shared clear and chip remove rule and the dropped dead `-remove-button` rule.
- [x] 2.7 Snapshots updated with `pnpm run test -u`, once; the diff is `widget-combobox-menu-hidden`, `widget-combobox-multiselect` and `widget-combobox-text` turned into `data-open`, `data-has-selection` and `data-style="text"`. The snapshots render closed menus, so the option attributes are covered by the Behavior spec instead.
- [x] 2.8 E2E: five `data-empty` assertions, the clear button locator in `Combobox.spec.js`, page object comment.
- [x] 2.9 CHANGELOG: Breaking changes entry for the modifier classes.

## 3. Refactoring

- [ ] 3.1 Step 5: split the Atlas View into parts and add the `classes` and `parts` props.

## 4. Verification

- [x] 4.1 `pnpm run test`: 19 suites, 228 tests, 5 snapshots updated once.
- [x] 4.2 `pnpm run lint`: 0 errors; 7 warnings, all pre-existing (the `children` prop warning moved from `helpers/utils.ts` to `components/Caption.tsx` with the component).
- [x] 4.3 `pnpm exec tsc --noEmit -p tsconfig.json`: clean.
- [x] 4.4 `pnpm run build`: MPK, editor preview and editor config build; MPK copied into the test project.
- [x] 4.5 E2E locally against the test project after an app restart in Studio Pro; visual snapshots identical. Green on 2026-11-02.
- [ ] 4.6 E2E on the PR through CI; waits for the safety-net PR to merge and a rebase on `main`.

## Notes

- One code commit (map, attributes, captions, SCSS, specs, E2E, CHANGELOG) plus this change as a docs commit.
- Test count: 218 on the selector-gate tip, plus 8 `OptionContent` cases, 1 menu wrapper case and 1 Behavior case, minus 3 association `render` cases replaced by 3 `customContent` cases, equals 228.
