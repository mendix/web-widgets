/* eslint-disable no-undef */
import { test as base, expect } from "@playwright/test";

async function waitForMendixApp(page, timeout = 60_000) {
    await page.waitForLoadState("domcontentloaded");
    await page.waitForFunction(
        () =>
            Boolean(window.mx?.session) &&
            !document.querySelector(".mx-progress-indicator") &&
            document.querySelector(".mx-page") !== null,
        undefined,
        { timeout }
    );
    await page.waitForLoadState("networkidle");
}

export { expect };

export const test = base.extend({
    mendixSession: [
        async ({ browser }, use) => {
            const context = await browser.newContext();
            const page = await context.newPage();
            const originalGoto = page.goto.bind(page);
            page.goto = async (url, options) => {
                const response = await originalGoto(url, options);
                await waitForMendixApp(page);
                return response;
            };
            await use({ context, page });
            await page.evaluate(() => window.mx?.session?.logout?.()).catch(() => {});
            await context.close();
        },
        { scope: "worker" }
    ],
    page: async ({ mendixSession }, use) => {
        await use(mendixSession.page);
    }
});
