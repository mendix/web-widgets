import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

function getTreeNodeHeaders(page) {
    return page.locator(".mx-name-treeNode1 .widget-tree-node-branch-header-value");
}

test.describe("capabilities: expand", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
    });

    test("expands a node", async ({ page }) => {
        const headers = await getTreeNodeHeaders(page);
        await headers.first().click();
        await expect(page.locator(".mx-name-treeNode1")).toHaveScreenshot(`treeNodeExpanded.png`, 0.1);
    });

    test("expands multiple nodes", async ({ page }) => {
        const headers = await getTreeNodeHeaders(page);
        await headers.nth(1).click();
        await headers.first().click();
        await expect(page.locator(".mx-name-treeNode1")).toHaveScreenshot(`treeNodeMultipleExpanded.png`, 0.1);
    });
});

test.describe("capabilities: collapse", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
    });

    test("collapses a node", async ({ page }) => {
        const headers = await getTreeNodeHeaders(page);
        await headers.first().click();
        await headers.first().click();
        await expect(page.locator(".mx-name-treeNode1")).toHaveScreenshot(`treeNodeCollapsed.png`, 0.1);
    });

    test("collapses multiple nodes", async ({ page }) => {
        const headers = await getTreeNodeHeaders(page);
        await headers.nth(1).click();
        await headers.first().click();
        await headers.nth(11).click();
        await headers.nth(11).click();
        await headers.first().click();
        // Second header has become the 5th cuz first header was opened and introduces 3 headers.
        await headers.nth(4).click();
        await expect(page.locator(".mx-name-treeNode1")).toHaveScreenshot(`treeNodeMultipleCollapsed.png`, 0.1);
    });
});

test.describe("a11y testing:", () => {
    test("checks accessibility violations", async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");

        await page.locator(".mx-name-treeNode1").waitFor();
        const accessibilityScanResults = await new AxeBuilder({ page })
            .include(".mx-name-treeNode1")
            .withTags(["wcag21aa"])
            .exclude(".mx-name-navigationTree3")
            .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
    });
});
