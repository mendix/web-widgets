# E2E Test Guidelines

Rules for writing reliable, non-flaky Playwright E2E tests in this monorepo. Derived from systematic fixes to 58+ spec files.

## Imports & Setup

Always use the custom fixtures, never raw Playwright:

```javascript
import { test, expect } from "@mendix/run-e2e/fixtures";
import { waitForMendixApp } from "@mendix/run-e2e/mendix-helpers";
```

The custom fixture:

- Auto-wraps `page.goto()` to call `waitForMendixApp()`
- Manages worker-scoped Mendix sessions (1 per worker, auto-logout on teardown)
- No manual `afterEach` logout needed

## Waiting Strategies

### Hierarchy (use the highest applicable level)

1. `waitForMendixApp(page)` — session exists + no progress indicator + `.mx-page` rendered
2. `await expect(element).toBeVisible()` — specific element appeared
3. `await expect(rows).toHaveCount(N)` — data loaded with expected count
4. `waitForDataReady(page)` — opt-in ONLY when data sync timing genuinely matters

### Banned Patterns

| Don't                                            | Do Instead                            | Why                                                  |
| ------------------------------------------------ | ------------------------------------- | ---------------------------------------------------- |
| `page.waitForTimeout(N)`                         | Web-first assertion on expected state | Arbitrary delays: too short = flaky, too long = slow |
| `page.waitForLoadState("networkidle")`           | `waitForMendixApp(page)`              | Unrelated network traffic delays indefinitely        |
| `page.waitForSelector(...)` then separate assert | `await expect(locator).toBeVisible()` | Combined wait+assert auto-retries                    |

## Assertions

Always prefer Playwright web-first assertions — they auto-retry until timeout.

| Don't                                                                | Do Instead                                           | Why                                              |
| -------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------ |
| `const text = await el.allTextContents(); expect(text).toEqual(...)` | `await expect(locator).toContainText([...])`         | Non-retrying snapshot vs auto-retrying           |
| `await el.evaluate(el => el.getBoundingClientRect())`                | `await expect(el).toHaveCSS("transform", "...")`     | DOM inspection races vs CSS state assertion      |
| `el.nth(1)` to disambiguate                                          | More specific selector or wait first                 | nth() fragile to render order                    |
| `page.$$eval(...)` to extract data                                   | `expect(locator).toContainText()` or `.toHaveText()` | evaluate snapshots DOM; locator assertions retry |

Preferred assertions: `toBeVisible`, `toHaveText`, `toHaveCount`, `toHaveCSS`, `toContainText`, `toHaveScreenshot`.

## Locator Patterns

| Don't                                   | Do Instead                                 | Why                                     |
| --------------------------------------- | ------------------------------------------ | --------------------------------------- |
| `.nth(N)` on ambiguous selectors        | `.mx-name-*` attribute selectors           | nth fragile to DOM order                |
| Complex CSS selectors                   | `page.locator(".mx-name-widgetName")`      | mx-name attributes are stable, semantic |
| `page.click("text=...")` for navigation | `page.locator(".mx-name-navItem").click()` | Text fragile to i18n/copy changes       |

## Screenshot Testing

- No per-test `{ threshold: N }` or `{ maxDiffPixels: N }` overrides — use global config (`threshold: 0.1`)
- Always ensure element is visible before screenshot: `await expect(el).toBeVisible()`
- Animations disabled globally (`animations: "disabled"` + `reducedMotion: "reduce"`)

## Session Management

- Worker-scoped sessions: 1 Mendix session per Playwright worker
- Workers: 4 in CI, 2 locally (stays under 5-session license limit)
- No manual `afterEach` logout — fixture handles cleanup
- No per-test browser context creation

## ESLint Enforcement

These rules are configured in `automation/run-e2e/eslint.config.mjs`:

```
playwright/no-wait-for-timeout: error
playwright/no-networkidle: warn
playwright/prefer-web-first-assertions: warn
```

## Code Review Checklist

- [ ] Uses `@mendix/run-e2e/fixtures` import (not `@playwright/test`)
- [ ] No `waitForTimeout` calls
- [ ] No `waitForLoadState("networkidle")` without explicit justification
- [ ] All assertions use web-first Playwright assertions
- [ ] No per-test screenshot threshold overrides
- [ ] No manual `afterEach` logout
- [ ] Locators use `.mx-name-*` attributes where possible
- [ ] Tests tagged `@smoke` if they cover critical paths

## Spec File Template

```javascript
import { test, expect } from "@mendix/run-e2e/fixtures";
import { waitForMendixApp } from "@mendix/run-e2e/mendix-helpers";

test.describe("WidgetName", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await waitForMendixApp(page);
    });

    test("describes user-visible behavior", async ({ page }) => {
        // Arrange
        await page.locator(".mx-name-navItem").click();
        await waitForMendixApp(page);

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
