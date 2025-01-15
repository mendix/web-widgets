#!/usr/bin/env ts-node-script

import assert from "node:assert/strict";
import { getPublishedInfo, gh } from "../src";
import { fgGreen } from "../src/ansi-colors";
import { createDraft, publishDraft } from "../src/api/contributor";

async function main(): Promise<void> {
    console.log(`Getting package information...`);
    const { marketplace, version } = await getPublishedInfo(process.cwd());
    const tag = process.env.TAG;

    assert.ok(tag, "env.TAG is empty");

    if (marketplace.appNumber === -1) {
        console.log(`Skipping release process for tag ${fgGreen(tag)}. appNumber is set to -1 in package.json.`);
        process.exit(2);
    }

    console.log(`Starting release process for tag ${fgGreen(tag)}`);

    const artifactUrl = await gh.getMPKReleaseArtifactUrl(tag);

    const draft = await createDraft({
        appName: marketplace.appName,
        appNumber: marketplace.appNumber,
        reactReady: marketplace.reactReady,
        version,
        studioProVersion: marketplace.minimumMXVersion,
        artifactUrl
    });

    await publishDraft({ draftUUID: draft.UUID });
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
