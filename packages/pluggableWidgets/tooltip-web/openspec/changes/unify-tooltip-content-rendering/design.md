## Context

`Tooltip.tsx` currently renders `.widget-tooltip-sr-only` whenever content exists, and `.widget-tooltip-content` while open. Both receive the same `textMessage` or `htmlMessage`. Floating UI's `useRole` gives the floating element an id and points the trigger wrapper's `aria-describedby` at that id while open.

## Goals / Non-Goals

**Goals:** keep the screen reader description while removing the side effects of the second copy.

**Non-Goals:**

- Changing `Open on` modes. Deque's pattern opens tooltips on both focus and hover, while this widget's default `Hover` mode does not open on focus. WC-3404 asks for no other behavior change, so this needs its own ticket.
- Extending the focusable element selector.

## Decisions

- **One element for both states.** It stays mounted while content exists, so custom widgets keep their state across open and close. Closed, it has `.widget-tooltip-sr-only` and `aria-hidden="true"`. Open, it has `.widget-tooltip-content`, floating styles and the arrow. _Alternative:_ keep two copies and make the hidden one inert. Rejected because it still duplicates widgets.
- **Attach the floating ref only while open.** `refs.setFloating` is passed only while open, so `autoUpdate` and outside-press detection stay limited to the open tooltip.
- **Use one id.** Trigger elements use the id from `getFloatingProps()`, so wrapper and trigger elements reference the same element and `useId` is removed.
- **Set `inert` through the DOM.** An effect toggles the attribute based on `showTooltip`. React 18 and 19 treat a JSX `inert` prop differently, so `toggleAttribute` works the same on both.
- **Derive content once.** `const content = renderMethod === "text" ? textMessage : htmlMessage`, and content exists only if this value is truthy.
- **Skip `aria-describedby` management in preview.** The effect returns early when `preview` is set, as the preview has no screen reader use.

## Risks / Trade-offs

- [Custom widgets mount at page load instead of on first open, so data widgets load early, and many tooltips in a list multiply this] → The current implementation has the same cost, doubled while open, and a description needs content in the DOM. _Alternative:_ describe Text mode only and mount custom content on open as on `main`, which fully keeps "no other change" but leaves Custom mode unannounced. This is the decision for review.
- [`inert` could remove the element from description computation in some browser and screen reader pairs] → Task 3.2 checks this. If it fails, remove only the `inert` attribute and revisit focus handling.
- [Reusing one element changes the DOM of the closed state] → Unit tests and existing E2E screenshots cover open state rendering.
