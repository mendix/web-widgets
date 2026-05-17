import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

async function navigateToV2Page(page) {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("menuitem", { name: "Tree Node V2" }).click();
    await page.waitForLoadState("networkidle");
}

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

test.describe("v2: lazy loading (parentAssociation)", () => {
    test.beforeEach(async ({ page }) => {
        await navigateToV2Page(page);
    });

    test("renders only root nodes initially", async ({ page }) => {
        const widget = page.locator(".mx-name-treeNodeV2_1");
        await expect(widget.getByRole("treeitem", { name: "Electronics" })).toBeVisible();
        await expect(widget.getByRole("treeitem", { name: "Clothing" })).toBeVisible();
        await expect(widget.getByRole("treeitem", { name: "Books" })).toBeVisible();
        // root nodes start collapsed — verify via aria-expanded (children are CSS-clipped, not removed from DOM)
        await expect(widget.getByRole("treeitem", { name: "Electronics" })).toHaveAttribute("aria-expanded", "false");
        await expect(widget.getByRole("treeitem", { name: "Clothing" })).toHaveAttribute("aria-expanded", "false");
    });

    test("shows expand icon on nodes that have children", async ({ page }) => {
        const widget = page.locator(".mx-name-treeNodeV2_1");
        const electronicsHeader = widget
            .getByRole("treeitem", { name: "Electronics" })
            .locator(".widget-tree-node-branch-header-icon-container");
        await expect(electronicsHeader).toBeVisible();
        // Books has no children — no icon
        const booksIcon = widget
            .getByRole("treeitem", { name: "Books" })
            .locator(".widget-tree-node-branch-header-icon-container");
        await expect(booksIcon).not.toBeVisible();
    });

    test("lazy loads children when a node is expanded", async ({ page }) => {
        const widget = page.locator(".mx-name-treeNodeV2_1");
        await widget
            .getByRole("treeitem", { name: "Electronics" })
            .locator(".widget-tree-node-branch-header")
            .first()
            .click();
        await expect(widget.getByRole("treeitem", { name: "Phones" })).toBeVisible();
        await expect(widget.getByRole("treeitem", { name: "Laptops" })).toBeVisible();
        await expect(widget.getByRole("treeitem", { name: "Tablets" })).toBeVisible();
    });

    test("lazy loads grandchildren when a nested node is expanded", async ({ page }) => {
        const widget = page.locator(".mx-name-treeNodeV2_1");
        await widget
            .getByRole("treeitem", { name: "Electronics" })
            .locator(".widget-tree-node-branch-header")
            .first()
            .click();
        const phonesItem = widget.getByRole("treeitem", { name: "Phones" });
        await expect(phonesItem).toBeVisible();
        await phonesItem.locator(".widget-tree-node-branch-header").first().click();
        // grandchildren load via network; assert Phones expanded (aria-expanded changes immediately)
        // then verify Android/iOS appear as treeitems in the DOM
        await expect(phonesItem).toHaveAttribute("aria-expanded", "true", { timeout: 8000 });
        await expect(widget.getByRole("treeitem", { name: "Android" })).toBeAttached({ timeout: 8000 });
        await expect(widget.getByRole("treeitem", { name: "iOS" })).toBeAttached({ timeout: 8000 });
    });

    test("collapses children when an expanded node is clicked again", async ({ page }) => {
        const widget = page.locator(".mx-name-treeNodeV2_1");
        const electronicsItem = widget.getByRole("treeitem", { name: "Electronics" });
        await electronicsItem.locator(".widget-tree-node-branch-header").first().click();
        await expect(widget.getByRole("treeitem", { name: "Phones" })).toBeVisible();
        await electronicsItem.locator(".widget-tree-node-branch-header").first().click();
        // Collapse is CSS-only (grid 0fr); assert via aria-expanded rather than child visibility
        await expect(electronicsItem).toHaveAttribute("aria-expanded", "false");
    });

    test("multiple root nodes can be expanded independently", async ({ page }) => {
        const widget = page.locator(".mx-name-treeNodeV2_1");
        await widget
            .getByRole("treeitem", { name: "Electronics" })
            .locator(".widget-tree-node-branch-header")
            .first()
            .click();
        await widget
            .getByRole("treeitem", { name: "Clothing" })
            .locator(".widget-tree-node-branch-header")
            .first()
            .click();
        await expect(widget.getByRole("treeitem", { name: "Phones" })).toBeVisible();
        await expect(widget.getByRole("treeitem", { name: "Men", exact: true })).toBeVisible();
        await expect(widget.getByRole("treeitem", { name: "Women" })).toBeVisible();
    });
});

test.describe("v2: startExpanded", () => {
    test.beforeEach(async ({ page }) => {
        await navigateToV2Page(page);
    });

    test("renders all nodes expanded when startExpanded is true", async ({ page }) => {
        const widget = page.locator(".mx-name-treeNodeV2_2");
        // All levels should be present with aria-expanded="true"
        await expect(widget.getByRole("treeitem", { name: "Electronics" }).first()).toBeVisible();
        await expect(widget.getByRole("treeitem", { name: "Phones" }).first()).toBeVisible();
        // Deep nodes load via network — allow extra time
        await expect(widget.getByRole("treeitem", { name: "Android" })).toHaveAttribute("aria-expanded", "true", {
            timeout: 8000
        });
        await expect(widget.getByRole("treeitem", { name: "iOS" })).toHaveAttribute("aria-expanded", "true", {
            timeout: 8000
        });
        await expect(widget.getByRole("treeitem", { name: "Men", exact: true })).toBeVisible();
    });

    test("can still collapse nodes when startExpanded is true", async ({ page }) => {
        const widget = page.locator(".mx-name-treeNodeV2_2");
        const electronicsItem = widget.getByRole("treeitem", { name: "Electronics" }).first();
        await electronicsItem.locator(".widget-tree-node-branch-header").first().click();
        // Collapse is CSS-only (grid 0fr); assert via aria-expanded rather than child visibility
        await expect(electronicsItem).toHaveAttribute("aria-expanded", "false");
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
