## 1. Implementation

- [x] 1.1 In `src/components/Tooltip.tsx`, always render tooltip content in a hidden element when content exists
- [x] 1.2 Add the hidden element's id to `aria-describedby` on focusable trigger elements, keeping existing values
- [x] 1.3 Remove only the tooltip id during cleanup
- [x] 1.4 Observe the trigger wrapper for late-mounted elements and attribute resets
- [x] 1.5 Add `.widget-tooltip-sr-only` to `src/ui/Tooltip.scss`

## 2. Unit tests and changelog

- [x] 2.1 Test that hidden content is in the DOM before the tooltip opens, for text and custom content
- [x] 2.2 Test that all focusable trigger elements get the description
- [x] 2.3 Test that an existing `aria-describedby` is kept and restored
- [x] 2.4 Test late-mounted elements and attribute resets
- [x] 2.5 Add a "Fixed" entry under `[Unreleased]` in `CHANGELOG.md`
- [x] 2.6 `pnpm run test` and `pnpm run lint` pass in `packages/pluggableWidgets/tooltip-web`

## 3. Manual QA

The reviewer and QA approvals on PR 2175 (2026-11-18) cover this section. QA tested the final merged behavior, which includes the later changes in this package.

- [x] 3.1 Tooltip opens, closes and positions as before in all `Open on` modes
- [x] 3.2 VoiceOver and NVDA announce the tooltip text on focusable triggers in all `Open on` modes, and browse mode does not reach the hidden element
- [x] 3.3 Custom content with a data-loading widget: check for duplicate ids and doubled requests
- [x] 3.4 Custom content with a link or button: focus must not land on the hidden copy
- [x] 3.5 Text box with a validation message inside the trigger: message stays announced
- [x] 3.6 Trigger shown later through conditional visibility: tooltip text is announced
- [x] 3.7 Hidden text is never visible, and no scrollbars or layout shifts appear
