# Diagnostic Script Patterns

## Contents

- [Script Skeleton](#script-skeleton)
- [Layout / CSS](#layout--css)
- [Data](#data)
- [Interaction](#interaction)
- [Stale State / Value Update](#stale-state--value-update)
- [Performance](#performance)
- [Session Management](#session-management)
- [Adding New Patterns](#adding-new-patterns)

---

## Script Skeleton

Every diagnostic script follows this structure. Generate one per bug — keep it focused on the specific symptom.

```javascript
// <bug-description>.spec.js — temporary, delete or convert to regression test after use
import { test } from "@playwright/test";

test.afterEach(async ({ page }) => {
    // REQUIRED: prevent exceeding Mendix's 5-session license limit
    await page.evaluate(() => window.mx.session.logout());
});

test("diagnostic: <bug description>", async ({ page }) => {
    // 1. Navigate
    await page.goto("<page-url>");
    await page.waitForLoadState("networkidle");
    await page.locator("<widget-selector>").waitFor({ state: "visible", timeout: 15000 });

    // 2. Capture BEFORE metrics
    const before = await page.locator("<target-element>").evaluate(el => ({
        // ...metric capture — see templates below
    }));
    console.log("BEFORE:", JSON.stringify(before, null, 2));

    // 3. Trigger the condition that reveals the bug
    // await page.locator("...").click();
    // await page.waitForTimeout(300); // allow MobX + CSS reflow to settle

    // 4. Capture AFTER metrics (same as BEFORE)
    const after = await page.locator("<target-element>").evaluate(el => ({
        // ...same metric capture
    }));
    console.log("AFTER:", JSON.stringify(after, null, 2));

    // 5. Diagnosis log
    console.log("DIAGNOSIS:", {
        // compare before vs after to confirm/deny hypothesis
    });
});
```

**Run from widget package directory:**

```bash
npx playwright test e2e/<script>.spec.js --headed
```

---

## Layout / CSS

Capture dimensions, overflow state, and CSS custom properties:

```javascript
const metrics = await page.locator(".widget-datagrid-grid-body").evaluate(el => {
    const style = getComputedStyle(el);
    const container = el.closest("[class*='widget-datagrid-grid']");
    const containerStyle = container ? getComputedStyle(container) : null;

    return {
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
        offsetWidth: el.offsetWidth,
        maxHeight: style.maxHeight,
        overflow: style.overflow,
        overflowY: style.overflowY,
        hasScrollbar: el.scrollHeight > el.clientHeight,
        // Read CSS custom properties from the container
        gridBodyHeight: containerStyle?.getPropertyValue("--widgets-grid-body-height"),
        gridColumns: containerStyle?.getPropertyValue("--widgets-grid-template-columns")
    };
});
```

**For CSS grid layout issues:**

```javascript
const gridMetrics = await page.locator("[role='grid']").evaluate(el => ({
    gridTemplateColumns: getComputedStyle(el).gridTemplateColumns,
    columnCount: el.querySelectorAll("[role='columnheader']").length,
    childCount: el.children.length
}));
```

---

## Data

Count items and verify content correctness:

```javascript
const dataMetrics = await page.locator(".widget-datagrid").evaluate(el => {
    const rows = el.querySelectorAll("[role='row']:not([class*='header'])");
    const headers = el.querySelectorAll("[role='columnheader']");
    return {
        rowCount: rows.length,
        columnCount: headers.length,
        firstRowText: rows[0]?.textContent?.trim().slice(0, 100),
        lastRowText: rows[rows.length - 1]?.textContent?.trim().slice(0, 100),
        hasLoadingIndicator: !!el.querySelector("[class*='loading']"),
        hasEmptyState: !!el.querySelector("[class*='empty']")
    };
});
```

**For datasource / pagination state:**

```javascript
const pagingState = await page.evaluate(() => {
    // Read Mendix datasource state if accessible
    const pager = document.querySelector(".widget-datagrid .pagination-bar");
    return {
        paginationText: pager?.textContent?.trim(),
        hasNextButton: !!document.querySelector(".btn-next-page:not([disabled])"),
        hasPrevButton: !!document.querySelector(".btn-prev-page:not([disabled])")
    };
});
```

---

## Interaction

Verify event handling and selection feedback:

```javascript
// Click a row and verify selection state changes
await page.locator("[role='row']").nth(1).click();
await page.waitForTimeout(100);

const selectionState = await page.locator(".widget-datagrid").evaluate(el => ({
    selectedCount: el.querySelectorAll("[role='row'][aria-selected='true']").length,
    checkedCount: el.querySelectorAll("input[type='checkbox']:checked").length,
    hasSelectedClass: el.querySelectorAll(".tr-selected").length
}));
```

**For column hiding:**

```javascript
// Open column selector and hide first column
await page.locator(".column-selector-button").click();
const columnsBefore = await page.locator("[role='columnheader']").count();
await page.locator(".column-selectors > li").first().click();
await page.waitForTimeout(300);
const columnsAfter = await page.locator("[role='columnheader']").count();
console.log("Columns hidden:", columnsBefore - columnsAfter);
```

---

## Stale State / Value Update

Verify that a widget's displayed value updates when the underlying attribute changes externally (via popup, microflow, another widget on the same page).

**Generic pattern** (adapt selectors to your widget):

```javascript
// 1. Read the current displayed value
const valueBefore = await page.locator("<widget-display-selector>").textContent();
console.log("BEFORE:", valueBefore);

// 2. Trigger the external change (follow JIRA reproduction steps)
// Common patterns:
//   a) Click Edit button → change value in popup → close popup
//   b) Click a button that triggers a microflow/nanoflow changing the attribute
//   c) Change value in a different widget bound to the same attribute
await page.locator("<trigger-selector>").click();
await page.waitForLoadState("networkidle");
// ... perform the external change ...
await page.waitForLoadState("networkidle");

// 3. Read the displayed value again
const valueAfter = await page.locator("<widget-display-selector>").textContent();
console.log("AFTER:", valueAfter);

// 4. Compare — this is your BEFORE baseline (should show bug: changed === false)
console.log("DIAGNOSIS:", {
    changed: valueBefore !== valueAfter,
    valueBefore,
    valueAfter
});

// For regression test: convert to assertion
// expect(valueAfter).not.toBe(valueBefore);
```

**Widget-specific selectors** (add rows as you debug new widgets):

| Widget                               | Display value selector                                 | Notes                     |
| ------------------------------------ | ------------------------------------------------------ | ------------------------- |
| Combobox (text mode)                 | `.widget-combobox .widget-combobox-placeholder-text`   | Single-select label       |
| Combobox (custom content)            | `.widget-combobox .widget-combobox-placeholder-custom` | Custom content mode       |
| Combobox input                       | `.widget-combobox .widget-combobox-input`              | Search/filter input field |
| Combobox clear button                | `.widget-combobox .widget-combobox-clear-button`       | Visible when value is set |
| _Add rows as you debug more widgets_ |                                                        |                           |

**Also useful for:** text inputs, date pickers, dropdown filters, reference selectors, or any widget that should reflect attribute changes made by microflows, popups, or sibling widgets.

---

## Performance

Frame timing during interactions (scroll, load more):

```javascript
const perfMetrics = await page.evaluate(
    () =>
        new Promise(resolve => {
            const frameTimes = [];
            let last = performance.now();
            let count = 0;

            function measure(ts) {
                frameTimes.push(ts - last);
                last = ts;
                if (++count < 30) requestAnimationFrame(measure);
                else {
                    const avg = frameTimes.reduce((a, b) => a + b) / frameTimes.length;
                    resolve({
                        avgFrameMs: Math.round(avg),
                        maxFrameMs: Math.round(Math.max(...frameTimes)),
                        estimatedFps: Math.round(1000 / avg),
                        frameCount: frameTimes.length
                    });
                }
            }
            requestAnimationFrame(measure);
        })
);
```

**Render count** (add to component temporarily for deep debugging):

```javascript
// In browser console after navigating to the page:
const counts = {};
document.querySelectorAll("[data-testid]").forEach(el => {
    counts[el.dataset.testid] = (counts[el.dataset.testid] || 0) + 1;
});
console.table(counts);
```

---

## Session Management

**Always include this in every diagnostic script.** Mendix enforces a 5-session license limit — failing to logout will block subsequent test runs.

```javascript
// At the top of every diagnostic file, before any test.describe:
test.afterEach(async ({ page }) => {
    await page.evaluate(() => window.mx.session.logout());
});
```

If the page navigation fails before the session is created, the evaluate may throw. Wrap it:

```javascript
test.afterEach(async ({ page }) => {
    try {
        await page.evaluate(() => window.mx.session.logout());
    } catch {
        // Page never loaded — no session to clean up
    }
});
```

This pattern is copied from all existing E2E tests in the widget packages (e.g., `datagrid-web/e2e/DataGrid.spec.js:6`).

---

## Adding New Patterns

After a debugging session, if the bug category wasn't covered above, add a new section here.

**Recipe for a new pattern:**

1. **Section header:** `## <Category Name>` — must match an entry in the Bug Categories table in `SKILL.md`
2. **Generic Playwright code** with `<placeholder>` selectors so any widget developer can adapt it
3. **Widget-specific selector table** with rows for each widget you tested — saves the next developer from re-discovering selectors
4. **"Also useful for:" line** listing other widgets where the pattern applies

**Then update:**

- The Contents list at the top of this file
- The Bug Categories table in `SKILL.md` if the category is new

**Guideline:** Keep the generic template free of widget-specific class names. Put all widget-specific selectors in the table below the template. This way one pattern serves all widgets.
