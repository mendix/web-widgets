import { WidgetChangelogFileWrapper } from "./changelog-parser";
import { gh } from "./github";
import { appNameSchema, PackageInfo } from "./package-info";
import { exec } from "./shell";

export async function updateChangelogsAndCreatePR(
    info: PackageInfo,
    changelog: WidgetChangelogFileWrapper,
    releaseTag: string,
    remoteName: string
): Promise<void> {
    const releaseBranchName = `${releaseTag}-update-changelog`;
    const appName = appNameSchema.parse(info.marketplace.appName);

    console.log(`Creating branch '${releaseBranchName}'...`);
    await exec(`git checkout -b ${releaseBranchName}`);

    console.log("Updating CHANGELOG.md...");
    const updatedChangelog = changelog.moveUnreleasedToVersion(info.version);
    updatedChangelog.save();

    console.log(`Committing CHANGELOG.md to '${releaseBranchName}' and pushing to remote...`);
    await exec(`git add ${changelog.changelogPath}`);
    await exec(`git commit -m "chore(${info.mxpackage.name}): update changelog"`);
    await exec(`git push ${remoteName} ${releaseBranchName}`);

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
