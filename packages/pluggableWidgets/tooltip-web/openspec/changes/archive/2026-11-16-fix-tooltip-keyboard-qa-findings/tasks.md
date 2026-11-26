## 1. Click mode (`src/utils/useKeyboardClick.ts`)

- [x] 1.1 Ignore keydowns with `event.repeat`, and skip the native `click` that a repeated Enter dispatches on a button
- [x] 1.2 Open the tooltip, but don't close it, on a click whose target is a form control (`input`, `textarea`, `select`, `label`, `contenteditable`) that isn't a button
- [x] 1.3 Ignore events whose target belongs to another `.widget-tooltip` than the one that handles them

## 2. Focus (`src/utils/useFloatingUI.ts`, `src/components/Tooltip.tsx`)

- [x] 2.1 When Escape closes the tooltip and focus is inside the tooltip content, move focus to the first focusable element in the trigger
- [x] 2.2 In `Hover,focus` mode, close the tooltip on blur only when focus leaves both the trigger and the tooltip content

## 3. Unit tests (`src/components/__tests__/Tooltip.spec.tsx`)

- [x] 3.1 Hover,focus: the tooltip stays open while focus moves into custom content, and closes when focus leaves it
- [x] 3.2 Hover,focus: Escape inside custom content closes the tooltip and moves focus back to the trigger
- [x] 3.3 Click: holding Enter toggles the tooltip once
- [x] 3.4 Click: a second click in a text box doesn't close the tooltip
- [x] 3.5 Click: Space on a check box opens the tooltip and the next Space doesn't close it
- [x] 3.6 Click: Enter on a nested tooltip's trigger opens only the nested tooltip
- [x] 3.7 Click: Escape inside custom content closes the tooltip and moves focus back to the trigger

## 4. Verify and document

- [x] 4.1 Add CHANGELOG "Fixed" entries for each problem
- [x] 4.2 Retest in SampleWidgetProject (`TooltipTest.Tooltip_Keyboard`) with Playwright: all eight sections pass, and button actions still run once per activation
- [ ] 4.3 Reply to the QA comment in WC-3663 with the results, and raise the question about interactive custom content
