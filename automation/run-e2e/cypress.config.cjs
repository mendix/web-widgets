// Once cypress-image-diff-js and cypress-terminal-report will be published as ES Modules, we finally
// can convert config to ES Module.
const { defineConfig } = require("cypress");
const getCompareSnapshotsPlugin = require("cypress-image-diff-js/dist/plugin");
const installLogsPrinter = require("cypress-terminal-report/src/installLogsPrinter");
const { readExcelFile } = require("./utils/read-excel.cjs");

module.exports = defineConfig({
    e2e: {
        setupNodeEvents(on, config) {
            getCompareSnapshotsPlugin(on, config);
            installLogsPrinter(on, {
                printLogsToConsole: "onFail"
            });
            on("task", {
                readExcelFile,
                log(message) {
                    console.log(message);

                    return null;
                },
                table(message) {
                    console.table(message);

                    return null;
                }
            });
        },
        baseUrl: "http://localhost:8080",
        retries: 2,
        video: false,
        viewportHeight: 1080,
        viewportWidth: 1280,
        testIsolation: false,
        chromeWebSecurity: false,
        specPattern: "cypress/integration/**/*.js",
        supportFile: "cypress/support/e2e.js",
        reporter: "./node_modules/@mendix/run-e2e/node_modules/mochawesome/src/mochawesome.js",
        reporterOptions: {
            reportDir: "cypress/results",
            overwrite: false,
            html: false,
            json: true
        }
    }
});
