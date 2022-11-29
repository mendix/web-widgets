import { spawnSync } from "node:child_process";
import { delimiter } from "node:path";
import { fileURLToPath } from "node:url";
import parseArgs from "yargs-parser";
import { setupTestProject } from "./setup-test-project.mjs";

export async function dev() {
    console.log("Run e2e tests in development environment");
    setupTestProject();
    const parseArgsOptions = {
        string: ['browser'],
        default: {
            browser: 'chrome'
        }
    };

    const { browser }  = parseArgs(process.argv.slice(2), parseArgsOptions);
    const packageBinariesPath = fileURLToPath(new URL("../node_modules/.bin", import.meta.url));
    process.env.PATH += `${delimiter}${packageBinariesPath}`;
    
    const command = "cypress";
    const args = ["open", "--browser", browser, "--e2e", "--config-file", "cypress.config.cjs"];
    // spawnSync(command, args, { stdio: "inherit", shell: true });
}
