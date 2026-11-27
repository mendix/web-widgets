import { defineConfig, devices, Project } from "@playwright/test";

const port = 5199;
const runtimeUrl = process.env.MX_RUNTIME_URL;

const projects: Project[] = [
    { name: "harness", use: { ...devices["Desktop Chrome"], baseURL: `http://localhost:${port}` } }
];
if (runtimeUrl) {
    // Behavior specs against a real Mendix app; see runtime/README.md.
    projects.push({
        name: "runtime",
        testMatch: "behavior/**/*.spec.ts",
        use: { ...devices["Desktop Chrome"], baseURL: runtimeUrl }
    });
}

export default defineConfig({
    testDir: "./e2e",
    fullyParallel: true,
    reporter: process.env.CI ? "github" : "list",
    use: { trace: "retain-on-failure" },
    projects,
    webServer: {
        // A bundled build: the dev server serves hundreds of modules per navigation and Chrome runs out of resources.
        command: "pnpm run build:host && pnpm run preview",
        url: `http://localhost:${port}`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000
    }
});
