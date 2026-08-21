#!/usr/bin/env ts-node-script

import { basename } from "node:path";
import { gh } from "../src/github";
import { findAllReadmeOssLocally, getRecommendedReadmeOss } from "../src/oss-clearance";

async function main(): Promise<void> {
    const releaseTag = process.argv[2];
    const releaseName = process.argv[3];
    const explicitPath = process.argv[4];

    if (!releaseTag || !releaseName) {
        throw new Error(
            'Usage: rui-upload-readme-oss <release-tag> "<Release Name>" [explicit-path]\nExample: rui-upload-readme-oss combobox-web-v2.9.0 "Combo box v2.9.0"'
        );
    }

    await gh.ensureAuth();

    const releaseId = await gh.getReleaseIdByReleaseTag(releaseTag);
    if (!releaseId) {
        throw new Error(`No GitHub release found for tag '${releaseTag}'`);
    }

    const readmePath = explicitPath ?? getRecommendedReadmeOss(releaseName, findAllReadmeOssLocally());
    if (!readmePath) {
        throw new Error(
            `No matching READMEOSS found in ~/Downloads or ~/Documents for '${releaseName}'. Pass the path explicitly as a 3rd argument.`
        );
    }

    const asset = await gh.uploadReleaseAsset(releaseId, readmePath, basename(readmePath));
    console.log(JSON.stringify({ uploaded: asset.name }));
}

main().catch(error => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
});
