#!/usr/bin/env node
import { tmpdir } from "node:os";
import { createWriteStream } from "node:fs";
import { mkdtemp } from "node:fs/promises";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import { join } from "node:path";
import fetch from "node-fetch";
import sh from "shelljs";
import crossZip from "cross-zip";
import { packageMeta } from "./utils.mjs";

const { cp, ls, mkdir, rm, mv } = sh;
const streamPipe = promisify(pipeline);
const usetmp = async () => mkdtemp(join(tmpdir(), "run_e2e_files_"));

export async function setupTestProject() {
    console.log("Copying test project from GitHub repository");

    sh.config.silent = true;
    const testsFiles = ls("tests");
    sh.config.silent = false;

    if (testsFiles.length !== 0) {
        throw new Error("tests dir is not empty");
    }

    const archivePath = await downloadTestProject(
        packageMeta.testProject.githubUrl,
        packageMeta.testProject.branchName
    );

    try {
        mkdir("-p", "tests");
        crossZip.unzipSync(archivePath, "tests");
        mv("tests/testProjects-*", "tests/testProject");
        rm("-f", archivePath);

        if (ls(`tests/testProject/*.mpr`).length === 0) {
            throw new Error('Invalid test project retrieved from GitHub: "mpr" file is missing.');
        }

        await updateAtlas();
    } catch (e) {
        console.error(e);
        throw new Error("Failed to unzip the test project into tests/testProject");
    }
}

async function downloadTestProject(repository, branch) {
    const tmp = await usetmp();
    const downloadedArchivePath = join(tmp, `testProject.zip`);

    if (!repository.includes("github.com")) {
        throw new Error("githubUrl is not a valid github repository!");
    }

    try {
        await streamPipe(
            (
                await fetch(`${repository}/archive/refs/heads/${branch}.zip`)
            ).body,
            createWriteStream(downloadedArchivePath)
        );
        return downloadedArchivePath;
    } catch (e) {
        rm("-f", downloadedArchivePath);
        throw new Error("Cannot find test project in GitHub repository. Try again later.");
    }
}

async function updateAtlas() {
    console.log("Copying Atlas files from latest StarterApp");
    rm(
        "-rf",
        "tests/testProject/theme",
        "tests/testProject/themesource/atlas_ui_resources",
        "tests/testProject/themesource/atlas_core",
        "tests/testProject/themesource/atlas_nativemobile_content",
        "tests/testProject/themesource/atlas_web_content",
        "tests/testProject/themesource/datawidgets"
    );

    const releasesResponse = await fetch("https://api.github.com/repos/mendix/StarterApp_Blank/releases/latest");
    if (releasesResponse.ok) {
        const release = await releasesResponse.json();
        const [{ browser_download_url }] = release.assets;
        const downloadedPath = join(await usetmp(), `StarterAppRelease.zip`);
        const outPath = await usetmp();
        try {
            await streamPipe((await fetch(browser_download_url)).body, createWriteStream(downloadedPath));
            crossZip.unzipSync(downloadedPath, outPath);
            cp("-r", join(outPath, "theme"), "tests/testProject");
            cp("-r", join(outPath, "themesource"), "tests/testProject");
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
