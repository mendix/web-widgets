#!/usr/bin/env node
import { createWriteStream } from "node:fs";
import { join } from "node:path";
import sh from "shelljs";
import crossZip from "cross-zip";
import { packageMeta, fetchWithReport, usetmp, streamPipe } from "./utils.mjs";
import * as config from "./config.mjs";

const { ls, mkdir, rm, mv } = sh;

export async function setupTestProject() {
    console.log("Copying test project from GitHub repository");

    sh.config.silent = true;
    const testsFiles = ls(config.testsDir);
    sh.config.silent = false;

    if (testsFiles.length !== 0) {
        console.log("Test project directory already exists, cleaning up...");
        rm("-rf", config.testsDir);
    }

    const archivePath = await downloadTestProject(
        packageMeta.testProject.githubUrl,
        packageMeta.testProject.branchName
    );

    try {
        mkdir("-p", config.testsDir);
        crossZip.unzipSync(archivePath, config.testsDir);
        mv(config.postUnzipProjectDirGlob, config.testProjectDir);
        rm("-f", archivePath);

        if (ls(config.mprFileGlob).length === 0) {
            throw new Error('Invalid test project retrieved from GitHub: "mpr" file is missing.');
        }
    } catch (e) {
        console.error(e);
        throw new Error(`Failed to unzip the test project into ${config.testProjectDir}`);
    }
}

async function downloadTestProject(repository, branch) {
    const tmp = await usetmp();
    const downloadedArchivePath = join(tmp, config.nameForDownloadedArchive);

    if (!repository.includes("github.com")) {
        throw new Error("githubUrl is not a valid github repository!");
    }

    try {
        await streamPipe(
            (await fetchWithReport(`${repository}/archive/refs/heads/${branch}.zip`)).body,
            createWriteStream(downloadedArchivePath)
        );
        return downloadedArchivePath;
    } catch (e) {
        rm("-f", downloadedArchivePath);
        throw new Error("Cannot find test project in GitHub repository. Try again later.");
    }
}
