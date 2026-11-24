import { defineConfig, devices } from "@playwright/test";

const port = 5199;

export default defineConfig({
    testDir: "./e2e",
    fullyParallel: true,
    reporter: process.env.CI ? "github" : "list",
    use: {
        baseURL: `http://localhost:${port}`,
        trace: "retain-on-failure"
    },
    projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
    webServer: {
        command: "pnpm run dev",
        url: `http://localhost:${port}`,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000
    }
});
