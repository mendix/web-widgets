import path from "path";
import { test, expect } from "@mendix/run-e2e/fixtures";
import { waitForWidget, waitFrames } from "@mendix/run-e2e/mendix-helpers";

test.describe("Video Player", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/p/grid");
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
    });

    test("renders youtube video", async ({ page }) => {
        await page.locator(".mx-name-tabPage1").click();
        await waitForWidget(page, "videoPlayer1");
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
        await waitForWidget(page, "videoPlayer5");
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
        await waitForWidget(page, "videoPlayer4");
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
        await waitForWidget(page, "videoPlayer3");
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
    });

    test("renders a poster", async ({ page }) => {
        // Intercept the external video URL and serve a local stub so the test
        // doesn't depend on third-party CDN availability in CI.
        await page.route("**/*.mp4", route =>
            route.fulfill({
                status: 200,
                contentType: "video/mp4",
                path: path.join(import.meta.dirname, "fixtures/stub.mp4")
            })
        );
        // Reload so the intercepted route applies to the video element fetch.
        await page.reload();

        const widget = page.locator(".widget-video-player");
        const videoLocator = page.locator(".widget-video-player video");
        await widget.scrollIntoViewIfNeeded();
        await expect(widget).toBeVisible();
        await expect(videoLocator).toHaveAttribute("poster", /.+/);
        // Wait for the video element to reach HAVE_METADATA (readyState >= 1).
        // Until metadata loads, Chrome renders the <video> without its native chrome
        // (controls bar, dark background) — producing a screenshot that doesn't match
        // the baseline. Guard against a pre-existing error to avoid waiting forever
        // when onerror already fired before we attach the listener.
        await videoLocator.evaluate(el => {
            if (el.readyState >= 1) {
                return Promise.resolve();
            }
            if (el.error !== null) {
                return Promise.reject(new Error("Video failed to load metadata before screenshot"));
            }
            return new Promise((resolve, reject) => {
                el.addEventListener("loadedmetadata", resolve, { once: true });
                el.addEventListener(
                    "error",
                    () => reject(new Error("Video failed to load metadata before screenshot")),
                    { once: true }
                );
            });
        });
        // Flush layout and paint after metadata is ready.
        await waitFrames(page, 2);
        await expect(widget).toHaveScreenshot("videoPlayerExternalPoster.png");
    });

    test.describe("Video aspect ratio", () => {
        test.beforeEach(async ({ page }) => {
            await page.goto("/p/aspectRatio");
        });

        test("renders video aspect ratio correctly", async ({ page }) => {
            await waitForWidget(page, "videoPlayer1");
            const videoElement = await page.locator(".mx-name-videoPlayer1").first().boundingBox();
            const { width, height } = videoElement;
            const aspectRatio = Number(width / height);
            expect(aspectRatio).toBeCloseTo(16 / 9, 0.1);

            await page.locator(".mx-name-tabPage2").click();
            await waitForWidget(page, "videoPlayer3");
            const videoElement2 = await page.locator(".mx-name-videoPlayer3").first().boundingBox();
            const { width: width2, height: height2 } = videoElement2;
            const aspectRatio2 = Number(width2 / height2);
            expect(aspectRatio2).toBeCloseTo(3 / 2, 0.1);

            await page.locator(".mx-name-tabPage3").click();
            await waitForWidget(page, "videoPlayer5");
            const videoElement3 = await page.locator(".mx-name-videoPlayer5").first().boundingBox();
            const { width: width3, height: height3 } = videoElement3;
            expect(width3).toEqual(height3);
        });
    });
});
