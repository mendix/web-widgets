#!/usr/bin/env node

import assert from "node:assert/strict";
import { appendFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import chalk from "chalk";
import { MarketplacePublishClient, publishRelease } from "../src/api/marketplace-publish.ts";
import { getPublishedInfo, gh } from "../src/index.ts";
import { releaseNotesToHtml } from "../src/release-notes-html.ts";

async function writeJobSummary(line: string): Promise<void> {
    const summaryFile = process.env.GITHUB_STEP_SUMMARY;
    if (!summaryFile) {
        return;
    }
    await appendFile(summaryFile, `${line}\n\n`).catch((error: unknown) => {
        console.warn(`Could not write to the job summary: ${error}`);
    });
}

async function main(): Promise<void> {
    console.log(`Getting package information...`);
    const { marketplace, version } = await getPublishedInfo(process.cwd());
    const tag = process.env.TAG;
    const pat = process.env.MX_PAT;

    assert.ok(tag, "env.TAG is empty");

    if (marketplace.appNumber === -1) {
        console.log(`Skipping release process for tag ${chalk.green(tag)}. appNumber is set to -1 in package.json.`);
        process.exit(2);
    }

    assert.ok(pat, "env.MX_PAT is empty");

    console.log(`Starting release process for tag ${chalk.green(tag)}`);

    const release = await gh.getReleaseByTag(tag);
    assert.ok(release, `Could not find GitHub release with tag '${tag}'`);

    const releaseNotes = releaseNotesToHtml(release.body ?? "");
    assert.ok(releaseNotes, `GitHub release '${tag}' has no release notes`);

    const mpkAsset = release.assets.find(asset => asset.name.endsWith(".mpk"));
    assert.ok(mpkAsset, `GitHub release '${tag}' has no MPK asset`);

    const tmpFolder = await mkdtemp(join(tmpdir(), "marketplace-publish-"));
    try {
        const mpkPath = join(tmpFolder, mpkAsset.name);
        await gh.downloadReleaseAsset(mpkAsset.id, mpkPath);

        const result = await publishRelease(new MarketplacePublishClient(pat), {
            componentId: marketplace.appNumber,
            versionNumber: version.format(),
            mendixVersion: marketplace.minimumMXVersion.format(),
            releaseNotes,
            mpkPath,
            publish: true,
            onDraftCreated: releaseId =>
                writeJobSummary(`Created Marketplace draft release \`${releaseId}\` for ${tag}.`)
        });

        console.log(chalk.green(`${result.name} v${result.versionNumber} is now ${result.status}.`));
        await writeJobSummary(`Marketplace release \`${result.releaseId}\` is now **${result.status}**.`);

        if (result.name !== marketplace.appName) {
            const warning =
                `The Marketplace lists this component as "${result.name}", but marketplace.appName is "${marketplace.appName}". ` +
                `The Publish API can't rename components; rename it in the Marketplace if the change is intended.`;
            console.warn(chalk.yellow(warning));
            await writeJobSummary(`> [!WARNING]\n> ${warning}`);
        }
    } finally {
        await rm(tmpFolder, { recursive: true, force: true });
    }
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
