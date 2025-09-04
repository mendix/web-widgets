import { gh } from "./github";
import { PublishedInfo } from "./package-info";
import { exec, popd, pushd } from "./shell";
import { findOssReadme } from "./oss-readme";
import { join } from "path";

export async function updateChangelogsAndCreatePR(
    info: PublishedInfo,
    releaseTag: string,
    remoteName: string
): Promise<void> {
    const releaseBranchName = `${releaseTag}-update-changelog`;
    const appName = info.marketplace.appName;

    // Check if branch already exists on remote
    try {
        const { stdout: remoteOutput } = await exec(`git ls-remote --heads ${remoteName} ${releaseBranchName}`, {
            stdio: "pipe"
        });
        if (remoteOutput.trim()) {
            // Branch exists on remote, get its commit hash and rename it
            const remoteCommitHash = remoteOutput.split("\t")[0].substring(0, 7); // Get short hash from remote output
            const renamedBranchName = `${releaseBranchName}-${remoteCommitHash}`;

            console.log(
                `Branch '${releaseBranchName}' already exists on remote. Renaming it to '${renamedBranchName}'...`
            );

            // Create new branch on remote with the renamed name pointing to the same commit
            await exec(`git push ${remoteName} ${remoteName}/${releaseBranchName}:refs/heads/${renamedBranchName}`);
            // Delete the old branch on remote
            await exec(`git push ${remoteName} --delete ${releaseBranchName}`);
        }
    } catch (error) {
        // Branch doesn't exist on remote, continue with original name
        console.log(`Using branch name '${releaseBranchName}'`);
    }

    console.log(`Creating branch '${releaseBranchName}'...`);
    await exec(`git checkout -b ${releaseBranchName}`);

    console.log("Updating CHANGELOG.md...");
    await exec(`pnpm run update-changelog --filter=${info.name}`);
    const { stdout: changed } = await exec(`git status --porcelain`, { stdio: "pipe" });
    const hasChangelogUpdats = changed.split("\n").some(file => file.endsWith("CHANGELOG.md"));

    if (!hasChangelogUpdats) {
        throw new Error(`[${info.name}] CHANGELOG.md has no changes, nothing to commit.`);
    }

    console.log(`Committing changes and pushing '${releaseBranchName}' to remote...`);
    const { stdout: root } = await exec(`git rev-parse --show-toplevel`, { stdio: "pipe" });
    pushd(root.trim());
    await exec(`git add '*/CHANGELOG.md'`);

    const path = process.cwd();
    const readmeossFile = findOssReadme(path, info.mxpackage.name, info.version.format());
    if (readmeossFile) {
        console.log(`Removing OSS clearance readme file '${readmeossFile}'...`);
        await exec(`git rm '${join(path, readmeossFile)}'`);
    }

    await exec(`git commit -m "chore(${info.name}): update changelog"`);
    await exec(`git push ${remoteName} ${releaseBranchName}`);
    popd();

    console.log(`Creating pull request for '${releaseBranchName}'`);
    await gh.createGithubPRFrom({
        title: `${appName} v${info.version.format()}: Update changelog`,
        body: "This is an automated PR that merges changelog update to main branch.",
        base: "main",
        head: releaseBranchName,
        repo: info.repository.url
    });

    console.log("Created PR for changelog updates.");
}
