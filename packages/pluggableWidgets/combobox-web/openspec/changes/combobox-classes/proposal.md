## Why

Migration step 4 of `docs/design/headless-combobox.md`: the Atlas View stops carrying literal class names and modifier classes, and the Core stops deciding caption markup. After step 3 the views render from the ViewModel through the Behavior, but three things still tie the markup to the Core and to one set of class names:

- every element names its own `widget-combobox-*` class inline, and state is expressed as a second class next to it (`widget-combobox-item-highlighted`, `widget-combobox-menu-hidden`), so neither a `classes` override (step 5) nor a custom View with our Behavior has anything to hook into;
- `ComboboxOptionVM.content` is built by the captions providers, which decide between the plain caption element and the custom-content wrapper per placement, so the Core renders React for the View and the editor preview keeps design-mode overrides in the providers;
- the Behavior getters return downshift's attributes only, so a View that does not use our SCSS cannot style the highlighted or selected option without reading the ViewModel for each element.

## Root Cause

The markup grew around one View. Class names and their modifiers were the only styling hook, and the placement rule for custom content (`CaptionsProvider.render(id, placement, htmlFor)`) was pushed into the data layer because the old components received rendered nodes, not captions.

## What Changes

- `src/components/classes.ts` (new): `ComboboxClassKey`, `ComboboxClasses` and `comboboxClasses(prefix = "widget-combobox")`. The values are today's class names, so app CSS that targets an element keeps working. The key set covers every element the Atlas View renders (section 6 of the design doc, updated).
- Modifier classes become data attributes, per the table in the design doc, section 6: `data-open`, `data-disabled`, `data-has-selection`, `data-style`, `data-custom`, `data-readonly`, `data-empty`, `data-highlighted`, `data-selected`, `data-lazy`, `data-active`, `data-size`, `data-margins`. `src/ui/Combobox.scss` targets the attributes; the rules are otherwise unchanged. The modifier classes are still emitted next to the attributes, from one map in `src/components/legacyModifiers.ts`, deprecated and to be removed with the next major version.
- `src/hooks/useComboboxBehavior.ts`: the getters carry the state attributes of their element: `getToggleProps` `data-open`; `getInputProps` `data-readonly`; `getMenuProps` `data-lazy` and `data-highlighted`; `getOptionProps` `data-selected` and `data-highlighted`; `getChipProps` `data-active`. The multi-mode `aria-selected` quirk (no attribute while the value is `null`) is dropped: options always carry `aria-selected`.
- `src/core/ComboboxViewModel.ts`: `ComboboxOptionVM.content` is optional and holds the configured custom content only, whenever a custom-content widget is configured and regardless of placement; `selectedContent: ReactNode` becomes `selectedCaption: string`. Placement is the View's decision through `hints.customContent`.
- `src/helpers/types.ts`: `CaptionsProvider.render` and `CaptionPlacement` are gone; `customContent(id): ReactNode | undefined` replaces them. The providers no longer import React components.
- `src/components/Caption.tsx` (new, the former `CaptionContent`) and `src/components/OptionContent.tsx` (new): the View renders the plain caption or the custom-content wrapper, in the menu, the input area and the chips.
- `src/components/*`: the views, wrappers, loaders and icons read `classes` and set data attributes; `ComboboxMenuWrapper` and `ComboboxOptionWrapper` lose the props that only drove a modifier class; the chip remove control gets its own class (`chipRemove`) instead of sharing `clear`'s.
- Editor preview: the preview captions providers return the dropzone as `customContent`; the datasource preview returns it for the selected id only, so design mode keeps one dropzone in the input area.
- Specs: the three DOM snapshots are updated on purpose and the diff reviewed; the caption placement cases move from the association spec to an `OptionContent` spec; Behavior cases for the data attributes; E2E assertions on `widget-combobox-placeholder-empty` move to `data-empty`, and the one locator that counted on the chip remove sharing the clear button's class is tightened.
- `CHANGELOG.md`: a Deprecated entry for the modifier classes, naming the data attributes that replace them.

Not in this change: `a11y.statusMessage` on the envelope (waits for a View without our Behavior, step 7); the `classes` and `parts` props on the View (step 5).

## Impact

- **Behaviour**: none intended for the user. The DOM grows and does not shrink: every state is also a data attribute, the chip remove control carries its own class next to the shared one, and options always carry `aria-selected`. The one element that changes is the caption in a row-click multi-select menu, a `span` instead of a `label` without a checkbox to point at. The visual E2E snapshots must stay identical.
- **Apps**: custom CSS that targets a modifier class (`.widget-combobox-item-highlighted`, `.widget-combobox-menu-hidden`, `.widget-combobox-input-container-active`, ...) keeps matching for one release and should move to the data attribute; the CHANGELOG deprecates the modifiers. CSS that targets an element class keeps working.
- **Release**: CHANGELOG entry under Deprecated.
- **Dependencies**: none added.
