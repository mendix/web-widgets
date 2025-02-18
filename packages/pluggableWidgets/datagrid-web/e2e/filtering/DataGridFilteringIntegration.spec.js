import { test, expect } from "@playwright/test";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test("datagrid-web filtering integration", async ({ page }) => {
    const rows = async () => {
        return page.locator('.mx-name-dataGrid21 [role="row"]');
    };

    const rowCount = await rows();

    await page.goto("/p/filtering-integration");
    await page.waitForLoadState("networkidle");

    await expect(rowCount).toHaveCount(51);

    await page.getByRole("columnheader", { name: "First name" }).getByRole("textbox").fill("a");
    //await select("First name").fill("a");
    await expect(await rows()).toHaveCount(30);

    await page.getByRole("columnheader", { name: "Birth date" }).getByRole("textbox").fill("1/1/1990");
    //await select("Birth date").fill("1/1/1990");
    await page.getByRole("columnheader", { name: "First name" }).getByRole("textbox").click();
    await expect(await rows()).toHaveCount(14);

    await page.getByRole("spinbutton").fill("1995");
    //await select("Birth year").fill("1995");
    await expect(await rows()).toHaveCount(9);

    await page.getByRole("columnheader", { name: "Color (enum)" }).getByRole("combobox").click();
    //await select("Color (enum)").click();
    await page.locator(`[role="option"]:has-text("Black")`).click();
    //await option("Black").click();
    await expect(await rows()).toHaveCount(4);

    await page.getByRole("columnheader", { name: "Roles (ref set)" }).getByRole("combobox").click();
    //await select("Roles (ref set)").click();
    await page.locator(`[role="option"]:has-text("Careers adviser")`).click();
    //await option("Careers adviser").click();
    await expect(await rows()).toHaveCount(3);

    await page.getByRole("columnheader", { name: "Company" }).getByRole("combobox").click();
    //await select("Company").click();
    await page.locator(`[role="option"]:has-text("Sierra Health Services Inc")`).click();
    //await option("Sierra Health Services Inc").click();
    await expect(await rows()).toHaveCount(2);

    const row = (await rows()).nth(1);
    await expect(row).toHaveText(
        "Lina3/3/20042004BlackEnvironmental scientistCareers adviserPrison officerMarket research analystSierra Health Services Inc"
    );

    await expect(page).toHaveScreenshot(`datagridFilteringIntegration.png`);
});
