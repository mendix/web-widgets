## Why

With the default settings, keyboard users can't reach tooltip content (WC-3663). The default **Open on** value is `Hover`, which opens the tooltip on mouse hover only, so a keyboard user who tabs to the trigger sees nothing. The Deque tooltip pattern says a tooltip must open on both focus and hover. `Hover,focus` already does this. A second problem also blocks keyboard users: in `Click` mode, the tooltip doesn't open when the trigger is a Mendix action button. With an action set, it doesn't open on click, Enter or Space. With no action, it doesn't open on Enter or Space.

`Hover` and `Hover,focus` stay separate options, and `Hover` keeps opening on mouse hover only. This is a product decision made in WC-3663: app developers keep the choice, and existing apps don't change behavior.

We reproduced both problems in a running app with Tooltip 1.4.2. In Hover mode, tooltips opened on mouse hover but not on Tab. `Hover,focus` opened on focus, and Escape closed it. The Click-mode tooltip on an action button didn't open from the keyboard, and on a button with an action it didn't open on mouse click either.

## What Changes

- The default **Open on** value changes from `Hover` to `Hover,focus`, so new Tooltip widgets open on keyboard focus. Widgets already in apps keep their stored value.
- `Hover` and `Hover,focus` behave as before.
- In `Click` mode, the tooltip toggles on click, Enter and Space on a button or link inside the trigger. This also works when the trigger dispatches no native `click` for the key, or stops propagation of the event. The trigger's own action still runs.
- The **Open on** description in `Tooltip.xml` explains the difference between the options.
- CHANGELOG "Changed" and "Fixed" entries.

## Capabilities

### New Capabilities

- `tooltip-keyboard-access`: Keyboard users can open the tooltip with the default settings and in Click mode, following the Deque tooltip pattern.

### Modified Capabilities

<!-- None: tooltip-web has no archived specs on main. WC-3404 (PR 2175) adds `tooltip-screen-reader-description`, which this change doesn't modify. -->

## Impact

- `src/Tooltip.xml`: the `openOn` default value and description. No new keys or values, so `typings/TooltipProps.d.ts` doesn't change.
- `src/utils/useFloatingUI.ts` and a new `src/utils/useKeyboardClick.ts`: Click-mode interaction.
- `src/components/__tests__/Tooltip.spec.tsx` and `e2e/Tooltip.spec.js`: new keyboard tests.
- `CHANGELOG.md`. At release, the new default calls for a minor version bump.
- Docs follow-up: the **Open on** section of the Tooltip page in `mendix/docs`, including the new default.
- Jira follow-up: WC-3663's acceptance criteria still say Hover mode opens on focus. Update them to match this decision.
- Depends on WC-3404 (PR 2175), which also changes `Tooltip.tsx` and `useFloatingUI.ts`. Rebase this change onto it after it merges.
