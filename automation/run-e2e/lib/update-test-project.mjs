import crossZip from "cross-zip";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createWriteStream } from "node:fs";
import { join, resolve } from "node:path";
import sh from "shelljs";
import * as config from "./config.mjs";
import { fetchGithubRestAPI, fetchWithReport, packageMeta, streamPipe, usetmp } from "./utils.mjs";

const { cp, rm, mkdir, test } = sh;

async function getLatestReleaseByName(name, atlasCoreReleaseUrl) {
    const releasesResponse = await fetchGithubRestAPI(`${atlasCoreReleaseUrl}`);

    if (!releasesResponse.ok) {
        throw new Error("Can't fetch releases");
    }

    const releases = await releasesResponse.json();

    if (!Array.isArray(releases)) {
        throw new Error("Releases response is not an array");
    }

    const filteredReleases = releases.filter(release => release.name.toLowerCase().includes(name.toLowerCase()));

    if (filteredReleases.length === 0) {
        throw new Error(`No releases found with name: ${name}`);
    }

    return filteredReleases[0];
}

async function downloadAndExtract(url, downloadPath, extractPath) {
    try {
        await streamPipe((await fetchWithReport(url)).body, createWriteStream(downloadPath));
        crossZip.unzipSync(downloadPath, extractPath);
    } catch (e) {
        throw new Error(`Unable to download and extract from ${url}`);
    } finally {
        rm("-f", downloadPath);
    }
}

async function updateAtlasThemeSource() {
    console.log("Copying Atlas themesource files from latest Atlas Core release");

    rm("-rf", config.atlasDirsToRemove);

    const release = await getLatestReleaseByName("Atlas Core", config.atlasCoreReleaseUrl);
    const { browser_download_url } = release.assets[0];
    const downloadedPath = join(await usetmp(), config.nameForDownloadedAtlasCore);
    const outPath = await usetmp();

    await downloadAndExtract(browser_download_url, downloadedPath, outPath);

    const themeSourcePath = join(outPath, "themesource");
    if (!test("-d", themeSourcePath)) {
        console.log(`Directory not found: ${themeSourcePath}. Creating it.`);
        mkdir("-p", themeSourcePath);
    }

    cp("-r", themeSourcePath, config.testProjectDir);
}

async function updateAtlasTheme() {
    console.log("Copying Atlas theme files from latest Atlas UI theme release");

    rm("-rf", "tests/testProject/theme");

    const release = await getLatestReleaseByName("Atlas UI - Theme Folder Files", config.atlasCoreReleaseUrl);

    if (!release) {
        throw new Error("Can't fetch latest Atlas UI theme release");
    }

    const [{ browser_download_url }] = release.assets;
    const downloadedPath = join(await usetmp(), config.nameForDownloadedAtlasTheme);
    const outPath = await usetmp();

    await downloadAndExtract(browser_download_url, downloadedPath, outPath);

    const themePath = join(outPath, "theme");
    if (!test("-d", themePath)) {
        console.log(`Directory not found: ${themePath}. Creating it.`);
        mkdir("-p", themePath);
    }
    const webPath = join(outPath, "web");
    const nativePath = join(outPath, "native");
    cp("-r", webPath, themePath);
    cp("-r", nativePath, themePath);

    cp("-r", themePath, config.testProjectDir);
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

    await updateAtlasTheme();

    await updateAtlasThemeSource();

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
