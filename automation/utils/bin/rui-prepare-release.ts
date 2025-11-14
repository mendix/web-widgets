import { Jira } from "../src/jira";
import { PackageListing, selectPackage } from "../src/monorepo";
import chalk from "chalk";
import { prompt } from "enquirer";
import { getNextVersion, writeVersion } from "../src/bump-version";
import { exec } from "../src/shell";
import { gh } from "../src/github";

async function main(): Promise<void> {
    try {
        console.log(chalk.bold.cyan("\n🚀 RELEASE PREPARATION WIZARD 🚀\n"));

        console.log(chalk.bold("📋 STEP 1: Initialize Jira and GitHub"));

        // Check GitHub authentication
        try {
            await gh.ensureAuth();
            console.log(chalk.green("✅ GitHub authentication verified"));
        } catch (error) {
            console.log(chalk.red(`❌ GitHub authentication failed: ${(error as Error).message}`));
            console.log(chalk.yellow("\n💡 First, make sure GitHub CLI is installed:"));
            console.log(chalk.cyan("   Download from: https://cli.github.com/"));
            console.log(chalk.cyan("   Or install via brew: brew install gh"));
            console.log(chalk.yellow("\n💡 Then authenticate with GitHub using one of these options:"));
            console.log(chalk.yellow("   1. Set GITHUB_TOKEN environment variable:"));
            console.log(chalk.cyan("      export GITHUB_TOKEN=your_token_here"));
            console.log(chalk.yellow("   2. Set GH_PAT environment variable:"));
            console.log(chalk.cyan("      export GH_PAT=your_token_here"));
            console.log(chalk.yellow("   3. Use GitHub CLI to authenticate:"));
            console.log(chalk.cyan("      gh auth login"));
            console.log(chalk.yellow("\n   Get a token at: https://github.com/settings/tokens"));
            process.exit(1);
        }

        // Step 1: Initialize Jira client
        let jira: Jira;
        try {
            jira = await initializeJiraClient();
        } catch (error) {
            console.log(chalk.red(`❌ ${(error as Error).message}`));
            process.exit(1);
        }

        // Step 2: Select package and determine version
        console.log(chalk.bold("\n📋 STEP 2: Package Selection"));
        const { pkg, baseName, nextVersion, jiraVersionName, isVersionBumped } = await selectPackageAndVersion();

        // Step 3: Check if Jira version exists
        console.log(chalk.bold("\n📋 STEP 3: Jira Version Setup"));
        const jiraVersion = await checkAndCreateJiraVersion(jira, jiraVersionName);

        // Step 4: Create release branch
        console.log(chalk.bold("\n📋 STEP 4: Git Operations"));
        const tmpBranchName = await createReleaseBranch(baseName, nextVersion);

        // Track whether we need to commit changes
        let hasCommits = false;

        // Step 4.1: Write versions to the files (if user chose to bump version)
        if (isVersionBumped) {
            await writeVersion(pkg, nextVersion);
            console.log(chalk.green(`✅ Updated ${baseName} to ${nextVersion}`));

            await exec(`git reset`, { stdio: "pipe" }); // Unstage all files
            await exec(`git add ${pkg.path}`, { stdio: "pipe" }); // Stage only the package

            // Step 4.2: Commit changes
            const { confirmCommit } = await prompt<{ confirmCommit: boolean }>({
                type: "confirm",
                name: "confirmCommit",
                message: "❓ Commit version changes? You can stage other files now, if needed",
                initial: true
            });

            if (!confirmCommit) {
                console.log(chalk.yellow("⚠️  Commit canceled. Changes remain uncommitted"));
                process.exit(0);
            }
            await exec(`git commit -m "chore(${baseName}): bump version to ${nextVersion}"`, { stdio: "pipe" });
            console.log(chalk.green("✅ Changes committed"));
            hasCommits = true;
        } else {
            console.log(chalk.yellow("⚠️  Version bump skipped. No changes to commit."));
        }

        // Step 4.3: Push to GitHub
        const { confirmPush } = await prompt<{ confirmPush: boolean }>({
            type: "confirm",
            name: "confirmPush",
            message: `❓ Push branch ${chalk.blue(tmpBranchName)} to GitHub${!hasCommits ? " (without commits)" : ""}?`,
            initial: true
        });

        if (!confirmPush) {
            console.log(chalk.yellow("⚠️  Push canceled. Branch remains local"));
            console.log(chalk.yellow(`   To push manually: git push origin ${tmpBranchName}`));
            process.exit(0);
        }

        await exec(`git push -u origin ${tmpBranchName}`, { stdio: "pipe" });
        console.log(chalk.green("✅ Branch pushed to GitHub"));

        console.log(chalk.bold("\n📋 STEP 5: GitHub Release Workflow"));
        await triggerGitHubReleaseWorkflow(pkg.name, tmpBranchName);

        console.log(chalk.bold("\n📋 STEP 6: Jira Issue Management"));
        await manageIssuesForVersion(jira, jiraVersion.id, jiraVersionName);

        console.log(chalk.cyan("\n🎉 Release preparation completed! 🎉"));
        console.log(chalk.cyan(`   Package: ${baseName} v${nextVersion}`));
        console.log(chalk.cyan(`   Branch: ${tmpBranchName}`));
        console.log(chalk.cyan(`   Jira Version: ${jiraVersionName}`));
        if (!isVersionBumped) {
            console.log(chalk.cyan(`   Note: Version was not bumped as requested`));
        }
    } catch (error) {
        console.error(chalk.red("\n❌ ERROR:"), error);
        process.exit(1);
    }
}

function showManualTriggerInstructions(packageName: string, branchName: string): void {
    console.log(chalk.yellow("\n⚠️  Trigger GitHub workflow manually:"));
    console.log(
        chalk.cyan("   1. Go to") + " https://github.com/mendix/web-widgets/actions/workflows/CreateGitHubRelease.yml"
    );
    console.log(chalk.cyan("   2. Click") + " 'Run workflow' button");
    console.log(chalk.cyan("   3. Enter branch:") + ` ${chalk.white(branchName)}`);
    console.log(chalk.cyan("   4. Enter package:") + ` ${chalk.white(packageName)}`);
    console.log(chalk.cyan("   5. Click") + " 'Run workflow'");
}

async function manageIssuesForVersion(jira: Jira, versionId: string, versionName: string): Promise<void> {
    const { manageIssues } = await prompt<{ manageIssues: boolean }>({
        type: "confirm",
        name: "manageIssues",
        message: `❓ Manage issues for version ${chalk.blue(versionName)}?`,
        initial: true
    });

    if (!manageIssues) {
        return;
    }

    console.log(chalk.bold(`\n📋 Managing issues for version ${chalk.blue(versionName)}`));

    let managing = true;
    while (managing) {
        // Get current issues
        const issues = await jira.getIssuesWithDetailsForVersion(versionId);

        console.log(chalk.bold(`\n🔖 Issues for ${chalk.blue(versionName)} (${issues.length}):`));
        if (issues.length === 0) {
            console.log(chalk.yellow("   No issues assigned to this version yet"));
        } else {
            issues.forEach((issue, index) => {
                console.log(`   ${index + 1}. ${chalk.cyan(issue.key)}: ${issue.fields.summary}`);
            });
        }

        const { action } = await prompt<{ action: string }>({
            type: "select",
            name: "action",
            message: "What would you like to do?",
            choices: [
                { name: "add", message: "Add an issue" },
                { name: "remove", message: "Remove an issue" },
                { name: "refresh", message: "Refresh issue list" },
                { name: "exit", message: "Exit" }
            ]
        });

        switch (action) {
            case "add": {
                const { issueKey } = await prompt<{ issueKey: string }>({
                    type: "input",
                    name: "issueKey",
                    message: "Enter issue key (e.g., WEB-1234)"
                });

                const issue = await jira.searchIssueByKey(issueKey);
                if (!issue) {
                    console.log(chalk.red(`❌ Issue ${chalk.cyan(issueKey)} not found`));
                    break;
                }

                console.log(`Found: ${chalk.cyan(issue.key)}: ${issue.fields.summary}`);

                const { confirm } = await prompt<{ confirm: boolean }>({
                    type: "confirm",
                    name: "confirm",
                    message: `❓ Assign ${chalk.cyan(issue.key)} to version ${chalk.blue(versionName)}?`,
                    initial: true
                });

                if (confirm) {
                    await jira.assignVersionToIssue(versionId, issue.key);
                    console.log(
                        chalk.green(`✅ Issue ${chalk.cyan(issue.key)} assigned to ${chalk.blue(versionName)}`)
                    );
                }
                break;
            }

            case "remove": {
                if (issues.length === 0) {
                    console.log(chalk.yellow("⚠️  No issues to remove"));
                    break;
                }

                const { selectedIssue } = await prompt<{ selectedIssue: string }>({
                    type: "select",
                    name: "selectedIssue",
                    message: "Select issue to remove",
                    choices: issues.map(issue => ({
                        name: issue.key,
                        message: `${issue.key}: ${issue.fields.summary}`
                    }))
                });

                const { confirmRemove } = await prompt<{ confirmRemove: boolean }>({
                    type: "confirm",
                    name: "confirmRemove",
                    message: `❓ Remove ${chalk.cyan(selectedIssue)} from ${chalk.blue(versionName)}?`,
                    initial: true
                });

                if (confirmRemove) {
                    await jira.removeFixVersionFromIssue(versionId, selectedIssue);
                    console.log(chalk.green(`✅ Removed ${chalk.cyan(selectedIssue)} from ${chalk.blue(versionName)}`));
                }
                break;
            }

            case "refresh":
                console.log(chalk.blue("🔄 Refreshing issue list..."));
                break;

            case "exit":
                managing = false;
                break;
        }
    }
}

async function triggerGitHubReleaseWorkflow(packageName: string, branchName: string): Promise<void> {
    const { triggerWorkflow } = await prompt<{ triggerWorkflow: boolean }>({
        type: "confirm",
        name: "triggerWorkflow",
        message: "❓ Trigger GitHub release workflow now?",
        initial: true
    });

    if (triggerWorkflow) {
        console.log(chalk.blue("🔄 Triggering GitHub release workflow..."));
        try {
            await gh.triggerCreateReleaseWorkflow(packageName, branchName);
            console.log(chalk.green("✅ GitHub Release Workflow triggered"));
        } catch (error) {
            console.error(chalk.red(`❌ Failed to trigger workflow: ${(error as Error).message}`));
            showManualTriggerInstructions(packageName, branchName);
        }
    } else {
        showManualTriggerInstructions(packageName, branchName);
    }
}

async function createReleaseBranch(packageName: string, version: string): Promise<string> {
    const tmpBranchName = `tmp/${packageName}-v${version}`;

    let branchToUse = tmpBranchName;
    let branchesAreReady = false;

    while (!branchesAreReady) {
        // Check if branch exists locally
        let localBranchExists = false;
        try {
            const { stdout: localBranchCheck } = await exec(`git branch --list ${tmpBranchName}`, { stdio: "pipe" });
            localBranchExists = localBranchCheck.trim().includes(tmpBranchName);
        } catch (error) {
            console.warn(chalk.yellow(`⚠️  Could not check local branch: ${(error as Error).message}`));
        }

        // Check if branch exists on remote
        let remoteBranchExists = false;
        try {
            const { stdout: remoteBranchCheck } = await exec(`git ls-remote --heads origin ${tmpBranchName}`, {
                stdio: "pipe"
            });
            remoteBranchExists = remoteBranchCheck.trim().includes(tmpBranchName);
        } catch (error) {
            console.warn(chalk.yellow(`⚠️  Could not check remote branch: ${(error as Error).message}`));
        }

        if (!localBranchExists && !remoteBranchExists) {
            branchesAreReady = true;
            continue;
        }

        console.log(
            chalk.yellow(
                `⚠️  Branch ${chalk.blue(tmpBranchName)} exists ${localBranchExists ? "locally" : ""}${localBranchExists && remoteBranchExists ? " and " : ""}${remoteBranchExists ? "on remote" : ""}`
            )
        );

        // Show manual deletion instructions
        console.log(chalk.cyan("\n🗑️  Branch deletion instructions:"));
        if (localBranchExists) {
            console.log(chalk.cyan("   To delete local branch:"));
            console.log(chalk.white(`   1. Switch to another branch: git checkout main`));
            console.log(chalk.white(`   2. Delete branch: git branch -D ${tmpBranchName}`));
        }
        if (remoteBranchExists) {
            console.log(chalk.cyan("   To delete remote branch:"));
            console.log(chalk.white(`   Run: git push origin --delete ${tmpBranchName}`));
        }

        const { branchAction } = await prompt<{ branchAction: string }>({
            type: "select",
            name: "branchAction",
            message: "What would you like to do?",
            choices: [
                { name: "checkAgain", message: "I've deleted the branches, check again" },
                { name: "random", message: "Create branch with random suffix" },
                { name: "cancel", message: "Cancel operation" }
            ]
        });

        switch (branchAction) {
            case "checkAgain":
                console.log(chalk.blue("🔄 Rechecking branch status..."));
                break;

            case "random":
                const randomSuffix = Math.random().toString(36).substring(2, 8);
                branchToUse = `${tmpBranchName}-${randomSuffix}`;
                console.log(chalk.blue(`🔀 Using branch: ${branchToUse}`));
                branchesAreReady = true;
                break;

            case "cancel":
                console.log(chalk.red("❌ Process canceled"));
                process.exit(1);
        }
    }

    // Now create the branch
    console.log(`🔀 Creating branch: ${chalk.blue(branchToUse)}`);
    await exec(`git checkout -b ${branchToUse}`, { stdio: "pipe" });
    console.log(chalk.green("✅ Branch created"));

    return branchToUse;
}

async function initializeJiraClient(): Promise<Jira> {
    const projectKey = process.env.JIRA_PROJECT_KEY ?? "WC";
    const baseUrl = process.env.JIRA_BASE_URL ?? "https://mendix.atlassian.net";
    const apiToken = process.env.JIRA_API_TOKEN;

    if (!projectKey || !baseUrl || !apiToken) {
        console.error(chalk.red("❌ Missing Jira environment variables"));
        console.log(chalk.dim("   Required variables:"));
        console.log(chalk.dim("   export JIRA_API_TOKEN=username@your-company.com:ATATT3xFfGF0..."));
        console.log(chalk.dim("   Get your API token at: https://id.atlassian.com/manage-profile/security/api-tokens"));
        throw new Error("Missing Jira environment variables");
    }

    // Initialize Jira client
    const jira = new Jira(projectKey, baseUrl, apiToken);

    // Initialize Jira project data with retry mechanism
    let initialized = false;
    while (!initialized) {
        try {
            console.log("🔄 Initializing Jira project data...");
            await jira.initializeProjectData();
            console.log(chalk.green("✅ Jira project data initialized"));
            initialized = true;
        } catch (error) {
            console.error(chalk.red(`❌ Jira init failed: ${(error as Error).message}`));

            const { retry } = await prompt<{ retry: boolean }>({
                type: "confirm",
                name: "retry",
                message: "❓ Retry Jira initialization?",
                initial: true
            });

            if (!retry) {
                throw new Error("Cannot proceed without Jira initialization");
            }
        }
    }

    return jira;
}

async function selectPackageAndVersion(): Promise<{
    pkg: PackageListing;
    baseName: string;
    nextVersion: string;
    jiraVersionName: string;
    isVersionBumped: boolean;
}> {
    const pkg = await selectPackage();
    const baseName = pkg.name.split("/").pop()!;

    console.log(`📦 Selected: ${chalk.blue(baseName)} (current: ${chalk.green(pkg.version)})`);

    // Ask user if they want to bump the version before showing version selection dialog
    const { confirmBumpVersion } = await prompt<{ confirmBumpVersion: boolean }>({
        type: "confirm",
        name: "confirmBumpVersion",
        message: `❓ Do you want to bump ${baseName} from version ${chalk.green(pkg.version)}?`,
        initial: true
    });

    // Only call getNextVersion if user wants to bump version
    let nextVersion = pkg.version;
    if (confirmBumpVersion) {
        nextVersion = await getNextVersion(pkg.version);
        console.log(`🔼 Next version: ${chalk.green(nextVersion)}`);
    } else {
        console.log(chalk.yellow(`⚠️ Version bump skipped. Keeping version ${chalk.green(pkg.version)}`));
    }

    const jiraVersionName = `${baseName}-v${nextVersion}`;

    return { pkg, baseName, nextVersion, jiraVersionName, isVersionBumped: confirmBumpVersion };
}

async function checkAndCreateJiraVersion(jira: Jira, jiraVersionName: string): Promise<any> {
    let jiraVersion = jira.findVersion(jiraVersionName);
    if (jiraVersion) {
        console.log(chalk.yellow(`⚠️  Jira version ${chalk.blue(jiraVersionName)} already exists`));
    } else {
        // Ask user for confirmation to create new version
        const { createVersion } = await prompt<{ createVersion: boolean }>({
            type: "confirm",
            name: "createVersion",
            message: `❓ Create Jira version ${chalk.blue(jiraVersionName)}?`,
            initial: true
        });

        if (!createVersion) {
            console.log(chalk.red("❌ Process canceled"));
            process.exit(1);
        }

        // Create Jira version
        jiraVersion = await jira.createVersion(jiraVersionName);
        console.log(chalk.green(`✅ Created Jira version ${chalk.blue(jiraVersionName)}`));
    }

    return jiraVersion;
}

main();
