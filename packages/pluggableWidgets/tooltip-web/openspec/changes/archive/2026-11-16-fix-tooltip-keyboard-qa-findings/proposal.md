## Why

QA on PR 2526 (WC-3663) found five keyboard and focus problems in the Tooltip changes, and a retest found a sixth. We reproduced all six in a running app (SampleWidgetProject, Mendix 11.12.0, Tooltip 1.5.1 built from the branch), by hand and with Playwright:

1. In `Click` mode, holding Enter on a button made the tooltip flicker. Every repeated keydown toggled it.
2. In `Click` mode, the second click in a text box closed the tooltip, and the third reopened it.
3. In `Click` mode, Space on a check box toggled the check box and the tooltip together.
4. With a `Click` tooltip nested in another `Click` tooltip, Enter on the inner button opened both. Escape closed only the inner one, and after that each Enter swapped which one was open.
5. Escape while focus was on a button inside custom tooltip content closed the tooltip, and focus fell to the top of the page.
6. In `Hover,focus` mode, Tab from the trigger into custom tooltip content closed the tooltip, and focus fell to the top of the page.

## What Changes

- In `Click` mode, a held key toggles the tooltip once. Repeated keydowns are ignored.
- In `Click` mode, a click on a form control inside the trigger (text box, text area, drop-down, check box, radio button, label) opens the tooltip but doesn't close it. Buttons and links still toggle it.
- In `Click` mode, a tooltip ignores clicks and key presses that come from a tooltip nested inside its trigger.
- In every mode, when Escape closes the tooltip while focus is inside its content, focus moves to the first focusable element in the trigger.
- In `Hover,focus` mode, the tooltip stays open while focus moves between the trigger and the tooltip content, and closes when focus leaves both.
- CHANGELOG "Fixed" entries for each problem.

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `tooltip-keyboard-access`: Hover,focus keeps the tooltip open while focus is in its content, Escape returns focus to the trigger from the content, and Click mode handles held keys, form controls and nested tooltips.

## Impact

- `src/utils/useKeyboardClick.ts`: key repeat, form controls, nested tooltips.
- `src/utils/useFloatingUI.ts` and `src/components/Tooltip.tsx`: focus return on Escape, and focus moving into the content in `Hover,focus` mode.
- `src/components/__tests__/Tooltip.spec.tsx`: seven new unit tests.
- `CHANGELOG.md`: five "Fixed" entries.
- Open question for the PR: custom content with a button stays reachable with Tab in `Click` and `Hover,focus` modes. This follows from the content's place in the DOM. Strictly, a tooltip with interactive content acts like a popover. The change keeps it reachable, because hiding it would leave keyboard users unable to use that button.
