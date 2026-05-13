const { defineConfig, devices } = require("@playwright/test");

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
    testDir: "./e2e",
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Filter tests by tag: E2E_SUITE=smoke runs only @smoke-tagged tests */
    grep: process.env.E2E_SUITE === "smoke" ? /@smoke/ : undefined,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Worker-scoped session: each worker holds 1 Mendix session. Safe up to 4 workers
     * against the 5-session developer license (leaves 1 headroom). */
    workers: process.env.CI ? 4 : 4,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [
        ["list"],
        [
            "playwright-ctrf-json-reporter",
            {
                outputDir: "../../../automation/run-e2e/ctrf",
                outputFile: "ctrf" + Date.now() + ".json"
            }
        ]
    ],
    /* webServer: [
        {
            command: "run-e2e playwright",
            url: "http://127.0.0.1:8080",
            timeout: 120 * 1000,
            stdout: "pipe",
            stderr: "pipe",
            reuseExistingServer: !process.env.CI
        }
    ], */
    expect: {
        toHaveScreenshot: {
            animations: "disabled",
            threshold: 0.1
        }
    },
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: process.env.URL ? process.env.URL : "http://127.0.0.1:8080",

        actionTimeout: 10_000,
        navigationTimeout: 30_000,

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: "on-first-retry",

        launchOptions: {
            args: [
                "--disable-dev-shm-usage",
                "--disable-extensions",
                "--disable-background-networking",
                "--disable-background-timer-throttling",
                "--disable-renderer-backgrounding",
                "--disable-sync",
                "--disable-translate",
                "--disable-default-apps",
                "--disable-hang-monitor",
                "--metrics-recording-only",
                "--no-first-run",
                "--font-render-hinting=none"
            ]
        },

        contextOptions: {
            reducedMotion: "reduce"
        }
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"], channel: "chromium" }
        }
    ]
});
