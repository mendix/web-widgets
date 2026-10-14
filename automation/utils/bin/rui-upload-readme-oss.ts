#!/usr/bin/env ts-node-script

import { basename } from "node:path";
import { gh } from "../src/github";
import { findAllReadmeOssLocally, getRecommendedReadmeOss, hasReadmeOssInAssets } from "../src/oss-clearance";

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

    // Uploading a name that is already attached fails with a 422, so a re-run of
    // this step reports the existing asset instead of trying again.
    const attached = release.assets.filter(asset => hasReadmeOssInAssets([asset.name]));
    if (attached.length > 0) {
        console.log(JSON.stringify({ uploaded: attached[0].name, status: "exists" }));
        return;
    }

    const readmePath = explicitPath ?? getRecommendedReadmeOss(release.name, findAllReadmeOssLocally());
    if (!readmePath) {
        throw new Error(
            `No matching READMEOSS found in ~/Downloads or ~/Documents for '${release.name}'. Pass the path explicitly as a 2nd argument.`
        );
    }

    const asset = await gh.uploadReleaseAsset(release.id, readmePath, basename(readmePath));
    console.log(JSON.stringify({ uploaded: asset.name, status: "created" }));
}

main().catch(error => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
});
