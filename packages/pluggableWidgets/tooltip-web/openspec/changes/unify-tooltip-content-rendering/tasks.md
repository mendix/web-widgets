## 1. Implementation

- [x] 1.1 In `src/components/Tooltip.tsx`, derive `content` from `renderMethod` and use it for the content check
- [x] 1.2 Replace the two content elements with one that switches between closed and open state
- [x] 1.3 Attach `refs.setFloating`, floating styles and the arrow only while open
- [x] 1.4 Use the id from `getFloatingProps()` for `aria-describedby` and remove `useId`
- [x] 1.5 Toggle `inert` on the content element based on `showTooltip`
- [x] 1.6 Skip `aria-describedby` management when `preview` is set

## 2. Unit tests

- [x] 2.1 Test that open custom content renders exactly once, and that a custom widget does not remount on open and close
- [x] 2.2 Test that closed content is `inert` and `aria-hidden`, and that an open tooltip is neither
- [x] 2.3 Test that a button in closed custom content is inside the `inert` element (jsdom ignores `inert` when tabbing, so task 3.4 covers real focus)
- [x] 2.4 Test that Text mode with empty text and custom content adds no description and renders no content
- [x] 2.5 Test that preview mode renders content once and adds no `aria-describedby`
- [x] 2.6 Make the "no tooltip content" test check the trigger element
- [x] 2.7 Update the snapshot and check that its diff shows only the expected change
- [x] 2.8 `pnpm run test` and `pnpm run lint` pass in `packages/pluggableWidgets/tooltip-web`

## 3. Manual QA

- [ ] 3.1 Tooltip opens, closes and positions as on `main` in all `Open on` modes
- [ ] 3.2 VoiceOver and NVDA announce text and custom content on focus with the tooltip closed and open
- [ ] 3.3 Custom content with a data-loading widget: one request and no duplicate ids
- [ ] 3.4 Custom content with a link or button: closed content takes no focus, open content is usable
- [ ] 3.5 Studio Pro preview shows one custom content drop zone
