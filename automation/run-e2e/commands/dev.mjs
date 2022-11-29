import { spawnSync } from "node:child_process";
import { delimiter } from "node:path";
import { fileURLToPath } from "node:url";
import parseArgs from "yargs-parser";
import c from "chalk";
import enquirer from "enquirer";
import { setupTestProject } from "./setup-test-project.mjs";

export async function dev() {
    console.log(c.cyan("Run e2e tests in development environment"));

    const parseArgsOptions = {
        string: ["browser"],
        boolean: ["skip-project-setup"],
        default: {
            browser: "chrome",
            "skip-project-setup": false
        }
    };
    const packageBinariesPath = fileURLToPath(new URL("../node_modules/.bin", import.meta.url));
    process.env.PATH += `${delimiter}${packageBinariesPath}`;
    const options = parseArgs(process.argv.slice(2), parseArgsOptions);

    if (!options["skip-project-setup"]) {
        const { needSetup } = await enquirer.prompt({
            type: "confirm",
            name: "needSetup",
            message: "Would you like to download test project?"
        });

        if (needSetup) {
            await setupTestProject();
        }
    }

    console.log(c.cyan("Launch cypress"));
    const command = "cypress";
    const args = ["open", "--browser", options.browser, "--e2e", "--config-file", "cypress.config.cjs"];
    spawnSync(command, args, { stdio: "inherit", shell: true });
}
