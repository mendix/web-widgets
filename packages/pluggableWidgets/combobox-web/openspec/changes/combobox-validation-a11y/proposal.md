## Why

The combobox widget has accessibility gaps that create noise and confusion for screen reader users: decorative icons (arrow, clear button) are announced as "image", and empty structural elements are exposed in the accessibility tree when they provide no value. These issues violate WCAG 2.2 AA guidelines and degrade the experience for assistive technology users.

## What Changes

- Add `aria-hidden="true"` to decorative icon elements (DownArrow, ClearButton SVG containers) to hide them from assistive technologies
- Prevent empty group-like nodes from being exposed to screen readers when the combobox has no value or options
- Ensure validation-related ARIA attributes remain functional (aria-invalid, aria-describedby already implemented)

## Capabilities

### New Capabilities

- `decorative-icon-hiding`: Hide decorative icons from assistive technologies using aria-hidden
- `empty-group-prevention`: Prevent empty structural elements from being exposed in accessibility tree

### Modified Capabilities

<!-- No existing capability requirements are changing - these are additive improvements -->

## Impact

**Affected Files:**

- `packages/pluggableWidgets/combobox-web/src/assets/icons.tsx` - Add aria-hidden to DownArrow and ClearButton SVG elements
- `packages/pluggableWidgets/combobox-web/src/components/ComboboxWrapper.tsx` - Ensure arrow icon container has proper accessibility attributes
- `packages/pluggableWidgets/combobox-web/src/components/ComboboxMenuWrapper.tsx` - Prevent empty ul/group elements from being exposed when no options exist

**No Breaking Changes**: These are non-breaking accessibility enhancements that improve screen reader experience without affecting visual presentation or API.
