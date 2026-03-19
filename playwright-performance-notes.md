# Playwright Performance & Memory Improvement Ideas

## Setup Overview

- **Config:** `automation/run-e2e/playwright.config.cjs` — shared by all 40 widget packages
- **Browser:** Chromium only, `channel: "chromium"`, `devices["Desktop Chrome"]`
- **Parallelism:** `fullyParallel: true`, 4 workers in CI
- **Scale:** 59 `.spec.js` files, ~4,900 lines of E2E code
- **Trace:** `on-first-retry` (already good)
- **Pattern:** Every test navigates + `waitForLoadState("networkidle")`, then logs out via `window.mx.session.logout()`

---

## Ideas

### 1. Add Chrome Launch Flags

The config uses no custom `launchOptions`. These flags can significantly reduce overhead:

```js
// playwright.config.cjs
use: {
  launchOptions: {
    args: [
      "--disable-dev-shm-usage",        // CRITICAL in Docker — prevents OOM crashes
      "--disable-extensions",
      "--disable-background-networking",
      "--disable-background-timer-throttling",
      "--disable-renderer-backgrounding",
      "--disable-sync",
      "--disable-translate",
      "--disable-default-apps",
      "--disable-hang-monitor",
      "--metrics-recording-only",
      "--no-first-run",
    ]
  }
}
```

`--disable-dev-shm-usage` is especially impactful in the Docker CI runtime since `/dev/shm` is typically limited to 64MB, causing Chrome to crash under load.

---

### 2. Replace `waitForLoadState("networkidle")` with Targeted Waits

**Every single test file** uses this pattern:

```js
await page.waitForLoadState("networkidle");
```

`networkidle` waits until there are no network requests for 500ms — it's the slowest load state and is fragile when apps have long-polling or periodic requests. Replace with element-based waits:

```js
// Instead of:
await page.waitForLoadState("networkidle");

// Prefer waiting for the widget's root element to appear:
await page.locator(".mx-datagrid").waitFor({ state: "visible" });
// or
await page.locator(".widget-badge").waitFor();
```

This could cut seconds off each test's setup time.

---

### 3. Disable Animations for Visual Tests

Visual snapshot tests are sensitive to CSS animations causing flakiness and slower execution:

```js
use: {
  contextOptions: {
    reducedMotion: "reduce",
  }
}
```

Or via launch args:

```js
args: ["--animation-duration-scale=0"]
```

---

### 4. Block Unnecessary Network Requests

In tests that don't need analytics or external resources, intercept and abort them:

```js
// In a shared beforeEach or fixture
await page.route("**/*.{png,jpg,woff2}", route => route.abort());
await page.route(/google-analytics|analytics\.js/, route => route.abort());
```

---

### 5. Share Browser Context for Read-Only Tests

Currently every test gets a fresh Mendix session, limited to 5 by license. For tests that only read data (no mutations), a shared `browserContext` in `beforeAll/afterAll` avoids the per-test session creation cost:

```js
test.describe("read-only group", () => {
    let sharedPage;
    test.beforeAll(async ({ browser }) => {
        sharedPage = await browser.newPage();
        await sharedPage.goto("/p/datagrid");
        await sharedPage.waitForLoadState("networkidle");
    });
    test.afterAll(async () => {
        await sharedPage.evaluate(() => window.mx.session.logout());
        await sharedPage.close();
    });
    // tests use sharedPage instead of page fixture
});
```

---

### 6. Introduce a Shared Playwright Fixture for Mendix Navigation

Currently each test manually navigates and waits. A custom fixture would centralize this and allow easy optimization in one place:

```js
// automation/run-e2e/fixtures.js
const { test: base } = require("@playwright/test");

exports.test = base.extend({
    mendixPage: async ({ page }, use) => {
        // centralized wait strategy — easy to tune globally
        await page.goto("/");
        await page.waitForSelector(".mx-app", { state: "visible" });
        await use(page);
        await page.evaluate(() => window.mx.session.logout());
    }
});
```

This would let you swap out the wait strategy across all 59 test files from one location.

---

### 7. Increase CI Workers (Within Session Limit)

Currently `workers: CI ? 4 : undefined`. The Mendix 5-session license limit means you're spending more time on session management than needed. With the `afterEach` logout pattern, sessions are released immediately — so increasing to 5 workers is safe:

```js
workers: process.env.CI ? 5 : undefined,
```

---

### 8. Docker: Mount Adequate `/dev/shm`

In `docker-utils.mjs`, if Chrome is run inside Docker, ensure the container has enough shared memory:

```yaml
# docker-compose
shm_size: '2gb'
```

Or pass `--shm-size=2g` to the Docker run command. Without this, Chrome silently OOMs on heavy pages.

---

### 9. Use `--font-render-hinting=none` for Consistent Screenshots

Visual tests produce different snapshots across machines/OS due to font rendering differences. This flag makes rendering more deterministic:

```js
args: ["--font-render-hinting=none"]
```

This reduces the number of `chromium-linux.png` vs `chromium-darwin.png` divergences and can reduce snapshot file sizes.

---

## Summary Table

| Idea | Impact | Effort | Priority |
|---|---|---|---|
| `--disable-dev-shm-usage` in Docker | High (prevents crashes) | Low | Critical |
| Replace `networkidle` with element waits | High (speed) | Medium | High |
| Add Chrome launch flags | Medium (memory/speed) | Low | High |
| Increase CI workers to 5 | Low-Medium (throughput) | Low | Medium |
| Disable animations | Medium (stability) | Low | Medium |
| Block unnecessary network requests | Low-Medium | Medium | Medium |
| Shared context for read-only tests | Medium (speed) | Medium | Medium |
| Shared Mendix fixture | Low (maintainability) | Medium | Low |
| `--font-render-hinting=none` | Low (consistency) | Low | Low |

The highest-leverage changes are (1) adding `--disable-dev-shm-usage` for the Docker CI environment and (2) replacing `waitForLoadState("networkidle")` with targeted element waits, since those two patterns are in every test run.
