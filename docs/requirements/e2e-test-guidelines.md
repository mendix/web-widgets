# E2E Test Guidelines

Rules for writing reliable, non-flaky Playwright E2E tests in this monorepo.

## Imports & Setup

Always use the custom fixtures, never raw Playwright:

```javascript
import { test, expect } from "@mendix/run-e2e/fixtures";
```

Import helpers only when explicitly needed:

```javascript
import { waitForDataReady } from "@mendix/run-e2e/mendix-helpers";
```

The custom fixture:

- Auto-wraps `page.goto()` to call `waitForMendixApp()` — do NOT call it manually after `goto`
- Worker-scoped sessions: 1 Mendix session per Playwright worker (4 in CI, 2 locally)
- Auto-logout on teardown — no manual `afterEach` logout needed

## Waiting Strategies

Prefer web-first assertions over explicit waits — they auto-retry until timeout.

| Don't                                            | Do Instead                            | Why                                                  |
| ------------------------------------------------ | ------------------------------------- | ---------------------------------------------------- |
| `page.waitForTimeout(N)`                         | Web-first assertion on expected state | Arbitrary delays: too short = flaky, too long = slow |
| `page.waitForLoadState("networkidle")`           | `waitForMendixApp(page)`              | Unrelated network traffic delays indefinitely        |
| `page.waitForSelector(...)` then separate assert | `await expect(locator).toBeVisible()` | Combined wait+assert auto-retries                    |

Use `waitForDataReady(page)` only when data sync timing genuinely matters.

## Assertions

Preferred: `toBeVisible`, `toHaveText`, `toHaveCount`, `toHaveCSS`, `toContainText`, `toHaveScreenshot`.

| Don't                                                                | Do Instead                                           | Why                                              |
| -------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------ |
| `const text = await el.allTextContents(); expect(text).toEqual(...)` | `await expect(locator).toContainText([...])`         | Non-retrying snapshot vs auto-retrying           |
| `await el.evaluate(el => el.getBoundingClientRect())`                | `await expect(el).toHaveCSS("transform", "...")`     | DOM inspection races vs CSS state assertion      |
| `page.$$eval(...)` to extract data                                   | `expect(locator).toContainText()` or `.toHaveText()` | evaluate snapshots DOM; locator assertions retry |

## Locator Patterns

Prefer `.mx-name-*` attributes — set by Mendix Studio Pro from widget names, stable across DOM refactors and i18n changes.

| Don't                               | Do Instead                                      | Why                                          |
| ----------------------------------- | ----------------------------------------------- | -------------------------------------------- |
| `.nth(N)` on ambiguous selectors    | `.mx-name-*` attribute selectors                | nth fragile to DOM order                     |
| `page.click("text=...")` standalone | `.mx-name-*` or compose: CSS scope + role/label | Text alone = false positive, fragile to i18n |
| Asserting text content in E2E       | Unit/snapshot tests for text correctness        | Text assertions belong in unit tests         |

When `.mx-name-*` is not available, compose locators — see [Playwright locator docs](https://playwright.dev/docs/locators):

```javascript
// mx-name — preferred
page.locator(".mx-name-btnSubmit");

// composed: CSS scope + role
page.locator(".mx-name-myForm").getByRole("button", { name: "Save" });

// composed: CSS scope + label
page.locator(".mx-name-myWidget").getByLabel("Start date");
```

## Page Object Model

For widgets with more than a handful of specs — or any spec that repeats the same locators/actions — encapsulate the widget's locators and interactions in a Page Object instead of scattering raw selectors across tests. This keeps specs reading as behavior and gives one place to update when the DOM changes.

**Where it lives:** widget-local, at `e2e/pages/<Widget>Page.js`. Keep it per-widget — do not add shared POMs to `@mendix/run-e2e` (widgets are isolated; see repo-layout). Reference: `packages/pluggableWidgets/datagrid-web/e2e/pages/DataGridPage.js`.

**Conventions:**

- **Scope to one widget instance by `mx-name`.** The constructor takes `(page, name)` and builds a `root` locator (`.mx-name-<name>`); default the `name` to the most common instance. All locators derive from `root` — the POM stores no reference to `page`.
- **Navigation stays in `beforeEach`, not the POM.** Call `page.goto(path)` directly in the spec's `beforeEach`. The custom fixture auto-waits for the app after every `goto` — do **not** add `waitForMendixApp` (see Imports & Setup).
- **Page-level selectors stay in the spec.** When a widget renders outside the grid's DOM subtree (e.g. a sibling filter widget), use `page.locator(...)` inline in the test. Do not add a `this.page` property to the POM to accommodate these — it breaks instance isolation.
- **Expose locators as getters/methods; keep assertions in the spec.** The POM returns locators (e.g. `get rows()`, `columnCells(n)`); the test does the `expect(...)`. This preserves auto-retrying web-first assertions and keeps the POM assertion-free.
- **Actions are verbs** (`sortByColumn(n)`, `openColumnSelector()`); **locators are nouns** (`columnHeaders`, `cells`). Prefer `.mx-name-*` and role/label composition inside the POM, following Locator Patterns above.

```javascript
// e2e/pages/MyWidgetPage.js
export class MyWidgetPage {
    constructor(page, name = "myWidget1") {
        // page is used only to build root; not stored — keeps POM dom-subtree-scoped.
        this.root = page.locator(`.mx-name-${name}`);
    }

    get rows() {
        return this.root.locator('[role="row"]');
    }

    async submit() {
        await this.root.getByRole("button", { name: "Save" }).click();
    }
}
```

```javascript
// e2e/MyWidget.spec.js
import { test, expect } from "@mendix/run-e2e/fixtures";
import { MyWidgetPage } from "./pages/MyWidgetPage";

test.describe("MyWidget", () => {
    /** @type {MyWidgetPage} */
    let widget;

    // Navigation and page-level setup belong here, not in the POM.
    test.beforeEach(async ({ page }) => {
        widget = new MyWidgetPage(page);
        await page.goto("/"); // fixture auto-waits for Mendix readiness
    });

    test("submits the form @smoke", async () => {
        await widget.submit();
        await expect(widget.rows).toHaveCount(3); // assertion stays in the spec
    });
});
```

## Screenshot Testing

- No per-test `{ threshold: N }` or `{ maxDiffPixels: N }` overrides — use global config (`threshold: 0.1`)
- Always ensure element is visible before screenshot: `await expect(el).toBeVisible()`
- Animations disabled globally (`animations: "disabled"` + `reducedMotion: "reduce"`)

## ESLint Enforcement

Configured in `automation/run-e2e/eslint.config.mjs`:

```
playwright/no-wait-for-timeout: error
playwright/no-networkidle: warn
playwright/prefer-web-first-assertions: warn
```

## Spec File Template

Minimal template for a small widget. For widgets with many specs or repeated locators, use a Page Object instead (see Page Object Model above).

```javascript
import { test, expect } from "@mendix/run-e2e/fixtures";

test.describe("WidgetName", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test("describes user-visible behavior @smoke", async ({ page }) => {
        // Arrange
        await page.locator(".mx-name-navItem").click();

        // Act
        await page.locator(".mx-name-myWidget .some-input").fill("value");

        // Assert
        await expect(page.locator(".mx-name-resultArea")).toContainText("expected");
    });

    test("visual regression", async ({ page }) => {
        const widget = page.locator(".mx-name-myWidget");
        await expect(widget).toBeVisible();
        await expect(widget).toHaveScreenshot("widget-default-state.png");
    });
});
```

## Available Helpers

From `@mendix/run-e2e/mendix-helpers`:

| Function                                 | Purpose                                                    |
| ---------------------------------------- | ---------------------------------------------------------- |
| `waitForMendixApp(page)`                 | Core readiness wait (session + no spinner + page rendered) |
| `waitForDataReady(page)`                 | App ready + networkidle (opt-in for data-heavy tests)      |
| `waitForWidget(page, mxName)`            | Wait for specific widget by mx-name                        |
| `waitForListData(page, mxName, minRows)` | Wait for list/grid to have minimum row count               |
| `navigateToPage(page, path)`             | Navigate + auto-wait                                       |
| `safeLogout(page)`                       | Graceful logout (rarely needed — fixture handles it)       |
| `checkAccessibility(page, selector)`     | Axe-core a11y scan                                         |
