## Why

QA testing of WC-3404 found three problems with `unify-tooltip-content-rendering`:

1. **Keyboard trap.** With Custom content that contains a focusable widget, Tab and Shift+Tab stop moving focus around the trigger, even while the tooltip is closed or after closing it with Escape. In 1.5.1, Tab moves on normally. QA reports that the Mendix client moves focus to the next element in page order itself, which is now inside the closed, `inert` content, and that adding `display: none` restored normal tabbing in browser tests.
2. **Empty description and empty tooltip.** When conditional visibility hides all Custom content widgets, the trigger still references an empty element, and focusing it opens an empty tooltip about 12px high.
3. **Whitespace-only text.** In Text mode, text such as `' '` gives the trigger an empty description.

## What Changes

- Hide closed content with `display: none` instead of visually hiding it, and remove `inert`, `aria-hidden` and the `.widget-tooltip-sr-only` styles.
- Treat content as empty when it renders no text and no media, and update this when its widgets show or hide.
- With empty content, add no `aria-describedby` and do not open the tooltip.
- Trim Text mode content before deciding whether it exists.

## Capabilities

### New Capabilities

<!-- None. -->

### Modified Capabilities

- `tooltip-screen-reader-description`: Closed content is hidden with `display: none`, and content that renders nothing visible counts as no content.

## Impact

- `src/components/Tooltip.tsx`, `src/ui/Tooltip.scss`, `src/components/__tests__/Tooltip.spec.tsx`.
- No XML, typings, dependency or changelog changes beyond the existing "Fixed" entry.
- Depends on `fix-tooltip-screen-reader-description` and `unify-tooltip-content-rendering`, so archive this change after them.
