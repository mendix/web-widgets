import { test, expect } from "@playwright/test";

test.describe("color-picker-web", () => {
    test.describe("render a picker of mode", () => {
        test("button", async ({ page, browserName }) => {
            const isFirefox = browserName === "firefox";

            await page.goto("/p/modePage");

            if (!isFirefox) {
                const colorPicker = await page.$(".mx-name-colorPicker3 .widget-color-picker-inner");
                await expect(colorPicker).toBeVisible();
                await expect(colorPicker).toHaveCSS(
                    "background",
                    "rgba(0, 0, 0, 0) none repeat scroll 0% 0% / auto padding-box border-box"
                );
            } else {
                const colorPicker = await page.$(".mx-name-colorPicker3 .widget-color-picker-inner");
                await expect(colorPicker).toHaveCSS("background", "rgb(76, 175, 80)");
            }
        });

        test("input box", async ({ page }) => {
            await page.goto("/p/modePage");
            await page.click(".mx-name-tabPage2");
            const inputBox = await page.$(".mx-name-colorPicker17 input");
            await expect(inputBox).toHaveValue("#4caf50");
        });

        test("inline", async ({ page }) => {
            await page.goto("/p/modePage");
            await page.click(".mx-name-tabPage3");
            const inlinePicker = await page.$(".mx-name-colorPicker27 .sketch-picker");
            await expect(inlinePicker).toBeVisible();
        });
    });

    test.describe("renders a picker of type", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("/");
        });

        test("sketch", async ({ page }) => {
            const sketchPicker = await page.$(".mx-name-colorPicker27 .sketch-picker");
            await expect(sketchPicker).toBeVisible();
        });

        test("block", async ({ page }) => {
            const blockPicker = await page.$(".mx-name-colorPicker28 .block-picker");
            await expect(blockPicker).toBeVisible();
        });

        test("chrome", async ({ page }) => {
            const chromePicker = await page.$(".mx-name-colorPicker29 .chrome-picker");
            await expect(chromePicker).toBeVisible();
        });

        test("github", async ({ page }) => {
            const githubPicker = await page.$(".mx-name-colorPicker30 .github-picker");
            await expect(githubPicker).toBeVisible();
        });

        test("material", async ({ page }) => {
            const materialPicker = await page.$(".mx-name-colorPicker31 .material-picker");
            await expect(materialPicker).toBeVisible();
        });

        test("swatches", async ({ page }) => {
            const swatchesPicker = await page.$(".mx-name-colorPicker32 .swatches-picker");
            await expect(swatchesPicker).toBeVisible();
        });

        test("twitter", async ({ page }) => {
            const twitterPicker = await page.$(".mx-name-colorPicker33 .twitter-picker");
            await expect(twitterPicker).toBeVisible();
        });

        test("circle", async ({ page }) => {
            const circlePicker = await page.$(".mx-name-colorPicker34 .circle-picker");
            await expect(circlePicker).toBeVisible();
        });

        test("hue", async ({ page }) => {
            const huePicker = await page.$(".mx-name-colorPicker35 .hue-picker");
            await expect(huePicker).toBeVisible();
        });

        test("slider", async ({ page }) => {
            await page.getByRole("tab", { name: "Slider" }).click();
            const sliderPicker = await page.$(".mx-name-colorPicker37 .slider-picker");
            await expect(sliderPicker).toBeVisible();
        });

        test("compact", async ({ page }) => {
            await page.getByRole("tab", { name: "Compact" }).click();
            const compactPicker = await page.$(".mx-name-colorPicker26 .compact-picker");
            await expect(compactPicker).toBeVisible();
        });
    });

    test.describe("renders with color format as", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("/p/colorFormat");
        });

        test("hex", async ({ page }) => {
            const hexInput = await page.$(".mx-name-colorPicker24 input");
            await expect(hexInput).toHaveValue("#4caf50");
        });

        test("rgb", async ({ page }) => {
            await page.getByRole("tab", { name: "RGB" }).click();
            const rgbInput = await page.$(".mx-name-colorPicker17 input");
            await expect(rgbInput).toHaveValue("rgb(42,94,210)");
        });

        test("rgba", async ({ page }) => {
            await page.getByRole("tab", { name: "RGBA" }).click();
            const rgbaInput = await page.$(".mx-name-colorPicker27 input");
            await expect(rgbaInput).toHaveValue("rgba(39,255,238,0.49)");
        });
    });
});
