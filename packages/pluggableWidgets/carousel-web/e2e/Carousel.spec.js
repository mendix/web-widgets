import { test, expect } from "@playwright/test";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("Carousel", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test("disables the left arrow when showing the first item", async ({ page }) => {
        const leftArrow = page.locator(".swiper-button-prev");
        await expect(leftArrow).toHaveClass("swiper-button-prev swiper-button-disabled");
    });

    test("enables the left arrow when it navigates from the first item", async ({ page }) => {
        const leftArrow = page.locator(".swiper-button-prev");
        const rightArrow = page.locator(".swiper-button-next");
        await rightArrow.click();
        await expect(leftArrow).toBeVisible();
    });

    test("disables the right arrow when on the last image item", async ({ page }) => {
        const rightArrow = page.locator(".swiper-button-next");
        await rightArrow.click();
        await expect(rightArrow).toHaveClass("swiper-button-next swiper-button-disabled");
    });

    test("shows enlarged image when image is clicked", async ({ page }) => {
        const image = page.locator(".mx-name-Image01 > img").first();
        const lightbox = page.locator(".mx-image-viewer-lightbox");

        await image.click();
        await expect(lightbox).toBeVisible();
    });

    test.skip("check accessibility violations", async ({ page }) => {
        const carousel = page.locator(".mx-name-carousel2");
        const snapshot = await carousel.accessibility.snapshot();
        await expect(snapshot).toHaveNoViolations({ runOnly: { type: "tag", values: ["wcag2a"] } });
    });
});
