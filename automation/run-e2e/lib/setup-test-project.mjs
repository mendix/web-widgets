#!/usr/bin/env node
import { createWriteStream, existsSync, globSync, mkdirSync, renameSync, rmSync } from "node:fs";
import { join } from "node:path";
import crossZip from "cross-zip";
import { packageMeta, fetchWithReport, usetmp, streamPipe } from "./utils.mjs";
import * as config from "./config.mjs";

export async function setupTestProject() {
    console.log("Copying test project from GitHub repository");

    if (existsSync(config.testsDir)) {
        console.log("Test project directory already exists, cleaning up...");
        rmSync(config.testsDir, { recursive: true, force: true });
    }

    const archivePath = await downloadTestProject(
        packageMeta.testProject.githubUrl,
        packageMeta.testProject.branchName
    );

    try {
        mkdirSync(config.testsDir, { recursive: true });
        crossZip.unzipSync(archivePath, config.testsDir);
        const [unzippedProjectDir] = globSync(config.postUnzipProjectDirGlob);
        if (!unzippedProjectDir) {
            throw new Error(`No directory matching ${config.postUnzipProjectDirGlob} after unzipping.`);
        }
        renameSync(unzippedProjectDir, config.testProjectDir);
        rmSync(archivePath, { force: true });

        if (globSync(config.mprFileGlob).length === 0) {
            throw new Error('Invalid test project retrieved from GitHub: "mpr" file is missing.');
        }
    } catch (e) {
        console.error(e);
        throw new Error(`Failed to unzip the test project into ${config.testProjectDir}`, { cause: e });
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
        rmSync(downloadedArchivePath, { force: true });
        throw new Error("Cannot find test project in GitHub repository. Try again later.", { cause: e });
    }
}
