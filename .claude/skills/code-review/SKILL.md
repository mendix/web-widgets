---
name: code-review
description: Review a pull request in the mendix/web-widgets monorepo. Checks Mendix widget conventions, React/MobX patterns, versioning, test coverage, Atlas UI styling, security, and accessibility.
---

# Code Review

Review the PR diff against the standards in this repository. Read `AGENTS.md` for full repo context.

## What to check on every PR

### PR metadata

- **Title**: JIRA format `[XX-000]: description` or conventional commits (`feat:`, `fix:`, etc.)
- **Template adherence**: lint/test run locally, new tests added, related PRs linked
- **Multi-package PRs**: validate each changed package separately

### Versioning and changelog (per changed package)

If runtime code, public API, XML schema, or behavior changed:

- Require semver bump in `package.json`
- Require `CHANGELOG.md` entry (Keep a Changelog format)
- Suggest: `pnpm -w changelog`

If refactor/docs/tests-only: bump not required — confirm with author.

### Mendix-specific

- **XML ↔ TSX alignment**: lowerCamelCase keys, TS props updated with XML changes, unique widget ID
- **Data API**: check `ActionValue.canExecute` before `execute()`, use `EditableValue.setValue()` for two-way binding, render loading/empty states until values are ready

### React

- **Hooks**: correct `useEffect`/`useMemo`/`useCallback` deps; no stale closures; guard async effects:
    ```ts
    useEffect(() => {
        let active = true;
        (async () => {
            const data = await load();
            if (active) setData(data);
        })();
        return () => {
            active = false;
        };
    }, [load]);
    ```
- **State**: functional updates (`setX(x => x + 1)`); no mirroring props in state without sync logic; stable `key`s in lists (not array index)
- **Props**: don't spread unknown props onto DOM nodes; prefer composition over prop drilling

### MobX

- `makeAutoObservable` or `makeObservable` in every store constructor
- State mutations only inside `action`; `computed` must be pure (no side effects)
- React integration via `observer` HOC or `useSubscribe()` from `@mendix/widget-plugin-mobx-kit`

### Styling

- SCSS only — no inline styles for static design
- Atlas UI classes preferred (`btn`, `badge`); never override core Atlas classes
- BEM-like naming prefixed with widget name; no `!important`

### Unit tests

Files live in `src/**/__tests__/*.spec.ts(x)` and run with Jest + RTL (enzyme-free).

**Structure**

- Use `describe`/`it` blocks; group related cases under a nested `describe`
- Define a `defaultProps` constant and a factory render helper to avoid repetition:
    ```ts
    const defaultProps: MyWidgetProps = { ... };
    const renderWidget = (props = defaultProps) => render(<MyWidget {...props} />);
    ```

**Mendix data mocking — always use builders, never manual objects**

```ts
import { EditableValueBuilder, ListValueBuilder, actionValue, obj } from "@mendix/widget-plugin-test-utils";

const value = new EditableValueBuilder<string>().withValue("hello").build();
const readOnly = new EditableValueBuilder<string>().withValue("x").isReadOnly().build();
const loading = new EditableValueBuilder<string>().isLoading().build();
const list = new ListValueBuilder().withItems([obj("A"), obj("B")]).build();
const action = actionValue(); // jest.fn() — assert with .execute toHaveBeenCalled()
```

**What to cover**

- All Mendix data states: `Available`, `Loading`, `Unavailable`, `ReadOnly`
- All prop/behavior branches (null checks, conditional renders, edge cases)
- User interactions via `fireEvent` or `userEvent`
- Verify `setValue` / `execute` calls: `expect(action.execute).toHaveBeenCalled()`
- Accessibility assertions: `getByRole`, `getByLabelText`, ARIA attributes

**What to flag**

- Manual mock objects instead of builders — brittle and miss status edge cases
- Enzyme patterns (`shallow`, `mount`, `instance()`) — must use RTL
- Snapshot tests on dynamic content (dates, IDs, async state) — use specific assertions instead
- Missing `afterEach` mock cleanup — causes test pollution
- Missing `ResizeObserver` / `window.mx` global setup when widget requires it (add to `jest.setup.ts`)
- Jest config not extending `@mendix/pluggable-widgets-tools/test-config/jest.config`

### E2E tests

Files live in `e2e/*.spec.js` and run with Playwright (Chromium). Config inherits from `@mendix/run-e2e/playwright.config.cjs`.

**Mandatory structure — every file must have this**

```js
import { test, expect } from "@playwright/test";

test.afterEach("Cleanup session", async ({ page }) => {
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("WidgetName", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
    });
});
```

**Selectors — in order of preference**

1. `.mx-name-*` — Mendix widget names (most stable): `page.locator(".mx-name-myWidget")`
2. ARIA roles: `page.getByRole("button", { name: "Save" })`
3. Widget CSS classes: `page.locator(".widget-badge-button-text")`
4. Avoid brittle selectors: nth-child chains, deeply nested CSS, text-only locators

**Assertions**

```js
await expect(page.locator(".mx-name-myWidget")).toBeVisible();
await expect(page.locator(".badge")).toContainText("New");
await expect(page.locator(".mx-name-myWidget")).toHaveScreenshot("myWidget-default.png");
```

**Accessibility scanning (use for new interactive widgets)**

```js
import AxeBuilder from "@axe-core/playwright";
const results = await new AxeBuilder({ page }).analyze();
expect(results.violations).toEqual([]);
```

**What to flag**

- Missing `afterEach` session logout — will exceed Mendix's 5-session license limit in CI
- `page.waitForTimeout()` / hardcoded `sleep` — replace with `waitForLoadState` or a Playwright locator assertion
- Selectors that don't use `.mx-name-*` when a Mendix widget name is available
- Screenshot baselines not committed — `toHaveScreenshot` requires a baseline PNG in the repo
- Missing `page.waitForLoadState("networkidle")` in `beforeEach` — causes flaky tests
- E2E file not following `WidgetName.spec.js` naming convention

### Security

- **No `dangerouslySetInnerHTML`** unless input is sanitized with a trusted library (e.g. DOMPurify); flag any unsanitized usage as high severity
- **No secrets or tokens** hardcoded in source — API keys, client IDs, URLs with credentials
- **Safe external data handling**: validate and sanitize data from Mendix props before rendering or passing to DOM; guard against prototype pollution when merging objects
- **No `eval()` or `new Function()`** with dynamic input
- **Third-party scripts**: dynamic `<script>` injection must be reviewed for XSS risk
- **URL handling**: verify `href`/`src` values derived from user input are validated (guard against `javascript:` and `data:` URIs)
- **Event handlers**: avoid attaching global `window`/`document` listeners without cleanup — can leak references and be exploited

### Accessibility

Follow WCAG 2.2 AA. Prefer semantic HTML over ARIA — only add ARIA when native elements don't convey the right semantics.

- **Semantic elements**: use `<button>` for actions, `<a>` for navigation, `<dialog>` for modals — not `<div onClick>`
- **Keyboard navigation**: all interactive elements reachable and operable by keyboard; focus order is logical
    - Arrow keys for menu/list navigation
    - Enter/Space to activate
    - Escape to dismiss floating elements
    - Roving `tabIndex` pattern for lists/menus (`tabIndex=0` on active item, `-1` on others)
- **ARIA labels**: interactive elements without visible text need `aria-label` or `aria-labelledby`; dynamic regions need `aria-live` where appropriate
- **Focus management**: dialogs/modals must trap focus on open and restore it on close; use `FloatingFocusManager` from Floating UI for popovers/menus
- **Images**: decorative images use `alt=""`; informative images have descriptive `alt` text
- **Colour contrast**: minimum 4.5:1 for normal text, 3:1 for large text and UI components (AA)
- **No content conveyed by colour alone**: pair colour cues with text or icons

## Heuristics

| Situation                                      | Comment                                                                        |
| ---------------------------------------------- | ------------------------------------------------------------------------------ |
| Code/XML changed, no version bump or CHANGELOG | "Please bump semver and add changelog (`pnpm -w changelog`)."                  |
| Feature/fix without tests                      | "Please add unit tests in `src/components/__tests__/` and consider E2E tests." |
| XML changed, TS props not updated              | "XML props changed but TS types/usage aren't aligned."                         |
| Async effect sets state without guard          | Suggest the `active` flag pattern above                                        |
| `index` used as list `key`                     | Request a stable unique key                                                    |
| MobX mutation outside `action`                 | Suggest `runInAction` or `action` wrapper                                      |
| `dangerouslySetInnerHTML` without sanitization | Flag as high severity; require DOMPurify or equivalent                         |
| Hardcoded secret, token, or credential         | Flag as critical; must be removed and rotated                                  |
| `javascript:` or `data:` URI from user input   | Flag as XSS risk; require validation before use                                |
| Interactive element is a `<div>` with onClick  | Replace with `<button>` or `<a>`; add keyboard handler if div must be kept     |
| Missing `alt` on `<img>`                       | Add descriptive `alt` or `alt=""` for decorative images                        |
| No `aria-label` on icon-only button            | Add `aria-label` describing the action                                         |
| Colour used as sole differentiator             | Pair with text or icon; check contrast ratio meets 4.5:1 (3:1 for large text)  |

## Scope

### What to review

| Path pattern                                                   | What to check                                                                      |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `packages/pluggableWidgets/*/src/**/*.{ts,tsx}`                | Widget logic, React hooks, MobX, Mendix data API usage                             |
| `packages/pluggableWidgets/*/*.xml`                            | Widget manifest: property keys (lowerCamelCase), unique ID, XML ↔ TS alignment     |
| `packages/pluggableWidgets/*/**/*.scss`                        | Styling: BEM naming, Atlas UI classes, no `!important`, no inline styles           |
| `packages/pluggableWidgets/*/src/**/__tests__/*.spec.{ts,tsx}` | Unit test coverage, builder usage, RTL patterns                                    |
| `packages/pluggableWidgets/*/e2e/*.spec.js`                    | E2E structure, selectors, afterEach logout, no hardcoded waits                     |
| `packages/pluggableWidgets/*/package.json`                     | Semver bump present when runtime/XML/behavior changed                              |
| `packages/pluggableWidgets/*/CHANGELOG.md`                     | Keep a Changelog entry present when version bumped                                 |
| `packages/pluggableWidgets/*/*.editorConfig.ts`                | Studio Pro design-time config aligns with XML properties                           |
| `packages/pluggableWidgets/*/*.editorPreview.tsx`              | Preview component renders without crashing; no production-only imports             |
| `packages/shared/*/src/**/*.{ts,tsx}`                          | Shared utility changes — check for breaking API changes affecting widget consumers |
| `packages/modules/*/src/**/*.{ts,tsx}`                         | Module-level logic and Mendix integration patterns                                 |
| `automation/**/*.{ts,mjs,cjs}`                                 | Build/test automation scripts — no destructive ops, no hardcoded paths             |
| `.github/workflows/*.yml`                                      | See workflow rules below                                                           |
| `.claude/skills/**`                                            | See skill rules below                                                              |

### What to ignore

- `dist/**` — build output, never review
- `pnpm-lock.yaml` — lockfile-only changes need no review unless paired with `package.json` changes
- `**/.turbo/**`, `**/node_modules/**` — generated/cached artifacts
- `**/test-results/**`, `**/results/**` — test output directories
- `dist/tmp/**` — intermediate build artifacts
- `**/__snapshots__/**` — auto-generated snapshots (flag only if snapshot was deleted without test change)
- `*.mpk` — compiled Mendix packages

### Multi-package PRs

When a PR touches multiple packages, validate each changed package separately:

- Versioning and CHANGELOG per package
- XML ↔ TS alignment per widget
- Test coverage per changed component

### GitHub Actions workflows (`.github/workflows/**`)

- All action references must be SHA-pinned with a version comment: `uses: actions/foo@<sha> # vX.Y`
- Secrets must be read from `${{ secrets.* }}` — never hardcoded values
- Permissions must be minimal: only declare what the job actually needs
- Jobs that assume AWS/cloud roles must have `id-token: write` and use OIDC (`aws-actions/configure-aws-credentials`)
- Jobs running on `pull_request` events should guard against fork PRs: check `head.repo.full_name` or `github.repository`
- Jobs triggerable by comments (`issue_comment`) must restrict by `author_association` to prevent external contributors from triggering privileged workflows
- Every long-running job should have `timeout-minutes` set
- Shared `concurrency` groups with `cancel-in-progress: true` will cancel in-flight jobs — use per-job concurrency for interactive workflows

### Claude Code skills (`.claude/skills/**`)

- Frontmatter (`name`, `description`) must be present and accurate
- Instructions should be actionable and specific — vague guidance leads to inconsistent reviews
- Code examples must match the patterns actually used in this repo (check against `src/**` if unsure)
- New sections should include a "What to flag" list of concrete anti-patterns

## Output format

Always post one summary comment. Use inline comments for issues that reference a specific line; use the summary comment for file-level or cross-cutting issues.

### Summary comment template

**Verdict line** — always the first line, one of:

- `✅ Approved — no issues found`
- `⚠️ Approved with suggestions — low-severity items only, safe to merge`
- `🔶 Changes requested — one or more medium-severity items must be addressed`
- `🚨 Blocked — high-severity issue (security, data loss, broken API) must be fixed`

**Full template:**

````markdown
## AI Code Review

> ✅ / ⚠️ / 🔶 / 🚨 **<verdict line>**

---

### What was reviewed

| File                | Change                            |
| ------------------- | --------------------------------- |
| `path/to/file.ts`   | Brief description of what changed |
| `path/to/other.yml` | Brief description                 |

Skipped (out of scope): `dist/`, `pnpm-lock.yaml`

---

### Findings

<!-- Omit this section entirely on a clean PR -->

#### 🚨 High — <short title>

**File:** `path/to/file.ts` line 42
**Problem:** What is wrong and why it matters.
**Fix:**

```ts
// suggested fix snippet
```

---

#### 🔶 Medium — <short title>

**File:** `path/to/file.ts` line 10
**Problem:** What is wrong and why it matters.
**Fix:** What to do (prose or snippet).

---

#### ⚠️ Low — <short title>

**File:** `path/to/file.ts` line 5
**Note:** What to consider, not blocking.

---

### Positives

- Specific thing done well (not generic praise)
- Another concrete positive
````

### Rules

- **The summary comment is mandatory** — even on a clean PR. It proves the review ran.
- Omit the **Findings** section entirely on a clean PR; do not write "no findings".
- Each finding must include: severity emoji, a short title, the file + line, the problem, and a concrete fix.
- Keep **Positives** specific — name what was done right (e.g. "SHAs are pinned with version comments"), not generic ("good job").
- One finding per `####` block — do not bundle multiple issues.
- Be specific and actionable; avoid noise.
