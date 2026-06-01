You are helping the developer write or improve Playwright e2e specs for a Mendix pluggable widget in the web-widgets monorepo.

## Context

- E2e specs live at: `packages/pluggableWidgets/<widget>/e2e/*.spec.js`
- Specs run against a live Mendix runtime (Docker CI or Studio Pro dev mode)
- Playwright strict mode is ON — a locator that resolves to multiple elements throws immediately
- Each test opens a new Mendix session; the license allows max 5 concurrent sessions

## Mandatory boilerplate

Every spec file must include a session cleanup hook:

```js
import { test, expect } from "@playwright/test";

test.afterEach("Cleanup session", async ({ page }) => {
    // Force logout after every test — Mendix limits concurrent sessions to 5
    await page.evaluate(() => window.mx.session.logout());
});
```

Without this, sessions accumulate and later tests will fail with a session-limit error.

## Navigating to pages

**Option A — Direct URL (use when the page has a URL slug configured in Studio Pro):**

```js
test.beforeEach(async ({ page }) => {
    await page.goto("/p/my-page-slug");
});
```

**Option B — Navigation menu (use when no URL slug exists — this is the safe default):**

```js
async function navigateViaMenu(page, menuLabel, itemLabel) {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("menuitem", { name: menuLabel }).click();
    await page.getByRole("menuitem", { name: itemLabel }).click();
    await page.waitForLoadState("networkidle");
}

test.beforeEach(async ({ page }) => {
    await navigateViaMenu(page, "Different Views", "Listen To Grid");
});
```

Get the exact menu labels from the test project:

```bash
bash automation/mxcli/mx-testproject.sh inspect <widget>
# Navigation is included at the end of inspect output.
# Or run directly:
bash automation/mxcli/mx-testproject.sh exec <widget> "DESCRIBE NAVIGATION Responsive"
```

Always call `waitForLoadState("networkidle")` after navigation — Mendix pages fire multiple XHR requests on load and widgets may not be ready yet.

## Selectors

**Use `.mx-name-<widgetName>` selectors** — they are stable across Mendix versions and match how widgets are named in Studio Pro.

```js
// Good
page.locator(".mx-name-badgeDanger");
page.locator(".mx-name-dataGrid1");

// Avoid — brittle, tied to widget internals
page.locator(".widget-badge span:first-child");
```

To discover all `.mx-name-*` widget names available on a page, describe the page via mxcli:

```bash
bash automation/mxcli/mx-testproject.sh exec <widget> "DESCRIBE PAGE <Module>.<PageName>"
```

If you don't know the page name, first run `bash automation/mxcli/mx-testproject.sh list-pages <widget>`.

### Strict mode — multiple matches

A widget placed inside a list view or repeated container will produce multiple `.mx-name-*` elements. Playwright strict mode throws if your locator resolves to more than one element. Fix with `.first()` or a compound selector:

```js
// Throws if badgeV23 appears more than once:
await expect(page.locator(".mx-name-badgeV23")).toBeVisible(); // ❌

// Safe:
await expect(page.locator(".mx-name-badgeV23").first()).toBeVisible(); // ✓

// Or narrow with a compound class (badge variant only, not label variant):
await expect(page.locator(".widget-badge.badge.mx-name-badgeV23")).toBeVisible(); // ✓
```

The badge widget renders two `mx-name-*` elements when both a `badge` type and a `label` type share the same Studio Pro widget name — always check with `DESCRIBE PAGE` if you get unexpected strict-mode errors.

## Asserting content

**Wait for visibility before asserting text** — data-bound widgets may still be loading:

```js
const badge = page.locator(".mx-name-badgeDanger");
await expect(badge).toBeVisible();
await expect(badge).toHaveText("Expected text");
```

**For async state updates** (e.g., a data view that reloads when a grid row is selected), use a retrying assertion with a generous timeout instead of reading text synchronously:

```js
// ❌ Synchronous read — may race with data view update:
const text = await badge.textContent();
expect(text?.trim().length).toBeGreaterThan(0);

// ✓ Auto-retrying assertion — waits up to 10 s for non-empty content:
await expect(badge).toHaveText(/.+/, { timeout: 10000 });
```

**Do not assert Atlas design classes** (e.g., `badge-danger`, `btn-primary`) — these are applied via Atlas design properties configured in Studio Pro and may or may not produce a matching CSS class depending on the Atlas version in the test project. Assert visibility and text content instead:

```js
// ❌ Fragile — Atlas class may not be on the element:
await expect(badge).toHaveClass(/badge-danger/);

// ✓ Robust — tests what the widget actually does:
await expect(badge).toBeVisible();
```

## Structuring tests

Group tests with `test.describe` by feature area. A good split for widget specs:

```
<widget>.spec.js     — core behavior: rendering, data binding, visual snapshot
onClick.spec.js      — microflow, nanoflow, keyboard accessibility
dataTypes.spec.js    — each supported Mendix attribute type
layouts.spec.js      — widget behavior inside list view, tab, data view, listen-to-grid
```

Keep each spec file focused. Avoid one giant file — Playwright runs files in parallel and smaller files improve isolation.

### Visual snapshots

Use sparingly — only for the main page to catch unintended rendering regressions:

```js
test("visual comparison", async ({ page }) => {
    await expect(page.locator(".mx-name-badgeDanger")).toBeVisible();
    await expect(page).toHaveScreenshot("badge.png");
});
```

When a data mutation in a prior test changes the snapshot baseline, update it:

```bash
# Re-run only the visual test and update the snapshot:
pnpm --filter @mendix/<widget> run e2e --no-setup-project --no-update-project -- --update-snapshots
```

The snapshot file lives at `e2e/<spec>.spec.js-snapshots/<name>-chromium-darwin.png`.

## onClick patterns

**Nanoflow — verify via dialog:**

```js
test("clicking badge calls nanoflow and shows result in dialog", async ({ page }) => {
    await page.locator(".mx-name-badgeCallNanoflow").click();
    await expect(page.locator(".modal-body")).toBeVisible();
    await expect(
        page
            .locator("div")
            .filter({ hasText: /^Data stringNewSuccess$/ })
            .locator("div")
    ).toContainText("NewSuccess");
});
```

**Keyboard accessibility:**

```js
test("badge is keyboard accessible — Enter key triggers nanoflow", async ({ page }) => {
    await page.locator(".mx-name-badgeCallNanoflow").focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(".modal-body")).toBeVisible();
});
```

**Microflow smoke test (no dialog expected):**

```js
test("clicking badge calls microflow without error", async ({ page }) => {
    const badge = page.locator(".mx-name-badgeV22");
    await expect(badge).toBeVisible();
    await badge.click();
    // Microflow click should not throw — page stays intact after click
    await expect(badge).toBeVisible();
});
```

## Running tests

```bash
# Full CI run (Docker — downloads project, builds widget, runs Playwright):
pnpm --filter @mendix/<widget> run e2e

# Skip re-downloading the test project:
pnpm --filter @mendix/<widget> run e2e --no-setup-project

# Also skip rebuilding the widget MPK:
pnpm --filter @mendix/<widget> run e2e --no-setup-project --no-update-project
```

⚠️ Pass flags directly — do NOT use `pnpm run e2e -- --no-setup-project`. The `--` separator causes yargs-parser to ignore the flags.

## Checklist before marking a spec done

- [ ] `test.afterEach` with `window.mx.session.logout()` is present in every file
- [ ] No locator resolves to more than one element without `.first()` or a compound selector
- [ ] No assertions on Atlas design classes (e.g., `.toHaveClass(/badge-danger/)`)
- [ ] Async state updates use retrying assertions (`toHaveText`, `toBeVisible`) not synchronous reads
- [ ] `waitForLoadState("networkidle")` called after every menu-based navigation
- [ ] All 32+ tests pass in CI (`pnpm run e2e`)
