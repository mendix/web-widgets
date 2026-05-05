import { test as base, expect } from "@playwright/test";

/**
 * Waits for the Mendix application to be fully initialized.
 * Checks for mx.session existence and absence of progress indicators.
 */
async function waitForMendixApp(page, timeout = 30_000) {
    await page.waitForFunction(
        // eslint-disable-next-line no-undef
        () => Boolean(window.mx?.session) && !document.querySelector(".mx-progress-indicator"),
        { timeout }
    );
}

export { expect };

export const test = base.extend({
    page: async ({ page }, use) => {
        const originalGoto = page.goto.bind(page);
        page.goto = async (url, options) => {
            const response = await originalGoto(url, options);
            await waitForMendixApp(page);
            return response;
        };

        try {
            await use(page);
        } finally {
            // eslint-disable-next-line no-undef
            await page.evaluate(() => window.mx?.session?.logout?.()).catch(() => {});
        }
    }
});
