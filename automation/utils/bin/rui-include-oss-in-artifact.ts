#!/usr/bin/env ts-node-script

import { gh } from "../src/github";
import { includeReadmeOssIntoMpk } from "../src/oss-clearance";
import { rm } from "../src/shell";
import { mkdtemp } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import chalk from "chalk";

/**
 * This script processes GitHub release artifacts to include READMEOSS HTML files into MPK files.
 *
 * Workflow:
 * 1. Check release assets for .mpk and .html files
 * 2. If only MPK exists - do nothing
 * 3. If both MPK and HTML exist:
 *    - Download both files
 *    - Merge HTML into MPK
 *    - Replace the MPK asset in the release
 */

async function main(): Promise<void> {
    const releaseTag = process.env.TAG;

    if (!releaseTag) {
        throw new Error("TAG environment variable is required");
    }

    await gh.ensureAuth();

    console.log(chalk.bold.cyan(`\n🔍 Processing release: ${releaseTag}\n`));

    const releaseId = await gh.getReleaseIdByReleaseTag(releaseTag);

    if (!releaseId) {
        throw new Error(`Could not find release ID for tag '${releaseTag}'`);
    }

    // Step 1: Get release artifacts
    console.log(chalk.blue("📦 Fetching release artifacts..."));
    const artifacts = await gh.listReleaseAssets(releaseId);

    const mpkAsset = artifacts.find(asset => asset.name.endsWith(".mpk"));
    const htmlAsset = artifacts.find(asset => asset.name.endsWith(".html"));

    if (!mpkAsset) {
        throw new Error(`No MPK file found in release '${releaseTag}'`);
    }

    console.log(chalk.green(`✅ Found MPK: ${mpkAsset.name}`));

    // Step 2: Check if HTML file exists
    if (!htmlAsset) {
        console.log(chalk.yellow("⚠️  No HTML file found in release - nothing to include"));
        console.log(chalk.gray("   Skipping MPK modification\n"));
        process.exit(0);
    }

    console.log(chalk.green(`✅ Found HTML: ${htmlAsset.name}`));

    // Step 3: Download both files to temp directory
    console.log(chalk.blue("\n📥 Downloading artifacts..."));

    const tmpFolder = await mkdtemp(join(tmpdir(), "mpk-oss-include-"));
    const mpkPath = join(tmpFolder, mpkAsset.name);
    const htmlPath = join(tmpFolder, htmlAsset.name);

    try {
        console.log(chalk.gray(`   → Downloading ${mpkAsset.name}...`));
        await gh.downloadReleaseAsset(mpkAsset.id, mpkPath);

        console.log(chalk.gray(`   → Downloading ${htmlAsset.name}...`));
        await gh.downloadReleaseAsset(htmlAsset.id, htmlPath);

        console.log(chalk.green("✅ Downloads completed"));

        // Step 4: Include HTML into MPK
        console.log(chalk.blue("\n🔧 Merging HTML into MPK..."));
        await includeReadmeOssIntoMpk(htmlPath, mpkPath);
        console.log(chalk.green("✅ Merge completed"));

        // Step 5: Remove old assets, upload patched MPK
        console.log(chalk.blue("\n🔄 Replacing MPK asset in release..."));

        console.log(chalk.gray(`   → Deleting old MPK asset...`));
        await gh.deleteReleaseAsset(mpkAsset.id);

        console.log(chalk.gray(`   → Deleting old HTML asset...`));
        await gh.deleteReleaseAsset(htmlAsset.id);

        console.log(chalk.gray(`   → Uploading modified MPK...`));
        const newAsset = await gh.uploadReleaseAsset(releaseId, mpkPath, mpkAsset.name);

        console.log(chalk.green(`✅ Successfully replaced MPK asset (ID: ${newAsset.id})`));
        console.log(chalk.bold.green(`\n🎉 Process completed successfully!\n`));
    } finally {
        // Step 8: Cleanup temp files
        console.log(chalk.gray("🧹 Cleaning up temporary files..."));
        await rm("-rf", tmpFolder);
    }
}

main().catch(error => {
    console.error(chalk.red(`\n❌ Error: ${error.message}\n`));
    console.error(error);
    process.exit(1);
});
