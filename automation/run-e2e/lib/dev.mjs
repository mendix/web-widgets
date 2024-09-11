import { spawnSync } from "node:child_process";
import { delimiter } from "node:path";
import { fileURLToPath } from "node:url";
import parseArgs from "yargs-parser";
import c from "ansi-colors";
import enquirer from "enquirer";
import { setupTestProject } from "./setup-test-project.mjs";
import { updateTestProject } from "./update-test-project.mjs";
import { await200 } from "./utils.mjs";
import * as config from "./config.mjs";

export async function dev() {
    console.log(c.cyan("Run e2e tests in development environment"));

    const parseArgsOptions = {
        string: ["browser"],
        boolean: ["with-preps"],
        default: {
            browser: "chromium",
            "with-preps": false
        },
        configuration: {
            // https://github.com/yargs/yargs-parser#boolean-negation
            "boolean-negation": true,
            // https://github.com/yargs/yargs-parser#camel-case-expansion
            "camel-case-expansion": true
        }
    };

    // We add local node_modules/.bin to PATH to make cypress bin is available for
    // any package in monorepo.
    const packageBinariesPath = fileURLToPath(new URL("../node_modules/.bin", import.meta.url));
    process.env.PATH += `${delimiter}${packageBinariesPath}`;
    const options = parseArgs(process.argv.slice(2), parseArgsOptions);

    if (options.withPreps) {
        // Download test project from github
        await setupTestProject();
        // Run update project hook
        await updateTestProject();

        console.log(
            c.yellow(
                [
                    `Please open and run ${config.mprFileGlob} in Studio Pro.`,
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
    } else {
        console.log(c.yellow("Skip preparations"));
    }

    const url = process.env.URL ?? "http://127.0.0.1:8080";

    console.log(c.cyan(`Make sure app is running on ${url}`));
    try {
        await await200(url);
    } catch {
        throw new Error(`Can't reach app on ${url}`);
    }

    console.log(c.cyan("Launch Playwright"));
    const command = "playwright";
    const args = ["test", "--project", options.browser, "--ignore-snapshots", "--ui"];
    spawnSync(command, args, { stdio: "inherit", shell: true });
}
