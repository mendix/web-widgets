import crossZip from "cross-zip";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createWriteStream } from "node:fs";
import { join, resolve } from "node:path";
import sh from "shelljs";
import * as config from "./config.mjs";
import { fetchGithubRestAPI, fetchWithReport, packageMeta, streamPipe, usetmp } from "./utils.mjs";

const { cp, rm, mkdir } = sh;

async function updateAtlas() {
    console.log("Copying Atlas files from latest StarterApp");

    rm("-rf", config.atlasDirsToRemove);

    const releasesResponse = await fetchGithubRestAPI(config.starterAppLatestReleaseUrl);

    if (releasesResponse.ok) {
        const release = await releasesResponse.json();
        const [{ browser_download_url }] = release.assets;
        const downloadedPath = join(await usetmp(), config.nameForDownloadedStarterApp);
        const outPath = await usetmp();
        try {
            await streamPipe((await fetchWithReport(browser_download_url)).body, createWriteStream(downloadedPath));
            crossZip.unzipSync(downloadedPath, outPath);
            cp("-r", join(outPath, "theme"), config.testProjectDir);
            cp("-r", join(outPath, "themesource"), config.testProjectDir);
        } catch (e) {
            throw new Error("Unable to download StarterApp mpk");
        } finally {
            rm("-f", downloadedPath);
            rm("-rf", outPath);
        }
    } else {
        throw new Error("Can't fetch latest StarterApp release");
    }
}

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

export async function updateTestProject() {
    console.log("Updating test project files (widgets, themesource, atlas, etc.)");

    await updateAtlas();

    process.env.MX_PROJECT_PATH = resolve(process.cwd(), config.testProjectDir);

    if (packageMeta.scripts["e2e-update-project"]) {
        console.log("Run e2e-update-project script");
        await runUpdateProjectScript();
    } else {
        console.log("Run release script");
        await runReleaseScript();
    }
}
