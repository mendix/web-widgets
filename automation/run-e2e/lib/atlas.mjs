import crossZip from "cross-zip";
import fetch from "node-fetch";
import { createWriteStream } from "node:fs";
import { execFileSync } from "node:child_process";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import sh from "shelljs";

const { cp, rm, mkdir, test, exec } = sh;
const streamPipe = promisify(pipeline);

const releasesUrl = "https://api.github.com/repos/mendix/atlas/releases";

const themesourceDirsToRemove = [
    "themesource/atlas_ui_resources",
    "themesource/atlas_core",
    "themesource/atlas_nativemobile_content",
    "themesource/atlas_web_content",
    "themesource/datawidgets"
];

// Mendix 11 test projects ship Atlas 4, which renamed design properties and moved
// JavaScript actions into the Atlas Core package. Mendix 10 and below stay on Atlas 3.
const atlas3 = {
    themeTag: "atlasui-theme-files-2024-01-25",
    coreTag: "atlas-core-v3.17.0",
    dirsToRemove: themesourceDirsToRemove,
    renameDesignProperties: false
};

const atlas4 = {
    themeTag: "atlasui-theme-files-2025-10-08",
    coreTag: "atlas-core-v4.4.0",
    dirsToRemove: [...themesourceDirsToRemove, "javascriptsource/atlas_core"],
    renameDesignProperties: true
};

/** Atlas release matching the given Mendix version (e.g. "11.12.0" or "10.24.0.73019"). */
export function getAtlasConfig(mendixVersion) {
    const major = Number.parseInt(mendixVersion, 10);
    return Number.isFinite(major) && major >= 11 ? atlas4 : atlas3;
}

/** True when the model needs `mx rename-design-properties` after the Atlas update. */
export function needsDesignPropertyRename(mendixVersion) {
    return getAtlasConfig(mendixVersion).renameDesignProperties;
}

/**
 * Mendix version the test project was last saved with, read from the .mpr file.
 * Returns undefined when sqlite3 is unavailable or the file can't be read.
 */
export function detectProjectMendixVersion(mprFile) {
    try {
        return execFileSync("sqlite3", [mprFile, "select _ProductVersion from _MetaData;"], {
            encoding: "utf-8",
            stdio: ["pipe", "pipe", "pipe"]
        }).trim();
    } catch {
        return undefined;
    }
}

async function usetmp() {
    return mkdtemp(join(tmpdir(), "atlas_files_"));
}

async function getReleaseByTag(tag) {
    const token = process.env.GITHUB_TOKEN;
    const headers = {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        // Anonymous requests work for these public releases, a token only raises the rate limit.
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    const response = await fetch(`${releasesUrl}/tags/${tag}`, { headers });
    if (!response.ok) {
        throw new Error(`Can't fetch release for tag: ${tag} (HTTP ${response.status})`);
    }
    return response.json();
}

async function downloadAndExtract(url, downloadPath, extractPath) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} while downloading ${url}`);
        }
        await streamPipe(response.body, createWriteStream(downloadPath));
        crossZip.unzipSync(downloadPath, extractPath);
    } catch (e) {
        throw new Error(`Unable to download and extract from ${url}`, { cause: e });
    } finally {
        rm("-f", downloadPath);
    }
}

async function updateAtlasTheme(projectDir, atlas) {
    console.log(`Copying Atlas theme files from ${atlas.themeTag}`);

    const release = await getReleaseByTag(atlas.themeTag);
    const asset = release.assets?.find(a => a.name.endsWith(".zip"));
    if (!asset) {
        throw new Error(`No .zip asset found for release tag: ${atlas.themeTag}`);
    }

    const outPath = await usetmp();
    await downloadAndExtract(asset.browser_download_url, join(await usetmp(), "AtlasTheme.zip"), outPath);

    const themePath = join(outPath, "theme");
    mkdir("-p", themePath);
    for (const dir of ["web", "native"]) {
        const src = join(outPath, dir);
        if (test("-d", src)) {
            cp("-r", src, themePath);
        }
    }

    rm("-rf", join(projectDir, "theme"));
    cp("-r", themePath, projectDir);
}

async function updateAtlasThemesource(projectDir, atlas) {
    console.log(`Copying Atlas themesource files from ${atlas.coreTag}`);

    const release = await getReleaseByTag(atlas.coreTag);
    const asset = release.assets?.find(a => a.name.endsWith(".mpk"));
    if (!asset) {
        throw new Error(`No .mpk asset found for release tag: ${atlas.coreTag}`);
    }

    const outPath = await usetmp();
    await downloadAndExtract(asset.browser_download_url, join(await usetmp(), "AtlasCore.zip"), outPath);

    rm(
        "-rf",
        atlas.dirsToRemove.map(dir => join(projectDir, dir))
    );

    // The Atlas files are copied with read-only permissions, but mxbuild writes to
    // some generated files during the build.
    for (const dir of ["themesource", "javascriptsource"]) {
        const src = join(outPath, dir);
        if (!test("-d", src)) {
            continue;
        }
        cp("-r", src, projectDir);
        exec(`chmod -R +w "${join(projectDir, dir)}"`, { silent: true });
    }
}

/**
 * Replaces the Atlas theme and themesource of a test project with the release that
 * matches the given Mendix version. Falls back to the version stored in the .mpr file.
 */
export async function updateAtlas(projectDir, mendixVersion, mprFile) {
    const version = mendixVersion || (mprFile && detectProjectMendixVersion(mprFile));
    const atlas = getAtlasConfig(version);

    console.log(`Updating Atlas for Mendix ${version ?? "unknown"} (${atlas.coreTag}, ${atlas.themeTag})`);

    await updateAtlasTheme(projectDir, atlas);
    await updateAtlasThemesource(projectDir, atlas);
}
