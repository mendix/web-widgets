## Context

`useRole` from `@floating-ui/react` sets `aria-describedby` on the `.widget-tooltip-trigger` wrapper, and only while the tooltip is open. The wrapper is not the element that receives focus, because the trigger is made of arbitrary Mendix widgets placed inside it.

## Goals / Non-Goals

**Goals:** expose tooltip content as the accessible description of focusable trigger elements, without changing how the tooltip looks or opens.

**Non-Goals:**

- Describing triggers that have no focusable elements.
- Changing the Floating UI positioning or interaction hooks.

## Decisions

- **Always-rendered hidden element, referenced by `aria-describedby`.** The description has to exist before the tooltip opens. The element has `aria-hidden="true"` so browse mode does not read it as separate page content, while `aria-describedby` can still reference it. _Alternative:_ `aria-live`. Rejected because it announces on change rather than describing the element in focus.
- **Set the attribute through the DOM.** The widget does not control the markup of the widgets in its `trigger` slot, so it cannot pass them props. It queries the wrapper for focusable elements instead.
- **Merge ids rather than overwrite.** Trigger elements can already have a description, such as validation or help text. Removing only the tooltip id during cleanup restores the earlier value without having to store it.
- **Watch the wrapper with a `MutationObserver`.** Mendix widgets can render late and can reset attributes they manage. The observer callback writes only when the tooltip id is missing, so its own writes do not cause a loop.
- **Use `.widget-tooltip-sr-only`.** A prefixed class avoids a global rule that would affect other widgets using `.sr-only`.

## Risks / Trade-offs

- [Custom content renders twice while the tooltip is open, which can duplicate widget side effects and ids] → Open question, to be settled by manual testing (task 3.3).
- [Focusable elements in custom content stay tabbable inside the `aria-hidden` element, because it is hidden only visually] → Open question, to be settled by manual testing (task 3.4).
- [The observer runs on every DOM change in the trigger] → The callback is one query plus attribute checks, and it stops on cleanup.

## Open Questions

- Should Custom mode keep a second rendered copy of its widgets? This depends on the results of tasks 3.3 and 3.4.
