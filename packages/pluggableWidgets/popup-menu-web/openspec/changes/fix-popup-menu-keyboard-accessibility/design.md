## Context

The Pop-up Menu (v4.3.1) is built on `@floating-ui/react@0.26.28`:

- `usePopup` combines `useClick` (click mode), `useHover` (hover mode), `useDismiss` and `useRole(context)` (defaults to `role="dialog"`).
- `PopupTrigger` renders a non-focusable `<div class="popupmenu-trigger">` around the user's trigger content (typically a Mendix Action Button or a container). Reference props from `getReferenceProps` go on this wrapper, so keyboard events only reach it by bubbling from the focused inner element.
- `Menu` renders `<FloatingFocusManager>` → `<ul class="popupmenu-menu">` → `<li onClick>` items. Items have no role, no `tabIndex` and no key handlers.

A jsdom investigation with `@testing-library/user-event` (scratch test, not committed) showed:

| Trigger content                               | Enter | Space | Arrow Down |
| --------------------------------------------- | ----- | ----- | ---------- |
| native `<button>`                             | opens | opens | no-op      |
| `<div tabIndex=0 role=button>`                | opens | opens | no-op      |
| element calling `preventDefault` on keydown   | no-op | no-op | no-op      |
| `<button>` calling `stopPropagation` on click | no-op | no-op | no-op      |

In every case where the menu opened, focus stayed on the trigger, `<ul>` had `role="dialog" tabindex="0"` and the `<li>` items weren't focusable. So after opening, Tab lands on the popup container and the items are unreachable.

**Mendix Action Button source (confirmed):** `onKeyDown` for Enter/Space always calls `preventDefault()`, and `stopPropagation()` only when the button has an action. For a trigger button without an action, the keydown therefore reaches the wrapper with `defaultPrevented = true` and a `BUTTON` target, and no native click is synthesized.

This explains why the mouse opens the menu but Enter doesn't. The keydown reaches `useClick`, which drops it twice: `defaultPrevented` and `isButtonTarget`. The native click it relies on is never synthesized because Mendix prevented it.

The Atlas theme (`_pop-up-menu.scss`) already defines `:focus` styles for `.popupmenu-basic-item` and `.popupmenu-custom-item`, so no widget SCSS is needed.

## Goals / Non-Goals

**Goals:**

- Follow the WAI-ARIA APG Menu Button + Menu patterns (vertical menus) for opening, closing, navigating and activating:
    - roving tabindex, Up/Down/Home/End per menu level, visible focus indicator;
    - Right Arrow/Enter/Space open a submenu, Left Arrow/Escape close one level and return focus to the parent item, one open submenu per level;
    - Tab/Shift+Tab exit and close all menus (handled by detecting, not driving, the focus move — see D3); Escape closes the menu containing focus, with focus on the trigger also counting (see D5).
- The same keyboard behavior for basic items and custom items: every item is a focusable `menuitem`, and activation runs the widget-level On click action.
- Treat trigger content as a black box: no inspection, attribute changes or workarounds for it. We assume the content is focusable and lets key events propagate to the trigger wrapper (see D1).
- Treat custom item content as a black box too. The widget renders it as-is and doesn't look inside it (apart from nested Pop-up Menus, which register themselves, see D6).
- No change to mouse/hover behavior, XML or public properties, **except**: an item's action that steals focus (e.g. opens a dialog) now closes the menu even under "Close on: Click outside"/"Click outside" (hover), for both mouse and keyboard activation — see D3/D4. This one case was previously preserved as-is; revised deliberately once keyboard support made the underlying "did focus leave the menu" mechanism (`closeOnFocusOut`) something we need regardless, and it doesn't distinguish input device.

**Non-Goals:**

- Horizontal (menubar) orientation. All levels are vertical menus, so Left/Right are reserved for submenus.
- Typeahead (first-letter navigation). This could be a follow-up via `useTypeahead`.
- Making non-focusable trigger content (e.g. a container without an action, Text, Image) keyboard-reachable, or opening the menu when trigger content stops event propagation (e.g. a button or container with its own On click action). This is the app developer's responsibility.
- Moving ARIA attributes onto the focused element inside the trigger content (see D2 limitation).
- **Interactive elements inside custom item content** (buttons, links, inputs, containers with their own On click action) aren't arrow-key navigable, and Enter/Space _on the item itself_ only runs the widget-level action (D4) — they're presentational to assistive technology, since the item is `role="menuitem"`. They are, incidentally, still reachable one at a time by Tab once their containing item has roving-tabindex focus (D3 no longer blocks Tab), and once focused directly they get their own native behavior (e.g. Enter on a real `<button>` triggers its own click, not the item's action) — but there's no keyboard path to give such an item roving-tabindex focus other than arrowing to it first, and nothing makes them stand out to assistive technology as separately operable. This is still a **known limitation**, just a narrower one than before. Supporting interactive item content properly (e.g. forwarding activation or a separate "custom popover" content type) is possible future work.
- Changing the Atlas theme.

## Decisions

### D1. Trigger keyboard handling on the wrapper

**Assumption:** the trigger content is focusable and lets key events bubble to the `.popupmenu-trigger` wrapper. The widget doesn't inspect or modify the content. If the content stops propagation, the menu doesn't open (the same as with the mouse today), and this is out of scope.

All handlers run in the **bubble** phase on the wrapper:

- `useClick(context, { enabled: trigger === "onclick", keyboardHandlers: false })`. Mouse clicks keep today's behavior, and `useClick`'s key handling (which drops `defaultPrevented`/`<button>` events) is off.
- **Our `onKeyDown` on the wrapper, in both Click and Hover modes:**
    - Enter/Space: toggle the menu, ignoring `defaultPrevented` and the target tag. Content may prevent default for its own reasons (Mendix buttons always do).
    - Escape (menu open): close, keep focus (D5).
    - Record `document.activeElement` at open time for D3.
- **Arrow Down/Up are not handled by us.** `useListNavigation`'s reference `onKeyDown` (D2) already opens the menu on Arrow Down/Up (`openOnArrowKeyDown` defaults to `true`), doesn't check `defaultPrevented`, and records the key so that on open it focuses the first item (Arrow Down) or the last item (Arrow Up). It also records Enter/Space as the opening key, so our Enter/Space open gets first-item focus for free. `useInteractions` merges hook handlers first and the user-passed `onKeyDown` last on the same element, so both run.
- **No double toggle:** content that _doesn't_ prevent default (e.g. a plain HTML button) still gets a browser-synthesized click (Enter: after keydown, Space: after keyup). After handling a key we set a `keyboardActivation` ref. The reference `onClick` ignores the next click with `detail === 0` while the ref is set, and the ref is cleared on keyup + next tick. We don't call `preventDefault` on Enter, so the content's own behavior is untouched.
- **Space scroll:** call `preventDefault` on Space only when the target isn't a native button or typeable element.

- _Alternative: keep `useClick` keyboard handlers._ Rejected: they drop exactly the event Mendix sends (a `defaultPrevented` keydown on a `<button>`).
- _Alternative: capture-phase handlers, or making the wrapper focusable when content isn't._ Rejected: both work around trigger content, which we treat as a black box.

### D2. Menu semantics and roving tabindex via `useListNavigation`

- `useRole(context, { role: "menu" })` gives `role="menu"` on the floating element (labelled by the reference via `aria-labelledby`) and `aria-haspopup="menu"` / `aria-expanded` / `aria-controls` on the reference (the wrapper).
- **Known limitation:** the wrapper isn't the focused element, so screen readers may not announce the haspopup/expanded state when focus is on the trigger content. We accept this rather than modifying trigger content. It can be revisited separately (e.g. a Mendix platform-level solution).
- `useListNavigation(context, { listRef, activeIndex, onNavigate: setActiveIndex, loop: true, focusItemOnOpen: "auto", focusItemOnHover: false })` with Floating UI's `getItemProps`. `focusItemOnHover: false` keeps mouse behavior as before: hovering an item doesn't move focus. This provides the roving tabindex, Up/Down, Home/End and wrap-around (all built into `useListNavigation` in 0.26.28), plus opening from the trigger with Arrow Down/Up (D1).
- `listRef` stores only item `<li>` elements; list indices number items only. Dividers are plain `<li role="separator">` elements outside list navigation, so they need no registration and no `disabledIndices`. The first item is always index 0.
- `useRole` gives a nested menu's reference `role="menuitem"`. The nested trigger wrapper overrides it with `role: undefined`, since the parent `<li>` is the menuitem (D6).
- `activeIndex` state lives in `usePopup` and is reset to `null` on close.

This is the approach recommended by `docs/requirements/frontend-guidelines.md` (Floating UI hooks, roving tabindex).

- _Alternative: hand-rolled keydown handler on `<ul>`._ Rejected: it duplicates tested library logic, including focus management with `FloatingFocusManager`.

### D3. Initial focus and focus return

- Initial focus is owned by `useListNavigation`, not `FloatingFocusManager` (use `initialFocus={-1}` so the two don't compete). With a recorded opening key it focuses the first enabled item, or the last one for Arrow Up.
- `focusItemOnOpen: "auto"` in both modes: keyboard opening focuses an item (the opening key is recorded), while hover and programmatic opening ("Menu toggle" at page load) don't move focus. `true` was rejected because it also focuses the first item on programmatic opening, which steals focus on page load.
- Click opening focuses the first item (APG menu button): `usePopup` wraps `useClick`'s reference `onClick` and, when it opens the menu, sets `activeIndex` to the first enabled item. `useListNavigation` then focuses it. The same wrapper implements the D1 synthetic-click guard.
- `modal={false}`, and `closeOnFocusOut` is left at its library default (`true`) rather than overridden — see the dedicated point below. The menu is rendered in the DOM right after the trigger (no portal), so Tab from the trigger naturally lands on the item with `tabIndex=0`. That lets keyboard users reach a hover-opened menu.
- **Shift+Tab back to the trigger needs one small explicit handler, not just `closeOnFocusOut`.** `closeOnFocusOut`'s internal check explicitly excuses focus landing on the popup's own reference element (`contains(domReference, relatedTarget)` short-circuits before it ever calls `onOpenChange`) — this is correct for Floating UI's own intended combobox-style patterns, where focus legitimately bounces between reference and floating content, but wrong for a menu button, where Shift+Tab leaving the last/only tabbable item and landing back on the trigger means the user is leaving the menu, not returning to a still-open interaction. Since there's no portal, the trigger is exactly the previous tabbable element before the menu, so this is the common case, not an edge case. `PopupTrigger` gets a small `onFocus` (via `getReferenceProps`) that closes the menu when it's currently open and `event.relatedTarget` is inside the floating element (`refs.floating.current.contains(...)`) — i.e. focus was just in the menu and is now on the trigger. This doesn't fire for other ways the trigger can receive focus while open (e.g. a test or app code calling `.focus()` directly, or the trigger regaining focus after `closeOnFocusOut`/Escape already closed the menu), since those don't have a `relatedTarget` inside the floating element. It also ignores focus caused by a mouse press (a `mouseDownRef` set on `mousedown`, whose default action is the focus, and reset on the next tick): otherwise clicking the trigger to close a click-opened menu (focus is on the first item) would close it on `mousedown`'s focus and then reopen it on the `click` toggle.
- **The same applies one level down, inside nested menus (D6).** A submenu's `<ul>` is rendered _inside_ the parent `<li>`, and `closeOnFocusOut` also excuses focus landing on an element that contains the floating element. So Shift+Tab from a submenu item, which natively lands on the previous tabbable element (the parent `<li>`, which still has the roving `tabIndex=0`, or the nested trigger content if it's focusable), would leave the submenu open, with two tab stops (parent item and submenu item) the user can cycle between. Following APG ("Tab/Shift+Tab exit and close all menus", Goals), both cases close the whole hierarchy with `close-all`, and the root `FloatingFocusManager`'s `returnFocus` puts focus on the root trigger, just as Shift+Tab from a top-level item does:
    - the parent `MenuItem` gets an `onFocus` that fires `close-all` when the `<li>` itself receives focus from inside it (`relatedTarget` contained in the `<li>`) while its registered submenu is open;
    - the nested `PopupTrigger`'s `onFocus` (above) fires `close-all` instead of closing only its own level.

    Both use the same mouse-press guard, so clicking a submenu's trigger still just toggles it.

- **Tab is not intercepted.** The roving tabindex means only one `<li>` per level is ever tabbable, so with no portal (the menu is a plain DOM sibling right after the trigger, in visual/document order) the browser's native Tab/Shift+Tab already lands on the right element by itself: forward goes past the whole hierarchy to the next focusable after the widget, Shift+Tab goes back to the trigger (it's the previous tabbable before the menu). Two earlier attempts at orchestrating this ourselves were both abandoned as unreliable in real-browser testing:
    - _Attempt 1:_ `preventDefault` on Shift+Tab, explicitly focus the trigger first, and let plain Tab's native default action continue from there. Worked in Chromium, not in Firefox (confirmed by manual testing) — the two engines don't agree on the exact point at which the currently-focused element is read for computing the native Tab destination relative to synchronous focus/DOM changes made in the handler.
    - _Attempt 2:_ `preventDefault` on both, close the whole hierarchy, and let `FloatingFocusManager`'s `returnFocus` put focus back on the trigger (the same mechanism Escape already used correctly). Worked in unit tests but not confirmed in real-browser (Playwright) testing — the trigger didn't reliably end up focused.
    - Rejected fallback (considered during attempt 1, not pursued for either): compute "the next tabbable element after the trigger" ourselves, the way Floating UI's own focus guards do internally (via the `tabbable` package), and focus it directly instead of relying on any browser default action or library restore. Not pursued: needs a new direct dependency (`tabbable` is currently only transitive, via `@floating-ui/react`) for behavior the native, unintercepted Tab already gives us for free.
    - _Alternative: set `tabindex=-1` on focusables inside custom content._ Rejected: it mutates Mendix-rendered DOM and is fragile across re-renders.
- **Closing on focus-out uses `FloatingFocusManager`'s own `closeOnFocusOut` (default `true`), not hand-rolled tracking.** Not intercepting Tab means the menu doesn't close by itself when Tab moves focus away, so something still has to detect that. A third attempt did this by hand — an `onBlur` on the root, closing when focus landed outside it, gated by a `tabPressedRef` set on a Tab keydown and cleared on the next tick, specifically so it wouldn't _also_ fire when an item's action opened a dialog that stole focus (the D3 note this replaced said that case should never close the menu, mirroring the pre-keyboard-support behavior). That gate turned out to be solving the wrong problem: an action can be asynchronous (a microflow calling out to the server before it opens a dialog), so any short-lived "did a relevant key/action just happen" ref can miss a focus-steal that arrives after the ref was cleared — there's no reliable window to time it against. The only robust option is to react to the real `focusout` event whenever it actually happens, which is exactly what `closeOnFocusOut` already does, tree-aware (checks ancestor and child nodes in the `FloatingTree`, so nested submenus close correctly with no explicit `close-all` needed for this case), with no timing window to get wrong. So the hand-rolled `tabPressedRef`/`onBlur` mechanism is removed, and `closeOnFocusOut` is simply left at its default:
    - Forward Tab-out (past the whole hierarchy, to the next focusable after the widget): native focus move lands outside the tree → `closeOnFocusOut` fires → closes. No custom code.
    - Shift+Tab back to the trigger: `closeOnFocusOut` doesn't fire (see the dedicated point above) → `PopupTrigger`'s small `onFocus` handler closes it instead. From a submenu, the parent item's or nested trigger's `onFocus` closes the whole hierarchy (see above).
    - An item's action doesn't move focus (no-op, or a change that doesn't steal focus): nothing to detect, no `focusout` event fires, menu stays open. This is what "Close on: Click outside" (mouse or keyboard) actually protects, and it falls out naturally rather than needing an explicit check.
    - An item's action steals focus (opens a dialog, however long that takes to happen): `closeOnFocusOut` fires when it happens, however much later, closing the menu regardless of `clickCloseOn`/`hoverCloseOn` — this is the Goals-section revision, and it applies to both keyboard and mouse activation, since `closeOnFocusOut` doesn't know which one triggered the action. Previously this case never closed the menu (D3 used to override `closeOnFocusOut` to `false` specifically to preserve that, "as before"); this change intentionally revises it.
    - Focus moving within the tree (arrow-key navigation between items, trigger→first-item on open, entering/leaving a submenu) is correctly recognized as staying inside and never triggers a close — this is the same tree-aware check, not something we need to special-case.
    - Side effect, not a design goal: a focusable descendant inside custom item content (previously unreachable, see the Non-Goals limitation) is now reachable by Tab once its containing item has roving-tabindex focus, since we no longer block Tab from entering it. Arrow-key navigation still only moves between `<li>` items, not into their content.
- `returnFocus` is set to the element that had focus when the menu opened (`document.activeElement` recorded at open time, by D1 for keyboard or on click for mouse). Today it returns to the non-focusable wrapper `<div>`, so focus is lost. No DOM queries on the trigger content.

### D4. Uniform item activation

Each `<li role="menuitem">` gets `onKeyDown` for Enter/Space (with `preventDefault` to stop scroll) that calls the same `activate(item)` used by `onClick`: `executeAction(item.action)` (a no-op without an action; it already checks `canExecute`), then apply `clickCloseOn`. This is exactly what a mouse click on the `<li>` does today, so basic and custom items behave the same.

Custom item content is a black box: keyboard activation never reaches into it. A custom item without a widget-level action does nothing on Enter/Space apart from `clickCloseOn` (the same as clicking empty space in the item). See the Non-Goals limitation.

Keyboard activation that closes the menu returns focus to the trigger (D3). With "Close on: Click outside", the menu keeps `clickCloseOn`/`hoverCloseOn` from closing it directly on activation, but it's not exempt from closing altogether: if the action's own effect steals focus, `closeOnFocusOut` (D3) closes it anyway, the same as it would for a mouse click. Focus stays on the item only when the action doesn't move focus.

**Why a "click" property governs a keyboard action at all:** `clickCloseOn`/`hoverCloseOn` don't really describe two different closing _triggers_ named after a mouse action — they describe whether interacting with an item (click or Enter/Space; D4 makes activation call the exact same `activate()`/`executeAction()` either way, so it's one thing regardless of input device) _also_ closes the menu, on top of leaving the menu closing it regardless. "Leaving the menu altogether" was already unconditional for mouse (a real outside click always closes it, whichever value is set) and is now unconditional for keyboard too, and for an item's action stealing focus either way (D3's `closeOnFocusOut`) — none of those check `clickCloseOn`/`hoverCloseOn`. So there was never a keyboard equivalent needed for "outside" as a _setting_ — only "activating an item" needed one, and it already had a value to reuse since activation is unified with click. The property's caption/enum wording (written before keyboard support existed) still only says "click," which undersells this; worth a one-line mention in the Mendix docs update (task 7.2) that Enter/Space on an item follows the same "Close on" choice as clicking it, and that an action which opens a dialog closes the menu regardless of that choice.

- _Alternative: forward activation (`.click()`) to the first interactive descendant of custom content._ Rejected for now: it needs DOM queries into Mendix-rendered content, can hit non-actionable or multiple elements, and still leaves them presentational under `menuitem`. Candidate for future work.
- _Alternative: for custom items without a widget action, don't make the `<li>` a menuitem and let inner focusables participate in Tab order._ Rejected: arrow navigation becomes inconsistent across items, which is exactly the problem this change fixes.

### D5. Escape closes the menu containing focus

`useDismiss(context, { escapeKey: false })` turns off the document-level Escape listener. Escape is handled in `onKeyDown` on the `<ul>` (focus in the menu → close that level, return focus to the parent item or trigger) and in the D1 trigger key handler (focus on trigger → close, keep focus). Handled Escapes call `stopPropagation()`:

- a nested menu closes only its own level;
- a Mendix pop-up page containing the widget doesn't close at the same time.

With focus elsewhere on the page, Escape does nothing to the menu, so it never moves focus from an unrelated element. `outsidePress` dismissal (mouse) is unchanged.

- _Alternative: keep `useDismiss` Escape with `bubbles: false`._ Rejected: it listens on `document`, so it fires (and returns focus to the trigger) when the user is working elsewhere, and it competes with page-level Escape handlers.

### D6. Nested Pop-up Menus as keyboard submenus

Nesting already exists: a Pop-up Menu placed in a custom item's content renders as a child `FloatingNode` in the parent's `FloatingTree`, with its own trigger and menu inside the parent `<li>`.

- **Item ↔ submenu link:** `Menu` wraps each custom `<li>` in a new `MenuItemContext` exposing `registerSubmenu({ open, close, isOpen })`. A nested `PopupMenu` finds that context (and `useFloatingParentNodeId() != null`) and registers itself. The parent `<li>` then:
    - adds `aria-haspopup="menu"` / `aria-expanded`;
    - on Right Arrow / Enter / Space, calls the child's `open()` instead of the D4 activation. `open()` sets the child's `activeIndex` to its first enabled item before opening, so its `useListNavigation` focuses that item in both "Open on" modes.
    - handles keys only when the `<li>` itself is the event target, so keys bubbling from the nested menu don't reach it.
- **Child behavior when nested:**
    - Left Arrow and Escape in the child `<ul>` close the child and focus the parent `<li>` (the child's `returnFocus` target is the parent item, not its own trigger wrapper).
    - Up/Down are handled by the child's own `useListNavigation`. The handled key events call `stopPropagation()` so the parent list doesn't move too (DOM nesting means events bubble into the parent `<ul>`).
- **Sibling auto-close:** when a menu opens, it emits `tree.events.emit("submenu-open", { parentId, nodeId })` via `useFloatingTree()`. Every open menu with the same `parentId` and a different `nodeId` closes itself, and its descendants close via their own parent-close handling. This is the pattern used in Floating UI's nested menu example and also covers pointer-opened submenus.
- **Closing the whole hierarchy on keyboard activation with "Click anywhere":** emits `tree.events.emit("close-all")`, handled by every node. Mouse activation inside a submenu keeps today's behavior (only that level closes). (Tab-out and an action stealing focus don't need this event at all: every level's own `closeOnFocusOut` — D3 — independently detects that same external focus loss and closes itself, since the tree-aware check treats "outside every node in the tree" the same regardless of which level noticed first.)
- **Nested trigger in the tab order:** the nested menu's trigger (e.g. a Mendix button) sits inside the parent `<li>`. The parent `<li>` is the primary keyboard entry point (Right Arrow/Enter/Space open the submenu without needing to reach the trigger at all), but since D3 no longer intercepts Tab, the trigger element itself is also individually reachable by Tab like any other focusable descendant of custom content — reaching and activating it opens the submenu too, since `PopupTrigger`'s own key/click handling doesn't depend on the outer roving-tabindex system.
- _Alternative: use `useListNavigation({ nested: true })` built-in Left-Arrow handling._ Partially adopted for the child's own list. Floating UI's built-in Right-Arrow opening assumes the parent `menuitem` _is_ the child's reference element, which isn't true here (the reference is the nested trigger wrapper), so we use the explicit registration above.

### D7. Keep the DOM shape and class names

`ul.popupmenu-menu` / `li.popupmenu-basic-item` / `li.popupmenu-custom-item` / `li.popupmenu-basic-divider` keep their classes so Atlas and app-level theming are unaffected. Only attributes on the widget's own elements change (`role`, `tabindex`, `id`, `aria-*`).

## Risks / Trade-offs

- [`event.detail === 0` heuristic for suppressing the synthetic click] → Scope it to "a key press was just handled by D1" (ref flag cleared on keyup / next tick) rather than all `detail === 0` clicks, so programmatic clicks still work.
- [Interactive elements inside custom item content aren't keyboard-operable and are presentational to AT] → Accepted known limitation (Non-Goals). Document in the Mendix docs Pop-up Menu page that keyboard users can only trigger the item's own On click action, and that advanced-mode content is announced as the menuitem's text.
- [Apps that today rely on Tab reaching a Link/Button inside custom content] → Not lost: D3 ended up not intercepting Tab at all, so that path (which today only works by accident, via tabbing into a mouse-opened menu) keeps working, and is now reachable from a keyboard-opened menu too.
- [`modal={false}` changes the current focus-trap behavior after mouse open] → Current trapping is only partial (focus guards with no tabbable content), and it doesn't work for keyboard users. Non-modal is the APG behavior.
- [Nested menus: bubbling key events reach the parent `<ul>`] → Every handled key in a child menu calls `stopPropagation()`. Unit tests assert the parent's active index is unchanged.
- [A custom item contains more than one nested Pop-up Menu] → Only the first registered submenu is linked to the item. Document in the Mendix docs that one submenu per item is supported for keyboard use.
- [Different widget versions nested (old child in new parent)] → Not possible within one app: one widget version per app.
- [Two attempts at hand-rolling Tab's exit behavior both proved unreliable across real browsers — see D3's attempt 1 (Chromium-only) and attempt 2 (didn't reproduce in Playwright)] → Resolved by not hand-rolling it at all: Tab isn't intercepted, so the outcome is native, unsimulated browser behavior in every browser by construction. Still to verify via E2E once the test project is available (task 6.5).
- [A third attempt hand-rolled focus-out detection too (an `onBlur` gated by a `tabPressedRef`), specifically to avoid closing the menu when an item's action stole focus] → Replaced by leaving `closeOnFocusOut` at its library default (`true`) instead of overriding it to `false`. The gate couldn't work correctly anyway: it assumed the action's effect on focus would arrive within a short, timeable window, but the action can be asynchronous (a microflow round-trip before a dialog opens), and there's no reliable window to clear the ref against. This is also what motivated actually revising the "stays open" behavior (see next item) rather than working around it.
- [Revising `closeOnFocusOut` to its default closes the menu whenever any action steals focus, including from a **mouse** click, under "Close on: Click outside" — a behavior change beyond keyboard, previously preserved deliberately (see Goals)] → Accepted as intentional: "all bets are off" once something deliberately steals focus, regardless of which input device triggered the action, is the more coherent rule, and matches how "Close on: Click outside" already behaves for a literal outside click (unconditional either way). Document in the Mendix docs update (task 7.2).
- [`onBlur`-equivalent's `relatedTarget` is `null` when focus goes to browser chrome, another window/tab, or is simply cleared] → `closeOnFocusOut`'s own internal check requires a truthy `relatedTarget` before closing, so the menu stays open in that case (not something we need to handle ourselves).
- [`closeOnFocusOut` alone doesn't close on Shift+Tab back to the trigger, since Floating UI explicitly excuses focus landing on the popup's own reference element] → Caught by unit tests once written (not by the earlier browser-only mismatches this section otherwise documents). Fixed with one small, targeted `onFocus` handler on `PopupTrigger` (D3) rather than reopening the Tab-interception question — the forward-Tab and focus-steal cases are still handled entirely by `closeOnFocusOut`.
- [The same exemption applies to nested menus, since a submenu is rendered inside its parent `<li>`: Shift+Tab from a submenu left it open on top of the parent item, giving two tab stops to cycle between (found in manual testing)] → The parent `MenuItem` and the nested `PopupTrigger` close the whole hierarchy on that focus move (D3), matching APG. Covered by unit tests for both a non-focusable and a focusable nested trigger.
- [Closing on focus moving onto the trigger also fired on a mouse press, since `mousedown` focuses the trigger before `click` toggles: clicking the trigger to close a click-opened menu closed and immediately reopened it] → The `onFocus` handlers ignore focus caused by a mouse press (D3). Covered by a unit test.
- [Trigger content that isn't focusable or stops propagation won't open the menu from the keyboard] → Out of scope by design (D1 assumption). The Mendix docs state the requirement for trigger content.
- [Mendix changes Action Button key handling in a future runtime] → A unit test with a mock button that prevents default on Enter/Space (but propagates), plus an E2E test with a real no-action Action Button.
- [Focus indicator depends on the Atlas theme] → Atlas styles `:focus` on items. Verify 3:1 contrast. If it's insufficient, raise it with the Atlas team instead of overriding core classes in the widget.
- [Snapshot churn] → Expected. Review snapshot diffs for only role/tabindex/aria changes.

## Migration Plan

No migration needed: no XML or property changes. Ship as a patch/minor with a `Fixed` changelog entry. To roll back, revert the widget version.
