## Why

ValidationAlert components are currently used without IDs in several widgets, preventing proper ARIA connection between form controls and validation messages. This breaks accessibility for screen reader users who cannot determine which field has an error or read the validation message. Making the ID required ensures all validation messages are properly connected via `aria-describedby` and `aria-invalid` attributes.

## What Changes

- **BREAKING**: Make `ValidationAlert` component's `id` prop required in TypeScript interface
- Add development-mode runtime warning when ValidationAlert is rendered without proper ARIA connection
- Update all widgets using ValidationAlert to provide IDs: slider-web, range-slider-web, rich-text-web
- Add validation connection helper utilities for consistent ID generation
- Update widget development guidelines to document validation ID requirements

## Capabilities

### New Capabilities

- `validation-id-enforcement`: Type system and runtime checks ensuring all validation messages have IDs and can be properly connected to form controls via ARIA attributes

### Modified Capabilities

<!-- No existing capabilities are being modified - this is a new enforcement mechanism -->

## Impact

- **Breaking change** for ValidationAlert component API (id prop becomes required)
- Affects 5+ widgets currently using ValidationAlert (slider-web, range-slider-web, rich-text-web, combobox-web, checkbox-radio-selection-web)
- Improves WCAG 2.2 AA compliance across all widgets with validation
- Requires coordinated updates across multiple widget packages
- No runtime behavior changes for end users - purely accessibility improvements
