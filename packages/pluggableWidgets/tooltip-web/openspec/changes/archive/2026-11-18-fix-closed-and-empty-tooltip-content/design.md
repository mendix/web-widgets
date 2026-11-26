## Context

`Tooltip.tsx` renders one content element whenever `textMessage` or `htmlMessage` is truthy for the selected render method. Closed, it uses `.widget-tooltip-sr-only`, `aria-hidden="true"` and `inert`, which keep it in the layout but visually hidden. A truthy `htmlMessage` does not mean anything is shown, because widgets inside it can be hidden by conditional visibility.

## Goals / Non-Goals

**Goals:** restore normal tabbing, and never describe a trigger with, or open, empty content.

**Non-Goals:**

- Changing how open content looks or is positioned.
- Detecting content that is present but visually empty for other reasons, such as text styled to be invisible.

## Decisions

- **Hide closed content with the `hidden` attribute.** It applies `display: none`, so the content cannot take focus and leaves page order, which removes the trap. Accessible description computation still reads hidden content when a trigger references it directly through `aria-describedby`. Because `display: none` already hides the content from assistive technology and focus, `inert`, `aria-hidden` and `.widget-tooltip-sr-only` are removed. _Alternative:_ add `display: none` and keep `inert`, as QA tested. Rejected because `inert` adds nothing once the element is not displayed.
- **Measure rendered content.** A layout effect sets `hasVisibleContent` from the content element: true when its trimmed `textContent` is not empty, or when it contains `img`, `svg`, `video`, `canvas`, `iframe`, `input`, `select` or `textarea`. A `MutationObserver` on the element repeats the check when children, text or attributes change, so conditional visibility updates the result. Measuring works while hidden, because `textContent` and queries do not depend on layout.
- **Gate the open state.** The widget passes `showTooltip && hasVisibleContent` to Floating UI and to rendering, so empty content never opens. If content becomes visible while the trigger is hovered or focused, the tooltip opens.
- **Gate the description.** The `aria-describedby` effect also requires `hasVisibleContent`, and its cleanup removes the id when content becomes empty.
- **Trim text.** `textMessage?.trim()` decides whether Text mode has content, so whitespace-only text renders no element.
- **Preview counts as visible.** In Studio Pro preview, the custom content drop zone must show even when empty, so `hasVisibleContent` is always true there.

## Risks / Trade-offs

- [A screen reader might not read a description from `display: none` content] → Referenced hidden content is part of the description computation in browsers, and task 3.2 checks VoiceOver and NVDA.
- [Content that shows only a CSS background or icon font has no text or media, so it counts as empty] → Rare for a tooltip. Adding visible text or an image avoids it.
- [The content observer runs on every DOM change inside the tooltip] → The check is one `textContent` read and one query, and it stops on cleanup.
