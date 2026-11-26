## Context

`useKeyboardClick` toggles a `Click` tooltip from capture-phase handlers on the trigger wrapper, so it sees events that the trigger widget stops. That made three problems possible: every repeated keydown toggled, every click in a form control toggled, and a nested tooltip's events also reached the outer wrapper. Separately, the tooltip content is rendered next to the trigger. When it is removed while it has focus, the browser moves focus to `<body>`. The widget's own `onBlur` handler in `Hover,focus` mode closed the tooltip on any blur, including a move into the content.

## Goals / Non-Goals

**Goals:**

- Fix the five QA findings on PR 2526 and the focus loss on Tab in `Hover,focus` mode.
- Keep the trigger's own action running once per activation.

**Non-Goals:**

- Escape handling across nested tooltips. Each tooltip still closes on its own Escape listener. A Floating UI `FloatingTree` would coordinate them, but no reported problem needs it.
- Making interactive custom content unreachable. See the open question in the proposal.

## Decisions

- **Key repeat:** skip keydowns with `event.repeat`. A repeated Enter on a native button still fires a `click`, so the repeat also sets the "key toggled" flag that skips that click.
- **Form controls open only:** a click on `input`, `textarea`, `select`, `label` or `contenteditable` that isn't a button opens the tooltip and never closes it. Alternative: ignore those clicks. Rejected, because a mouse user who clicks a text box trigger expects the tooltip, as before.
- **Nested tooltips:** a handler ignores an event when `event.target.closest(".widget-tooltip")` isn't the wrapper of the handling trigger. This also covers clicks inside a nested tooltip's content.
- **Focus return:** the `onOpenChange` passed to `useFloating` checks the close reason. On `escape-key` with focus inside the content, it focuses the first focusable element in the trigger before the content is removed. Other close reasons don't move focus. An outside click already moves focus where the user clicked.
- **Focus into content:** the widget's blur handlers on the trigger and on the content close the tooltip only when `relatedTarget` is outside both. Floating UI's `useFocus` already keeps the tooltip open in that case.

## Risks / Trade-offs

- [The first focusable element in the trigger isn't the one the user started from, when the trigger has several] → Acceptable: focus stays near the tooltip instead of jumping to the top of the page.
- [The DOM selector `.widget-tooltip` ties the nested-tooltip check to the widget's class name] → The class is part of the widget's styling contract and is stable.
