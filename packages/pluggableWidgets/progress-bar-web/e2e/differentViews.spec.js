import { test, expect } from "@mendix/run-e2e/fixtures";

test.describe("Progress Bar", () => {
    test("renders in a group box", async ({ page }) => {
        await page.goto("p/groupBox");

        const textBox = await page.locator(".mx-name-textBox1");
        const textBoxContent = await textBox.textContent();

        const progressBar = await page.locator(".widget-progress-bar.mx-name-progressBar1 .progress-bar");
        await expect(progressBar).toHaveText(textBoxContent.trim());
    });

    test("renders when listens to data grid", async ({ page }) => {
        await page.goto("p/listenToGrid");

        const gridRow = await page.locator(".mx-name-index-0");
        await gridRow.click();

        const gridCell = await gridRow.locator(".mx-datagrid-data-wrapper");
        const cellContent = await gridCell.textContent();

        const progressBar = await page.locator(".widget-progress-bar.mx-name-progressBar1 .progress-bar");
        await expect(progressBar).toHaveText(cellContent.trim());
    });

    test("renders in a list view", async ({ page }) => {
        await page.goto("p/listView");

        const textBox = await page.locator(".mx-name-textBox1");
        const textBoxContent = await textBox.textContent();

        const progressBar = await page.locator(".widget-progress-bar.mx-name-progressBar1 .progress-bar");
        await expect(progressBar).toHaveText(textBoxContent.trim());
    });

    test("renders in a template grid", async ({ page }) => {
        await page.goto("p/templateGrid");

        const textBox = page.locator(".mx-name-textBox1 .form-control-static");
        await expect(textBox).toHaveText(/\d/);
        const textBoxContent = await textBox.textContent();

        const progressBar = page.locator(".widget-progress-bar.mx-name-progressBar1 .progress-bar");
        await expect(progressBar).toHaveText(textBoxContent);
    });

    test("renders in a tab container", async ({ page }) => {
        await page.goto("p/tabContainer");

        const tabPage = await page.locator(".mx-name-tabPage2");
        await tabPage.click();

        const textBox = await page.locator(".mx-name-textBox1");
        const textBoxContent = await textBox.textContent();

        const progressBar = await page.locator(".widget-progress-bar.mx-name-progressBar1 .progress-bar");
        await expect(progressBar).toHaveText(textBoxContent);
    });
});
