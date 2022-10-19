#!/usr/bin/env ts-node-script
import { join } from "path";
import { addRemoteWithAuthentication } from "../src";
import { updateChangelogsAndCreatePR } from "../src/changelog";
import { gh } from "../src/github";
import { getPublishedInfo } from "../src/package-info";
import { find } from "../src/shell";

async function main(): Promise<void> {
    console.info(`Getting package information...`);
    const path = process.cwd();
    const pkg = await getPublishedInfo(path);
    const appName = pkg.marketplace.appName;
    const version = pkg.version.format();
    const releaseTag = `${pkg.name}-v${version}`;
    const notesFile = await gh.createTempFile();

    // Check there is no release of that version on GitHub
    console.info("Checking existing releases...");

    const releaseId = await gh.getReleaseIdByReleaseTag(releaseTag);
    if (releaseId) {
        throw new Error(`There is already a release for tag '${releaseTag}'.`);
    }

    // Do release
    console.log(`Preparing ${pkg.name} release...`);
    const remoteName = `origin-${pkg.name}-v${version}-${Date.now()}`;
    // Set remote repo as origin
    await addRemoteWithAuthentication(pkg.repository.url, remoteName);

    // Update CHANGELOG.md and create PR
    console.log("Creating PR with updated CHANGELOG.md file...");
    process.env.RELEASE_NOTES_FILE = notesFile;
    await updateChangelogsAndCreatePR(pkg, releaseTag, remoteName);

    // Create release
    console.log("Creating Github release...");

    const mpk = find(join(path, "dist", version, "*.mpk")).toString();
    if (!mpk) {
        throw new Error("MPK file not found");
    }

    await gh.createGithubReleaseFrom({
        title: `${appName} v${version}`,
        notes: { file: notesFile },
        tag: releaseTag,
        target: "HEAD",
        isDraft: true,
        repo: pkg.repository.url,
        filesToRelease: mpk
    });
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
