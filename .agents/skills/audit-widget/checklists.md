# Detection heuristics per category

One section per audit category. Each finding you report must trace back to a concrete signal here (or a defensible variation of one) plus `file:line` evidence.

Severity scale used throughout:

- **Critical** — users hit broken/incorrect behaviour, or data loss
- **High** — a real defect or a gap that lets defects ship undetected
- **Medium** — degraded UX/perf, or a convention violation with maintenance cost
- **Low** — cleanup, nice-to-have coverage

---

## UT — Missing unit tests

Target: `src/**/__tests__/*.spec.{ts,tsx}` run by `pnpm run test` (Jest + RTL).

**Build the coverage map first.** For every file under `src/` that exports something, note whether any spec imports it. Optionally run `pnpm run test --coverage` for real numbers; if the toolchain rejects the flag, fall back to import analysis and say the numbers are structural, not measured.

Then look for these specific gaps:

| Signal                                                                                                                | Severity |
| --------------------------------------------------------------------------------------------------------------------- | -------- |
| Entry component (`src/<WidgetName>.tsx`) has no spec at all                                                           | High     |
| A `src/helpers/**` class or pure function has no spec                                                                 | High     |
| A custom hook in `src/hooks/**` has no spec                                                                           | High     |
| `<WidgetName>.editorConfig.ts` `getProperties` / `check` / `getPreview` untested                                      | Medium   |
| Branch untested: each mutually exclusive XML enum value (e.g. selection mode, datasource type) that changes rendering | High     |
| State untested: loading, unavailable/placeholder, empty/no-results, read-only, validation-message, disabled           | High     |
| `ActionValue` prop with no test asserting `canExecute === false` blocks `execute()`                                   | High     |
| `EditableValue.setValue` path with no test asserting the value written                                                | High     |
| Keyboard handler with no test for its keys (Arrow/Enter/Space/Escape/Tab/Home/End)                                    | High     |
| ARIA attributes / roles rendered but never asserted                                                                   | Medium   |
| Snapshot exists but no behavioural assertions accompany it                                                            | Medium   |
| Cleanup untested: listener/timer/observer added in an effect, no unmount assertion                                    | Medium   |
| Spec exists but only covers the happy path of a multi-branch function                                                 | Medium   |
| Test uses real timers/`setTimeout` sleeps instead of fake timers                                                      | Low      |

Prefer `@mendix/widget-plugin-test-utils` builders (`dynamicValue`, `listValue`, `actionValue`, …) when proposing new tests — check how sibling specs in the package do it and match.

---

## E2E — Missing e2e flows

Target: `e2e/*.spec.js` run via `@mendix/run-e2e`. Rules: `docs/requirements/e2e-test-guidelines.md`.

**Enumerate the surface first.** Widget features from the XML + the pages in the test project:

```bash
bash automation/mxcli/mx-testproject.sh inspect <widget>   # modules, pages, entities, .mx-name-* labels
```

If `automation/tools/mxcli` is missing, note it and fall back to reading `e2e/*.spec.js` selectors to infer the page inventory.

Coverage gaps:

| Signal                                                                             | Severity |
| ---------------------------------------------------------------------------------- | -------- |
| A test-project page exercising this widget has no spec referencing it              | High     |
| A primary interaction (select, filter, sort, open/close, upload, drag) has no spec | High     |
| Full keyboard navigation flow untested end-to-end                                  | High     |
| No `toHaveScreenshot` coverage for a visually-driven widget                        | Medium   |
| Dark-mode / design-property variants rendered but never screenshotted              | Low      |
| Error/validation path never driven through the UI                                  | Medium   |
| Feature added in a recent `CHANGELOG.md` entry with no matching spec               | High     |

Fragility gaps (report these as E2E findings too — a flaky spec is worse than a missing one):

| Signal                                                                 | Severity |
| ---------------------------------------------------------------------- | -------- |
| Import from `@playwright/test` instead of `@mendix/run-e2e/fixtures`   | High     |
| `page.waitForTimeout(...)`                                             | High     |
| `waitForLoadState("networkidle")`                                      | High     |
| `waitForMendixApp()` called manually right after `page.goto()`         | Low      |
| `.nth(N)` on an ambiguous selector                                     | Medium   |
| Bare `text=` / `page.click("text=…")` locator                          | Medium   |
| `allTextContents()` / `$$eval` / `evaluate` used to build an assertion | Medium   |
| Text-content correctness asserted in e2e rather than a unit test       | Low      |
| `press("Escape")` on a popup page                                      | Medium   |
| Manual login / manual logout in `afterEach`                            | Low      |

---

## PERF — Performance issues

Read the render path top-down from the entry component. Concrete, not vibes: each finding names what re-renders or what work repeats.

| Signal                                                                                                                    | Severity |
| ------------------------------------------------------------------------------------------------------------------------- | -------- |
| Object/array/function literal passed as a prop into a `memo`'d child (kills the memo)                                     | High     |
| `useEffect`/`useMemo` dependency array containing a value recreated every render                                          | High     |
| Class/selector/provider instance constructed in the render body instead of `useMemo`/`useRef`/state initialiser           | High     |
| Expensive work in render: sort, filter, `match-sorter`, regex build, date formatting over a full list                     | High     |
| Deriving state from props via `useState` + `useEffect` instead of computing during render                                 | Medium   |
| MobX-observable state read in a component not wrapped in `observer` (extra renders or missed updates)                     | High     |
| Missing `useCallback` on a handler passed to a large list's items                                                         | Medium   |
| List of unbounded length rendered without virtualisation or a cap                                                         | Medium   |
| `key` derived from index on a reorderable/filterable list                                                                 | Medium   |
| Layout read (`getBoundingClientRect`, `offsetWidth`) in an effect that also writes style — forced sync reflow             | Medium   |
| `ResizeObserver`/`scroll`/`resize` listener without throttle, or without cleanup                                          | High     |
| Effect that calls `setValue`/`execute` on every render tick                                                               | Critical |
| Timer/interval/listener/observer with no cleanup in the effect return                                                     | High     |
| Non-tree-shakable import (`import _ from "lodash"`, deep barrel re-export) — repo requires tree-shakable imports          | Medium   |
| Large asset or icon inlined per render instead of a stable module-level constant                                          | Low      |
| SCSS: deeply nested selectors, or animation on a non-composited property (`width`/`top` instead of `transform`/`opacity`) | Low      |

For each PERF finding, state the trigger: "on every keystroke", "on every parent render", "once per row per render".

---

## DEP — Dependency updates

**Only this widget's `package.json`.** Run from the package root:

```bash
pnpm outdated
```

Classify each result against the **range declared in this widget's `package.json`**:

- **patch** — `x.y.Z`; safe, batch them together
- **minor** — `x.Y.z`; read the changelog for behaviour changes
- **major** — `X.y.z`; breaking; report only, propose separately, never bundle with other work

Rules and hard constraints:

- Skip every `workspace:*` / `workspace:^*` dependency — those move with the monorepo, not with this widget.
- `react` / `react-dom` are supplied by the Mendix client and pinned repo-wide to `>=18.0.0 <19.0.0`. Never propose a React 19 bump, and reject any dep whose new version requires React 19.
- `@mendix/pluggable-widgets-tools` is `*` — do not pin it.
- Check the new version still supports the widget's `marketplace.minimumMXVersion` browser baseline; flag ESM-only majors, since the widget is bundled by Rollup for the Mendix client.
- Renovate manages the repo (`.github/renovate.json`). If a bump appears to already be in an open Renovate PR, note it rather than duplicating the work.
- Never edit lockfiles by hand. Bumps go through `pnpm up <pkg>@<version>` inside the package.

Report as a table: package, current, wanted, latest, kind (patch/minor/major), risk note.

---

## SMELL — Code smells

Repo conventions come from `AGENTS.md` and `docs/requirements/frontend-guidelines.md`.

| Signal                                                                                         | Severity |
| ---------------------------------------------------------------------------------------------- | -------- |
| `ActionValue.execute()` called without a `canExecute` check                                    | High     |
| Direct DOM manipulation (`document.querySelector`, manual `classList`) instead of React state  | High     |
| `any`, `as unknown as`, or `!` non-null assertion covering a real nullable case                | Medium   |
| `@ts-ignore` / `@ts-expect-error` without an explanatory comment                               | Medium   |
| Inline `style={{…}}` for static design instead of an SCSS class                                | Medium   |
| `!important`, or a rule overriding a core Atlas class                                          | Medium   |
| Custom class not prefixed with the widget name (`.widget-<name>-…`)                            | Low      |
| XML property key not matching the TS prop name, or not lowerCamelCase                          | High     |
| Prop declared in XML but never read in the component                                           | High     |
| `console.log` / `debugger` left in `src/`                                                      | Medium   |
| Dead code: unexported unused helper, commented-out block, unreachable branch                   | Low      |
| Duplicated logic across components that belongs in `src/helpers/` or a shared plugin package   | Medium   |
| Component file well over the package's norm (compare siblings) doing three unrelated jobs      | Medium   |
| Hardcoded user-facing string where the widget elsewhere uses XML/translation properties        | Medium   |
| `CHANGELOG.md` missing an `## [Unreleased]` entry for behaviour shipped since the last version | Medium   |
| Changelog entry describing implementation rather than user-visible behaviour                   | Low      |
| Missing `README.md` feature docs for a shipped XML property                                    | Low      |

---

## BEH — Missing behaviours

The XML is the contract. Walk it property by property and confirm the implementation honours each one.

| Signal                                                                                                                  | Severity |
| ----------------------------------------------------------------------------------------------------------------------- | -------- |
| XML property has no effect in the rendered output                                                                       | High     |
| System property declared (Visibility, Tab index, Name) but `tabIndex`/`class`/`style` not forwarded to the root element | Medium   |
| No loading state while `ListValue.status === "loading"` / `DynamicValue.status !== "available"`                         | High     |
| No empty state when the datasource returns zero items                                                                   | Medium   |
| `EditableValue.readOnly` not honoured — control stays interactive                                                       | High     |
| `EditableValue.validation` present but no validation message rendered                                                   | High     |
| `editorPreview.tsx` visibly diverges from runtime rendering (missing a whole feature)                                   | Medium   |
| `editorConfig.ts` does not hide properties irrelevant to the selected mode                                              | Low      |
| Offline-capable widget doing something that requires the network                                                        | High     |
| No cleanup on unmount for something that outlives the component                                                         | High     |
| Requirement in `openspec/specs/**` with no implementation                                                               | High     |
| `CHANGELOG.md` documents behaviour the code does not do (or no longer does)                                             | High     |

Accessibility (WCAG 2.2 AA — `docs/requirements/frontend-guidelines.md`):

| Signal                                                                                                                            | Severity |
| --------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Interactive element built from `div`/`span` where a native `button`/`input`/`dialog` fits                                         | High     |
| Keyboard path missing: Arrows for list/menu, Enter/Space to activate, Escape to dismiss, Tab order                                | High     |
| List/menu without roving tabindex (active `0`, rest `-1`)                                                                         | Medium   |
| Floating element (menu/tooltip/popover) not using Floating UI's `useRole`/`useDismiss`/`useListNavigation`/`FloatingFocusManager` | Medium   |
| Focus not restored to the trigger after a menu/dialog closes                                                                      | High     |
| Icon-only control with no accessible name                                                                                         | High     |
| ARIA added where semantic HTML already conveys it (over-engineering — report as cleanup)                                          | Low      |
| Contrast below 4.5:1 (normal text) / 3:1 (large text, GUI elements) in the widget's SCSS                                          | Medium   |
| State change with no screen-reader announcement (`aria-live`, `aria-expanded`, `aria-selected`)                                   | Medium   |

---

## DOCS — Outdated public docs (mx-docs)

Target: the widget's page in the mx-docs repo (`$MX_DOCS_PATH`, else `~/Projects/mx-docs`). The widget's XML, `package.json`, and `CHANGELOG.md` are the source of truth; the doc page is what drifts.

**Locate the page first.** Widget pages live under `content/en/docs/marketplace/platform-supported-content/widgets/`, module pages under `.../modules/` (sometimes a folder with `_index.md` plus one page per widget, e.g. `modules/data-widgets/`). Resolve by the marketplace link, which every page carries in its intro:

```bash
cd "${MX_DOCS_PATH:-$HOME/Projects/mx-docs}"
appNumber=$(node -p "require('<widget-path>/package.json').marketplace.appNumber")
grep -rl "link/component/$appNumber" content/en/docs/marketplace/platform-supported-content
```

Several pages can link the same component (cross-references). Pick the one whose `url:` front matter / filename matches `marketplace.appName` and that links it in the `## Introduction` paragraph. For widgets inside a module (`packages/modules/<name>`), match the page by widget name inside the module folder. If no page is found, that is itself a finding (below) — do not invent one.

**Then compare.** Walk the XML property groups against the page's `## Properties Pane` section — mx-docs mirrors Studio Pro's tabs as `### <Tab> Tab {#anchor}` headings (General, Events, Accessibility, Advanced, Common…), with one bold item or sub-heading per property using its XML `<caption>`.

| Signal                                                                                                                                    | Severity |
| ----------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| No mx-docs page exists for a released widget                                                                                              | High     |
| XML property (non-system, visible in Studio Pro) not documented on the page                                                               | High     |
| Page documents a property that no longer exists in the XML, or under an old caption                                                       | High     |
| Enum value added/removed in the XML but the page's list of options is unchanged                                                           | High     |
| Feature in a released `CHANGELOG.md` version (not `[Unreleased]`) with no mention on the page                                             | High     |
| Page describes behaviour the code does not do (default value, condition, what an option does) — cite the code line                        | High     |
| Property documented under the wrong tab/group compared to the XML `propertyGroup`                                                         | Medium   |
| Default value stated on the page differs from the XML `defaultValue`                                                                      | Medium   |
| Minimum Mendix version stated on the page lower/higher than `marketplace.minimumMXVersion`                                                | Medium   |
| "Limitations" / "Known issues" section lists something a released version fixed                                                           | Medium   |
| Design properties listed on the page don't match `src/themesource/**/design-properties.json` (modules only — skip for standalone widgets) | Low      |
| Screenshot/GIF shows a visibly outdated UI (old caption, removed control) — report only, never regenerate images                          | Low      |

Evidence for each finding is **two** locations: the doc `file:line` and the widget `file:line` (XML / changelog / source) it disagrees with.

Rules:

- Only released behaviour belongs in mx-docs. `[Unreleased]` changelog entries are not findings — the docs ship with the release.
- `editorConfig.ts`-hidden properties are still documented if a user can reach them in some mode; check the hide condition before calling one "internal".
- Wording, tone, and grammar are not findings here. Accuracy only — leave style to mx-docs' own `docs-proofread`/`docs-review` skills.
- Phase 2 edits must follow mx-docs `CLAUDE.md`: smallest edit that fixes the accuracy problem; ask before deleting more than a sentence or renaming a `{#anchor}`/`url:` (grep for inbound references first); never add claims not sourced from the widget's XML, changelog, or code.
