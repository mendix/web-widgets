## Why

Screen reader users who tab to an interactive tooltip trigger hear nothing (WC-3404). The tooltip content is only in the DOM while the tooltip is open, and the `aria-describedby` set by Floating UI sits on the non-focusable trigger wrapper. The goal is to announce the content on interactive trigger elements, in line with the Deque tooltip pattern, with no other change in behavior.

## What Changes

- Tooltip content is always in the DOM in a visually hidden, widget-prefixed element.
- Focusable elements inside the trigger reference that element through `aria-describedby`.
- Existing `aria-describedby` values on those elements are kept, and only the tooltip id is removed during cleanup.
- Focusable elements that mount later, and elements whose attribute gets reset, receive the description through a `MutationObserver` on the trigger wrapper.
- A CHANGELOG "Fixed" entry.

## Capabilities

### New Capabilities

- `tooltip-screen-reader-description`: Focusable elements in the tooltip trigger expose the tooltip content as their accessible description.

### Modified Capabilities

<!-- None: tooltip-web has no existing specs. -->

## Impact

- `src/components/Tooltip.tsx`, `src/ui/Tooltip.scss`, `src/components/__tests__/Tooltip.spec.tsx` and its snapshot, `CHANGELOG.md`.
- No XML, typings or dependency changes.
- Patch-level fix.
