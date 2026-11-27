const { join } = require("node:path");
const config = require("@mendix/run-e2e/playwright.config.cjs");

// Chromium's fake camera plays a Code 128 barcode with the value "MX-E2E-42". The camera is only available in a
// secure context, and on CI the app is served over plain http on the runner's IP address, not localhost.
const appOrigin = new URL(config.use.baseURL).origin;
const fakeCamera = [
    "--use-fake-ui-for-media-stream",
    "--use-fake-device-for-media-stream",
    `--use-file-for-fake-video-capture=${join(__dirname, "e2e/fixtures/code128.mjpeg")}`,
    `--unsafely-treat-insecure-origin-as-secure=${appOrigin}`
];

module.exports = {
    ...config,
    use: {
        ...config.use,
        permissions: ["camera"],
        launchOptions: {
            ...config.use.launchOptions,
            args: [...config.use.launchOptions.args, ...fakeCamera]
        }
    }
};
