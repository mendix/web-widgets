import { test, expect } from "@playwright/test";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("Slider", () => {
    test("renders with context", async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");

        const minimumValue = await page.inputValue(".mx-name-textBoxMinimumValue input");
        const minimumValueText = await page
            .locator(".mx-name-sliderContext .rc-slider-mark > span")
            .first()
            .textContent();
        await expect(minimumValueText).toBe(minimumValue);

        const maximumValue = await page.inputValue(".mx-name-textBoxMaximumValue input");
        const maximumValueText = await page
            .locator(".mx-name-sliderContext .rc-slider-mark > span")
            .nth(2)
            .textContent();
        await expect(maximumValueText).toBe(maximumValue);

        const value = await page.inputValue(".mx-name-textBoxValue input");
        await expect(value).toContain("10");

        const handleStyle = await page.locator(".mx-name-sliderContext .rc-slider-handle").getAttribute("style");
        await expect(handleStyle).toContain("left: 50%; right: auto; transform: translateX(-50%);");
    });

    test("renders without context", async ({ page }) => {
        await page.goto("/p/no-context");
        await page.waitForLoadState("networkidle");

        const sliderClass = await page.locator(".mx-name-sliderNoContext .rc-slider").getAttribute("class");
        await expect(sliderClass).toContain("rc-slider-disabled");

        const minimumValueText = await page
            .locator(".mx-name-sliderNoContext .rc-slider-mark > span")
            .first()
            .textContent();
        await expect(minimumValueText).toBe("0");

        const maximumValueText = await page
            .locator(".mx-name-sliderNoContext .rc-slider-mark > span")
            .nth(2)
            .textContent();
        await expect(maximumValueText).toBe("100");

        const handleStyle = await page.locator(".mx-name-sliderNoContext .rc-slider-handle").getAttribute("style");
        await expect(handleStyle).toContain("left: 0%;");

        const handleCursor = await page
            .locator(".mx-name-sliderNoContext .rc-slider-handle")
            .evaluate(node => window.getComputedStyle(node).cursor);
        await expect(handleCursor).toContain("not-allowed");
    });
    // Conditional flag added to skip these tests when running on react client, because those widgets aren't supported in the react client
    test.skip(process.env.MODERN_CLIENT === true, () => {
        test("listens to a grid", async ({ page }) => {
            await page.goto("/p/listen-to-grid");
            await page.waitForLoadState("networkidle");

            await expect(page.locator(".mx-name-slider .rc-slider-handle")).toHaveCSS("cursor", /not-allowed/);

            await page.locator(".mx-name-grid td").nth(0).click();
            await expect(page.locator(".mx-name-slider .rc-slider-handle")).toHaveAttribute("style", /left: 50%;/);

            await page.locator(".mx-name-grid td").nth(1).click();
            await expect(page.locator(".mx-name-slider .rc-slider-handle")).toHaveAttribute("style", /left: 80%;/);
        });
    });

    test("triggers a microflow after slide", async ({ page }) => {
        await page.goto("/p/after-slide");
        await page.waitForLoadState("networkidle");

        await page
            .locator(".mx-name-sliderMicroflow .rc-slider-handle")
            .dragTo(page.locator(".mx-name-sliderMicroflow .rc-slider .rc-slider-dot:nth-child(3)"));
        await expect(page.locator(".modal-dialog .mx-dialog-body p")).toHaveText(/Slider Value is 20/);
    });

    test("triggers a nanoflow after slide", async ({ page }) => {
        await page.goto("/p/after-slide");
        await page.waitForLoadState("networkidle");

        await page
            .locator(".mx-name-sliderNanoflow .rc-slider-handle")
            .dragTo(page.locator(".mx-name-sliderNanoflow .rc-slider .rc-slider-dot:nth-child(3)"));

        await expect(page.locator(".modal-dialog .modal-content .mx-name-text1")).toBeVisible();
        await expect(page.locator(".modal-dialog .modal-content .mx-name-text1")).toHaveText(/Slider Value is 20/);
    });

    test("renders with a range that goes from negative to positive", async ({ page }) => {
        await page.goto("/p/negative-and-positive-range");
        await page.waitForLoadState("networkidle");

        await expect(page.locator(".mx-name-slider")).toBeVisible();
        await expect(page.locator(".mx-name-textValue")).toHaveText(/5/);

        await page.locator(".mx-name-slider .rc-slider .rc-slider-dot:nth-child(1)").click({ force: true });
        await expect(page.locator(".mx-name-textValue")).toHaveText(/-20/);

        await page.locator(".mx-name-slider .rc-slider .rc-slider-dot:nth-child(6)").click({ force: true });
        await expect(page.locator(".mx-name-textValue")).toHaveText(/20/);
    });

    test("renders multiple markers", async ({ page }) => {
        await page.goto("/p/multiple-markers");
        await page.waitForLoadState("networkidle");

        await expect(page.locator(".mx-name-slider")).toBeVisible();
        const mark0 = await page.locator(".mx-name-slider .rc-slider-mark > span").nth(0);
        await expect(mark0).toHaveCSS("left", "0px");
        await expect(mark0).toHaveText(/0/);

        const mark9 = await page.locator(".mx-name-slider .rc-slider-mark > span").nth(9);
        await expect(mark9).toHaveAttribute("style", /left: 100%;/);

        const mark1 = await page.locator(".mx-name-slider .rc-slider-mark > span:nth-child(2)");
        await expect(mark1).toHaveText(/2.2/);

        const mark3 = await page.locator(".mx-name-slider .rc-slider-mark > span").nth(3);
        await expect(mark3).toHaveAttribute("style", /left: 33.5%;/);
        await expect(mark3).toHaveText(/6.7/);
    });

    test("updates decimal values", async ({ page }) => {
        await page.goto("/p/decimal-values");
        await page.waitForLoadState("networkidle");

        await expect(page.locator(".mx-name-slider")).toBeVisible();
        await expect(page.locator(".mx-name-textValue")).toHaveText(/5.5/);

        await page
            .locator(".mx-name-slider .rc-slider-handle")
            .dragTo(page.locator(".mx-name-slider .rc-slider .rc-slider-dot:nth-child(5)"), { force: true });

        await expect(page.locator(".mx-name-textValue")).toHaveText(/20.5/);
    });

    test("updates long values", async ({ page }) => {
        await page.goto("/p/long-values");
        await page.waitForLoadState("networkidle");

        await expect(page.locator(".mx-name-slider")).toBeVisible();
        await expect(page.locator(".mx-name-textValue")).toHaveText(/60000/);

        await page
            .locator(".mx-name-slider .rc-slider-handle")
            .dragTo(page.locator(".mx-name-slider .rc-slider .rc-slider-dot:nth-child(4)"), { force: true });

        await expect(page.locator(".mx-name-textValue")).toHaveText(/300000/);
    });

    test("slides with step size", async ({ page }) => {
        await page.goto("/p/long-values");
        await page.waitForLoadState("networkidle");

        await expect(page.locator(".mx-name-slider")).toBeVisible();
        await page.locator(".mx-name-slider .rc-slider-handle").click({ position: { x: 58, y: 0 }, force: true });
        await expect(page.locator(".mx-name-textValue")).toHaveText(/60000/);
        await expect(page.locator(".mx-name-slider .rc-slider-handle")).toHaveAttribute("style", /left: 0%;/);

        await page.locator(".mx-name-slider .rc-slider-dot:nth-child(2)").click({ force: true });
        await expect(page.locator(".mx-name-textValue")).toHaveText(/140000/);
        await expect(page.locator(".mx-name-slider .rc-slider-handle")).toHaveAttribute("style", /left: 33.3333%;/);
    });

    test("snaps to intermediate markers", async ({ page }) => {
        await page.goto("/p/long-values");
        await page.waitForLoadState("networkidle");

        await expect(page.locator(".mx-name-slider")).toBeVisible();
        await expect(page.locator(".mx-name-slider .rc-slider-mark > span").nth(1)).toHaveText("140000");
        await expect(page.locator(".mx-name-slider .rc-slider-mark > span").nth(1)).toHaveAttribute(
            "style",
            /left: 33.3333%;/
        );
    });

    test("slides without using intermediate marker as base", async ({ page }) => {
        await page.goto("/p/long-values");
        await page.waitForLoadState("networkidle");

        await expect(page.locator(".mx-name-slider")).toBeVisible();
        await page.locator(".mx-name-slider .rc-slider-dot:nth-child(2)").click({ force: true });
        await expect(page.locator(".mx-name-textValue")).toHaveText(/140000/);
        await expect(page.locator(".mx-name-slider .rc-slider-handle")).toHaveAttribute("style", /left: 33.3333%;/);

        await page.locator(".mx-name-slider .rc-slider-dot:nth-child(3)").click({ force: true });
        await expect(page.locator(".mx-name-textValue")).toHaveText(/220000/);
        await expect(page.locator(".mx-name-slider .rc-slider-handle")).toHaveAttribute("style", /left: 66.6667%;/);
    });

    test.describe("Style", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("/p/different-slider-styles");
            await page.waitForLoadState("networkidle");
        });

        test("compares with a screenshot baseline and checks if all slider elements are rendered as expected", async ({
            page
        }) => {
            await expect(page.locator(".mx-name-sliderPrimary")).toBeVisible();
            await expect(page.locator(".mx-name-sliderPrimary")).toHaveScreenshot(`sliderStyles.png`, {
                threshold: 0.4
            });
        });
    });

    test.describe("Tooltip", () => {
        test("doesn't render when there's no title", async ({ page }) => {
            await page.goto("/p/no-tooltip-title");
            await page.waitForLoadState("networkidle");

            await expect(page.locator(".mx-name-slider")).toBeVisible();
            await expect(page.locator(".mx-name-slider .rc-slider-handle .rc-slider-tooltip")).toHaveCount(0);
        });

        test("renders a static title", async ({ page }) => {
            await page.goto("/p/tooltip-with-static-title");
            await page.waitForLoadState("networkidle");

            await expect(page.locator(".mx-name-slider")).toBeVisible();
            await expect(page.locator(".rc-slider-tooltip-content")).toHaveText("Slider");

            await page
                .locator(".mx-name-slider .rc-slider-handle")
                .dragTo(page.locator(".mx-name-slider .rc-slider .rc-slider-dot:nth-child(2)"), { force: true });

            await expect(page.locator(".rc-slider-tooltip-content")).toHaveText("Slider");
        });

        test("renders the slider's value", async ({ page }) => {
            await page.goto("/p/tooltip-with-slider-value");
            await page.waitForLoadState("networkidle");

            await expect(page.locator(".rc-slider-tooltip-content")).toHaveText("10.00");

            await page
                .locator(".mx-name-slider .rc-slider-handle")
                .dragTo(page.locator(".mx-name-slider .rc-slider .rc-slider-dot:nth-child(3)"), { force: true });

            await expect(page.locator(".rc-slider-tooltip-content")).toHaveText(/20.00/);
        });
    });
});
