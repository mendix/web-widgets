# Page Discovery for Widget Debugging

## Contents

- [Tier 0: Running Test Project (MX_PROJECT_PATH)](#tier-0-running-test-project)
- [Tier 1: User-Provided URL](#tier-1-user-provided-url)
- [Tier 2: Grep Test Project XML](#tier-2-grep-test-project-xml)
- [Tier 3: Playwright Runtime Discovery](#tier-3-playwright-runtime-discovery)
- [Widget Type Reference](#widget-type-reference)

---

## Tier 0: Running Test Project

**When to use:** The user has `MX_PROJECT_PATH` set and the Studio Pro project is running at `http://localhost:8080`. This is the standard path for customer bug reproductions.

The app is already live — no XML grepping needed. Go directly to **Tier 3 (Playwright Runtime Discovery)** to find which page contains the widget configuration that matches the bug.

**Skip Tier 2** — the customer's test project page structure won't match the widget package's bundled test project XML.

**Typical setup confirmation:**

```bash
# Verify app is reachable
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080
# Expected: 200 or 302
```

---

## Tier 1: User-Provided URL

Navigate directly:

```
http://localhost:8080<url>   (e.g., http://localhost:8080/p/filtering-multi)
```

Done. Skip tiers 2 and 3.

---

## Tier 2: Grep Test Project XML

**When to use:** Widget has a deployed test project. Currently only `datagrid-web` and `column-chart-web` have them.

**Check availability:**

```bash
ls packages/pluggableWidgets/<widget>-web/tests/testProject/deployment/web/pages/ 2>/dev/null
```

**Find pages containing the widget:**

```bash
PAGES="packages/pluggableWidgets/<widget>-web/tests/testProject/deployment/web/pages/en_US"
grep -rl '"widget":"com.mendix.widget.web.<package>.<Name>"' "$PAGES"
```

Widget IDs follow the pattern `com.mendix.widget.web.<package>.<ClassName>`, e.g.:

- `com.mendix.widget.web.datagrid.Datagrid`
- `com.mendix.widget.web.columnchart.ColumnChart`

**Narrow by config** (e.g., virtual scrolling only):

```bash
grep -l '"pagination":"virtualScrolling"' "$PAGES"/**/*.page.xml
```

**Extract the URL from a matched page file:**

```bash
head -c 500 "<matched-file>.page.xml" | grep -oE "url='[^']*'"
```

Pages without a `url=` attribute are the home page (`/`) or pop-up pages opened by actions.

**Page XML structure notes:**

- Root element: `<m:page url='/p/...' title='...'>`
- Widgets declared as `"widget":"com.mendix.widget.web.<package>.<Name>"` in JSON inside `data-mendix-props`
- Instance selector: `"class":"mx-name-<instanceName>"` → `.mx-name-<instanceName>` in DOM

---

## Tier 3: Playwright Runtime Discovery

**When to use:** Widget has no deployed test project, or you need to check a live running app.

**Prerequisite:** App running at `localhost:8080` (or set `URL` env var for `playwright.config.cjs`).

```javascript
// discovery.spec.js — run standalone, delete after use
import { test } from "@playwright/test";

// Replace with the widget's root CSS class or mx-name pattern
const WIDGET_SELECTOR = ".widget-datagrid"; // e.g., .widget-gallery, .widget-combobox

test("discover pages containing target widget", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Collect navigation links from sidebar
    const navLinks = await page.$$eval("a[href*='/p/']", links =>
        links.map(l => ({ text: l.textContent?.trim(), href: l.getAttribute("href") }))
    );

    // Also try home page
    const allUrls = ["/", ...navLinks.map(l => l.href)];

    const found = [];
    for (const url of allUrls) {
        try {
            await page.goto(url);
            await page.waitForLoadState("networkidle");

            const widgets = await page.$$(WIDGET_SELECTOR);
            if (widgets.length > 0) {
                // Optionally read config from DOM
                const info = await page.evaluate(sel => {
                    const el = document.querySelector(sel);
                    return {
                        classes: el?.className,
                        dataAttrs: Object.fromEntries(
                            [...(el?.attributes ?? [])]
                                .filter(a => a.name.startsWith("data-"))
                                .map(a => [a.name, a.value])
                        )
                    };
                }, WIDGET_SELECTOR);

                found.push({ url, count: widgets.length, info });
                console.log(`FOUND on ${url}: ${widgets.length} widget(s)`);
                console.log(JSON.stringify(info, null, 2));
            }
        } catch (e) {
            // Page may not load or require auth — skip
        }
    }

    console.log("\nSummary:", found.map(f => `${f.url} (${f.count})`).join(", ") || "none found");

    await page.evaluate(() => window.mx.session.logout());
});
```

**Run:**

```bash
cd packages/pluggableWidgets/<widget>-web
npx playwright test e2e/discovery.spec.js --headed
```

**CSS class patterns by widget family:**

| Widget       | Root CSS Class                                                     |
| ------------ | ------------------------------------------------------------------ |
| Datagrid     | `.widget-datagrid`                                                 |
| Gallery      | `.widget-gallery`                                                  |
| Combobox     | `.widget-combobox`                                                 |
| Color Picker | `.widget-color-picker`                                             |
| Accordion    | `.widget-accordion`                                                |
| Any          | `.mx-name-<instanceName>` (always works if instance name is known) |

**Checking config in the DOM:**
Some widgets expose config via `data-` attributes or CSS classes that you can check with `page.evaluate()`:

- Virtual scrolling: look for `data-has-locked-height` on `.widget-datagrid-grid-body`
- Column hiding available: look for `.column-selector-button`
- Checkbox mode: look for `[role='checkbox']` in header row

---

## Widget Type Reference

| Package            | Widget ID                                       | Notes             |
| ------------------ | ----------------------------------------------- | ----------------- |
| `datagrid-web`     | `com.mendix.widget.web.datagrid.Datagrid`       | Has test project  |
| `column-chart-web` | `com.mendix.widget.web.columnchart.ColumnChart` | Has test project  |
| `gallery-web`      | `com.mendix.widget.web.gallery.Gallery`         | No test project   |
| `combobox-web`     | `com.mendix.widget.web.combobox.Combobox`       | No test project   |
| `accordion-web`    | `com.mendix.widget.web.accordion.Accordion`     | No test project   |
| (pattern)          | `com.mendix.widget.web.<package>.<Name>`        | Naming convention |

Widget package name → widget ID: drop the `-web` suffix, use the class name from `src/<Name>.tsx`.
