import { test, expect } from "@playwright/test";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("with single target", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
    });

    test("sets attributes when condition is true", async ({ page }) => {
        await page.locator(".mx-name-radioButtons2 input").first().click();
        await expect(page.locator(".mx-name-text3")).toBeVisible();
        await expect(await page.locator(".mx-name-text3").getAttribute("trueCondition")).toBe("true");
    });

    test("hides attributes when condition is false", async ({ page }) => {
        await page.locator(".mx-name-radioButtons2 input").first().click();
        await expect(page.locator(".mx-name-text3")).toBeVisible();
        await expect(await page.locator(".mx-name-text3").getAttribute("a11yhelper")).not.toBe("a11yhelper");
    });

    test("updates target attributes when attributes are expression", async ({ page }) => {
        await page.locator(".mx-name-radioButtons2 input").first().click();
        await expect(page.locator(".mx-name-text3")).toBeVisible();
        await expect(page.locator(".mx-name-textBox1")).toBeVisible();
        await page.locator(".mx-name-textBox1 input").fill("test", { force: true });
        await page.locator(".mx-name-radioButtons1 input").first().click();
        await expect(await page.locator(".mx-name-text3").getAttribute("expressionValue")).toBe("test");
    });

    test("updates target attributes using a NF", async ({ page }) => {
        await page.locator(".mx-name-radioButtons2 input").first().click();
        await page.locator(".mx-name-radioButtons2 input").first().click();
        await page.locator(".mx-name-radioButtons1 input").first().click();
        await page.locator(".mx-name-radioButtons1 input").first().click();
        await page.locator(".mx-name-actionButton1").click();
        await page.locator(".mx-name-actionButton1").click();
        await expect(await page.locator(".mx-name-text3").getAttribute("expressionValue")).toBe("NF changes");
    });

    test("sets target attributes even though target's props changed eg: textinput", async ({ page }) => {
        await page.locator(".mx-name-radioButtons2 input").first().click();
        await page.locator(".mx-name-radioButtons1 input").first().click();
        await expect(page.locator(".mx-name-text3")).toHaveAttribute("a11yhelper", /a11yhelper/);
        await page.locator(".mx-name-textBox1 input").fill("test", { force: true });
        await page.locator(".mx-name-radioButtons2 input").first().click();
        await expect(page.locator(".mx-name-text3")).toHaveAttribute("expressionvalue", /test/);
    });

    test("sets target attributes even though target is conditionally shown after being hidden", async ({ page }) => {
        await page.locator(".mx-name-radioButtons2 input").first().click();
        await page.locator(".mx-name-radioButtons1 input").first().click();
        await expect(page.locator(".mx-name-text3")).toHaveAttribute("a11yhelper", /a11yhelper/);
        await page.locator(".mx-name-radioButtons1 input").last().click();
        await page.locator(".mx-name-radioButtons1 input").first().click();
        await expect(page.locator(".mx-name-text3")).toHaveAttribute("a11yhelper", /a11yhelper/);
    });
    test.describe("with multiple targets", () => {
        test("sets attributes when condition is true", async ({ page }) => {
            await page.click(".mx-name-actionButton2");
            await page.click(".mx-name-actionButton2");
            await page.waitForLoadState("networkidle");
            await page.click(".mx-name-radioButtons2 input:first-child");
            await page.click(".mx-name-radioButtons2 input:first-child");
            await expect(page.locator(".mx-name-text3")).toHaveAttribute("trueCondition", "true");
            await expect(page.locator(".mx-name-text4")).toHaveAttribute("trueCondition", "true");
        });

        test("hides attributes when condition is false", async ({ page }) => {
            await page.click(".mx-name-actionButton2");
            await page.waitForLoadState("networkidle");
            await page.click(".mx-name-radioButtons2 input:first-child");
            await page.click(".mx-name-radioButtons2 input:first-child");
            await expect(page.locator(".mx-name-text3")).not.toHaveAttribute("a11yhelper", "a11yhelper");
            await expect(page.locator(".mx-name-text4")).not.toHaveAttribute("a11yhelper", "a11yhelper");
        });

        test("updates target attributes when attributes are expression", async ({ page }) => {
            await page.click(".mx-name-actionButton2");
            await page.waitForLoadState("networkidle");
            await page.click(".mx-name-radioButtons2 input:first-child");
            await page.click(".mx-name-radioButtons2 input:first-child");
            await page.locator(".mx-name-textBox1 input").fill("test", { force: true });
            await page.click(".mx-name-radioButtons1 input:first-child");
            await page.click(".mx-name-radioButtons1 input:first-child");
            await expect(page.locator(".mx-name-text3")).toHaveAttribute("expressionValue", "test");
            await expect(page.locator(".mx-name-text4")).toHaveAttribute("expressionValue", "test");
        });

        test("updates target attributes using a NF", async ({ page }) => {
            await page.click(".mx-name-actionButton2");
            await page.click(".mx-name-actionButton2");
            await page.waitForLoadState("networkidle");
            await page.click(".mx-name-radioButtons2 input:first-child");
            await page.click(".mx-name-radioButtons2 input:first-child");
            await page.click(".mx-name-radioButtons1 input:first-child");
            await page.click(".mx-name-radioButtons1 input:first-child");
            await page.click(".mx-name-actionButton1");
            await page.click(".mx-name-actionButton1");
            await expect(page.locator(".mx-name-text3")).toHaveAttribute("expressionValue", "NF changes");
            await expect(page.locator(".mx-name-text4")).toHaveAttribute("expressionValue", "NF changes");
        });

        test("sets target attributes even though target's props changed eg: textinput", async ({ page }) => {
            await page.click(".mx-name-actionButton2");
            await page.waitForLoadState("networkidle");
            await page.click(".mx-name-radioButtons2 input:first-child");
            await page.click(".mx-name-radioButtons1 input:first-child");
            await page.locator(".mx-name-textBox1 input").fill("test", { force: true });
            await page.click(".mx-name-radioButtons2 input:first-child");
            await expect(page.locator(".mx-name-text3")).toHaveAttribute("a11yhelper", /a11yhelper/);
            await expect(page.locator(".mx-name-text4")).toHaveAttribute("a11yhelper", /a11yhelper/);
            await expect(page.locator(".mx-name-text3")).toHaveAttribute("expressionValue", /test/);
            await expect(page.locator(".mx-name-text4")).toHaveAttribute("expressionValue", /test/);
        });

        test("sets target attributes even though target is conditionally shown after being hidden", async ({
            page
        }) => {
            await page.click(".mx-name-actionButton2");
            await page.click(".mx-name-actionButton2");
            await page.waitForLoadState("networkidle");
            await page.click(".mx-name-radioButtons2 input:first-child");
            await page.click(".mx-name-radioButtons2 input:first-child");
            await page.click(".mx-name-radioButtons1 input:first-child");
            await page.click(".mx-name-radioButtons1 input:first-child");
            await expect(page.locator(".mx-name-text3")).toHaveAttribute("a11yhelper", /a11yhelper/);
            await expect(page.locator(".mx-name-text4")).toHaveAttribute("a11yhelper", /a11yhelper/);
            await page.click(".mx-name-radioButtons1 input");
            await page.click(".mx-name-radioButtons1 input");
            await page.click(".mx-name-radioButtons1 input:first-child");
            await page.click(".mx-name-radioButtons1 input:first-child");
            await expect(page.locator(".mx-name-text3")).toHaveAttribute("a11yhelper", /a11yhelper/);
            await expect(page.locator(".mx-name-text4")).toHaveAttribute("a11yhelper", /a11yhelper/);
        });
    });
});
