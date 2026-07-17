## 1. Test Setup

<!-- RED: Write failing tests / add the mock first -->

- [x] 1.1 Add `@floating-ui/react` (`^0.26.27`) to `combobox-web` package.json dependencies
- [x] 1.2 Add `src/hooks/__mocks__/useFloatingMenu.ts` returning stable `refs.setReference` /
      `refs.setFloating`, a marker `floatingStyles`, and `isPositioned: true`
- [x] 1.3 Write failing unit test: `SingleSelection` open → menu wrapper gets the floating ref +
      `floatingStyles`; `useMenuStyle` no longer imported
- [x] 1.4 Write failing unit test: `MultiSelection` wires floating identically to Single
- [x] 1.5 Test alwaysOpen bypass: wrapper `position: relative`, floating ref NOT attached, floating
      styles ignored — via `ComboboxMenuWrapper.spec.tsx` (keepMenuOpen isn't wired to runtime
      `Combobox` props, so the presentational wrapper is the correct public interface to test)
- [x] 1.6 Regression: lazy-loading `onScroll` + `widget-combobox-menu-lazy-scroll` covered by the
      existing (still-passing) lazy-loading specs

## 2. Implementation

<!-- GREEN: Make tests pass with minimal code -->

- [x] 2.1 Create `src/hooks/useFloatingMenu.ts`: `useFloating` with `strategy: "fixed"`,
      `placement: "bottom-start"`, `whileElementsMounted: autoUpdate`, middleware
      `offset(4)` → `flip({ crossAxis: false, fallbackStrategy: "bestFit", padding: 8 })` →
      `size({ padding: 8, apply })`; `apply` sets width = reference width and
      `maxHeight = min(availableHeight, 320)`; hide until `isPositioned`
- [x] 2.2 `ComboboxMenuWrapper`: accept `floatingRef` + `floatingStyles`; apply on the
      `.widget-combobox-menu` div; alwaysOpen branch keeps `position: relative`, no floating ref
- [x] 2.3 Thread props through `SingleSelectionMenu` / `MultiSelectionMenu`
- [x] 2.4 `SingleSelection` + `MultiSelection`: call `useFloatingMenu(alwaysOpen ? false : isOpen)`,
      set `refs.setReference` on `ComboboxWrapper`, pass `refs.setFloating` + `floatingStyles`
      to the menu (consistent across both — fixes the POC Single/Multi inconsistency)
- [x] 2.5 `ComboboxWrapper`: already `forwardRef` — confirm reference ref lands on the
      input container div

## 3. Refactoring / Cleanup

<!-- REFACTOR: Clean up while keeping tests green -->

- [x] 3.1 Delete `src/hooks/useMenuStyle.ts`; remove now-dead `usePositionObserver` / `debounce`
      usage for menu positioning
- [x] 3.2 SCSS `.widget-combobox-menu`: remove `position: absolute`, `display: inline`,
      `margin: 4px 0`, `width: 100%`, `left: unset`; add `display: flex; flex-direction: column`
- [x] 3.3 SCSS `.widget-combobox-menu-list`: `max-height: 320px` → `max-height: 100%; flex: 1;
min-height: 0` so the list fills + scrolls within the (shrunk) wrapper
- [x] 3.4 SCSS `.widget-combobox-menu`: add `overflow: hidden`, remove the top `padding` and the
      `.widget-combobox-menu-list:last-child` `margin-bottom` so the inner scroll shadow is
      clipped to the rounded wrapper and no longer has a ~1px top/bottom offset when shrunk

## 4. Verification

- [x] 4.1 All new + updated unit tests pass (`SingleSelection`, `MultiSelection`,
      `StaticSelection` specs green with the mock) — 28 passed, 5 snapshots regenerated
- [x] 4.2 Full `combobox-web` test suite passes; lint clean (touched files: no issues);
      snapshots updated
- [x] 4.3 Add Playwright e2e in `e2e/Combobox.spec.js`: menu `top` stable while open,
      height capped + within viewport when space is tight, menu width == input width
      (run against the live test project — not runnable in this env)
- [x] 4.4 Add CHANGELOG.md entry under `## [Unreleased] > ### Fixed` + `### Changed`

## Notes

- Real flip/shrink math is not unit-testable in jsdom — covered by 4.3 (e2e/manual), not units.
- Known limitation (no portal): `position: fixed` inside a transformed/`contain`/`filter`
  ancestor can mis-anchor. Same as old code; documented in proposal, not fixed here.
