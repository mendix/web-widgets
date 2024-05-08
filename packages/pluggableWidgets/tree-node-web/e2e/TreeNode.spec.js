import { test, expect } from "@playwright/test";

function getTreeNodeHeaders(page) {
    return page.locator(".mx-name-treeNode1 .widget-tree-node-branch-header-value");
}

test.describe("capabilities: expand", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test("expands a node", async ({ page }) => {
        const headers = await getTreeNodeHeaders(page);
        await headers.first().click();
        await expect(page.locator(".mx-name-treeNode1")).toHaveScreenshot(`treeNodeExpanded`, 0.1);
    });

    test("expands multiple nodes", async ({ page }) => {
        const headers = await getTreeNodeHeaders(page);
        await headers.nth(1).click();
        await headers.first().click();
        await expect(page.locator(".mx-name-treeNode1")).toHaveScreenshot(`treeNodeMultipleExpanded`, 0.1);
    });
});

test.describe("capabilities: collapse", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test("collapses a node", async ({ page }) => {
        const headers = await getTreeNodeHeaders(page);
        await headers.first().click();
        await headers.first().click();
        await expect(page.locator(".mx-name-treeNode1")).toHaveScreenshot(`treeNodeCollapsed`, 0.1);
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
        await expect(page.locator(".mx-name-treeNode1")).toHaveScreenshot(`treeNodeMultipleCollapsed`, 0.1);
    });
});

test.describe("a11y testing:", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test("checks accessibility violations", async ({ page }) => {
        await page.installAccessibilityService();
        await page.locator(".mx-name-treeNode1").scrollIntoViewIfNeeded();
        const snapshot = await page.accessibility.snapshot();

        expect(snapshot.violations).toEqual([]);
    });
});
