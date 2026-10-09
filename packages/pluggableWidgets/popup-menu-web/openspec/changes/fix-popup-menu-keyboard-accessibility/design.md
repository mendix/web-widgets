## Context

The Pop-up Menu (v4.3.1) is built on `@floating-ui/react@0.26.28`:

- `usePopup` combines `useClick` (click mode), `useHover` (hover mode), `useDismiss` and `useRole(context)` (defaults to `role="dialog"`).
- `PopupTrigger` renders a non-focusable `<div class="popupmenu-trigger">` around the user's trigger content (typically a Mendix Action Button or a container). Reference props from `getReferenceProps` go on this wrapper, so keyboard events only reach it by bubbling from the focused inner element.
- `Menu` renders `<FloatingFocusManager>` → `<ul class="popupmenu-menu">` → `<li onClick>` items. Items have no role, no `tabIndex` and no key handlers.

Behavior of v4.3.1 by trigger content:

| Trigger content                               | Enter | Space | Arrow Down |
| --------------------------------------------- | ----- | ----- | ---------- |
| native `<button>`                             | opens | opens | no-op      |
| `<div tabIndex=0 role=button>`                | opens | opens | no-op      |
| element calling `preventDefault` on keydown   | no-op | no-op | no-op      |
| `<button>` calling `stopPropagation` on click | no-op | no-op | no-op      |

In every case where the menu opens, focus stays on the trigger, `<ul>` has `role="dialog" tabindex="0"` and the `<li>` items aren't focusable. So after opening, Tab lands on the popup container and the items are unreachable.

The Mendix Action Button calls `preventDefault()` on Enter/Space keydown in every case, and `stopPropagation()` only when the button has an action. For a trigger button without an action, the keydown therefore reaches the wrapper with `defaultPrevented = true` and a `BUTTON` target, and no native click is synthesized. `useClick` drops that keydown (both `defaultPrevented` and button targets are ignored) and waits for a native click that never comes. That is why the mouse opens the menu but Enter doesn't.

The Atlas theme (`_pop-up-menu.scss`) already defines `:focus` styles for `.popupmenu-basic-item` and `.popupmenu-custom-item`, so no widget SCSS is needed.

## Goals / Non-Goals

**Goals:**

- Follow the WAI-ARIA APG Menu Button + Menu patterns (vertical menus) for opening, closing, navigating and activating:
    - roving tabindex, Up/Down/Home/End per menu level, visible focus indicator;
    - Right Arrow/Enter/Space open a submenu, Left Arrow/Escape close one level and return focus to the parent item, one open submenu per level;
    - Tab/Shift+Tab leave and close all menus (D3); Escape closes the menu containing focus, with focus on the trigger also counting (D5).
- The same keyboard behavior for basic items and custom items: every item is a focusable `menuitem`, and activation runs the widget-level On click action.
- Treat trigger content as a black box: no inspection, attribute changes or workarounds. We assume the content is focusable and lets key events propagate to the trigger wrapper (D1).
- Treat custom item content as a black box too. The widget renders it as-is and doesn't look inside it (apart from nested Pop-up Menus, which register themselves, D6).
- No XML or property changes. Mouse and hover behavior stay as they were, with two deliberate changes:
    - opening the menu by click moves focus to the first item (APG menu button, D3);
    - when focus leaves the menu, the menu closes. This includes an item's action that takes focus (e.g. opens a dialog), for mouse and keyboard activation and whatever "Close on" says (D3).

**Non-Goals:**

- Horizontal (menubar) orientation. All levels are vertical menus, so Left/Right are reserved for submenus.
- Typeahead (first-letter navigation). This could be a follow-up via `useTypeahead`.
- Making non-focusable trigger content (e.g. a container without an action, Text, Image) keyboard-reachable, or opening the menu when trigger content stops event propagation (e.g. a button or container with its own On click action). This is the app developer's responsibility.
- Moving ARIA attributes onto the focused element inside the trigger content (see D2 limitation).
- **Interactive elements inside custom item content** (buttons, links, inputs, containers with their own On click action). They aren't part of arrow-key navigation, and Enter/Space on the item runs only the widget-level action (D4). Because the item is `role="menuitem"`, assistive technology treats them as presentational. They stay in the native Tab order: Tab from their item reaches them, and once focused they behave natively. This is a known limitation. Proper support (forwarding activation, or a separate popover content type) is possible future work.
- Changing the Atlas theme.

## Decisions

### D1. Trigger keyboard handling on the wrapper

**Assumption:** the trigger content is focusable and lets key events bubble to the `.popupmenu-trigger` wrapper. The widget doesn't inspect or modify the content. If the content stops propagation, the menu doesn't open (the same as with the mouse), and this is out of scope.

All handlers run in the **bubble** phase on the wrapper:

- `useClick(context, { enabled: trigger === "onclick", keyboardHandlers: false })`. Mouse clicks work as before, and `useClick`'s key handling (which drops `defaultPrevented`/`<button>` events) is off.
- **`PopupTrigger`'s `onKeyDown`, in both Click and Hover modes:**
    - Enter/Space: toggle the menu, ignoring `defaultPrevented` and the target tag. Content may prevent default for its own reasons (Mendix buttons always do).
    - Escape (menu open): close, keep focus (D5).
- **Arrow Down/Up are handled by `useListNavigation`** (D2). Its reference `onKeyDown` opens the menu on Arrow Down/Up (`openOnArrowKeyDown`, default `true`), doesn't check `defaultPrevented`, and records the key so that on open it focuses the first item (Arrow Down) or the last item (Arrow Up). It also records Enter/Space as the opening key, so the Enter/Space open focuses the first item. `useInteractions` runs the hook handlers and then the `onKeyDown` passed to `getReferenceProps`, so both run.
- **No double toggle:** content that _doesn't_ prevent default (e.g. a plain HTML button) still gets a browser-synthesized click (Enter: after keydown, Space: after keyup). Handling a key sets `keyboardActivationRef`. `usePopup` wraps `useClick`'s reference `onClick` and ignores a click with `detail === 0` while the ref is set. The ref is cleared on the next tick after keyup. Enter isn't prevented, so the content's own behavior is untouched.
- **Space scroll:** `preventDefault` on Space only when the target isn't a native button or typeable element.

- _Alternative: keep `useClick` keyboard handlers._ Rejected: they drop exactly the event Mendix sends (a `defaultPrevented` keydown on a `<button>`).
- _Alternative: capture-phase handlers, or making the wrapper focusable when content isn't._ Rejected: both work around trigger content, which we treat as a black box.

### D2. Menu semantics and roving tabindex via `useListNavigation`

- `useRole(context, { role: "menu" })` gives `role="menu"` on the floating element (labelled by the reference via `aria-labelledby`) and `aria-haspopup="menu"` / `aria-expanded` / `aria-controls` on the reference (the wrapper).
- **Known limitation:** the wrapper isn't the focused element, so screen readers may not announce the haspopup/expanded state when focus is on the trigger content. We accept this rather than modifying trigger content. It can be revisited separately (e.g. a Mendix platform-level solution).
- `useListNavigation(context, { listRef, activeIndex, onNavigate: setActiveIndex, loop: true, focusItemOnOpen: "auto", focusItemOnHover: false })` with Floating UI's `getItemProps`. It provides the roving tabindex, Up/Down, Home/End and wrap-around, plus opening from the trigger with Arrow Down/Up (D1). `focusItemOnHover: false` keeps hovering an item from moving focus.
- Each item is a `MenuItem` component. Its `<li>` registers in `listRef`, and list indices number items only. Dividers are plain `<li role="separator">` elements outside list navigation, so they need no `disabledIndices`. The first item is always index 0. When no item is active, the first item is the tab stop.
- `useRole` gives a nested menu's reference `role="menuitem"`. The nested trigger wrapper overrides it with `role: undefined`, since the parent `<li>` is the menuitem (D6).
- `activeIndex` state lives in `usePopup`. A reopened menu starts again from the first item.

This is the approach recommended by `docs/requirements/frontend-guidelines.md` (Floating UI hooks, roving tabindex).

- _Alternative: hand-rolled keydown handler on `<ul>`._ Rejected: it duplicates tested library logic, including focus management with `FloatingFocusManager`.

### D3. Focus placement, focus return and closing on focus-out

**Initial focus** is owned by `useListNavigation`, not `FloatingFocusManager` (`initialFocus={-1}`, so the two don't compete):

- Keyboard opening focuses the first item, or the last one for Arrow Up (`focusItemOnOpen: "auto"` with a recorded opening key).
- Click opening focuses the first item (APG menu button): the `useClick` wrapper from D1 sets `activeIndex` to the first item when it opens the menu.
- Hover opening and programmatic opening ("Menu toggle", e.g. at page load) don't move focus. `focusItemOnOpen: true` was rejected because it also steals focus on programmatic opening.

**Focus return:** `FloatingFocusManager`'s `returnFocus` is `returnFocusRef`. For a top-level menu, `usePopup` records `document.activeElement` when the menu opens (before list navigation moves focus), which is the focused element inside the trigger content. For a nested menu it's the parent item (D6). In v4.3.1 focus went back to the non-focusable wrapper `<div>` and was lost.

**Tab is not intercepted.** `FloatingFocusManager` is `modal={false}` and the menu is rendered right after the trigger in the DOM (no portal). With the roving tabindex, only one `<li>` per level is tabbable, so native Tab/Shift+Tab already reach the right element:

- Tab from the menu goes to the next focusable after the widget. Tab from the trigger of a hover-opened menu enters the menu.
- Shift+Tab from the menu goes back to the previous focusable, which is the trigger content (or, in a submenu, the parent item or the nested trigger content).
- Focusables inside custom item content stay in the native Tab order (Non-Goals).

- _Alternative: intercept Tab/Shift+Tab and move focus ourselves._ Rejected: focusing the trigger and letting the native Tab continue from it gives different results in Chromium and Firefox. Closing everything and relying on `returnFocus` didn't reliably focus the trigger in real browsers. Computing the next tabbable element ourselves would need `tabbable` as a direct dependency for behavior native Tab already provides.
- _Alternative: set `tabindex=-1` on focusables inside custom content._ Rejected: it mutates Mendix-rendered DOM and is fragile across re-renders.

**Closing on focus-out** uses `FloatingFocusManager`'s `closeOnFocusOut` (library default, `true`). It reacts to the real `focusout` event and checks the whole `FloatingTree`, so:

- Tab past the widget closes every level.
- An item's action that takes focus (e.g. opens a dialog) closes the menu whenever that happens, even after an asynchronous microflow, regardless of `clickCloseOn`/`hoverCloseOn` and of input device.
- An action that doesn't move focus leaves the menu open, so "Close on: Click outside" keeps the menu open on activation.
- Focus moving within the tree (arrow navigation, opening the menu, entering or leaving a submenu) doesn't close anything.
- When focus goes to browser chrome or another window, `relatedTarget` is `null` and the menu stays open.

- _Alternative: an own `onBlur` that closes only after a Tab key press, to keep the menu open when an action opens a dialog._ Rejected: an action can be asynchronous, so there's no time window in which a "Tab was just pressed" flag reliably tells the two cases apart.

**Shift+Tab onto the trigger or a parent item.** `closeOnFocusOut` doesn't close when focus moves to the reference element, or to an element that contains the floating element. Shift+Tab hits both cases:

- from a top-level menu, focus lands on the trigger content, inside the reference;
- from a submenu, focus lands on the parent `<li>` (which contains the submenu `<ul>`) or on the nested trigger content.

Two `onFocus` handlers cover this. Both act only when focus comes from inside the floating element:

- `PopupTrigger`: when the menu is open and `relatedTarget` is inside it, close the menu. A nested trigger fires `close-all` instead.
- `MenuItem`: when the `<li>` itself gets focus from inside its open submenu, fire `close-all`. The check asks the submenu whether its `<ul>` contains `relatedTarget` (`handle.contains`) rather than reading the registered `isOpen`, which is updated only after a re-render and can lag behind a fast Shift+Tab.

So Shift+Tab from any level closes the whole hierarchy, and the root `returnFocus` puts focus on the root trigger, as APG requires.

Both handlers ignore focus caused by a mouse press (`useMouseDownRef`: set on `mousedown`, whose default action is the focus, and cleared on the next tick). Without that, clicking the trigger of an open click-opened menu would close it on focus and immediately reopen it on `click`.

### D4. Uniform item activation

Each `<li role="menuitem">` gets `onKeyDown` for Enter/Space (with `preventDefault` to stop scroll) that calls the same `activate` used by `onClick`. `activate` executes the item's action through `executeAction` (a no-op without an action; it checks `canExecute`), then applies `clickCloseOn`. Basic and custom items behave the same.

Custom item content is a black box: keyboard activation never reaches into it. A custom item without a widget-level action does nothing on Enter/Space apart from `clickCloseOn` (the same as clicking empty space in the item). See the Non-Goals limitation.

Keyboard activation that closes the menu returns focus to the trigger (D3). With "Close on: Click outside", activation doesn't close the menu and focus stays on the item, unless the action takes focus, in which case `closeOnFocusOut` closes the menu (D3).

"Close on" (`clickCloseOn`/`hoverCloseOn`) decides whether activating an item, by click or by Enter/Space, also closes the menu. Leaving the menu always closes it, whatever the setting. The property captions only mention clicking, so the Mendix docs (task 7.2) state that Enter/Space follows the same setting, and that an action that opens a dialog closes the menu regardless.

- _Alternative: forward activation (`.click()`) to the first interactive descendant of custom content._ Rejected for now: it needs DOM queries into Mendix-rendered content, can hit non-actionable or multiple elements, and still leaves them presentational under `menuitem`. Candidate for future work.
- _Alternative: for custom items without a widget action, don't make the `<li>` a menuitem and let inner focusables participate in Tab order._ Rejected: arrow navigation becomes inconsistent across items.

### D5. Escape closes the menu containing focus

`useDismiss(context, { escapeKey: false })` turns off the document-level Escape listener. Escape is handled in `onKeyDown` on the `<ul>` (focus in the menu → close that level, focus returns to the parent item or trigger) and in the D1 trigger key handler (focus on trigger → close, keep focus). Handled Escapes call `stopPropagation()`, and also stop the matching Escape **keyup** (`stopEscapeKeyUp`: a one-off capture listener on `document` that stops the next Escape keyup and removes itself):

- a nested menu closes only its own level;
- a Mendix pop-up page containing the widget doesn't close at the same time. The Mendix client closes pop-up pages on the Escape keyup, so stopping the keydown alone isn't enough.

An Escape the menu doesn't handle (e.g. the next one, with the menu closed) isn't stopped, so the pop-up page still closes on it.

With focus elsewhere on the page, Escape does nothing to the menu, so it never moves focus from an unrelated element. `outsidePress` dismissal (mouse) is unchanged.

- _Alternative: keep `useDismiss` Escape with `bubbles: false`._ Rejected: it listens on `document`, so it fires (and returns focus to the trigger) when the user is working elsewhere, and it competes with page-level Escape handlers.

### D6. Nested Pop-up Menus as keyboard submenus

A Pop-up Menu placed in a custom item's content renders as a child `FloatingNode` in the parent's `FloatingTree`, with its own trigger and menu inside the parent `<li>`.

- **Item ↔ submenu link:** every `MenuItem` provides a `MenuItemContext` with `itemRef` and `registerSubmenu(id, { open, contains, isOpen })`. A nested `PopupMenu` (`useFloatingParentNodeId() != null`) registers itself with the enclosing item. Only the first registered submenu is linked. The parent `<li>` then:
    - adds `aria-haspopup="menu"` / `aria-expanded`;
    - on Right Arrow / Enter / Space, calls the child's `open()` instead of the D4 activation. `open()` sets the child's `activeIndex` to its first item before opening, so its `useListNavigation` focuses that item in both "Open on" modes;
    - handles keys only when the `<li>` itself is the event target, so keys bubbling from the nested menu don't reach it.
- **Child behavior when nested:**
    - Left Arrow and Escape in the child `<ul>` close the child and focus the parent `<li>` (the child's `returnFocusRef` is the parent item).
    - Up/Down/Home/End are handled by the child's own `useListNavigation`, which stops propagation of handled keys, so the parent list doesn't move too.
- **Sibling auto-close:** when a nested menu opens, it emits `submenu-open` with `{ parentId, nodeId }` on the tree events. Every open menu with the same `parentId` and a different `nodeId` closes itself. This follows Floating UI's nested menu example and also covers pointer-opened submenus.
- **Closing the whole hierarchy:** a `close-all` tree event closes every level. It's fired on keyboard activation of a leaf with "Close on: Click anywhere" and on Shift+Tab out of a submenu (D3). Mouse activation inside a submenu closes only that level, as before. Tab past the widget and an action taking focus need no event: every level's `closeOnFocusOut` closes it.
- **Nested trigger in the tab order:** the nested trigger content sits inside the parent `<li>`. The parent item is the keyboard entry point, but the trigger content is also reachable by Tab like any other focusable in custom content, and activating it opens the submenu through `PopupTrigger`'s own handling.
- _Alternative: `useListNavigation({ nested: true })` for Right/Left Arrow._ Rejected: it assumes the parent `menuitem` _is_ the child's reference element, which isn't true here (the reference is the nested trigger wrapper).

### D7. Keep the DOM shape and class names

`ul.popupmenu-menu` / `li.popupmenu-basic-item` / `li.popupmenu-custom-item` / `li.popupmenu-basic-divider` keep their classes so Atlas and app-level theming are unaffected. Only attributes on the widget's own elements change (`role`, `tabindex`, `id`, `aria-*`).

## Risks / Trade-offs

- [`event.detail === 0` heuristic for suppressing the synthetic click] → Scoped to "a key press was just handled by D1" (ref cleared after keyup) rather than all `detail === 0` clicks, so programmatic clicks still work.
- [Interactive elements inside custom item content aren't keyboard-operable and are presentational to AT] → Accepted known limitation (Non-Goals). The Mendix docs state that keyboard users can only trigger the item's own On click action, and that advanced-mode content is announced as the menuitem's text.
- [`modal={false}` drops the focus trap after mouse open] → The previous trap was partial (focus guards with no tabbable content) and didn't help keyboard users. Non-modal is the APG behavior.
- [An action that takes focus now closes the menu under "Close on: Click outside", for mouse clicks too] → Intentional (Goals): leaving the menu always closes it. Stated in the changelog and the Mendix docs (task 7.2).
- [The Shift+Tab `onFocus` handlers depend on Floating UI's `closeOnFocusOut` exemptions] → Unit tests cover Shift+Tab from the top level and from a submenu (with non-focusable and focusable nested trigger), and clicking the trigger while focus is in the menu. A Floating UI upgrade that changes the exemptions shows up there.
- [Stopping the Escape keyup relies on the Mendix client closing pop-up pages on keyup in the bubble phase] → Verified in the test project and covered by an E2E test on a pop-up page. If the keyup never arrives (e.g. the window loses focus mid-press), the listener stays until the next Escape keyup and stops that one too: rare, and that Escape only fails to close a pop-up page once.
- [Nested Pop-up Menus are Mendix-rendered item content, so they link to their item (`aria-haspopup`, Right Arrow) a moment after the item renders] → A Right Arrow pressed in that moment does nothing. E2E tests wait for `aria-haspopup` before using a submenu.
- [Nested menus: bubbling key events reach the parent `<ul>`] → Handled keys in a child menu stop propagation. Unit tests assert the parent's active index is unchanged.
- [A custom item contains more than one nested Pop-up Menu] → Only the first registered submenu is linked to the item. The Mendix docs state that one submenu per item is supported for keyboard use.
- [Different widget versions nested (old child in new parent)] → Not possible within one app: one widget version per app.
- [Native Tab behavior across browsers] → Tab isn't intercepted, so its outcome is the browser's own. Verified by E2E in Chrome, Firefox and Safari (task 6.5).
- [Trigger content that isn't focusable or stops propagation won't open the menu from the keyboard] → Out of scope by design (D1 assumption). The Mendix docs state the requirement for trigger content.
- [Mendix changes Action Button key handling in a future runtime] → A unit test with a mock button that prevents default on Enter/Space (but propagates), plus an E2E test with a real no-action Action Button.
- [Focus indicator depends on the Atlas theme] → Atlas styles `:focus` on items. Verify 3:1 contrast. If it's insufficient, raise it with the Atlas team instead of overriding core classes in the widget.
- [Atlas styles items on `:focus`, not `:focus-visible`] → After a click opens the menu, the first item shows the focus/hover background. Accepted: it's Atlas styling and matches APG focus placement.

## Migration Plan

No migration needed: no XML or property changes. Ship as a patch/minor with a `Fixed` changelog entry. To roll back, revert the widget version.
