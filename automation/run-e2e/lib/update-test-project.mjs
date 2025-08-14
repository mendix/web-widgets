import crossZip from "cross-zip";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createWriteStream } from "node:fs";
import { join, resolve } from "node:path";
import sh from "shelljs";
import * as config from "./config.mjs";
import { fetchGithubRestAPI, fetchWithReport, packageMeta, streamPipe, usetmp } from "./utils.mjs";
import { atlasCoreReleaseUrl } from "./config.mjs";

const { cp, rm, mkdir, test } = sh;

async function getReleaseByTag(tag) {
    const url = `${atlasCoreReleaseUrl}/tags/${tag}`;
    const response = await fetchGithubRestAPI(url);
    if (!response.ok) {
        throw new Error(`Can't fetch release for tag: ${tag}`);
    }
    return await response.json();
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

    const release = await getReleaseByTag("atlas-core-v3.17.0");
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

    // Fetch the specific release by tag from GitHub API
    const tag = "atlasui-theme-files-2024-01-25";
    const release = await getReleaseByTag(tag);

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
    // Fix file permissions to ensure Docker can write to theme files
    // The Atlas theme files are copied with read-only permissions
    // but mxbuild needs to write to some generated files during build
    sh.exec(`chmod -R +w "${config.testProjectDir}/themesource"`, { silent: true });
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
