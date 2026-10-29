import { gh } from "./github.ts";
import type { PublishedInfo } from "./package-info.ts";
import { exec } from "./shell.ts";

export async function updateChangelogsAndCreatePR(
    info: PublishedInfo,
    branch: string,
    remoteName: string
): Promise<void> {
    const appName = info.marketplace.appName;

    console.log("Updating CHANGELOG.md...");
    await exec(`pnpm run update-changelog --filter=${info.name}`);
    const { stdout: changed } = await exec(`git status --porcelain`, { stdio: "pipe" });
    const hasChangelogUpdates = changed.split("\n").some(file => file.endsWith("CHANGELOG.md"));

    if (!hasChangelogUpdates) {
        throw new Error(`[${info.name}] CHANGELOG.md has no changes, nothing to commit.`);
    }

    console.log(`Committing changes and pushing '${branch}' to remote...`);
    const { stdout: root } = await exec(`git rev-parse --show-toplevel`, { stdio: "pipe" });
    const cwd = root.trim();
    await exec(`git add '*/CHANGELOG.md'`, { cwd });
    await exec(`git commit -m "chore(${info.name}): update changelog"`, { cwd });
    await exec(`git push ${remoteName} ${branch}`, { cwd });

    console.log(`Creating pull request for '${branch}'`);
    await gh.createGithubPRFrom({
        title: `${appName} v${info.version.format()}: Update changelog`,
        body: "This is an automated PR that merges changelog update to main branch.",
        base: "main",
        head: branch,
        repo: info.repository.url
    });

    console.log("Created PR for changelog updates.");
}
