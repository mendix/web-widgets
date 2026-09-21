/* global mx */
import { test, expect } from "@mendix/run-e2e/fixtures";

async function nativeResize(page, grid, delta) {
    const handle = grid.locator(".column-resizer").first();
    await handle.scrollIntoViewIfNeeded();
    const box = await handle.boundingBox();
    const x = box.x + box.width / 2,
        y = box.y + box.height / 2;
    const cdp = await page.context().newCDPSession(page);
    try {
        await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
        await cdp.send("Input.dispatchMouseEvent", {
            type: "mousePressed",
            x,
            y,
            button: "left",
            buttons: 1,
            clickCount: 1
        });
        await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: x + delta, y, button: "left", buttons: 1 });
        await cdp.send("Input.dispatchMouseEvent", {
            type: "mouseReleased",
            x: x + delta,
            y,
            button: "left",
            buttons: 0,
            clickCount: 1
        });
    } finally {
        await cdp.detach();
    }
}

test.describe("enabled top scrollbar fixture", () => {
    test.describe.configure({ mode: "serial" });
    test.skip(
        process.env.TOP_SCROLLBAR_ENABLED_FIXTURE !== "1",
        "Requires the isolated enabled-option fixture described in README.md"
    );

    test("native column resize preserves scrollbar sync and hide/show", async ({ page }) => {
        await page.setViewportSize({ width: 1200, height: 900 });
        await page.goto("/");
        const grid = page.locator(".mx-name-datagrid1");
        const column = grid.getByRole("columnheader", { name: "sort Age", exact: true });
        const initialWidth = await column.evaluate(e => e.getBoundingClientRect().width);
        await nativeResize(page, grid, 250);
        await expect
            .poll(() => column.evaluate(e => e.getBoundingClientRect().width))
            .toBeGreaterThan(initialWidth + 100);
        await page.setViewportSize({ width: 450, height: 900 });
        const content = grid.locator(".widget-datagrid-content");
        const top = grid.locator(".widget-datagrid-top-scrollbar");
        await expect(top).not.toHaveClass(/--collapsed/);
        await top.evaluate(e => {
            e.scrollLeft = 100;
        });
        await expect.poll(() => content.evaluate(e => e.scrollLeft)).toBe(100);
        await grid.getByRole("button", { name: "Column selector", exact: true }).click();
        await page.getByRole("menuitemcheckbox", { name: "Age", exact: true }).click();
        await expect(column).toHaveCount(0);
        await page.getByRole("menuitemcheckbox", { name: "Age", exact: true }).click();
        await expect(column).toBeVisible();
        await expect(top).not.toHaveClass(/--collapsed/);
    });

    test("keeps the existing grid keyboard navigation", async ({ page }) => {
        await page.setViewportSize({ width: 1200, height: 900 });
        await page.goto("/");
        const grid = page.locator(".mx-name-datagrid1");
        const top = grid.locator(".widget-datagrid-top-scrollbar");
        await expect(top).toHaveAttribute("aria-hidden", "true");
        await expect(top).toHaveAttribute("tabindex", "-1");
        const firstCell = grid.locator('[role="gridcell"][data-position="0,0"]');
        await firstCell.focus();
        await firstCell.press("ArrowRight");
        await expect(grid.locator('[role="gridcell"][data-position="1,0"]')).toBeFocused();
    });

    test("prepare 500 synthetic people in isolated runtime", async ({ page }) => {
        test.setTimeout(120000);
        await page.goto("/");
        expect(["127.0.0.1", "localhost", "[::1]"]).toContain(new URL(page.url()).hostname);
        const count = await page.evaluate(async () => {
            const existing = await new Promise((resolve, reject) =>
                mx.data.get({
                    xpath: "//MyFirstModule.Person[starts-with(FirstName, 'SMRP2434_')]",
                    callback: resolve,
                    error: reject
                })
            );
            for (let start = existing.length; start < 500; start += 20) {
                const batch = await Promise.all(
                    Array.from(
                        { length: Math.min(20, 500 - start) },
                        (_, offset) =>
                            new Promise((resolve, reject) =>
                                mx.data.create({
                                    entity: "MyFirstModule.Person",
                                    callback: object => {
                                        object.set("FirstName", `SMRP2434_${String(start + offset).padStart(4, "0")}`);
                                        object.set("LastName", "Synthetic scrollbar validation");
                                        object.set("Age", start + offset);
                                        object.set("Birthday", new Date(2000, 0, 1).getTime());
                                        resolve(object);
                                    },
                                    error: reject
                                })
                            )
                    )
                );
                await new Promise((resolve, reject) =>
                    mx.data.commit({
                        mxobjs: batch,
                        callback: resolve,
                        error: reject,
                        onValidation: () => reject(new Error("Validation failed"))
                    })
                );
            }
            return 500;
        });
        expect(count).toBe(500);
    });

    test("virtual scrolling keeps both axes independent with 500 available rows", async ({ page }) => {
        test.setTimeout(120000);
        await page.setViewportSize({ width: 1200, height: 900 });
        await page.goto("/p/virtual-scrolling");
        const grid = page.locator(".mx-name-dataGrid21");
        await expect(grid.getByRole("grid")).toBeVisible();
        await grid.scrollIntoViewIfNeeded();
        await expect(grid.getByRole("grid")).toHaveAttribute("style", /--widgets-grid-table-height/);
        await nativeResize(page, grid, 400);
        await page.setViewportSize({ width: 600, height: 900 });
        const table = grid.getByRole("grid");
        const top = grid.locator(".widget-datagrid-top-scrollbar");
        await expect.poll(() => table.evaluate(e => e.scrollWidth - e.clientWidth)).toBeGreaterThan(100);
        await expect(top).not.toHaveClass(/--collapsed/);
        await top.evaluate(e => {
            e.scrollLeft = 100;
        });
        await expect.poll(() => table.evaluate(e => e.scrollLeft)).toBe(100);
        for (let i = 0; i < 260 && (await grid.getByRole("row").count()) < 504; i++) {
            const before = await grid.getByRole("row").count();
            await table.evaluate(e => {
                e.scrollTop = e.scrollHeight;
            });
            await expect.poll(() => grid.getByRole("row").count()).toBeGreaterThan(before);
            await expect.poll(() => top.evaluate(e => e.scrollLeft)).toBe(100);
        }
        await expect(grid.getByRole("row")).toHaveCount(504);
        await expect(grid.getByRole("gridcell", { name: "SMRP2434_0499", exact: true })).toHaveCount(1);
        const vertical = await table.evaluate(e => e.scrollTop);
        await top.evaluate(e => {
            e.scrollLeft = 50;
        });
        await expect.poll(() => table.evaluate(e => e.scrollLeft)).toBe(50);
        await expect.poll(() => table.evaluate(e => e.scrollTop)).toBe(vertical);
        await grid.getByRole("button", { name: "Column selector", exact: true }).click();
        await page.getByRole("menuitemcheckbox", { name: "Name", exact: true }).click();
        await expect(grid.getByRole("columnheader", { name: "sort Name", exact: true })).toHaveCount(0);
        await page.getByRole("menuitemcheckbox", { name: "Name", exact: true }).click();
        await expect(grid.getByRole("columnheader", { name: "sort Name", exact: true })).toBeVisible();
        await grid.getByRole("button", { name: "Column selector", exact: true }).click();
        await top.evaluate(e => {
            e.scrollLeft = 80;
        });
        await expect.poll(() => table.evaluate(e => e.scrollLeft)).toBe(80);
        // Use the standard dir attribute at the Mendix page root, including Atlas RTL styles.
        await page.locator(".mx-page").evaluate(e => {
            e.dir = "rtl";
        });
        await expect(top).toHaveCSS("direction", "rtl");
        await expect(table).toHaveCSS("direction", "rtl");
        await top.evaluate(e => {
            e.scrollLeft = -100;
        });
        await expect.poll(() => table.evaluate(e => e.scrollLeft)).toBe(-100);
        await table.evaluate(e => {
            e.scrollLeft = -50;
        });
        await expect.poll(() => top.evaluate(e => e.scrollLeft)).toBe(-50);
        await expect.poll(() => table.evaluate(e => e.scrollTop)).toBeGreaterThan(0);
    });
});
