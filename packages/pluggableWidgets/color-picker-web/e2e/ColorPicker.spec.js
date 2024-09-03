import { test, expect } from "@playwright/test";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("color-picker-web", () => {
    test.describe("render a picker of mode", () => {
        test.slow("button", async ({ page, browserName }) => {
            const isFirefox = browserName === "firefox";

            await page.goto("/p/modePage");
            await page.waitForLoadState("networkidle");

            if (!isFirefox) {
                const colorPicker = await page.locator(".mx-name-colorPicker3 .widget-color-picker-inner");
                await expect(colorPicker).toBeVisible();
                await expect(colorPicker).toHaveCSS(
                    "background",
                    "rgb(76, 175, 80) none repeat scroll 0% 0% / auto padding-box border-box"
                );
            } else {
                const colorPicker = await page.locator(".mx-name-colorPicker3 .widget-color-picker-inner");
                await expect(colorPicker).toHaveCSS("background", "rgb(76, 175, 80)");
            }
        });

        test("input box", async ({ page }) => {
            await page.goto("/p/modePage");
            await page.waitForLoadState("networkidle");
            await page.click(".mx-name-tabPage2");
            const inputBox = await page.locator(".mx-name-colorPicker17 input");
            await expect(inputBox).toHaveValue("#4caf50");
        });

        test("inline", async ({ page }) => {
            await page.goto("/p/modePage");
            await page.waitForLoadState("networkidle");
            await page.click(".mx-name-tabPage3");
            const inlinePicker = await page.locator(".mx-name-colorPicker27 .sketch-picker");
            await expect(inlinePicker).toBeVisible();
        });
    });

    test.describe("renders a picker of type", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("/p/modePage");
            await page.waitForLoadState("networkidle");
            await page.click(".mx-name-tabPage3");
        });

        test("sketch", async ({ page }) => {
            const sketchPicker = await page.locator(".mx-name-colorPicker27 .sketch-picker");
            await expect(sketchPicker).toBeVisible();
        });

        test("block", async ({ page }) => {
            const blockPicker = await page.locator(".mx-name-colorPicker28 .block-picker");
            await expect(blockPicker).toBeVisible();
        });

        test("chrome", async ({ page }) => {
            const chromePicker = await page.locator(".mx-name-colorPicker29 .chrome-picker");
            await expect(chromePicker).toBeVisible();
        });

        test("github", async ({ page }) => {
            const githubPicker = await page.locator(".mx-name-colorPicker30 .github-picker");
            await expect(githubPicker).toBeVisible();
        });

        test("material", async ({ page }) => {
            const materialPicker = await page.locator(".mx-name-colorPicker31 .material-picker");
            await expect(materialPicker).toBeVisible();
        });

        test("swatches", async ({ page }) => {
            const swatchesPicker = await page.locator(".mx-name-colorPicker32 .swatches-picker");
            await expect(swatchesPicker).toBeVisible();
        });

        test("twitter", async ({ page }) => {
            const twitterPicker = await page.locator(".mx-name-colorPicker33 .twitter-picker");
            await expect(twitterPicker).toBeVisible();
        });

        test("circle", async ({ page }) => {
            const circlePicker = await page.locator(".mx-name-colorPicker34 .circle-picker");
            await expect(circlePicker).toBeVisible();
        });

        test("hue", async ({ page }) => {
            const huePicker = await page.locator(".mx-name-colorPicker35 .hue-picker");
            await expect(huePicker).toBeVisible();
        });

        test("slider", async ({ page }) => {
            const sliderPicker = await page.locator(".mx-name-colorPicker37 .slider-picker");
            await expect(sliderPicker).toBeVisible();
        });

        test("compact", async ({ page }) => {
            const compactPicker = await page.locator(".mx-name-colorPicker26 .compact-picker");
            await expect(compactPicker).toBeVisible();
        });
    });

    test.describe("renders with color format as", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("/p/colorFormat");
            await page.waitForLoadState("networkidle");
        });

        test.fixme("hex", async ({ page }) => {
            const hexInput = await page.locator(".mx-name-colorPicker24 input");
            await expect(hexInput).toBeVisible();
            await page.reload();
            await page.waitForLoadState("networkidle");
            await expect(hexInput).toBeVisible({ timeout: 10000 });
            await expect(hexInput).toBeEnabled({ timeout: 10000 });
            await expect(hexInput).toBeEditable({ timeout: 10000 });
            await expect(hexInput).toHaveValue("#4caf50");
        });

        test("rgb", async ({ page }) => {
            await page.click(".mx-name-tabPage2");
            const rgbInput = await page.locator(".mx-name-colorPicker17 input");
            await expect(rgbInput).toBeVisible();
            await expect(rgbInput).toHaveValue("rgb(42,94,210)");
        });

        test("rgba", async ({ page }) => {
            await page.click(".mx-name-tabPage3");
            const rgbaInput = await page.locator(".mx-name-colorPicker27 input");
            await expect(rgbaInput).toBeVisible();
            await expect(rgbaInput).toHaveValue("rgba(39,255,238,0.49)");
        });
    });
});
