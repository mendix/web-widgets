// Once cypress-image-diff-js and cypress-terminal-report will be published as ES Modules, we finally 
// can convert config to ES Module.

import { defineConfig } from "cypress"
import getCompareSnapshotsPlugin from "cypress-image-diff-js";
import installLogsPrinter from "cypress-terminal-report/src/installLogsPrinter.js";

export default defineConfig({
    e2e: {
        setupNodeEvents(on, config) {
            getCompareSnapshotsPlugin(on, config);
            installLogsPrinter(on, {
                printLogsToConsole: "onFail"
            });
        },
        baseUrl: "http://localhost:8080",
        retries: 2,
        video: false,
        videoUploadOnPasses: false,
        viewportHeight: 1080,
        viewportWidth: 1280,
        chromeWebSecurity: false,
        specPattern: "cypress/integration/**/*.js",
        supportFile: "cypress/support/e2e.js"
    }
});
