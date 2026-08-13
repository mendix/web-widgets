## Why

The Combobox dropdown menu jumps around while open (WC-3406). Opening the menu near the
bottom of the viewport, or changing the number of visible options (e.g. by typing to
filter), makes the menu flicker between rendering above and below the input instead of
settling in one place.

Reported by Roman Vyakhirev with a screen recording. The reporter also built a
proof-of-concept branch (`feat/combobox-better-menu`) migrating the menu to floating-ui,
which this change ports and hardens.

Expected: once open, the menu picks a stable placement (below the input by default, above
only when there genuinely isn't room) and does not oscillate when its content height
changes.

## Root Cause

Menu positioning is hand-rolled in `hooks/useMenuStyle.ts`. `getMenuPosition()` chooses
top-vs-bottom placement from the _measured_ menu height, and that same `menuHeight` is a
dependency of the positioning `useEffect`. So: place menu → height changes → effect
re-runs → placement recomputed from the new height → height changes again. The debounced
`setStyle` (32ms) only smears the oscillation over time; it does not remove the feedback
loop. There is also no re-anchoring on scroll/resize.

## What Changes

Replace the hand-rolled positioning with floating-ui (`@floating-ui/react`), following the
reporter's approach but resolving the edge cases his branch left open.

- **New dependency**: `@floating-ui/react` (`^0.26.27`) added to `combobox-web`.
- **New hook** `hooks/useFloatingMenu.ts`: `useFloating` with `strategy: "fixed"`,
  `placement: "bottom-start"`, `whileElementsMounted: autoUpdate`, and middleware
  `offset(4)` → `flip({ crossAxis: false, fallbackStrategy: "bestFit", padding: 8 })` →
  `size({ padding: 8, apply })`. `apply` sets the floating width to the reference width and
  caps `maxHeight` at `min(availableHeight, 320)`. Menu stays hidden until
  `isPositioned` to avoid a first-frame flash.
- **Delete** `hooks/useMenuStyle.ts` (and stop importing `usePositionObserver` / `debounce`
  for this purpose).
- **Wire floating refs** through `SingleSelection` / `MultiSelection` →
  `Single/MultiSelectionMenu` → `ComboboxMenuWrapper`: reference ref on the input
  container, floating ref + `floatingStyles` on the menu wrapper.
- **Height model (SCSS)**: `.widget-combobox-menu` becomes `display: flex; flex-direction:
column` and is the element floating-ui height-caps. `.widget-combobox-menu-list` changes
  from a hard `max-height: 320px` to `max-height: 100%; flex: 1; min-height: 0` so the list
  fills the wrapper and scrolls, while header/footer share the capped height. This is what
  makes the "shrink when space is tight" behavior work with header/footer present.
- **Strip stale wrapper CSS**: remove `position: absolute`, `display: inline`,
  `margin: 4px 0`, `width: 100%`, `left: unset` from `.widget-combobox-menu` - these fight
  the inline styles floating-ui writes (the `margin` in particular caused a residual
  offset). The 4px gap is preserved via `offset(4)`.
- **alwaysOpen (`keepMenuOpen`) unchanged in behavior**: this mode renders inline with
  `position: relative` and must NOT use floating positioning. Both selections call
  `useFloatingMenu(alwaysOpen ? false : isOpen)` and the wrapper attaches no floating ref /
  styles in the relative branch. (Fixes an inconsistency in the POC where Single passed
  `isOpen || keepMenuOpen` and Multi passed `isOpen`.)

## Impact

- **Widget**: `combobox-web` only. No public prop/XML changes — purely internal positioning
  and styling. Not breaking for app developers.
- **Behavior change (intended)**: near a viewport edge the menu now shrinks and scrolls
  rather than overflowing; default placement is below the input. This shrink behavior is
  the part the reporter flagged for design review — this branch is meant to be **shown to
  Takuma / Ana before merge**, not merged blind.
- **Must NOT break**:
    - `keepMenuOpen` / alwaysOpen inline rendering.
    - Menu width still matches the input width.
    - Lazy-loading scroll (`widget-combobox-menu-lazy-scroll`) and its scroll handler.
    - Menu header/footer content still visible and not clipped when the menu shrinks.
    - Existing Single/Multi/Static selection unit tests (updated to mock `useFloatingMenu`).
- **Known limitations (documented, out of scope)**:
    - No React portal — with `position: fixed`, a transformed/filtered/`contain` ancestor can
      still mis-anchor the menu. Same vulnerability as the old code; not a regression.
    - No `shift` middleware (width is pinned to the anchor, so horizontal overflow can't
      occur in practice).
    - RTL menu _placement_ is handled for free by `bottom-start`; pre-existing RTL item
      styling (`margin-right`) is left untouched.
