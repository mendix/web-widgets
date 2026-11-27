import { expect, Locator, Page, test } from "@playwright/test";

// Fixture: host/fixtures/people.ts. 30 people, page size 10, ages 20..49 all distinct.
const FIRST_NAME = 2;
const AGE = 4;

class Grid {
    readonly root: Locator;
    readonly rows: Locator;

    constructor(public readonly page: Page) {
        this.root = page.locator(".mx-name-datagrid1");
        this.rows = this.root.locator(".widget-datagrid-grid-body [role=row]");
    }

    column(n: number): Locator {
        return this.rows.locator(`[role=gridcell]:nth-child(${n})`);
    }

    header(name: string): Locator {
        return this.root.getByRole("button", { name: `sort ${name}` });
    }

    get pagingStatus(): Locator {
        return this.root.locator(".paging-status");
    }
}

test.beforeEach(async ({ page }) => {
    await page.goto("/?scenario=datagrid-basic");
});

test("renders the first page of rows from the store", async ({ page }) => {
    const grid = new Grid(page);
    await expect(grid.rows).toHaveCount(10);
    await expect(grid.column(FIRST_NAME).first()).toHaveText("Loretta");
    await expect(grid.pagingStatus).toHaveText("1 to 10 of 30");
});

test("sorts by a column ascending, then descending", async ({ page }) => {
    const grid = new Grid(page);
    await grid.header("Age").click();
    await expect(grid.column(AGE).first()).toHaveText("20");
    await expect(grid.column(AGE).nth(9)).toHaveText("29");

    await grid.header("Age").click();
    await expect(grid.column(AGE).first()).toHaveText("49");
    await expect(grid.column(AGE).nth(9)).toHaveText("40");
});

test("filters rows with the column text filter, case-insensitively", async ({ page }) => {
    const grid = new Grid(page);
    await grid.root.getByRole("textbox", { name: "filter" }).fill("ADA");

    await expect(grid.rows).toHaveCount(3);
    await expect(grid.column(FIRST_NAME)).toHaveText(["Ada", "Ada", "Ada"]);
    await expect(grid.pagingStatus).toHaveText("1 to 3 of 3");
});

test("pages through the data source", async ({ page }) => {
    const grid = new Grid(page);
    await grid.root.getByRole("button", { name: "Go to next page" }).click();
    await expect(grid.pagingStatus).toHaveText("11 to 20 of 30");
    await expect(grid.column(AGE).first()).toHaveText("30");

    await grid.root.getByRole("button", { name: "Go to last page" }).click();
    await expect(grid.pagingStatus).toHaveText("21 to 30 of 30");
    await expect(grid.rows).toHaveCount(10);
});

test("re-renders when the store changes and records row click actions", async ({ page }) => {
    const grid = new Grid(page);
    await expect(grid.column(FIRST_NAME).first()).toHaveText("Loretta");

    await page.evaluate(() => (window as any).harness.harness.store.update("p01", { firstName: "Zed" }));
    await expect(grid.column(FIRST_NAME).first()).toHaveText("Zed");

    await grid.column(AGE).nth(1).click();
    const calls = await page.evaluate(() => (window as any).harness.harness.calls);
    expect(calls).toEqual([{ name: "onClickRow", item: "p02" }]);
});
