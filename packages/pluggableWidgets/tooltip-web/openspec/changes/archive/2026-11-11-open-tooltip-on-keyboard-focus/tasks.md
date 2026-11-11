## 1. Prepare

- [ ] 1.1 Wait for WC-3404 (PR 2175) to merge, then rebase this branch onto `main` and resolve any conflicts in `src/utils/useFloatingUI.ts`
- [x] 1.2 Run `pnpm run test` in `packages/pluggableWidgets/tooltip-web` to get a green baseline

## 2. Default to Hover,focus

- [x] 2.1 In `src/Tooltip.xml`, set the `openOn` default to `hoverFocus`, and leave the Hover and Hover,focus code unchanged
- [x] 2.2 Update the `openOn` description in `src/Tooltip.xml`, and confirm `typings/TooltipProps.d.ts` is unchanged after a build
- [x] 2.3 Confirm existing widgets keep their stored `openOn` value after the widget definition is updated (checked with `mxcli fix widgets` on the sample project)

## 3. Click mode works with the mouse and the keyboard

- [x] 3.1 Replace `useClick` in Click mode with `useKeyboardClick`, which toggles on click, Enter (keydown) and Space (keyup) for button and link targets
- [x] 3.2 Add the key toggle record so a native `click` after a key toggle doesn't toggle again, and clear it on the next `keydown`, on `pointerdown`, on blur, and after use
- [x] 3.3 Skip typeable targets (inputs, text areas, `contenteditable`) so typing Space or Enter doesn't toggle the tooltip
- [x] 3.4 Confirm `useDismiss` still closes the tooltip on Escape and outside press in Click mode
- [x] 3.5 Use capture-phase handlers so triggers that stop propagation of `click` and `keydown` (a Mendix action button with an action) still toggle the tooltip, without blocking the trigger's own action

## 4. Unit tests (`src/components/__tests__/Tooltip.spec.tsx`)

- [x] 4.1 Hover: mouse enter and leave open and close the tooltip, and focus doesn't open it
- [x] 4.2 Hover,focus: focus on a button inside the trigger opens the tooltip, and blur closes it
- [x] 4.3 Hover,focus: the tooltip stays open while a text box inside the trigger has focus and the user types
- [x] 4.4 Hover,focus: custom content shows on focus, and focus doesn't move into the tooltip
- [x] 4.5 Hover,focus: Escape closes the tooltip, focus stays on the button, and the tooltip doesn't reopen without a new focus or hover
- [x] 4.6 Click: Enter and Space on a button that dispatches no `click` toggle the tooltip
- [x] 4.7 Click: Enter and Space on a native button toggle the tooltip once, not twice
- [x] 4.8 Click: a synthetic `click` with no key events opens the tooltip, as a screen reader would
- [x] 4.9 Click: a mouse click after a key toggle isn't swallowed
- [x] 4.10 Click: a button that stops propagation and runs its own action toggles the tooltip on click, Enter and Space, and its action runs once per activation
- [x] 4.11 Click: Space and Enter in a text input don't toggle the tooltip, focus alone doesn't open it, and Escape closes it with focus kept

## 5. E2E tests (`e2e/Tooltip.spec.js`)

- [ ] 5.1 Check that the tooltip-web test project has pages with a Mendix action button trigger (with and without an action) in Hover, Hover,focus and Click modes. Add the missing ones in Studio Pro, following `docs/requirements/e2e-test-guidelines.md`
- [ ] 5.2 Add keyboard tests: Tab opens a Hover,focus tooltip and not a Hover tooltip, Escape closes it with focus kept, and click, Enter and Space toggle a Click tooltip on a button with an action while the action runs

## 6. Verify and document

- [x] 6.1 Add CHANGELOG entries under `[Unreleased]`: "Changed": new Tooltip widgets default to Hover,focus. "Fixed": the Click-mode tooltip on action buttons
- [x] 6.2 Build into SampleWidgetProject and step through `TooltipTest.Tooltip_Focus_WC3663`: Hover cases stay closed on Tab and open on hover, case 2 opens on Tab, and cases 3 and 7 toggle on click, Enter and Space while case 7's panel toggles too
- [ ] 6.3 With VoiceOver or NVDA, confirm that opening a Click tooltip with Enter announces the content once
- [ ] 6.4 In Studio Pro, add a new Tooltip and confirm **Open on** is Hover,focus. Run **Update widget** on an existing Hover tooltip and confirm it stays Hover
- [ ] 6.5 Hand over the docs change for the **Open on** section of the Tooltip page in `mendix/docs`, including the new default
- [ ] 6.6 Update the WC-3663 acceptance criteria in Jira to match the decision (after confirmation)
