## Context

The Tooltip widget uses Floating UI (`@floating-ui/react` 0.26.28) for its interactions. `useFloatingUI.ts` sets up the hooks per **Open on** mode:

- `useHover` is enabled for `hover` and `hoverFocus`.
- `useFocus` is enabled only for `hoverFocus`. `Tooltip.tsx` also passes `blurFocusEvents` (`onFocus` opens, `onBlur` closes) for `hoverFocus`.
- `useClick` is enabled only for `click`.
- `useDismiss` (Escape and outside press) and `useRole("tooltip")` are always on.

The reference props sit on the `widget-tooltip-trigger` wrapper `div`, not on the focusable element inside it.

`Tooltip.xml` sets `openOn` to `hover` by default, so a new Tooltip doesn't open on keyboard focus.

We reproduced both problems in a running app (SampleWidgetProject, page `TooltipTest.Tooltip_Focus_WC3663`, Tooltip 1.4.2 and 1.5.1, Chrome):

- **Hover**: tabbing to a trigger opens nothing, and mouse hover works. This is the intended Hover behavior.
- **Hover,focus**: Tab opens the tooltip. Escape closes it, and focus stays on the button.
- **Click, action button with no action**: a mouse click opens the tooltip. Enter and Space don't. The button dispatches `keydown` and `keyup` but no `click` for Enter, while a plain `<button>` on the same page does dispatch `click`. `useClick` ignores `keydown` on `BUTTON` targets (`isButtonTarget`) because it expects that native click.
- **Click, action button with an action**: nothing opens the tooltip, not even a mouse click. The button stops propagation of `click` and `keydown`, so the bubble-phase handlers on the wrapper never run. The button's action itself runs normally.

WC-3404 (PR 2175, open) rewrites most of `Tooltip.tsx`, so the content stays in the DOM as a visually hidden description. This change doesn't touch `Tooltip.tsx`.

## Goals / Non-Goals

**Goals:**

- New Tooltip widgets open on hover and keyboard focus by default.
- In Click mode, a mouse click, Enter and Space toggle the tooltip on any Mendix trigger, and the trigger's own action still runs.
- Escape closes the tooltip in every mode without moving focus.

**Non-Goals:**

- Changing `Hover` behavior. It stays mouse-only. WC-3663 decided to keep `Hover` and `Hover,focus` as separate options.
- Migrating existing widgets from `Hover` to `Hover,focus`. App developers choose the option.
- Making a trigger that contains no focusable element focusable, for example by adding `tabindex` to the wrapper.
- Opening a Click-mode tooltip on focus alone.

## Decisions

### 1. Change the default instead of the Hover behavior

Set `defaultValue="hoverFocus"` on `openOn` in `Tooltip.xml`, and leave the hover and focus code as it is.

- **Why**: it gives keyboard users the tooltip in the default configuration, and keeps `Hover` as an explicit mouse-only choice. Existing apps don't change behavior.
- **Checked**: after updating the widget definition in the sample project (`mxcli fix widgets`), all existing tooltips kept their stored `openOn` value (`hover`, `hoverFocus`, `click`). Mendix stores enumeration values on each widget, so a new default only applies when a widget is added. Studio Pro's **Update widget** wasn't checked separately.
- **Alternative**: make `Hover` open on focus too. This was implemented first, and then rejected in WC-3663 so the two options stay distinct.

### 2. Click mode handles click and keys itself, in the capture phase

Replace `useClick` with a `useKeyboardClick` hook in `src/utils/useKeyboardClick.ts`. It returns reference props that run in the capture phase:

- `onKeyDownCapture`: on Enter on a button or link (`button`, `a[href]`, `input` of type button, submit or reset, `[role="button"]`, `[role="link"]`), toggle the tooltip and record that a key toggled it. On Space on such a target, mark that the key went down.
- `onKeyUpCapture`: on Space marked on keydown, toggle the tooltip and record the toggle. This follows native button activation, which happens on keyup for Space.
- `onClickCapture`: toggle the tooltip, unless a key press already toggled it for this activation. In that case, clear the record and skip.
- `onPointerDownCapture` and `onBlur` clear the record, so a stale record can't swallow a later mouse click. This matters for buttons that dispatch no `click` after a key press.

The handlers never stop propagation or prevent default. Text inputs and other typeable elements never match the selector, so typing doesn't toggle the tooltip.

- **Why capture phase**: a Mendix action button with an action stops propagation of `click` and `keydown`. Capture-phase handlers on the wrapper run before the button's own handlers, so they always see the event. Because they don't block it, the button's action runs as before.
- **Why handle keys directly**: some trigger widgets dispatch a native `click` for Enter and Space, and some don't. Handling the key works for both, and the record of a key toggle stops a double toggle.
- **Why not ignore `click` with `event.detail === 0`**: screen readers activate controls with a synthetic `click` with `detail === 0`, often with no key events. Ignoring those would break the tooltip for screen reader users.
- **Why not keep `useClick` and add handlers**: Floating UI runs every merged handler, so ours couldn't stop `useClick` from toggling a second time. `useClick` also listens in the bubble phase, which doesn't fix the action-button case.

`useDismiss` stays as it is, so Escape and outside press keep closing the tooltip.

### 3. Update the Open on description

The description explains the options: "How the tooltip is triggered. Hover,focus opens it on mouse hover and on keyboard focus, so keyboard users can see it. Hover opens it on mouse hover only. Click opens it on click, Enter or Space. On mobile devices, hover is triggered on touch." Changing the description and the default doesn't change `typings/TooltipProps.d.ts`.

## Risks / Trade-offs

- [Existing apps that use `Hover` stay inaccessible to keyboard users.] → This was decided in WC-3663. The new description tells app developers why to pick `Hover,focus`, and the docs page will say the same.
- [Click-mode tooltips on action buttons now open, where before they never did. This could surprise apps that relied on the tooltip not opening.] → That earlier behavior was a bug. The CHANGELOG states the fix.
- [Capture-phase handlers run even when a trigger widget wants to stop the event, for example a widget that handles Enter itself.] → The handlers only toggle the tooltip and don't block the event, so the widget's own handling is unaffected. Only buttons and links match for keys.
- [The button-or-link check could miss custom widgets that render a `div` with a click handler and no role.] → Such elements aren't keyboard-operable on their own either. Widgets that set `role="button"` are covered.
- [Merge conflict with PR 2175 in `useFloatingUI.ts` if it changes the hook list.] → Rebase after it merges.

## Migration Plan

No migration. The XML keys and typings don't change, and existing widgets keep their stored **Open on** value. To roll back, install the previous widget version.

## Open Questions

- Should the WC-3663 acceptance criteria in Jira be rewritten to match this decision? They still say Hover mode opens on focus.
