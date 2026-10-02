## Why

The target behavior is the WAI-ARIA Authoring Practices (APG) [Menu Button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/) and [Menu](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/) patterns. This covers roving tabindex, per-level arrow navigation, Right/Left for submenus, Escape closing one level, focus return and a single open submenu per level.

The Pop-up Menu can't be used with only a keyboard. The trigger gets focus, but Enter, Space and Arrow Down don't open the menu. Once the menu is open, its items can't be reached or activated from the keyboard unless the custom content happens to contain native `<a>`/`<button>` elements. This fails WCAG 2.2 AA (2.1.1 Keyboard, 4.1.2 Name/Role/Value) and makes behavior differ between configuration modes.

Code investigation confirmed the root causes:

- **Trigger**: opening relies on Floating UI `useClick` handlers attached to a non-focusable wrapper `<div class="popupmenu-trigger">`. `useClick` ignores key events that are `defaultPrevented` or whose target is a `<button>`, and it has no Arrow key support. Confirmed in the test project: a Mendix button with no action lets the click through; a button with an On click action stops it, so the menu doesn't open even with the mouse. For keyboard, the Mendix button always calls `preventDefault()` on Enter/Space keydown (and `stopPropagation()` only if it has an action). `useClick` drops prevented key events on `<button>` targets and waits for a native click, which the `preventDefault` has cancelled. So even a no-action button never opens the menu from the keyboard. In "Open on: Hover" mode there's no keyboard path at all.
- **Items**: basic items and advanced items with widget-level actions render as `<li onClick>` with no `tabIndex`, no role and no key handler, so they can't be focused or activated. Only native focusable descendants inside custom content work, which is why an action on an inner container or a Link/Button widget inside custom content behaves differently from an action configured on the item. An element inside custom content that only has `role="button"` isn't focusable either.
- **Semantics/focus**: `useRole` uses its default `dialog` role, so the popup is announced as a dialog, not a menu. On keyboard open, focus stays on the trigger. On close, focus is returned to the non-focusable wrapper `<div>`.

## What Changes

- The trigger opens the menu from the keyboard with Enter, Space and Arrow Down (focus goes to the first item) and Arrow Up (focus goes to the last item). This works in both "Click" and "Hover" open modes. Trigger content is treated as a black box: we assume it's focusable and lets key events propagate to the trigger, and the widget doesn't inspect or modify it.
- The popup uses `menu` semantics. Every visible menu item (basic and custom) is a `menuitem` in a roving-tabindex sequence. Dividers are `separator`s and are skipped.
- Arrow Up/Down (with wrap-around) and Home/End move focus between items. Enter/Space activates the focused item.
- Activation is consistent across modes: Enter/Space does what a mouse click on the item does, i.e. runs the item's widget-level On click action. Custom item content is treated as a black box and isn't inspected or activated.
- **Known limitation / non-goal:** interactive elements placed inside custom item content (Link/Button widgets, containers with their own On click action, inputs) aren't keyboard-operable. Tab doesn't reach them and Enter/Space doesn't forward to them. Keyboard users can reach an action only when it's configured on the Pop-up Menu item. Support for interactive item content may be added later.
- Opening the menu by click also moves focus to the first item (APG). Opening by hover doesn't move focus.
- Tab/Shift+Tab never move between items, including native buttons/links inside custom content. They close the whole menu hierarchy and move focus to the next/previous element in the page tab order (APG).
- Escape closes the menu that contains focus. In a submenu it closes that level and returns focus to the parent item. At the top level it closes the menu and returns focus to the trigger element that had focus before opening. Escape is ignored when focus is outside the widget, so it doesn't compete with other Escape handlers such as Mendix pop-up pages.
- Nested Pop-up Menus (a Pop-up Menu inside a custom item) become keyboard submenus. The parent item exposes `aria-haspopup`/`aria-expanded`. Right Arrow (or Enter/Space) opens the submenu and focuses its first item. Left Arrow or Escape closes it and returns focus to the parent item. Opening one submenu auto-closes any sibling submenu.
- The focus indicator is visible on items during arrow navigation.
- The trigger wrapper exposes `aria-haspopup="menu"`, `aria-expanded` and `aria-controls`, and the menu is labelled by it. These attributes stay on the widget's own wrapper, not on the trigger content (known limitation).
- No XML/property changes. No new dependencies. Mouse and hover behavior is unchanged.

## Capabilities

### New Capabilities

- `trigger-keyboard-interaction`: Opening/closing the popup from the keyboard via the trigger, focus placement on open, and focus return on close.
- `menu-item-keyboard-interaction`: Menu/menuitem semantics, arrow-key navigation, Tab/Escape scoping, and keyboard activation of basic and custom items.
- `submenu-keyboard-interaction`: Keyboard behavior of nested Pop-up Menus: opening/closing levels with Right/Left/Escape, focus return to the parent item, and auto-closing sibling submenus.

### Modified Capabilities

<!-- None: this package has no existing specs yet. -->

## Impact

- Code: `src/hooks/usePopup.ts` (role, list navigation, keyboard open, Escape scoping, tree events for sibling submenus), new item/submenu context in `src/components/PopupContext.tsx`, `src/components/PopupTrigger.tsx` (key handling, ARIA, focus return target), `src/components/Menu.tsx` (item roles, tabIndex, key handlers, refs), `src/components/PopupMenu.tsx` (active index state).
- Tests: new unit tests with `@testing-library/user-event`. Snapshots in `src/__tests__/__snapshots__` will change (roles/tabindex). New keyboard E2E scenarios in `e2e/PopupMenu.spec.js`.
- Styling: none expected. Atlas `_pop-up-menu.scss` already styles `.popupmenu-basic-item:focus` / `.popupmenu-custom-item:focus`.
- Changelog: `Fixed` entry in `CHANGELOG.md` (patch/minor at release time).
- Documentation: keyboard support section on the Pop-up Menu page in the Mendix docs (separate docs repository).
- Behavior note: screen readers will announce "menu" instead of "dialog". Nested interactive content inside a custom item becomes presentational under `menuitem` and is no longer reachable with Tab.
