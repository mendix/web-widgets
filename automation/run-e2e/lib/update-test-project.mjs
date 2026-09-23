import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { join, resolve } from "node:path";
import sh from "shelljs";
import * as config from "./config.mjs";
import { packageMeta } from "./utils.mjs";
import { updateAtlas } from "./atlas.mjs";

const { cp, ls, mkdir } = sh;

async function runReleaseScript() {
    const { name: packageName, version } = packageMeta;
    assert.ok(typeof packageName === "string", "missing package.name");

    // Please keep in mind that order of args matters.
    // Our goal is to run `turbo run --filter <widget>`
    // as then we can make sure that widget build with dependencies.
    // But both, pnpm and turbo have `--filter` flag (which may be confusing).
    // To pass flags to turbo, we pass --filter AFTER command (`release` in our case).
    // Check https://pnpm.io/cli/run#options for more details.
    const command = "pnpm";
    // prettier-ignore
    const args = [
        "run",
        "--workspace-root",
        "release",
        `--filter ${packageName}`
    ];

    spawnSync(command, args, { stdio: "inherit", shell: true });

    console.log("Copying widget mpk.");
    const mpkPath = `dist/${version}/*.mpk`;
    const outDir = join(config.testProjectDir, "widgets");
    mkdir("-p", outDir);
    cp("-f", mpkPath, outDir);
}

async function runUpdateProjectScript() {
    const command = "pnpm";
    const args = ["run", "e2e-update-project"];

    spawnSync(command, args, { stdio: "inherit", shell: true });
}

export async function updateTestProject(mendixVersion) {
    console.log("Updating test project files (widgets, themesource, atlas, etc.)");

    await updateAtlas(config.testProjectDir, mendixVersion, ls(config.mprFileGlob)[0]);

    process.env.MX_PROJECT_PATH = resolve(process.cwd(), config.testProjectDir);

    try {
        if (packageMeta.scripts["e2e-update-project"]) {
            console.log("Run e2e-update-project script");
            await runUpdateProjectScript();
        } else {
            console.log("Run release script");
            await runReleaseScript();
        }
    } catch (error) {
        console.error("An error occurred while updating the test project:", error);
    }
}
