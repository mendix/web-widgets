#!/usr/bin/env ts-node-script

import { basename } from "node:path";
import { gh } from "../src/github";
import { findAllReadmeOssLocally, getRecommendedReadmeOss } from "../src/oss-clearance";

async function main(): Promise<void> {
    const releaseTag = process.argv[2];
    const explicitPath = process.argv[3];

    if (!releaseTag) {
        throw new Error(
            "Usage: rui-upload-readme-oss <release-tag> [explicit-path]\nExample: rui-upload-readme-oss combobox-web-v2.9.0"
        );
    }

    await gh.ensureAuth();

    const release = await gh.getReleaseByTag(releaseTag);
    if (!release) {
        throw new Error(`No GitHub release found for tag '${releaseTag}'`);
    }

    const readmePath = explicitPath ?? getRecommendedReadmeOss(release.name, findAllReadmeOssLocally());
    if (!readmePath) {
        throw new Error(
            `No matching READMEOSS found in ~/Downloads or ~/Documents for '${release.name}'. Pass the path explicitly as a 2nd argument.`
        );
    }

    const asset = await gh.uploadReleaseAsset(release.id, readmePath, basename(readmePath));
    console.log(JSON.stringify({ uploaded: asset.name }));
}

main().catch(error => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
});
