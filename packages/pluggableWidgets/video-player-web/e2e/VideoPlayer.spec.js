import { test, expect } from "@playwright/test";

test.afterEach("Cleanup session", async ({ page }) => {
    // Because the test isolation that will open a new session for every test executed, and that exceeds Mendix's license limit of 5 sessions, so we need to force logout after each test.
    await page.evaluate(() => window.mx.session.logout());
});

test.describe("Video Player", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/p/grid");
        await page.waitForLoadState("networkidle");
    });

    test("renders youtube video", async ({ page }) => {
        await expect(
            page.locator(".widget-video-player.widget-video-player-container.mx-name-videoPlayer1.size-box iframe")
        ).toBeVisible();
        const iframeSource = await page
            .locator(".widget-video-player.widget-video-player-container.mx-name-videoPlayer1.size-box iframe")
            .getAttribute("src");
        expect(iframeSource).toContain("youtube.com");
        expect(iframeSource).toContain("autoplay=1");
        expect(iframeSource).toContain("controls=0");
        expect(iframeSource).toContain("mute=0");
        expect(iframeSource).toContain("loop=0");
    });

    test("renders vimeo video", async ({ page }) => {
        await expect(
            page.locator(".widget-video-player.widget-video-player-container.mx-name-videoPlayer2.size-box iframe")
        ).toBeVisible();
        const iframeSource = await page
            .locator(".widget-video-player.widget-video-player-container.mx-name-videoPlayer2.size-box iframe")
            .getAttribute("src");
        expect(iframeSource).toContain("vimeo.com");
        expect(iframeSource).toContain("autoplay=1");
        expect(iframeSource).toContain("muted=0");
        expect(iframeSource).toContain("loop=0");
    });
});

test.describe("Tab page", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/p/tabs");
        await page.waitForLoadState("networkidle");
    });

    test("renders youtube video", async ({ page }) => {
        await page.locator(".mx-name-tabPage1").click();
        await expect(
            page.locator(".widget-video-player.widget-video-player-container.mx-name-videoPlayer1.size-box iframe")
        ).toBeVisible();
        const iframeSource = await page
            .locator(".widget-video-player.widget-video-player-container.mx-name-videoPlayer1.size-box iframe")
            .getAttribute("src");
        expect(iframeSource).toContain("youtube.com");
    });

    test("renders vimeo video", async ({ page }) => {
        await page.locator(".mx-name-tabPage5").click();
        await expect(
            page.locator(".widget-video-player.widget-video-player-container.mx-name-videoPlayer5.size-box iframe")
        ).toBeVisible();
        const iframeSource = await page
            .locator(".widget-video-player.widget-video-player-container.mx-name-videoPlayer5.size-box iframe")
            .getAttribute("src");
        expect(iframeSource).toContain("vimeo.com");
    });

    test("renders dailymotion video", async ({ page }) => {
        await page.locator(".mx-name-tabPage4").click();
        await expect(
            page.locator(".widget-video-player.widget-video-player-container.mx-name-videoPlayer4.size-box iframe")
        ).toBeVisible();
        const iframeSource = await page
            .locator(".widget-video-player.widget-video-player-container.mx-name-videoPlayer4.size-box iframe")
            .getAttribute("src");
        expect(iframeSource).toContain("dailymotion.com");
    });

    test("renders html5 video", async ({ page }) => {
        await page.locator(".mx-name-tabPage3").click();
        await expect(
            page.locator(".widget-video-player.widget-video-player-container.mx-name-videoPlayer3.size-box video")
        ).toBeVisible();
        await expect(
            page.locator(".widget-video-player.widget-video-player-container.mx-name-videoPlayer3.size-box video")
        ).toHaveClass(/widget-video-player-html5/);
        const sourceUrl = await page
            .locator(".widget-video-player.widget-video-player-container.mx-name-videoPlayer3.size-box video source")
            .first()
            .getAttribute("src");
        expect(sourceUrl).toContain("file_example_MP4_640_3MG.mp4");
    });
});

test.describe("Error page", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/p/errors");
        await page.waitForLoadState("networkidle");
    });

    test("renders no content div", async ({ page }) => {
        const videoSource = await page.locator(
            ".widget-video-player.widget-video-player-container.mx-name-videoPlayerNoContent.size-box video source"
        );
        await expect(videoSource).not.toBeVisible();
    });
});

test.describe("External video", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/p/external");
        await page.waitForLoadState("networkidle");
    });

    test("renders a poster", async ({ page }) => {
        await expect(page.locator(".widget-video-player")).toHaveScreenshot(`videoPlayerExternalPoster.png`, 1);
    });

    test.describe("Video aspect ratio", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("/p/aspectRatio");
        });

        test("renders video aspect ratio correctly", async ({ page }) => {
            await expect(page.locator(".mx-name-videoPlayer1")).toBeVisible();
            const videoElement = await page.locator(".mx-name-videoPlayer1").first().boundingBox();
            const { width, height } = videoElement;
            const aspectRatio = Number(width / height);
            expect(aspectRatio).toBeCloseTo(16 / 9, 0.1);

            await page.locator(".mx-name-tabPage2").click();
            await expect(page.locator(".mx-name-videoPlayer3")).toBeVisible();
            const videoElement2 = await page.locator(".mx-name-videoPlayer3").first().boundingBox();
            const { width: width2, height: height2 } = videoElement2;
            const aspectRatio2 = Number(width2 / height2);
            expect(aspectRatio2).toBeCloseTo(3 / 2, 0.1);

            await page.locator(".mx-name-tabPage3").click();
            await expect(page.locator(".mx-name-videoPlayer5")).toBeVisible();
            const videoElement3 = await page.locator(".mx-name-videoPlayer5").first().boundingBox();
            const { width: width3, height: height3 } = videoElement3;
            expect(width3).toEqual(height3);
        });
    });
});
