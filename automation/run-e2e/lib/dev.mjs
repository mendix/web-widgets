import { spawnSync, execSync } from "node:child_process";
import { delimiter } from "node:path";
import { fileURLToPath } from "node:url";
import parseArgs from "yargs-parser";
import c from "ansi-colors";
import enquirer from "enquirer";
import sh from "shelljs";
import { setupTestProject } from "./setup-test-project.mjs";
import { updateTestProject } from "./update-test-project.mjs";
import { await200 } from "./utils.mjs";
import * as config from "./config.mjs";

const { ls, exec } = sh;

export async function dev() {
    console.log(c.cyan("Run e2e tests in development environment"));

    const parseArgsOptions = {
        string: ["browser"],
        boolean: ["with-preps", "update-project", "setup-project"],
        default: {
            browser: "chromium",
            "with-preps": false,
            "update-project": true,
            "setup-project": false
        },
        configuration: {
            // https://github.com/yargs/yargs-parser#boolean-negation
            "boolean-negation": true,
            // https://github.com/yargs/yargs-parser#camel-case-expansion
            "camel-case-expansion": true
        }
    };

    if (!process.env.GITHUB_TOKEN) {
        console.log("GITHUB_TOKEN not found. Fetching from GitHub CLI...");

        const result = exec("gh auth token", { silent: true });

        if (result.code === 0) {
            process.env.GITHUB_TOKEN = result.stdout.trim();
            console.log("Successfully set GITHUB_TOKEN from gh CLI.");
        } else {
            console.error('Error: Could not retrieve token. Ensure you are logged in via "gh auth login".');
            process.exit(1);
        }
    }

    // We add local node_modules/.bin to PATH to make cypress bin is available for
    // any package in monorepo.
    const packageBinariesPath = fileURLToPath(new URL("../node_modules/.bin", import.meta.url));
    process.env.PATH += `${delimiter}${packageBinariesPath}`;
    const options = parseArgs(process.argv.slice(2), parseArgsOptions);

    if (options.withPreps || options.setupProject) {
        // Download test project from github
        await setupTestProject();
    }
    if (options.withPreps || options.updateProject) {
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

        // Print out Mendix version from MPR file
        try {
            const mprFiles = ls(config.mprFileGlob);
            if (mprFiles.length > 0) {
                const mprFile = mprFiles[0];
                try {
                    const version = execSync(`sqlite3 "${mprFile}" "select _ProductVersion from _MetaData;"`, {
                        encoding: "utf-8",
                        stdio: ["pipe", "pipe", "pipe"]
                    }).trim();
                    console.log(c.cyan(`Test project was created with Mendix version: ${c.bold(version)}`));
                } catch (error) {
                    if (error.message.includes("sqlite3") || error.code === "ENOENT") {
                        console.log(c.gray("sqlite3 command not found, unable to get Mendix version info"));
                    } else {
                        console.log(c.gray("Unable to read Mendix version from project file"));
                    }
                }
            }
        } catch {
            console.log(c.gray("Unable to determine Mendix version"));
        }

        await enquirer.prompt({
            type: "confirm",
            name: "__ignore__",
            result: () => "continue",
            message: "Press Enter to continue"
        });
    }

    const url = process.env.URL ?? "http://127.0.0.1:8080";

    console.log(c.cyan(`Make sure app is running on ${url}`));
    let appRunning = false;

    while (!appRunning) {
        try {
            await await200(url);
            appRunning = true;
        } catch {
            const { retry } = await enquirer.prompt({
                type: "confirm",
                name: "retry",
                initial: true,
                message: `Can't reach app on ${url}. Do you want to retry?`
            });

            if (!retry) {
                throw new Error(`App is not running on ${url}. Exiting.`);
            }
        }
    }

    console.log(c.cyan("Launch Playwright"));
    const command = "playwright";
    const args = ["test", "--project", options.browser, "--ignore-snapshots", "--ui"];
    spawnSync(command, args, { stdio: "inherit", shell: true });
}
