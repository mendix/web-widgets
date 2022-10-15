#!/usr/bin/env ts-node-script

import assert from "node:assert/strict";
import { getPackageFileContent, getPublishedPackageInfo, gh } from "../src";
import { fgGreen } from "../src/ansi-colors";
import { createDraft, publishDraft } from "../src/api/contributor";

async function main(): Promise<void> {
    console.log(`Getting package information...`);
    const content = await getPackageFileContent(process.cwd());
    const packageInfo = await getPublishedPackageInfo(content);
    const tag = process.env.TAG;

    assert.ok(tag, "env.TAG is empty");

    console.log(`Starting release process for tag ${fgGreen(tag)}`);

    const artifacts = await gh.getReleaseArtifacts(tag);
    const mpk = artifacts.find(item => item.name.endsWith(".mpk"));

    if (!mpk) {
        throw new Error(`Could not retrieve MPK url from GitHub release with tag ${tag}`);
    }

    const draft = await createDraft({
        appName: packageInfo.appName,
        appNumber: packageInfo.appNumber,
        version: packageInfo.version,
        studioProVersion: packageInfo.minimumMXVersion,
        artifactUrl: mpk.browser_download_url
    });

    await publishDraft({ draftUUID: draft.UUID });
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
