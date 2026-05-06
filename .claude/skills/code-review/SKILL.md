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

### Changelog (per changed package)

Version bumps happen in a separate dedicated PR — do not require or flag missing semver bumps.

If runtime code, public API, XML schema, or behavior changed:

- Require `CHANGELOG.md` entry (Keep a Changelog format)
- Suggest: `pnpm -w changelog`

If refactor/docs/tests-only: changelog entry not required — confirm with author.

### Mendix-specific

`AGENTS.md` covers the core rules (canExecute, loading states, lowerCamelCase XML keys). Flag these additional review issues:

- XML changed but TS props not updated, or widget ID is not unique
- `EditableValue` read without checking `.status` — can render stale/undefined data
- `ActionValue.execute()` called without checking `.canExecute` first

### React

Flag these patterns — general React conventions are assumed known:

- Missing or wrong `useEffect`/`useMemo`/`useCallback` deps; stale closures
- Async effect sets state without a cleanup guard:
    ```ts
    useEffect(() => {
        let active = true;
        fetchData().then(data => {
            if (active) setState(data);
        });
        return () => {
            active = false;
        };
    }, [fetchData]);
    ```
- Array index used as list `key` — requires a stable unique key
- Props spread onto DOM nodes (`<div {...props}>`) — strips unknown HTML attributes

### MobX

- `makeAutoObservable` or `makeObservable` missing from store constructor
- State mutation outside `action` — suggest `runInAction` or `action` wrapper
- `computed` with side effects — must be pure
- Missing `observer` HOC or `useSubscribe()` from `@mendix/widget-plugin-mobx-kit` on React components that read MobX state

### Styling

Conventions are in `docs/requirements/frontend-guidelines.md`. Flag only deviations:

- Inline styles used for static design
- Core Atlas UI classes overridden
- `!important` used
- CSS class not prefixed with widget name

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

Full requirements are in `docs/requirements/frontend-guidelines.md`. Flag only deviations:

- Interactive element is a `<div>` or `<span>` with `onClick` — replace with `<button>` or `<a>`
- Icon-only button missing `aria-label`
- `<img>` missing `alt` attribute (use `alt=""` for decorative)
- Dialog/modal does not trap focus or restore it on close — use `FloatingFocusManager`
- Colour used as the sole differentiator — pair with text or icon

## Heuristics

| Situation                                      | Severity | Comment                                                |
| ---------------------------------------------- | -------- | ------------------------------------------------------ |
| Code/XML changed, no CHANGELOG entry           | Medium   | `pnpm -w changelog` — version bumps are a separate PR  |
| Feature/fix without tests                      | Medium   | Add unit tests; consider E2E for interactive behaviour |
| `dangerouslySetInnerHTML` without sanitization | High     | Require DOMPurify or equivalent before merge           |
| Hardcoded secret, token, or credential         | Critical | Must be removed and rotated immediately                |
| `javascript:` or `data:` URI from user input   | High     | Validate before use — XSS risk                         |

## Scope

### What to review

| Path pattern                                                   | What to check                                                                      |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `packages/pluggableWidgets/*/src/**/*.{ts,tsx}`                | Widget logic, React hooks, MobX, Mendix data API usage                             |
| `packages/pluggableWidgets/*/*.xml`                            | Widget manifest: property keys (lowerCamelCase), unique ID, XML ↔ TS alignment     |
| `packages/pluggableWidgets/*/**/*.scss`                        | Styling: BEM naming, Atlas UI classes, no `!important`, no inline styles           |
| `packages/pluggableWidgets/*/src/**/__tests__/*.spec.{ts,tsx}` | Unit test coverage, builder usage, RTL patterns                                    |
| `packages/pluggableWidgets/*/e2e/*.spec.js`                    | E2E structure, selectors, afterEach logout, no hardcoded waits                     |
| `packages/pluggableWidgets/*/package.json`                     | Version bumps happen in a separate PR — do not flag missing bumps                  |
| `packages/pluggableWidgets/*/CHANGELOG.md`                     | Keep a Changelog entry present when runtime/XML/behavior changed                   |
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

- CHANGELOG entry per package (version bumps are out of scope)
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

**Determine the execution context first** by checking whether the `CI` environment variable is set (`echo $CI`):

- **CI environment** (`CI=true`): post the review as a PR comment using `gh`, following the template below.
- **Local environment** (`CI` unset or empty): print the review directly to the terminal in the same format. Do NOT post any `gh` comment.

Use inline comments for issues that reference a specific line; use the summary comment/output for file-level or cross-cutting issues.

### Summary comment template

**Verdict line** — always the first line, one of:

- `✅ Approved — no issues found`
- `⚠️ Approved with suggestions — low-severity items only, safe to merge`
- `🔶 Changes requested — one or more medium-severity items must be addressed`
- `🚨 Blocked — high-severity issue (security, data loss, broken API) must be fixed`

**Post the comment using exactly this structure** (GitHub Markdown — render as-is, do not wrap in a code fence):

The comment must start with:

```
## AI Code Review
```

Then a blockquote verdict on the next line:

```
> ✅ Approved — no issues found
```

(replace with the appropriate verdict emoji and text)

Then a horizontal rule `---`, then a `### What was reviewed` section with a Markdown table:

```
### What was reviewed

| File | Change |
| --- | --- |
| `path/to/file.ts` | Brief description of what changed |
| `path/to/other.yml` | Brief description |

Skipped (out of scope): `dist/`, `pnpm-lock.yaml`
```

Then `---`, then a `### Findings` section (omit entirely on a clean PR) where each finding is a level-4 heading:

```
### Findings

#### 🚨 High — <short title>

**File:** `path/to/file.ts` line 42
**Problem:** What is wrong and why it matters.
**Fix:**
\`\`\`ts
// suggested fix snippet
\`\`\`

---

#### 🔶 Medium — <short title>

**File:** `path/to/file.ts` line 10
**Problem:** What is wrong and why it matters.
**Fix:** What to do (prose or snippet).

---

#### ⚠️ Low — <short title>

**File:** `path/to/file.ts` line 5
**Note:** What to consider, not blocking.
```

Then `---`, then a `### Positives` section as a bullet list:

```
### Positives

- Specific thing done well (not generic praise)
- Another concrete positive
```

### Rules

- **The summary comment is mandatory** — even on a clean PR. It proves the review ran.
- Omit the **Findings** section entirely on a clean PR; do not write "no findings".
- Each finding must include: severity emoji, a short title, the file + line, the problem, and a concrete fix.
- Keep **Positives** specific — name what was done right (e.g. "SHAs are pinned with version comments"), not generic ("good job").
- One finding per `####` block — do not bundle multiple issues.
- Be specific and actionable; avoid noise.
