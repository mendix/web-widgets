#!/usr/bin/env ts-node-script

import { gh, GitHubDraftRelease, GitHubReleaseAsset } from "../src/github";
import { basename, join } from "path";
import { prompt } from "enquirer";
import chalk from "chalk";
import { createReadStream } from "node:fs";
import * as crypto from "crypto";
import { pipeline } from "stream/promises";
import { homedir } from "node:os";
import {
    createSBomGeneratorFolderStructure,
    findAllReadmeOssLocally,
    generateSBomArtifactsInFolder,
    getRecommendedReadmeOss
} from "../src/oss-clearance";

// ============================================================================
// Constants
// ============================================================================

const SBOM_GENERATOR_JAR = join(homedir(), "SBOM_Generator.jar");

// ============================================================================
// Utility Functions
// ============================================================================

function printHeader(title: string): void {
    console.log("\n" + chalk.bold.cyan("═".repeat(60)));
    console.log(chalk.bold.cyan(`  ${title}`));
    console.log(chalk.bold.cyan("═".repeat(60)) + "\n");
}

function printStep(step: number, total: number, message: string): void {
    console.log(chalk.bold.blue(`\n[${step}/${total}]`) + chalk.white(` ${message}`));
}

function printSuccess(message: string): void {
    console.log(chalk.green(`✅ ${message}`));
}

function printError(message: string): void {
    console.log(chalk.red(`❌ ${message}`));
}

function printWarning(message: string): void {
    console.log(chalk.yellow(`⚠️  ${message}`));
}

function printInfo(message: string): void {
    console.log(chalk.cyan(`ℹ️  ${message}`));
}

function printProgress(message: string): void {
    console.log(chalk.gray(`   → ${message}`));
}

// ============================================================================
// Core Functions
// ============================================================================

async function verifyGitHubAuth(): Promise<void> {
    printStep(1, 5, "Verifying GitHub authentication...");

    try {
        await gh.ensureAuth();
        printSuccess("GitHub authentication verified");
    } catch (error) {
        printError(`GitHub authentication failed: ${(error as Error).message}`);
        console.log(chalk.yellow("\n💡 Setup Instructions:\n"));
        console.log(chalk.white("1. Install GitHub CLI:"));
        console.log(chalk.cyan("   • Download: https://cli.github.com/"));
        console.log(chalk.cyan("   • Or via brew: brew install gh\n"));
        console.log(chalk.white("2. Authenticate (choose one option):"));
        console.log(chalk.cyan("   • Option A: export GITHUB_TOKEN=your_token_here"));
        console.log(chalk.cyan("   • Option B: export GH_PAT=your_token_here"));
        console.log(chalk.cyan("   • Option C: gh auth login\n"));
        console.log(chalk.white("3. For A and B get your token at:"));
        console.log(chalk.cyan("   https://github.com/settings/tokens\n"));
        throw new Error("GitHub authentication required");
    }
}

async function selectRelease(): Promise<GitHubDraftRelease> {
    printStep(2, 5, "Fetching draft releases...");

    while (true) {
        const releases = await gh.getDraftReleases();
        printSuccess(`Found ${releases.length} draft release${releases.length !== 1 ? "s" : ""}`);

        if (releases.length === 0) {
            printWarning("No draft releases found. Please create a draft release before trying again.");

            console.log(); // spacing
            const { action } = await prompt<{ action: string }>({
                type: "select",
                name: "action",
                message: "What would you like to do?",
                choices: [
                    { name: "refresh", message: "--- Refresh the list ---" },
                    { name: "exit", message: "❌ Exit" }
                ]
            });

            if (action === "exit") {
                throw new Error("No draft releases found");
            }
            // If "refresh", continue the loop
            continue;
        }

        console.log(); // spacing
        const { tag_name } = await prompt<{ tag_name: string }>({
            type: "select",
            name: "tag_name",
            message: "Select a release to process:",
            choices: [
                ...releases.map(r => ({
                    name: r.tag_name,
                    message: `${r.name} ${chalk.gray(`(${r.tag_name})`)}`
                })),
                {
                    name: "__refresh__",
                    message: chalk.cyan("--- Refresh the list ---")
                }
            ]
        });

        if (tag_name === "__refresh__") {
            printInfo("Refreshing draft releases list...");
            continue; // Loop again to fetch fresh data
        }

        const release = releases.find(r => r.tag_name === tag_name);
        if (!release) {
            throw new Error(`Release not found: ${tag_name}`);
        }

        printInfo(`Selected release: ${chalk.bold(release.name)}`);
        return release;
    }
}

async function findAndValidateMpkAsset(release: GitHubDraftRelease): Promise<GitHubReleaseAsset> {
    printStep(3, 5, "Locating MPK asset...");

    const mpkAsset = release.assets.find(asset => asset.name.endsWith(".mpk"));

    if (!mpkAsset) {
        printError("No MPK asset found in release");
        printInfo(`Available assets: ${release.assets.map(a => a.name).join(", ")}`);
        throw new Error("MPK asset not found");
    }

    printSuccess(`Found MPK asset: ${chalk.bold(mpkAsset.name)}`);
    printInfo(`Asset ID: ${mpkAsset.id}`);
    return mpkAsset;
}

async function downloadAndVerifyAsset(mpkAsset: GitHubReleaseAsset, downloadPath: string): Promise<string> {
    printStep(4, 5, "Downloading and verifying MPK asset...");

    printProgress(`Downloading to: ${downloadPath}`);
    await gh.downloadReleaseAsset(mpkAsset.id, downloadPath);
    printSuccess("Download completed");

    printProgress("Computing SHA-256 hash...");
    const fileHash = await computeHash(downloadPath);
    printInfo(`Computed hash: ${fileHash}`);

    const expectedDigest = mpkAsset.digest.replace("sha256:", "");
    if (fileHash !== expectedDigest) {
        printError("Hash mismatch detected!");
        printInfo(`Expected: ${expectedDigest}`);
        printInfo(`Got:      ${fileHash}`);
        throw new Error("Asset integrity verification failed");
    }

    printSuccess("Hash verification passed");
    return fileHash;
}

async function runSbomGenerator(tmpFolder: string, releaseName: string, fileHash: string): Promise<string> {
    printStep(5, 5, "Running SBOM Generator...");

    printProgress("Generating OSS Clearance artifacts...");

    const finalName = `${releaseName} [${fileHash}].zip`;
    const finalPath = join(homedir(), "Downloads", finalName);

    await generateSBomArtifactsInFolder(tmpFolder, SBOM_GENERATOR_JAR, releaseName, finalPath);
    printSuccess("Completed.");

    return finalPath;
}

async function computeHash(filepath: string): Promise<string> {
    const input = createReadStream(filepath);
    const hash = crypto.createHash("sha256");
    await pipeline(input, hash);
    return hash.digest("hex");
}

// ============================================================================
// Command Handlers
// ============================================================================

async function selectAction(): Promise<"prepare" | "include"> {
    console.log(); // spacing
    const { action } = await prompt<{ action: "prepare" | "include" }>({
        type: "select",
        name: "action",
        message: "What would you like to do with this release?",
        choices: [
            {
                name: "prepare",
                message: "Prepare OSS clearance SBOM"
            },
            {
                name: "include",
                message: "Include OSS Readme"
            }
        ]
    });

    return action;
}

async function handlePrepareAction(release: GitHubDraftRelease, mpkAsset: GitHubReleaseAsset): Promise<void> {
    printHeader("OSS Clearance Artifacts Preparation");

    // Prepare folder structure
    const [tmpFolder, downloadPath] = await createSBomGeneratorFolderStructure(release.name);
    printInfo(`Working directory: ${tmpFolder}`);

    // Step 4: Download and verify
    const fileHash = await downloadAndVerifyAsset(mpkAsset, downloadPath);

    // Step 5: Run SBOM Generator
    const finalPath = await runSbomGenerator(tmpFolder, release.name, fileHash);

    console.log(chalk.bold.green(`\n🎉 Success! Output file:`));
    console.log(chalk.cyan(`   ${finalPath}\n`));
}

async function handleIncludeAction(release: GitHubDraftRelease): Promise<void> {
    printHeader("OSS Clearance Readme Include");

    // Step 4: Find and select OSS Readme
    const readmes = findAllReadmeOssLocally();
    const recommendedReadmeOss = getRecommendedReadmeOss(
        release.name.split(" ")[0],
        release.name.split(" ")[1],
        readmes
    );

    let readmeToInclude: string;

    if (!recommendedReadmeOss) {
        const { selectedReadme } = await prompt<{ selectedReadme: string }>({
            type: "select",
            name: "selectedReadme",
            message: "Select a README_OSS file to include:",
            choices: readmes.map(r => ({
                name: r,
                message: basename(r)
            }))
        });

        readmeToInclude = selectedReadme;
    } else {
        readmeToInclude = recommendedReadmeOss;
    }

    printInfo(`Readme to include: ${readmeToInclude}`);

    // Step 5: Upload asset to the draft release
    const newAsset = await gh.uploadReleaseAsset(release.id, readmeToInclude, basename(readmeToInclude));
    printSuccess(`Successfully uploaded asset ${newAsset.name} (ID: ${newAsset.id})`);
}

// ============================================================================
// Main Function
// ============================================================================

async function main(): Promise<void> {
    printHeader("OSS Clearance Tool");

    try {
        // Step 1: Verify authentication
        await verifyGitHubAuth();

        // Step 2: Select release
        const release = await selectRelease();

        // Step 3: Find MPK asset
        const mpkAsset = await findAndValidateMpkAsset(release);

        // Step 4: Select action
        const action = await selectAction();

        // Step 5: Execute selected action
        if (action === "prepare") {
            await handlePrepareAction(release, mpkAsset);
        } else {
            await handleIncludeAction(release);
        }
    } catch (error) {
        console.log("\n" + chalk.bold.red("═".repeat(60)));
        printError(`Process failed: ${(error as Error).message}`);
        console.log(chalk.bold.red("═".repeat(60)) + "\n");
        process.exit(1);
    }
}

// ============================================================================
// Entry Point
// ============================================================================

main().catch(e => {
    console.error(chalk.red("\n💥 Unexpected error:"), e);
    process.exit(1);
});
