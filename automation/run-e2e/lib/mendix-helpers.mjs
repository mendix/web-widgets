/* eslint-disable no-undef */
import { expect } from "@playwright/test";

export async function waitForMendixApp(page, timeout = 60_000) {
    await page.waitForLoadState("domcontentloaded");
    await page.waitForFunction(
        () =>
            Boolean(window.mx?.session) &&
            !document.querySelector(".mx-progress-indicator") &&
            document.querySelector(".mx-page") !== null,
        undefined,
        { timeout }
    );
}

export async function waitForDataReady(page, timeout = 60_000) {
    await waitForMendixApp(page, timeout);
    await page.waitForLoadState("networkidle");
}

export async function waitForWidget(page, mxName, timeout = 15_000) {
    const locator = page.locator(`.mx-name-${mxName}`);
    await expect(locator).toBeVisible({ timeout });
    return locator;
}

export async function waitForListData(page, mxName, minRows = 1, timeout = 15_000) {
    const container = page.locator(`.mx-name-${mxName}`);
    await expect(container).toBeVisible({ timeout });
    const rows = container.locator("[class*='item'], tr[class*='row'], [class*='gallery-item']");
    await expect(rows).toHaveCount(minRows, { timeout });
    return rows;
}

export async function safeLogout(page) {
    await page.evaluate(() => window.mx?.session?.logout?.()).catch(() => {});
}

export async function navigateToPage(page, path, timeout = 30_000) {
    await page.goto(path);
    await waitForMendixApp(page, timeout);
}

export async function waitFrames(page, n = 2) {
    for (let i = 0; i < n; i++) {
        await page.evaluate(() => new Promise(r => requestAnimationFrame(r)));
    }
}

export async function checkAccessibility(page, selector, options = {}) {
    const AxeBuilder = (await import("@axe-core/playwright")).default;
    let builder = new AxeBuilder({ page }).withTags(options.tags || ["wcag21aa"]);
    if (selector) {
        builder = builder.include(selector);
    }
    if (options.exclude) {
        for (const sel of [].concat(options.exclude)) {
            builder = builder.exclude(sel);
        }
    }
    const results = await builder.analyze();
    expect(results.violations).toEqual([]);
}
