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
