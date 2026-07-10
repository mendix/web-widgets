## Test Cases

<!--
Unit tests use Jest + RTL and mock `hooks/useFloatingMenu` via
`src/hooks/__mocks__/useFloatingMenu.ts` (the mock returns stable refs + a marker
style so specs don't depend on real layout). The real middleware behavior (flip,
size/shrink) is not exercisable in jsdom (no layout), so it is verified by e2e /
manual showcase rather than unit tests. Unit tests assert the WIRING and the
alwaysOpen bypass; e2e asserts the observable no-jump / shrink behavior.
-->

### Reproduction Tests

- Menu wiring uses floating-ui, not the old style hook - `useMenuStyle` is gone and the
  wrapper is positioned via floating refs (unit)
    - **Given**: `SingleSelection` rendered open with a mocked `useFloatingMenu`
    - **When**: component mounts and the menu opens
    - **Then**: the menu wrapper (`.widget-combobox-menu`) receives the floating ref and the
      `floatingStyles` from the hook; no import of `useMenuStyle` remains in the module graph

- Menu placement does not oscillate near the viewport bottom (e2e)
    - **Given**: a Combobox positioned so there is less space below than the menu's natural
      height, with enough options to fill the menu
    - **When**: the menu is opened and left open
    - **Then**: the menu settles in a single placement within one animation frame and its
      `top` (bounding rect) does not change across subsequent frames (no flip-flop)

- Menu does not jump when the option count changes while open (e2e)
    - **Given**: an open Combobox near the viewport bottom with a text filter
    - **When**: the user types to reduce, then clear, the number of matching options
    - **Then**: the menu re-anchors smoothly and does not flip between above/below the input

### Edge Cases

- Menu shrinks and scrolls instead of overflowing when space is tight (e2e)
    - **Given**: a Combobox with many options and limited space below it
    - **When**: the menu opens
    - **Then**: the menu height is capped to the available space (`maxHeight <= availableHeight`),
      the option list scrolls internally, and the menu bottom stays within the viewport
      (respecting the 8px padding)

- Menu width matches the input width (unit + e2e)
    - **Given**: a Combobox of a known input-container width, menu open
    - **When**: floating-ui's `size` middleware applies
    - **Then**: the menu wrapper width equals the reference (input container) width

- Menu header and footer remain visible when the menu shrinks (e2e)
    - **Given**: a Combobox configured with `menuHeaderContent` and `menuFooterContent`, in a
      tight space so the menu shrinks
    - **When**: the menu opens
    - **Then**: header and footer are both fully visible; only the option list scrolls; footer
      is not clipped below the fold

- Menu does not flash before it is positioned (e2e)
    - **Given**: a Combobox opened
    - **When**: the first render occurs before floating-ui reports `isPositioned`
    - **Then**: the menu is `visibility: hidden` until positioned (no visible jump-from-origin)

### Regression Tests

- alwaysOpen (`keepMenuOpen`) renders inline and does not use floating positioning (unit)
    - **Given**: `SingleSelection` and `MultiSelection` rendered with `keepMenuOpen`
    - **When**: the menu renders
    - **Then**: the wrapper style is `position: relative` (inline block), it does NOT carry the
      floating ref/`floatingStyles`, and `useFloatingMenu` is called with `open = false`

- MultiSelection wires floating identically to SingleSelection (unit)
    - **Given**: `MultiSelection` rendered open (not alwaysOpen)
    - **When**: it mounts
    - **Then**: reference ref is on the input container, floating ref + styles are on the menu
      wrapper — same contract as `SingleSelection`

- Lazy-loading scroll still works (unit)
    - **Given**: a Combobox with `lazyLoading` enabled and `hasMore` options, menu open
    - **When**: the option list is scrolled
    - **Then**: the `onScroll` handler fires and the `widget-combobox-menu-lazy-scroll` class is
      applied to the list — unchanged from current behavior

- Existing Single/Multi/Static selection specs pass with the new mock (unit)
    - **Given**: the existing `SingleSelection.spec`, `MultiSelection.spec`, `StaticSelection.spec`
    - **When**: run against the floating-ui implementation with `useFloatingMenu` mocked
    - **Then**: all previously-passing assertions still pass (menu render, item selection,
      open/close, a11y attributes)

## Notes

<!-- Track unexpected behaviors, additional edge cases found, test failures and resolutions. -->

- Real flip/shrink math is not unit-testable in jsdom (no layout engine). The no-jump and
  shrink outcomes are the reporter's core complaint, so they are covered by real Playwright
  e2e in `e2e/Combobox.spec.js` (stable `top` near the bottom edge, capped `maxHeight`, width
  == input) plus the manual showcase for Takuma / Ana.
- Transformed/`contain`/`filter` ancestor + `position: fixed` mis-anchoring is a known
  limitation (no portal this pass) — not covered by a test, documented in proposal.
