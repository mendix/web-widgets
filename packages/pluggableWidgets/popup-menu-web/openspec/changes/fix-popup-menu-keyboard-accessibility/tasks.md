## 1. Reproduce and confirm

- [ ] 1.1 Reproduce the current behavior in the test project (`tests/testProject`): Action Button trigger without action, basic items, advanced items with widget action, advanced items with container action / Link / Button / `role="button"` helper (the latter are a known limitation, not fixed)
- [x] 1.2 Action Button key handling confirmed from source: Enter/Space keydown always `preventDefault`, propagates when the button has no action
- [x] 1.3 Add a nested-menu page to the test project (2 levels, sibling parent items, mixed Click/Hover "Open on") for submenu scenarios
- [x] 1.4 Write failing unit tests (user-event) for the trigger spec scenarios in `src/__tests__/PopupMenu.keyboard.spec.tsx` (mock button that prevents default but propagates → menu opens; plain button without preventDefault → opens exactly once)

## 2. Trigger keyboard interaction

- [x] 2.1 In `usePopup.ts`, set `useClick(..., { enabled: trigger === "onclick", keyboardHandlers: false })`, switch `useRole` to `{ role: "menu" }`, and set `useDismiss(..., { escapeKey: false })`
- [x] 2.2 In `PopupTrigger.tsx`, add a bubble-phase `onKeyDown` passed through `getReferenceProps` (both open modes): Enter/Space toggle, Escape closes when open. Don't bail on `defaultPrevented` or `<button>` targets. Arrows are handled by `useListNavigation` (task 3.1)
- [x] 2.3 Add the `keyboardActivation` ref so a follow-up keyboard-synthesized click (`detail === 0`) doesn't toggle again; prevent Space scroll only for non-button, non-typeable targets
- [x] 2.4 Verify `useRole` puts `aria-haspopup="menu"`, `aria-expanded`, `aria-controls` on the trigger wrapper and `aria-labelledby` on the menu (no changes to trigger content)

## 3. Menu navigation, focus, Tab and Escape

- [x] 3.1 Add `activeIndex` state and `listRef` to `usePopup`; wire `useListNavigation` (`loop`, `focusItemOnOpen: "auto"`, `focusItemOnHover: false`, default `openOnArrowKeyDown`) into `useInteractions`; expose `getItemProps`; click opening sets the first item active (design.md D3)
- [x] 3.2 Verify the opening key drives initial focus (Enter/Space/ArrowDown → first item, ArrowUp → last) and that a reopened menu starts from the first item
- [x] 3.3 Configure `FloatingFocusManager` with `modal={false}`, `initialFocus={-1}`, `returnFocus` pointing at the recorded trigger element, and the default `closeOnFocusOut`
- [x] 3.4 Close the whole hierarchy on Shift+Tab onto the trigger (`PopupTrigger` `onFocus`) or onto a parent item (`MenuItem` `onFocus`), ignoring focus from a mouse press (`useMouseDownRef`) (design.md D3)
- [x] 3.5 Handle Escape in the `<ul>` `onKeyDown` and in the trigger key handler (`stopPropagation` on the keydown and the matching keyup): in the menu → close that level and return focus; on the trigger → close and keep focus; focus outside the widget → ignored
- [ ] 3.6 Verify the Atlas `:focus` indicator is visible and meets 3:1 contrast on items during arrow navigation

## 4. Menu items

- [x] 4.1 Add `MenuItem.tsx`: items via `getItemProps` with `role="menuitem"`, roving `tabIndex`, and `ref` into `listRef` (indices count items only); dividers as plain `role="separator"` elements outside list navigation, with no tabIndex
- [x] 4.2 Share one `activate` between `onClick` and Enter/Space `onKeyDown`: execute the widget-level action (no-op without one). Don't inspect or forward into custom item content
- [x] 4.3 Respect `clickCloseOn` for keyboard activation; return focus to the trigger when closing
- [x] 4.4 Keep existing class names and DOM structure
- [x] 4.5 Verify that under "Close on: Click outside", an action that doesn't move focus leaves the menu open, and an action that moves focus (e.g. opens a dialog) closes it, for both keyboard and mouse activation

## 5. Submenus (nested Pop-up Menus)

- [x] 5.1 Add `MenuItemContext` (in `PopupContext.tsx`), provided by every `MenuItem`, with `itemRef` and `registerSubmenu(id, { open, contains, isOpen })`
- [x] 5.2 In a nested `PopupMenu`, register with the enclosing `MenuItemContext`; `open()` sets the first item active, then opens; `returnFocus` points at the parent item
- [x] 5.3 On parent `<li>`: add `aria-haspopup="menu"`/`aria-expanded`; Right Arrow / Enter / Space open the registered submenu (takes precedence over activation)
- [x] 5.4 In a nested menu `<ul>`: Left Arrow and Escape close that level and focus the parent `<li>`; `stopPropagation` on handled keys so the parent list doesn't react
- [x] 5.5 Sibling auto-close via `useFloatingTree()` events (`submenu-open` with `parentId`/`nodeId`) for both keyboard and pointer opening
- [x] 5.6 `close-all` tree event for keyboard leaf activation with "Close on: Click anywhere" and for Shift+Tab out of a submenu; focus goes to the root trigger

## 6. Tests

- [x] 6.1 Unit tests for the menu-item spec: roles, single tab stop, ArrowUp/Down wrap, Home/End, divider skipping, Enter/Space activation (basic, custom with widget action, custom without action does not activate inner content), close-on modes, action that moves focus closes the menu (keyboard and mouse)
- [x] 6.2 Unit tests for focus/Tab/Escape: click open focuses the first item, clicking the trigger again closes the menu, hover open keeps focus (Tab then enters), reopened menu starts from the first item, Tab exits past the widget and closes the menu, Shift+Tab returns to the trigger and closes the menu, Tab reaches a focusable inside custom content without closing, arrow navigation doesn't close, focus moved elsewhere closes, Escape inside/on trigger/outside, Escape keydown and keyup don't propagate; ARIA attributes on the trigger wrapper and menu
- [x] 6.3 Unit tests for the submenu spec: Right opens + focuses first child, Right on leaf no-op, Left/Escape closes one level + focuses parent, per-level wrap doesn't move parent, sibling auto-close, leaf activation closes all, Tab and Shift+Tab close all (non-focusable and focusable nested trigger), clicking a submenu's trigger still toggles it, parent ARIA state
- [x] 6.4 Update snapshots and review that the diff only contains role/tabindex/aria/id changes
- [x] 6.5 Add `e2e/PopupMenu.keyboard.spec.js` for the `Keyboard` test page (`/p/keyboard`), waiting for the Mendix client's initial page focus before each test: trigger keys on a real no-action Action Button, item navigation and activation, "Close on: Click outside" with and without a dialog, Tab/Shift+Tab, hover open, 2-level submenus, Escape on a Mendix pop-up page
- [x] 6.6 Push the `Keyboard` test pages to `mendix/testProjects` (branch `popupmenu-web`)
- [ ] 6.7 Run the Playwright keyboard scenarios in Chrome, Firefox and Safari (passing locally in Chromium)
- [x] 6.8 Run `pnpm run test` and `pnpm turbo build` in the package
- [ ] 6.9 Manually verify with keyboard only and with a screen reader (VoiceOver + NVDA)

## 7. Docs and release notes

- [x] 7.1 Add a `Fixed` entry to `CHANGELOG.md` under Unreleased (keyboard opening, item navigation/activation, submenu keyboard support, menu announced to screen readers, and the menu closing when an item's action opens a dialog under "Close on: Click outside")
- [ ] 7.2 Update the Pop-up Menu page in the Mendix docs (separate docs repository) with a keyboard-support section: key table, trigger requirement (the trigger content must be focusable and must not stop event propagation, e.g. no own On click action), one-submenu-per-item note, Enter/Space follows "Close on" like a click, an action that opens a dialog closes the menu, and the known limitation for interactive elements inside custom item content
