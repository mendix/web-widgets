#!/usr/bin/env ts-node-script
import { join, resolve } from "path";
import { addRemoteWithAuthentication } from "../src";
import { updateChangelogsAndCreatePR } from "../src/changelog";
import { gh } from "../src/github";
import { getPublishedInfo } from "../src/package-info";
import { exec, find } from "../src/shell";

async function resolveChangelogBranch(releaseTag: string, remoteName: string): Promise<string> {
    const { stdout } = await exec(`git rev-parse --abbrev-ref HEAD`, { stdio: "pipe" });
    const currentBranch = stdout.trim();
    const tmpBranchPattern = /^tmp\/.+-v\d+\.\d+\.\d+$/;

    if (tmpBranchPattern.test(currentBranch)) {
        console.log(`Running on branch '${currentBranch}', reusing it for changelog PR.`);
        return currentBranch;
    }

    const branchName = `${releaseTag}-update-changelog`;

    try {
        const { stdout: remoteOutput } = await exec(`git ls-remote --heads ${remoteName} ${branchName}`, {
            stdio: "pipe"
        });
        if (remoteOutput.trim()) {
            const remoteCommitHash = remoteOutput.split("\t")[0].substring(0, 7);
            const renamedBranchName = `${branchName}-${remoteCommitHash}`;

            console.log(`Branch '${branchName}' already exists on remote. Renaming it to '${renamedBranchName}'...`);

            await exec(`git push ${remoteName} ${remoteName}/${branchName}:refs/heads/${renamedBranchName}`);
            await exec(`git push ${remoteName} --delete ${branchName}`);
        }
    } catch {
        console.log(`Using branch name '${branchName}'`);
    }

    console.log(`Creating branch '${branchName}'...`);
    await exec(`git checkout -b ${branchName}`);

    return branchName;
}

async function main(): Promise<void> {
    console.info(`Getting package information...`);
    const path = process.cwd();
    const pkg = await getPublishedInfo(path);
    const appName = pkg.marketplace.appName;
    const version = pkg.version.format();
    const pkgName = pkg.name.replace("@mendix/", "");
    const releaseTag = `${pkgName}-v${version}`;
    const notesFile = resolve(await gh.createTempFile());
    console.log(notesFile);

    // Check there is no release of that version on GitHub
    console.info("Checking existing releases...");

    const releaseId = await gh.getReleaseIdByReleaseTag(releaseTag);
    if (releaseId) {
        throw new Error(`There is already a release for tag '${releaseTag}'.`);
    }

    // Do release
    console.log(`Preparing ${pkgName} release...`);
    const remoteName = `origin-${pkgName}-v${version}-${Date.now()}`;
    // Set remote repo as origin
    await addRemoteWithAuthentication(pkg.repository.url, remoteName);

    // Update CHANGELOG.md and create PR
    console.log("Creating PR with updated CHANGELOG.md file...");
    process.env.RELEASE_NOTES_FILE = notesFile;
    const changelogBranch = await resolveChangelogBranch(releaseTag, remoteName);
    await updateChangelogsAndCreatePR(pkg, changelogBranch, remoteName);

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
