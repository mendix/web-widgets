import { test, expect } from "@playwright/test";

test.describe("Progress Bar", () => {
    test("renders in a group box", async ({ page }) => {
        await page.goto("p/groupBox");

        const textBox = await page.$(".mx-name-textBox1");
        const textBoxContent = await textBox.textContent();

        const progressBar = await page.$(".widget-progress-bar.mx-name-progressBar1 .progress-bar");
        await expect(progressBar).toHaveText(textBoxContent.trim());
    });

    test("renders when listens to data grid", async ({ page }) => {
        await page.goto("p/listenToGrid");

        const gridRow = await page.$(".mx-name-index-0");
        await gridRow.click();

        const gridCell = await gridRow.$(".mx-datagrid-data-wrapper");
        const cellContent = await gridCell.textContent();

        const progressBar = await page.$(".widget-progress-bar.mx-name-progressBar1 .progress-bar");
        await expect(progressBar).toHaveText(cellContent.trim());
    });

    test("renders in a list view", async ({ page }) => {
        await page.goto("p/listView");

        const textBox = await page.$(".mx-name-textBox1");
        const textBoxContent = await textBox.textContent();

        const progressBar = await page.$(".widget-progress-bar.mx-name-progressBar1 .progress-bar");
        await expect(progressBar).toHaveText(textBoxContent.trim());
    });

    test("renders in a template grid", async ({ page }) => {
        await page.goto("p/templateGrid");

        const textBox = await page.$(".mx-name-textBox1 .form-control-static");
        const textBoxContent = await textBox.textContent();

        const progressBar = await page.$(".widget-progress-bar.mx-name-progressBar1 .progress-bar", { timeout: 10000 });
        await expect(progressBar).toHaveText(textBoxContent);
    });

    test("renders in a tab container", async ({ page }) => {
        await page.goto("p/tabContainer");

        const tabPage = await page.$(".mx-name-tabPage2");
        await tabPage.click();

        const textBox = await page.$(".mx-name-textBox1");
        const textBoxContent = await textBox.textContent();

        const progressBar = await page.$(".widget-progress-bar.mx-name-progressBar1 .progress-bar");
        await expect(progressBar).toHaveText(textBoxContent);
    });
});
