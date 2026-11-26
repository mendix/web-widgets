import crossZip from "cross-zip";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, createWriteStream, existsSync, globSync, mkdirSync, rmSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import * as config from "./config.mjs";
import { fetchGithubRestAPI, fetchWithReport, packageMeta, streamPipe, usetmp } from "./utils.mjs";
import { atlasCoreReleaseUrl } from "./config.mjs";

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
        throw new Error(`Unable to download and extract from ${url}`, { cause: e });
    } finally {
        rmSync(downloadPath, { force: true });
    }
}

async function updateAtlasThemeSource() {
    const version = packageMeta.testProject?.atlasCoreVersion ?? config.defaultAtlasCoreVersion;
    const tag = `atlas-core-v${version}`;
    console.log(`Copying Atlas themesource files from Atlas Core release ${tag}`);

    for (const dir of config.atlasDirsToRemove) {
        rmSync(dir, { recursive: true, force: true });
    }

    const release = await getReleaseByTag(tag);
    if (!release.assets || release.assets.length === 0) {
        throw new Error(`No assets found for release tag: ${tag}`);
    }
    const [{ browser_download_url }] = release.assets;
    const downloadedPath = join(await usetmp(), config.nameForDownloadedAtlasCore);
    const outPath = await usetmp();

    await downloadAndExtract(browser_download_url, downloadedPath, outPath);

    const themeSourcePath = join(outPath, "themesource");
    if (!existsSync(themeSourcePath)) {
        console.log(`Directory not found: ${themeSourcePath}. Creating it.`);
        mkdirSync(themeSourcePath, { recursive: true });
    }

    cpSync(themeSourcePath, join(config.testProjectDir, "themesource"), { recursive: true });

    // Fix file permissions to ensure Docker can write to theme files
    // The Atlas theme files are copied with read-only permissions
    // but mxbuild needs to write to some generated files during build
    spawnSync("chmod", ["-R", "+w", join(config.testProjectDir, "themesource")]);
}

async function updateAtlasTheme() {
    const tag = packageMeta.testProject?.atlasThemeTag ?? config.defaultAtlasThemeTag;
    console.log(`Copying Atlas theme files from Atlas UI theme release ${tag}`);

    rmSync("tests/testProject/theme", { recursive: true, force: true });

    // Fetch the specific release by tag from GitHub API
    const release = await getReleaseByTag(tag);
    if (!release.assets || release.assets.length === 0) {
        throw new Error(`No assets found for release tag: ${tag}`);
    }
    const [{ browser_download_url }] = release.assets;
    const downloadedPath = join(await usetmp(), config.nameForDownloadedAtlasTheme);
    const outPath = await usetmp();

    await downloadAndExtract(browser_download_url, downloadedPath, outPath);

    const themePath = join(outPath, "theme");
    if (!existsSync(themePath)) {
        console.log(`Directory not found: ${themePath}. Creating it.`);
        mkdirSync(themePath, { recursive: true });
    }
    cpSync(join(outPath, "web"), join(themePath, "web"), { recursive: true });
    cpSync(join(outPath, "native"), join(themePath, "native"), { recursive: true });

    cpSync(themePath, join(config.testProjectDir, "theme"), { recursive: true });
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
    const mpkPaths = globSync(`dist/${version}/*.mpk`);
    if (mpkPaths.length === 0) {
        throw new Error(`No mpk found in dist/${version}`);
    }
    const outDir = join(config.testProjectDir, "widgets");
    mkdirSync(outDir, { recursive: true });
    for (const mpkPath of mpkPaths) {
        cpSync(mpkPath, join(outDir, basename(mpkPath)));
    }
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
