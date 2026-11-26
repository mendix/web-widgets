import { test, expect } from "@mendix/run-e2e/fixtures";

// The commands the widget hands to gtag, as Google's script would read them from the data layer.
const gtagCommands = page =>
    page.evaluate("(window.dataLayer ?? []).map(args => JSON.parse(JSON.stringify(Array.from(args))))");

const command = (page, name, target) =>
    gtagCommands(page).then(commands => commands.filter(([c, t]) => c === name && t === target));

test.describe("google-tag-web", () => {
    let gtagRequests;

    test.beforeEach(async ({ page }) => {
        gtagRequests = [];
        // Stand in for Google's script; the widget only has to request it.
        await page.route("https://www.googletagmanager.com/gtag/js**", route => {
            gtagRequests.push(route.request().url());
            return route.fulfill({ contentType: "text/javascript", body: "" });
        });
        await page.goto("/");
    });

    test("loads gtag.js for the tag ID once", async ({ page }) => {
        await expect.poll(() => gtagRequests).toEqual(["https://www.googletagmanager.com/gtag/js?id=G-E2ETEST"]);
        const configsOnHome = (await command(page, "config", "G-E2ETEST")).length;

        await page.locator(".mx-name-actionButtonSecond").click();
        // The second page's widget configures the tag again.
        await expect
            .poll(async () => (await command(page, "config", "G-E2ETEST")).length)
            .toBeGreaterThan(configsOnHome);

        expect(gtagRequests).toHaveLength(1);
    });

    test("configures the tag without the automatic page view", async ({ page }) => {
        await expect
            .poll(() => command(page, "config", "G-E2ETEST"))
            .toContainEqual(["config", "G-E2ETEST", { send_page_view: false }]);
    });

    test("sends the configured event", async ({ page }) => {
        await expect.poll(() => command(page, "event", "app_open")).toContainEqual(["event", "app_open", {}]);
    });

    // Page details and custom parameter values (through the {{__ModuleAndPageName__}} token) read
    // window.mx.ui.getContentForm(), which the React client does not have, so the widget throws instead.
    test.fixme("sends the configured event with its parameters", async ({ page }) => {
        await expect.poll(() => command(page, "event", "signup")).toEqual([["event", "signup", { plan: "gold" }]]);
    });

    test.fixme("sends a page view with the page details and its parameters", async ({ page }) => {
        await expect
            .poll(() => command(page, "event", "page_view"))
            .toEqual([
                [
                    "event",
                    "page_view",
                    expect.objectContaining({
                        page_title: "Google tag",
                        mx_page_name: "Home_Web",
                        mx_module_name: "MyFirstModule",
                        language: "en_US",
                        source: "e2e"
                    })
                ]
            ]);
    });

    test.fixme("sends a page view for the next page", async ({ page }) => {
        await expect.poll(() => command(page, "event", "page_view")).toHaveLength(1);

        await page.locator(".mx-name-actionButtonSecond").click();

        await expect
            .poll(async () => (await command(page, "event", "page_view")).map(([, , params]) => params.mx_page_name))
            .toEqual(["Home_Web", "Second_Web"]);
    });
});
