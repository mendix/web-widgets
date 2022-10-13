import { WidgetChangelogFileWrapper } from "./changelog-parser";
import { PackageInfo } from "./package-info";
import { execShellCommand } from "./shell";
import { gh } from "./github";

export async function updateChangelogsAndCreatePR(
    packageInfo: PackageInfo,
    changelog: WidgetChangelogFileWrapper,
    releaseTag: string,
    remoteName: string
): Promise<void> {
    const releaseBranchName = `${releaseTag}-update-changelog`;

    console.log(`Creating branch '${releaseBranchName}'...`);
    await execShellCommand(`git checkout -b ${releaseBranchName}`);

    console.log("Updating CHANGELOG.md...");
    const updatedChangelog = changelog.moveUnreleasedToVersion(packageInfo.version);
    updatedChangelog.save();

    console.log(`Committing CHANGELOG.md to '${releaseBranchName}' and pushing to remote...`);
    await execShellCommand([
        `git add ${changelog.changelogPath}`,
        `git commit -m "chore(${packageInfo.packageName}): update changelog"`,
        `git push ${remoteName} ${releaseBranchName}`
    ]);

    console.log(`Creating pull request for '${releaseBranchName}'`);
    await gh.createGithubPRFrom({
        title: `${packageInfo.packageFullName} v${packageInfo.version.format()}: Update changelog`,
        body: "This is an automated PR that merges changelog update to master.",
        base: "main",
        head: releaseBranchName,
        repo: packageInfo.repositoryUrl
    });

    console.log("Created PR for changelog updates.");
}
