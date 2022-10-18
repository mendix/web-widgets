#!/usr/bin/env ts-node-script
import { find } from "../src/shell";
import { appNameSchema, getWidgetInfo } from "../src/package-info";
import { gh } from "../src/github";
import { addRemoteWithAuthentication } from "../src/git";
import { updateChangelogsAndCreatePR } from "../src/changelog";
import { getWidgetChangelog } from "../src/changelog-parser";

async function main(): Promise<void> {
    // 1. Get widget info
    console.log(`Getting the widget release information...`);
    const info = await getWidgetInfo(process.cwd());
    const changelog = await getWidgetChangelog(process.cwd());
    const name = info.mxpackage.name;
    const appName = appNameSchema.parse(info.marketplace.appName);
    const version = info.version.format();
    const releaseTag = `${name}-v${version}`;

    // 2. Check prerequisites
    // 2.1. Check if current version is already in CHANGELOG
    if (changelog.hasVersion(info.version)) {
        throw new Error(`Version ${version} already exists in CHANGELOG.md file.`);
    }

    // 2.2. Check if there is something to release (entries under "Unreleased" section)
    if (!changelog.hasUnreleasedLogs()) {
        throw new Error(`No unreleased changes found in the CHANGELOG.md for ${name} ${version}.`);
    }

    // 2.3. Check there is no release of that version on GitHub
    const releaseId = await gh.getReleaseIdByReleaseTag(releaseTag);
    if (releaseId) {
        throw new Error(`There is already a release for tag '${releaseTag}'.`);
    }

    // 3. Do release
    console.log(`Preparing ${name} release...`);

    const remoteName = `origin-${name}-v${version}-${Date.now()}`;

    // 3.1 Set remote repo as origin
    await addRemoteWithAuthentication(info.repository.url, remoteName);

    // 3.2 Update CHANGELOG.md and create PR
    console.log("Creating PR with updated CHANGELOG.md file...");
    await updateChangelogsAndCreatePR(info, changelog, releaseTag, remoteName);

    // 3.3 Create release
    console.log("Creating Github release...");

    const mpk = find(`dist/${version}/*.mpk`).toString();
    if (!mpk) {
        throw new Error("MPK file not found");
    }

    await gh.createGithubReleaseFrom({
        title: `${appName} v${version}`,
        notes: changelog.changelog.content[0].sections
            .map(s => `## ${s.type}\n\n${s.logs.map(l => `- ${l}`).join("\n\n")}`)
            .join("\n\n"),
        tag: releaseTag,
        target: "HEAD",
        isDraft: true,
        repo: info.repository.url,
        filesToRelease: mpk
    });
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
