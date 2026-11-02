## Test Cases

This is the one migration step that changes the DOM on purpose, so the snapshots are updated with `pnpm run test -u` once, and the snapshot diff against the step 3 tip is checked to be additive. Everything else stays green without edits, except the assertions that named a modifier class.

### Regression Tests

- Views render the same elements (unit) - `src/__tests__/SingleSelection.spec.tsx`, `MultiSelection.spec.tsx`, `StaticSelection.spec.tsx`
    - **Given**: the views over the classes map and the data attributes
    - **When**: the component cases run
    - **Then**: all pass; the snapshot diff is `data-has-selection` and `data-style` added next to the classes that were there, and nothing else (the snapshots render closed menus, so the chip remove class and the row-click caption `span` are covered by the component cases instead)
- Caption placement (unit) - `src/components/__tests__/OptionContent.spec.tsx` (new, replaces the three `caption.render` cases of the association spec)
    - **Given**: an option with custom content and each `hints.customContent` value
    - **When**: rendered for the menu and for the input area
    - **Then**: `none` renders the caption everywhere; `menuOnly` renders the custom content in the menu and the caption in the input area; `everywhere` renders the custom content in both; an option without content renders the caption; the checkbox id lands on the caption `label`
- Selectors expose custom content (unit) - the association and static selector specs
    - **Given**: a custom-content widget configured
    - **When**: `caption.customContent(id)` is read
    - **Then**: the configured node for `yes` and `listItem`, `undefined` for `no`
- Data attributes (unit) - `src/hooks/__tests__/useComboboxBehavior.spec.tsx`
    - **Given**: a rendered combobox
    - **When**: the menu opens, an option is highlighted and one is selected
    - **Then**: the input container and the toggle carry `data-open`, the list carries `data-highlighted`, the options carry `data-highlighted` and `data-selected`, and a closed menu has no `data-open`
- Menu visibility (unit) - `src/components/__tests__/ComboboxMenuWrapper.spec.tsx`
    - **Given**: the menu wrapper closed and open
    - **Then**: `data-open` present only when open

### E2E

- `pnpm run e2e` locally against the test project after an app restart in Studio Pro, then on the PR through CI. The visual snapshots must be identical: the SCSS is a one-to-one translation. The five assertions on `widget-combobox-placeholder-empty` become `data-empty` checks; the locator that clicked the fourth `.widget-combobox-clear-button` of a multi-select becomes the page object's clear button.

## Decisions

- **The map keeps today's class names.** `comboboxClasses()` returns `widget-combobox-item` for `menuItem`, `widget-combobox-selected-item` for `chip`, `widget-combobox-down-arrow` for `toggle`, and so on. App CSS written against an element keeps matching. The keys follow the design doc; the values follow the released DOM.
- **Modifiers become data attributes, and the modifiers stay for one release.** `widget-combobox-item-highlighted` becomes `data-highlighted` on the item; `widget-combobox-menu-hidden` becomes the absence of `data-open`; `widget-combobox-boxes` and `widget-combobox-text` become `data-style="boxes" | "text"`. A custom View that uses our Behavior gets the state attributes from the getters without our class names. The modifier classes are still emitted next to the attributes, from one `legacy` map in `src/components/legacyModifiers.ts`, so the DOM diff of this step is additive and app CSS on a modifier keeps matching; the SCSS targets the attributes only, so removing the map later touches the views and nothing else. The CHANGELOG deprecates the modifiers. The first cut dropped them outright as a breaking change and was reverted on 2026-11-02: the migration must not break apps before the Views are even replaceable.
- **The key set grew from the design doc's sketch to the real DOM.** Twenty-five keys instead of seventeen: the input-area wrapper (`selectedItems`), the caption and custom-content elements, the icon container and the two icon classes, and the four loader classes. `loader` and `validation` from the sketch are not keys: the loaders have their own parts and `ValidationAlert` is a component-kit component with Atlas classes. The unavailable placeholder is rendered by the wrapper, not the View, and keeps its own two classes.
- **Getters carry the state of their element; the View sets the rest.** `data-open` on the toggle, `data-readonly` on the input, `data-lazy` and `data-highlighted` on the list, `data-selected` and `data-highlighted` on the option, `data-active` on the chip come from the Behavior, because they are the state downshift and the Behavior own. `data-open`, `data-disabled` and `data-has-selection` on the input container, `data-style` and `data-custom` on the input area, `data-empty` on the placeholder and `data-size` on the loaders come from the View, because they derive from the ViewModel or from hints. `data-open` and `data-disabled` on the input, listed in the design doc's sketch, are not emitted: `aria-expanded` and the native `disabled` attribute already carry them.
- **`data-readonly` has one rule for both modes.** The single view set `-nofilter` for `!filterable || readOnly`, the multi view for `!filterable` only. The getter uses the first rule everywhere. A read-only multi-select input is `disabled`, cannot take focus and therefore already collapsed through `:placeholder-shown:not(:focus)`; the only observable difference is a disabled multi-select input that still holds typed text, which is now collapsed as well.
- **Custom content lives in the option, placement in the View.** `content` is present whenever a custom-content widget is configured, in every placement, as section 3 of the design doc always said. `OptionContent` renders the custom-content wrapper when `hints.customContent` allows it for the placement and the caption otherwise. The providers lose `render`, `CaptionPlacement` and their React imports.
- **`selectedContent` becomes `selectedCaption`.** It stays a Core value because the database selector's empty caption is the bound attribute's display value, which the View cannot derive from `selected` and `t("emptyOption")`. The single view shows the selected option's custom content instead of it when `hints.customContent` is `everywhere`.
- **The caption `label` is for a checkbox only.** The Core passed an `htmlFor` for every multi-mode option; the View passes it when the selection method renders a checkbox. A row-click option renders a `span`. Same styles, same text, no dangling `for`.
- **The chip remove control has its own class.** It shared `widget-combobox-clear-button` with the widget-level clear button, which forced one E2E locator to count buttons. `chipRemove` maps to `widget-combobox-selected-item-remove-button`, the name the SCSS already had a rule for, and the chip keeps `widget-combobox-clear-button` next to it for the same release as the other legacy classes; the shared styles (flex layout, hover colour, focus outline) are now one rule for both selectors, and the former `-remove-button` rule for a `button` element is dropped as it never matched.
- **The `aria-selected` quirk is dropped.** With the view reading `data-selected` from the getter, the one reason to keep `aria-selected` absent while a multi-select has no value is gone. Every option carries `aria-selected`.
- **The preview keeps one dropzone.** The datasource preview returned the dropzone for the input area and the plain caption in the menu. Its captions provider returns `customContent` for the selected id only, so the "..." option of an always-open preview menu stays plain. The static preview's empty caption is the placeholder text it rendered in a bare `div`; the View renders it in the caption element.

## Notes

- The SCSS translation table, in order of appearance: `&-menu-hidden` to `&-menu:not([data-open])`; `&-menu-lazy-scroll` to `&-menu-list[data-lazy]`; `.widget-combobox-menu-list:not(.widget-combobox-menu-highlighted)` to `.widget-combobox-menu-list:not([data-highlighted])`; `&-select-all-button-disabled + label` to `&-select-all-button[data-disabled] + label`; `&-item-selected` to `&-item[data-selected]`; `&-item-highlighted` to `&-item[data-highlighted]`; `&-input-container-disabled` to `&-input-container[data-disabled]`; `.widget-combobox-multiselect:not(.widget-combobox-input-container-active)` to `.widget-combobox-input-container[data-has-selection]:not([data-open])`; `&-input-nofilter` to `&-input[data-readonly]`; `.widget-combobox-placeholder-empty` to `.widget-combobox-placeholder-text[data-empty]`; `.widget-combobox-placeholder-custom` to `.widget-combobox-placeholder-text[data-custom]` with the text rules scoped to `:not([data-custom])`; `&-custom-content` to `&-selected-items[data-custom]`; `.widget-combobox-boxes` and `.widget-combobox-text` to `[data-style="boxes"]` and `[data-style="text"]`; `&-down-arrow-icon.active` to `&-down-arrow[data-open] &-down-arrow-icon`; `&-spinner-margin` to `&-spinner[data-margins]`; `&-loader-small` to `&-loader[data-size="small"]`.
- The `widget-combobox-down-checkbox-icon` rules in the SCSS match nothing in this package or in component-kit; left as found, out of scope.
- Verification at the tip is recorded in tasks.md.
