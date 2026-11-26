## 1. Implementation

- [x] 1.1 In `src/components/Tooltip.tsx`, hide closed content with the `hidden` attribute, and remove the `inert` effect, `aria-hidden` and the `.widget-tooltip-sr-only` class
- [x] 1.2 Remove the `.widget-tooltip-sr-only` rule from `src/ui/Tooltip.scss`
- [x] 1.3 Trim `textMessage` when deciding whether Text mode has content
- [x] 1.4 Add `hasVisibleContent`, measured in a layout effect and kept current with a `MutationObserver` on the content element, and always true in preview
- [x] 1.5 Use `showTooltip && hasVisibleContent` as the open state for Floating UI and rendering
- [x] 1.6 Require `hasVisibleContent` before adding `aria-describedby`
- [x] 1.7 Skip focusable elements that belong to a nested tooltip when adding `aria-describedby`

## 2. Unit tests

- [x] 2.1 Replace the inert test: closed content has `hidden` and no `inert` or `aria-hidden`, and open content has none of them
- [x] 2.2 Test that Custom content rendering nothing adds no description and does not open on click
- [x] 2.3 Test that when Custom content changes from empty to visible, the description is added and the tooltip opens, and the reverse removes it
- [x] 2.4 Test that whitespace-only text renders no content element and adds no description
- [x] 2.5 Test that Custom content with only an image counts as visible
- [x] 2.6 Test that empty Custom content in preview still renders the drop zone
- [x] 2.7 Check that the snapshot is unchanged, as it shows open content
- [x] 2.8 `pnpm run test` and `pnpm run lint` pass in `packages/pluggableWidgets/tooltip-web`
- [x] 2.9 Test that a nested tooltip's trigger and content get no description from the outer tooltip

## 3. Manual QA

The reviewer and QA approvals on PR 2175 (2026-11-18) cover this section. QA tested the final merged behavior, which includes the later changes in this package.

- [x] 3.1 QA finding 1: with Custom content containing a button, link or text box, Tab and Shift+Tab move past the trigger with the tooltip closed and after closing it with Escape
- [x] 3.2 VoiceOver and NVDA announce text and Custom content on focus, with the tooltip closed and open
- [x] 3.3 QA finding 2: with all Custom content hidden by conditional visibility, the trigger has no `aria-describedby` and no tooltip opens; showing the content again restores both
- [x] 3.4 QA finding 3: whitespace-only text gives no `aria-describedby`
- [x] 3.5 Open content is focusable and usable, and the tooltip opens, closes and positions as before in all `Open on` modes
