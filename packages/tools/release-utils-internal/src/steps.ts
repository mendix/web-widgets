import { WidgetChangelogFileWrapper } from "./changelog-parser";
import { PackageInfo } from "./package-info";
import { exec, find, mkdir, cp } from "./shell";
import { gh } from "./github";
import { listPackages } from "./monorepo";

export async function updateChangelogsAndCreatePR(
    packageInfo: PackageInfo,
    changelog: WidgetChangelogFileWrapper,
    releaseTag: string,
    remoteName: string
): Promise<void> {
    const releaseBranchName = `${releaseTag}-update-changelog`;

    console.log(`Creating branch '${releaseBranchName}'...`);
    await exec(`git checkout -b ${releaseBranchName}`);

    console.log("Updating CHANGELOG.md...");
    const updatedChangelog = changelog.moveUnreleasedToVersion(packageInfo.version);
    updatedChangelog.save();

    console.log(`Committing CHANGELOG.md to '${releaseBranchName}' and pushing to remote...`);
    await exec(`git add ${changelog.changelogPath}`);
    await exec(`git commit -m "chore(${packageInfo.packageName}): update changelog"`);
    await exec(`git push ${remoteName} ${releaseBranchName}`);

    console.log(`Creating pull request for '${releaseBranchName}'`);
    await gh.createGithubPRFrom({
        title: `${packageInfo.appName} v${packageInfo.version.format()}: Update changelog`,
        body: "This is an automated PR that merges changelog update to master.",
        base: "main",
        head: releaseBranchName,
        repo: packageInfo.repositoryUrl
    });

    console.log("Created PR for changelog updates.");
}

export async function copyMpkFiles(packageNames: string[], dest: string): Promise<void> {
    const packages = await listPackages(packageNames);
    const paths = [...find(packages.map(p => `${p.path}/dist/${p.version}/*.mpk`))];
    mkdir("-p", dest);
    cp(paths, dest);
}
