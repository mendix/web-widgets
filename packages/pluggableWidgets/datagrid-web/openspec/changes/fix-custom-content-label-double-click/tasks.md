## 1. Diagnose the mechanism in a real browser

- [x] 1.1 Instrument a capture-phase `click` listener on a synthetic label + checkbox page in real Chromium; record `detail`, `isTrusted`, `timeStamp`, `target`.
- [x] 1.2 Confirm the `<label>` forwards a second **trusted** click with the same `detail` and the same `timeStamp` (0 ms apart), and that clicking the checkbox square produces only one click.
- [x] 1.3 Confirm the same signature in the customer repro app through the real widget, with both events passing the same `div.td` (cell `data-position` 4,0).
- [x] 1.4 Read `CellEventsController.getEntries()` and confirm React's `onDoubleClick` prop is dead code in production — all double-click decisions come from `ClickEventSwitch`.

## 2. Rewrite the click classification (widget-plugin-grid)

- [x] 2.1 Replace the 320 ms `Date.now()` window in `ClickEventSwitch.getClickEntry()` with classification from `event.detail`: 1 → click entries, 2 → double click entries.
- [x] 2.2 Ignore `event.detail === 0` (keyboard activation, `element.click()`) and `event.detail > 2`.
- [x] 2.3 Add same-gesture dedupe: skip a click whose `detail` equals the previously handled click's `detail` and whose `timeStamp` is within `sameGestureWindow = 5` ms.
- [x] 2.4 Keep the state in the closure returned by `getClickEntry()` (per `DataCell`), not module level.
- [x] 2.5 Do not suppress or `preventDefault` the forwarded DOM event — the checkbox must keep toggling.

## 3. Unit coverage for ClickEventSwitch (was zero)

- [x] 3.1 New `packages/shared/widget-plugin-grid/src/event-switch/__tests__/ClickEventSwitch.spec.ts` driving the entry handler with plain `{detail, timeStamp}` objects (this package's Jest env is node — no RTL).
- [x] 3.2 Classification: `detail` 1 → single only, 2 → double only, 0 → neither, 3+ → neither.
- [x] 3.3 Same gesture: `1@100` + `1@100` → single runs once; `1@100` + `1@100.1` → once; `1,1,2,2` (label double click) → 1 single + 1 double; `1@100` + `2@100.1` → not collapsed.
- [x] 3.4 Separate gestures: `1@100` + `1@400` → two singles; `1,2,1,2` → 2 singles + 2 doubles (proves the `startTime = 0` reset defect is gone).
- [x] 3.5 Entry `filter` still honored; ctx and event still passed through.
- [x] 3.6 `pnpm run test` in `widget-plugin-grid`: 18 suites / 149 tests green.

## 4. Integration regression in datagrid-web

- [x] 4.1 New `src/features/row-interaction/__tests__/cell-custom-content.spec.tsx` rendering the real DOM shape (`.td` with controller props, `.td-custom-content` with `<label for>` + checkbox) driven by the real `CellEventsController`.
- [x] 4.2 Trigger `double`: label single click executes the action 0 times; checkbox single click 0 times; label double click exactly once.
- [x] 4.3 Trigger `single`: label click and checkbox click each execute exactly once.
- [x] 4.4 `rowClick` selection: label click selects exactly once; checkbox still toggles.
- [x] 4.5 `pnpm run test` in `datagrid-web` (18 suites / 231 tests) and `gallery-web` (8 suites / 56 tests) green.

## 5. A/B verification in the customer repro app

- [x] 5.1 Build shared package then widget into the repro project; verify which version the runtime serves via `deployment/web/widgets/.../Datagrid.js` (`awaitTime` vs `sameGestureWindow`).
- [x] 5.2 Pre-fix build, trigger `double`: single label click → 2 clicks (`detail` 1, 1, same timestamp) and the double-click microflow **fires** — bug reproduced on this exact pipeline.
- [x] 5.3 Post-fix build, trigger `double`: identical DOM event stream, microflow does **not** fire, checkbox toggles; real double click still fires it once; plain cell single click fires nothing and double click fires once.
- [x] 5.4 Post-fix build, trigger `single` + checkbox selection method: single label click fires the action exactly once; plain cell single click fires once; clicking the selection checkbox selects the row once and fires no action.

## 6. Release hygiene

- [x] 6.1 `datagrid-web/CHANGELOG.md` entry under `[Unreleased]` / `Fixed`.
- [x] 6.2 `gallery-web/CHANGELOG.md` equivalent entry (gallery consumes the same shared switch).
- [x] 6.3 No version bumps, no XML/property changes, no changelog for the shared package.
- [x] 6.4 Delete the throwaway Playwright diagnostic files (`e2e/wc3524-label-diag.spec.js`, `e2e/wc3524-probe.spec.js`, `e2e/wc3524-probe.png`, `wc3524.playwright.config.cjs`, `test-results/`) before opening the PR.
