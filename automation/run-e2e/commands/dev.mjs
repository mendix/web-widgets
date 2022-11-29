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
        boolean: ["skip-project-setup", "interactive"],
        default: {
            browser: "chrome",
            "skip-project-setup": false,
            interactive: true
        },
        configuration: {
            // https://github.com/yargs/yargs-parser#boolean-negation
            "boolean-negation": true,
            // https://github.com/yargs/yargs-parser#boolean-negation
            "camel-case-expansion": true
        }
    };
    const packageBinariesPath = fileURLToPath(new URL("../node_modules/.bin", import.meta.url));
    process.env.PATH += `${delimiter}${packageBinariesPath}`;
    const options = parseArgs(process.argv.slice(2), parseArgsOptions);

    console.log(options);

    if (options.interactive && !options.skipProjectSetup) {
        const { needSetup } = await enquirer.prompt({
            type: "confirm",
            name: "needSetup",
            message: "Would you like to download test project?"
        });

        if (needSetup) {
            await setupTestProject();
        }
    }

    if (options.interactive) {
        console.log(
            c.yellow(
                [
                    "Please open and run tests/testProject/<name>.mpr in Studio Pro.",
                    "If project contains errors, then you have to resolve them manually.",
                    "Once project is running, press Enter to continue."
                ].join("\n")
            )
        );

        await enquirer.prompt({
            type: "confirm",
            name: "__ingore__",
            result: () => "continue",
            message: "Press Enter to continue"
        });
    }

    console.log(c.cyan("Launch cypress"));
    const command = "cypress";
    const args = ["open", "--browser", options.browser, "--e2e", "--config-file", "cypress.config.cjs"];
    spawnSync(command, args, { stdio: "inherit", shell: true });
}
