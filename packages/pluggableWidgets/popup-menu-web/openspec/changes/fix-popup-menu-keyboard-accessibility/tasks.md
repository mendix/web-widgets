## 1. Reproduce and confirm

- [ ] 1.1 Reproduce the current behavior in the test project (`tests/testProject`): Action Button trigger without action, basic items, advanced items with widget action, advanced items with container action / Link / Button / `role="button"` helper (the latter are a known limitation, not fixed)
- [x] 1.2 Action Button key handling confirmed from source: Enter/Space keydown always `preventDefault`, propagates when the button has no action
- [ ] 1.3 Add a nested-menu page to the test project (2 levels, sibling parent items, mixed Click/Hover "Open on") for submenu scenarios
- [x] 1.4 Write failing unit tests (user-event) for the trigger spec scenarios in `src/__tests__/PopupMenu.keyboard.spec.tsx` (mock button that prevents default but propagates → menu opens; plain button without preventDefault → opens exactly once)

## 2. Trigger keyboard interaction

- [x] 2.1 In `usePopup.ts`, set `useClick(..., { enabled: trigger === "onclick", keyboardHandlers: false })`, switch `useRole` to `{ role: "menu" }`, and set `useDismiss(..., { escapeKey: false })`
- [x] 2.2 In `PopupTrigger.tsx`, add a bubble-phase `onKeyDown` passed through `getReferenceProps` (both open modes): Enter/Space toggle, Escape closes when open. Don't bail on `defaultPrevented` or `<button>` targets. Record the focused element at open time. Don't handle arrows here: `useListNavigation` opens on ArrowDown/ArrowUp (task 3.1)
- [x] 2.3 Add the `keyboardActivation` ref so a follow-up keyboard-synthesized click (`detail === 0`) doesn't toggle again; prevent Space scroll only for non-button, non-typeable targets
- [x] 2.4 Verify `useRole` puts `aria-haspopup="menu"`, `aria-expanded`, `aria-controls` on the trigger wrapper and `aria-labelledby` on the menu (no changes to trigger content)

## 3. Menu navigation, focus, Tab and Escape

- [x] 3.1 Add `activeIndex` state and `listRef` to `usePopup`; wire `useListNavigation` (`loop`, `focusItemOnOpen: "auto"`, `focusItemOnHover: false`, default `openOnArrowKeyDown`; click opening sets the first active item, see D3) into `useInteractions`; expose `getItemProps`
- [x] 3.2 Verify the opening key drives initial focus (Enter/Space/ArrowDown → first enabled item, ArrowUp → last) via `useListNavigation`; reset `activeIndex` to `null` on close
- [x] 3.3 Configure `FloatingFocusManager` with `modal={false}`, `initialFocus={-1}` (list navigation owns initial focus: first item on keyboard and click open, nothing on hover open), and `returnFocus` pointing at the recorded trigger element. Leave `closeOnFocusOut` at its library default (`true`) — do not override it to `false` (see design.md D3 for why: it needs to fire whenever focus leaves the tree for any reason, not just Tab). Shift+Tab back to the trigger needed one extra small `onFocus` handler on `PopupTrigger`, since `closeOnFocusOut` excuses focus landing on its own reference element; the same applies to Shift+Tab from a submenu onto its parent `<li>` (a `MenuItem` `onFocus` closes the whole hierarchy), and both ignore focus caused by a mouse press so clicking the trigger still toggles (see design.md D3)
- [x] 3.4 Handle Escape in the `<ul>` `onKeyDown` and in the trigger key handler (`stopPropagation`): in the menu → close that level and return focus; on the trigger → close and keep focus; focus outside the widget → ignored
- [x] 3.5 Don't intercept Tab/Shift+Tab: the roving tabindex plus no-portal DOM order already give correct native exit behavior in every browser (two earlier hand-rolled attempts were both unreliable cross-browser, see design.md D3). Don't hand-roll focus-out detection either (a third attempt did, via a `tabPressedRef`-gated `onBlur` on the root — removed): rely on `FloatingFocusManager`'s own `closeOnFocusOut` (task 3.3) to close the whole hierarchy whenever focus lands outside it, for any reason (Tab-out or an item's action stealing focus), tree-aware for nested submenus with no explicit `close-all` needed for this case. Shift+Tab landing back on the trigger is the one case `closeOnFocusOut` doesn't cover by itself — see task 3.3
- [ ] 3.6 Verify the Atlas `:focus` indicator is visible and meets 3:1 contrast on items during arrow navigation

## 4. Menu items

- [x] 4.1 In `Menu.tsx`, render items via `getItemProps` with `role="menuitem"`, roving `tabIndex`, and `ref` into `listRef` (indices count items only); dividers as plain `role="separator"` elements outside list navigation, with no tabIndex
- [x] 4.2 Extract a shared `activate(item)` used by `onClick` and by Enter/Space `onKeyDown`: execute the widget-level action (no-op without one). Don't inspect or forward into custom item content
- [x] 4.3 Respect `clickCloseOn` for keyboard activation; return focus to the trigger when closing
- [x] 4.4 Keep existing class names and DOM structure
- [x] 4.5 Verify item activation combined with `closeOnFocusOut` (task 3.3/3.5): under "Close on: Click outside"/"Click outside" (hover), a no-op action (or one that doesn't move focus) leaves the menu open, but an action that steals focus (e.g. opens a dialog) closes the menu regardless of `clickCloseOn`/`hoverCloseOn` — for both keyboard and mouse activation (a deliberate small revision of "no change to mouse behavior", see design.md Goals)

## 5. Submenus (nested Pop-up Menus)

- [x] 5.1 Add `MenuItemContext` (in `PopupContext.tsx`) provided per custom `<li>` with `registerSubmenu({ open, close, isOpen })`
- [x] 5.2 In a nested `PopupMenu`, register with the enclosing `MenuItemContext`; expose `open()` (sets the first active item, then opens) and `close()`; `returnFocus` points at the parent item
- [x] 5.3 On parent `<li>`: add `aria-haspopup="menu"`/`aria-expanded`; Right Arrow / Enter / Space open the registered submenu (takes precedence over D4 activation)
- [x] 5.4 In a nested menu `<ul>`: Left Arrow and Escape close that level and focus the parent `<li>`; `stopPropagation` on all handled keys so the parent list doesn't react
- [x] 5.5 Sibling auto-close via `useFloatingTree()` events (`submenu-open` with `parentId`/`nodeId`) for both keyboard and pointer opening
- [x] 5.6 `close-all` tree event for leaf activation with "Close on: Click anywhere"; focus goes to the root trigger. (Tab exit no longer needs this event — see task 3.5.)

## 6. Tests

- [x] 6.1 Unit tests for the menu-item spec: roles, single tab stop, ArrowUp/Down wrap, Home/End, divider skipping, Enter/Space activation (basic, custom with widget action, custom without action does not activate inner content), close-on modes
- [x] 6.2 Unit tests for focus/Tab/Escape: click open focuses the first item, hover open keeps focus (Tab then enters), Tab exits past the widget and closes the menu, Shift+Tab returns to the trigger and closes the menu, clicking the trigger again closes a click-opened menu, Shift+Tab from a submenu closes every level and focuses the root trigger (non-focusable and focusable nested trigger), clicking a submenu's trigger still toggles it, a focusable descendant inside custom item content is reachable by Tab without closing the menu, focus moving within the menu (arrow keys) doesn't close it, Escape inside/on trigger/outside, Escape doesn't propagate to a parent handler; ARIA attributes on the trigger wrapper and menu. Replaced the old "focus stolen without Tab doesn't close" case: it now asserts the corrected expectation (it does close, once focus actually leaves); task 4.5 covers the "Close on: Click outside" + focus-steal interaction for both keyboard and mouse activation
- [x] 6.3 Unit tests for the submenu spec: Right opens + focuses first child, Right on leaf no-op, Left/Escape closes one level + focuses parent, per-level wrap doesn't move parent, sibling auto-close, leaf activation closes all, parent ARIA state
- [x] 6.4 Update snapshots (`pnpm run test -u`) and review that the diff only contains role/tabindex/aria/id changes
- [ ] 6.5 Add Playwright keyboard scenarios to `e2e/PopupMenu.spec.js` following `docs/requirements/e2e-test-guidelines.md`: full keyboard-only walk of a 2-level menu, Escape inside a Mendix pop-up page closes only the menu, Enter/Space on a real no-action Action Button opens the menu, Tab exits past the widget and closes the menu / Shift+Tab returns to the trigger and closes it (verify across Chrome, Firefox and Safari — two earlier hand-rolled Tab approaches each failed in at least one real browser before landing on not intercepting Tab at all)
- [ ] 6.6 Run `pnpm run test` and `pnpm turbo build` in the package; manually verify with keyboard only and with a screen reader (VoiceOver + NVDA)

## 7. Docs and release notes

- [x] 7.1 Add a `Fixed` entry to `CHANGELOG.md` under Unreleased (user-facing: keyboard opening, item navigation/activation, submenu keyboard support, menu announced to screen readers, and the "Close on: Click outside" + action-opens-a-dialog behavior change from task 4.5, for both click and keyboard activation)
- [ ] 7.2 Update the Pop-up Menu page in the Mendix docs (separate docs repository) with a keyboard-support section: key table, trigger requirement (the trigger content must be focusable and must not stop event propagation, e.g. no own On click action), one-submenu-per-item note, and the known limitation that interactive elements inside custom item content aren't keyboard-operable
