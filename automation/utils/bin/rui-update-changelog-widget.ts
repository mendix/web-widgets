#!/usr/bin/env ts-node-script

import { writeFile } from "fs/promises";
import { getPackageInfo } from "../src";
import { getWidgetChangelog } from "../src/changelog-parser";

async function main(): Promise<void> {
    const info = await getPackageInfo(process.cwd());
    const version = info.version;
    const changelog = await getWidgetChangelog(process.cwd());

    // Check if current version is already in CHANGELOG
    if (changelog.hasVersion(version)) {
        throw new Error(`[${info.name}] Version ${version.format()} already exists in CHANGELOG.md file.`);
    }

    // Check if there is something to release (entries under "Unreleased" section)
    if (!changelog.hasUnreleasedLogs()) {
        throw new Error(`[${info.name}] No unreleased changes found in the CHANGELOG.md file.`);
    }

    console.log("Updating changelog...");
    const updated = changelog.moveUnreleasedToVersion(info.version);
    updated.save();

    if (process.env.RELEASE_NOTES_FILE) {
        const content = updated.getLatestReleaseContent();
        await writeFile(process.env.RELEASE_NOTES_FILE, content);
    }
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
