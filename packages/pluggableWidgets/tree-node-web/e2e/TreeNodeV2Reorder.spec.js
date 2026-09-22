import { test, expect } from "@mendix/run-e2e/fixtures";

/**
 * Reordering tests for the v2 (self-referencing) tree on MyFirstModule.TreeNodeV2_Advanced.
 *
 * Page contract (test project branch `tree-node-web/v2`):
 *   - gallery1 lists MyFirstModule.Department, single selection. Both trees live in a
 *     data view bound to that selection, so a department must be selected first. Not every
 *     department has enough categories to reorder, so `openAdvancedPage` picks one that does.
 *   - treeNode1 = "Start expanded: No", treeNode2 = "Start expanded: Yes".
 *     Both sort their datasource on MyFirstModule.Category/Order ascending.
 *   - Each node's custom header renders "{Order}) {Name}" plus two action buttons:
 *       actionButton1 / actionButton3 -> ACT_MoveCategory(IsIncrement = true)  => Order + 1
 *       actionButton2 / actionButton4 -> ACT_MoveCategory(IsIncrement = false) => Order - 1
 *
 * Data contract: all sibling categories start from the same Order value (the shipped
 * data seeds every Category with Order = 0). One "+" click therefore moves a node past
 * all of its siblings to the last position, and one "-" click on it restores the
 * original position. `assertSingleOrderBaseline` fails loudly if that stops holding.
 *
 * Order is persisted, and the whole suite shares one Mendix runtime, so this file runs
 * serially and every test restores the Order value it changed.
 *
 * Note: the action buttons sit inside the node header, which is also the expand/collapse
 * target ("Open node on: Header click"), so a reorder click toggles the clicked node as
 * well. That is configuration, not a defect — assertions below deliberately only depend
 * on the state of ancestors and siblings of the clicked node.
 */

const TREES = {
    startCollapsed: {
        root: ".mx-name-treeNode1",
        label: ".mx-name-text2",
        moveDown: ".mx-name-actionButton1",
        moveUp: ".mx-name-actionButton2"
    },
    startExpanded: {
        root: ".mx-name-treeNode2",
        label: ".mx-name-text3",
        moveDown: ".mx-name-actionButton3",
        moveUp: ".mx-name-actionButton4"
    }
};

function rows(scope) {
    return scope.locator(":scope > li");
}

function header(row) {
    return row.locator(":scope > .widget-tree-node-branch-header");
}

function labels(scope, tree) {
    return scope.locator(`:scope > li > .widget-tree-node-branch-header ${tree.label}`);
}

function group(row) {
    return row.locator(":scope > .widget-tree-node-body > ul[role='group']");
}

function escapeForRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Matches a header label by node name only, ignoring the "{Order}) " prefix. */
function byName(name) {
    return new RegExp(`\\)\\s*${escapeForRegExp(name)}$`);
}

function nameOf(labelText) {
    return labelText.replace(/^\s*-?\d+\)\s*/, "").trim();
}

function orderOf(labelText) {
    const match = /^\s*(-?\d+)\)/.exec(labelText);
    return match ? match[1] : null;
}

/**
 * Reads the sibling labels once the list is rendered. Used to derive the expected
 * permutation; every assertion afterwards runs through a retrying locator assertion.
 */
async function readSiblings(labelsLocator) {
    await expect(labelsLocator.first()).toBeVisible();
    return (await labelsLocator.allTextContents()).map(text => text.trim());
}

function assertSingleOrderBaseline(siblingLabels) {
    const orders = new Set(siblingLabels.map(orderOf));
    expect(
        orders.size,
        `Siblings must all start from the same Order value for a single +/- click to move a node ` +
            `past them. Found: ${siblingLabels.join(" | ")}`
    ).toBe(1);
}

function assertEnoughSiblings(siblingLabels, what) {
    expect(siblingLabels.length, `The advanced page needs at least 2 ${what} to test reordering`).toBeGreaterThan(1);
}

/** Moves the first sibling to the end, then back, asserting both states. */
async function moveFirstToEndAndBack(scope, tree, names, extraAssertions) {
    const siblingLabels = labels(scope, tree);

    await header(rows(scope).first()).locator(tree.moveDown).click();
    await expect(siblingLabels).toHaveText([...names.slice(1), names[0]].map(byName));
    if (extraAssertions) {
        await extraAssertions();
    }

    await header(rows(scope).last()).locator(tree.moveUp).click();
    await expect(siblingLabels).toHaveText(names.map(byName));
}

async function openAdvancedPage(page) {
    await page.goto("/p/treenodev2_advanced");

    const gallery = page.locator(".mx-name-gallery1");
    await expect(gallery).toBeVisible();
    const departments = gallery.locator(".widget-gallery-item");
    await expect(departments.first()).toBeVisible();

    // Departments differ in how much data they carry — some hold a single root category,
    // which is not enough to reorder siblings. Select the first department whose tree has
    // at least 2 root categories and at least 2 children under the first root.
    const departmentCount = await departments.count();

    for (let index = 0; index < departmentCount; index++) {
        await departments.nth(index).click();

        // Both data views render once a department is selected.
        const collapsedRoots = rows(page.locator(TREES.startCollapsed.root));
        const expandedRoots = rows(page.locator(TREES.startExpanded.root));
        await expect(collapsedRoots.first()).toBeVisible();
        await expect(expandedRoots.first()).toBeVisible();

        if ((await collapsedRoots.count()) < 2) {
            continue;
        }

        // The start-expanded tree already renders the first root's children, so counting
        // them there needs no expand click.
        if ((await rows(group(expandedRoots.first())).count()) >= 2) {
            return;
        }
    }

    throw new Error(
        "No department on the advanced page has at least 2 root categories with at least 2 children " +
            "under the first root — the reordering tests cannot run against this test project data."
    );
}

test.describe.configure({ mode: "serial" });

test.describe("v2: reordering (advanced page)", () => {
    test.beforeEach(async ({ page }) => {
        await openAdvancedPage(page);
    });

    test("visual regression: start-collapsed tree", async ({ page }) => {
        const widget = page.locator(TREES.startCollapsed.root);
        await expect(widget).toBeVisible();
        await expect(widget).toHaveScreenshot("treeNodeV2AdvancedCollapsed.png");
    });

    test("visual regression: start-expanded tree", async ({ page }) => {
        const widget = page.locator(TREES.startExpanded.root);
        await expect(widget).toBeVisible();
        await expect(widget).toHaveScreenshot("treeNodeV2AdvancedExpanded.png");
    });

    test("reorders root nodes while the tree is collapsed @smoke", async ({ page }) => {
        const tree = TREES.startCollapsed;
        const treeRoot = page.locator(tree.root);

        await expect(rows(treeRoot).first()).toHaveAttribute("aria-expanded", "false");

        const baseline = await readSiblings(labels(treeRoot, tree));
        assertEnoughSiblings(baseline, "root categories");
        assertSingleOrderBaseline(baseline);

        await moveFirstToEndAndBack(treeRoot, tree, baseline.map(nameOf));
    });

    test("reorders children of an expanded node without collapsing it", async ({ page }) => {
        const tree = TREES.startCollapsed;
        const treeRoot = page.locator(tree.root);
        const parentRow = rows(treeRoot).first();
        const parentHeader = header(parentRow);

        await expect(
            parentHeader.locator(".widget-tree-node-branch-header-icon-container"),
            "The first root category must have children for this test"
        ).toBeVisible();

        // Expand through the icon container — it carries no action button of its own.
        await parentHeader.locator(".widget-tree-node-branch-header-icon-container").click();
        await expect(parentRow).toHaveAttribute("aria-expanded", "true");

        const childGroup = group(parentRow);
        const baseline = await readSiblings(labels(childGroup, tree));
        assertEnoughSiblings(baseline, "child categories under the first root");
        assertSingleOrderBaseline(baseline);

        // Every root that showed an expand affordance must still show it after the
        // datasource redelivery triggered by the reorder microflow.
        const rootIcons = treeRoot.locator(
            ":scope > li > .widget-tree-node-branch-header .widget-tree-node-branch-header-icon-container"
        );
        const rootIconCount = await rootIcons.count();

        await moveFirstToEndAndBack(childGroup, tree, baseline.map(nameOf), async () => {
            await expect(parentRow).toHaveAttribute("aria-expanded", "true");
            await expect(rootIcons).toHaveCount(rootIconCount);
        });

        await expect(parentRow).toHaveAttribute("aria-expanded", "true");
    });

    test("reorders children of an auto-expanded node when start expanded is on", async ({ page }) => {
        const tree = TREES.startExpanded;
        const treeRoot = page.locator(tree.root);
        const parentRow = rows(treeRoot).first();

        await expect(parentRow).toHaveAttribute("aria-expanded", "true");

        const childGroup = group(parentRow);
        const baseline = await readSiblings(labels(childGroup, tree));
        assertEnoughSiblings(baseline, "child categories under the first root");
        assertSingleOrderBaseline(baseline);

        const spinners = treeRoot.locator(".widget-tree-node-loading-spinner");

        await moveFirstToEndAndBack(childGroup, tree, baseline.map(nameOf), async () => {
            await expect(parentRow).toHaveAttribute("aria-expanded", "true");
            await expect(spinners).toHaveCount(0);
        });

        await expect(parentRow).toHaveAttribute("aria-expanded", "true");
        await expect(spinners).toHaveCount(0);
    });
});
