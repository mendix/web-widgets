## Why

When inserting an image, users can only set its source, alt text, and title. Width and height can only be set _after_ insertion by dragging the resize handles. Users who know the dimensions they want (or need a consistent size) have no way to specify them up front, forcing an extra manual resize step for every image.

## What Changes

- Add a "Dimensions" section to the image insert dialog with **Width** and **Height** number inputs (pixel values).
- Add a **Maintain aspect ratio** checkbox that defaults to checked.
- When the checkbox is checked, the Height input is disabled and only `width` is applied on insert; the browser derives height proportionally (`height: auto`).
- When the checkbox is unchecked, both Width and Height are applied as entered (image may be distorted — explicit user choice).
- Width/height are optional; any combination of filled/empty is allowed, and only filled, positive-numeric values are applied. Empty or invalid values fall back to today's natural-size behavior.
- New i18n keys for the dimension labels and checkbox across all supported locales.

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `rich-text-image-dialog`: The image dialog gains initial width/height inputs and an aspect-ratio toggle that governs how dimensions are applied on insert.

## Impact

- `src/components/toolbars/components/ImageDialog.tsx`: new state (`width`, `height`, `maintainRatio`), Dimensions UI block, and submit wiring passing `width`/`height` into the existing `setImage(...)` call.
- `src/utils/i18n/locales/*.json` (en, de, es, fr, nl): new translation keys.
- `src/components/toolbars/components/__tests__/ImageDialog.spec.tsx`: tests for the new inputs and toggle behavior.
- No changes to the `ImageResize` node extension or node view — `width`/`height` attributes already exist on the node.
- No `.xml` or TypeScript widget-prop changes — this is purely in-widget dialog UI.
