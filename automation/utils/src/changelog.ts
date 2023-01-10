import { gh } from "./github";
import { PublishedInfo } from "./package-info";
import { exec, pushd, popd } from "./shell";

export async function updateChangelogsAndCreatePR(
    info: PublishedInfo,
    releaseTag: string,
    remoteName: string
): Promise<void> {
    const releaseBranchName = `${releaseTag}-update-changelog`;
    const appName = info.marketplace.appName;

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
    await exec(`git commit -m "chore(${info.name}): update changelog"`);
    await exec(`git push ${remoteName} ${releaseBranchName}`);
    popd();

    console.log(`Creating pull request for '${releaseBranchName}'`);
    await gh.createGithubPRFrom({
        title: `${appName} v${info.version.format()}: Update changelog`,
        body: "This is an automated PR that merges changelog update to master.",
        base: "main",
        head: releaseBranchName,
        repo: info.repository.url
    });

    console.log("Created PR for changelog updates.");
}
