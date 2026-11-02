## Why

`fix-tooltip-screen-reader-description` renders tooltip content in a hidden element and again in the visible tooltip. WC-3404 asks for no other change in behavior, but this has side effects:

- While the tooltip is open, custom content exists twice, which can duplicate widget side effects and ids.
- Focusable elements in custom content stay tabbable while hidden, because the element is only visually hidden. Keyboard users can land on invisible content inside `aria-hidden`.
- In Studio Pro, the preview is always open, so the custom content drop zone renders twice.
- `hasTooltipContent` ignores the render method. In Text mode with widgets left in the custom content slot and no text, the trigger gets an empty description and an empty tooltip can open.

## What Changes

- Render one content element, visually hidden while closed and shown as the tooltip while open.
- Make closed content inert, so it cannot receive focus.
- Decide whether content exists from the selected render method only.
- Do not manage `aria-describedby` in the Studio Pro preview.
- Make the "no tooltip content" unit test check the trigger element instead of its parent.

## Capabilities

### New Capabilities

<!-- None. -->

### Modified Capabilities

- `tooltip-screen-reader-description`: Content is rendered once, closed content cannot take focus, and content follows the selected render method.

## Impact

- `src/components/Tooltip.tsx`, `src/components/__tests__/Tooltip.spec.tsx` and its snapshot.
- No XML, typings, dependency or changelog changes beyond the existing "Fixed" entry.
- Depends on `fix-tooltip-screen-reader-description`, so archive that change first.
