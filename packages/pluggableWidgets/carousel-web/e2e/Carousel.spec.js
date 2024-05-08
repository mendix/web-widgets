import { test, expect } from "@playwright/test";

test.describe("Carousel", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test("disables the left arrow when showing the first item", async ({ page }) => {
        const leftArrow = page.locator(".swiper-button-prev");
        await expect(leftArrow).toHaveClass("swiper-button-disabled");
    });

    test("enables the left arrow when it navigates from the first item", async ({ page }) => {
        const leftArrow = page.locator(".swiper-button-prev");
        const rightArrow = page.locator(".swiper-button-next");
        await rightArrow.click();
        await expect(leftArrow).toBeVisible();
    });

    test("disables the right arrow when on the last image item", async ({ page }) => {
        const rightArrow = page.locator(".swiper-button-next");
        await expect(rightArrow).toHaveClass("swiper-button-disabled");
    });

    test("shows enlarged image when image is clicked", async ({ page }) => {
        const leftArrow = page.locator(".swiper-button-prev");
        const image = page.locator(".mx-name-Image01 > img").first();
        const lightbox = page.locator(".mx-image-viewer-lightbox");
        await leftArrow.click();
        await image.click();
        await expect(lightbox).toBeVisible();
    });

    test("check accessibility violations", async ({ page }) => {
        const carousel = page.locator(".mx-name-carousel2");
        const snapshot = await carousel.accessibility.snapshot();
        await expect(snapshot).toHaveNoViolations({ runOnly: { type: "tag", values: ["wcag2a"] } });
    });
});
