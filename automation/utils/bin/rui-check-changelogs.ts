#!/usr/bin/env ts-node-script

import { exec } from "../src/shell";
import { Version } from "../src";
import { parse as parseWidget } from "../src/changelog-parser/parser/widget/widget";
import { parse as parseModule } from "../src/changelog-parser/parser/module/module";

interface ChangelogChange {
    filePath: string;
    oldContent: string;
    newContent: string;
    type: "module" | "widget";
}

type ChangelogType = "module" | "widget" | "other";

function getChangelogType(filePath: string): ChangelogType {
    if (filePath.includes("packages/modules/")) {
        return "module";
    }
    if (filePath.includes("packages/pluggableWidgets/")) {
        return "widget";
    }
    return "other";
}

function compareChangelogContent(change: ChangelogChange): boolean {
    try {
        const oldParsed =
            change.type === "module"
                ? parseModule(change.oldContent, { moduleName: "tmp", Version })
                : parseWidget(change.oldContent, { Version });
        const newParsed =
            change.type === "module"
                ? parseModule(change.newContent, { moduleName: "tmp", Version })
                : parseWidget(change.newContent, { Version });

        const [, ...oldReleased] = oldParsed.content;
        const [newUnreleased, ...newReleased] = newParsed.content;

        const releasedVersionsMatch = compareReleasedVersions(oldReleased, newReleased);

        if (!releasedVersionsMatch) {
            console.error(`  ❌ Released versions have been modified!`);
            return false;
        }

        const sectionTypes = newUnreleased.sections.map(s => s.type);
        if (sectionTypes.length !== new Set(sectionTypes).size) {
            console.error(`  ❌ There are duplicated changelog types in Unreleased!`);
            return false;
        }
    } catch (error) {
        console.error(`  ❌ Failed to parse changelog: ${error instanceof Error ? error.message : String(error)}`);
        return false;
    }

    return true;
}

function compareReleasedVersions(oldReleased: any[], newReleased: any[]): boolean {
    return JSON.stringify(oldReleased) === JSON.stringify(newReleased);
}

async function getChangedFiles(base: string, head: string): Promise<string[]> {
    const result = await exec(`git diff --name-only ${base}...${head}`, { stdio: "pipe" });
    return result.stdout.trim().split("\n").filter(Boolean);
}

async function getFileContent(filePath: string, commitSha: string): Promise<string | null> {
    try {
        const result = await exec(`git show ${commitSha}:${filePath}`, { stdio: "pipe" });
        return result.stdout;
    } catch (_error) {
        // File might not exist at this commit (newly added or deleted)
        return null;
    }
}

async function main(): Promise<void> {
    const base = process.env.BASE_SHA; // main
    const head = process.env.HEAD_SHA; // fix/blah-blah-blah

    if (!base || !head) {
        throw new Error("BASE_SHA and HEAD_SHA environment variables must be set");
    }

    console.log(`Checking CHANGELOG.md files between ${base} and ${head}...`);

    // Get list of all changed files
    const changedFiles = await getChangedFiles(base, head);
    console.log(`Found ${changedFiles.length} changed file(s)`);

    // Filter for CHANGELOG.md files in packages/modules or packages/pluggableWidgets
    const changelogFiles = changedFiles.filter(file => {
        return file.endsWith("CHANGELOG.md");
    });

    if (changelogFiles.length === 0) {
        console.log("No CHANGELOG.md files were changed.");
        return;
    }

    console.log(`Found ${changelogFiles.length} CHANGELOG.md file(s) to check:`);
    changelogFiles.forEach(file => {
        const type = getChangelogType(file);
        console.log(`  - ${file} (${type})`);
    });

    const changes: ChangelogChange[] = [];
    let hasErrors = false;

    for (const filePath of changelogFiles) {
        console.log(`\nProcessing ${filePath}...`);

        // Get old content (from base commit)
        const oldContent = await getFileContent(filePath, base);

        // Get new content (from head commit)
        const newContent = await getFileContent(filePath, head);

        if (!oldContent && !newContent) {
            console.log(`  ⚠️  Warning: File not found in both commits, skipping`);
            continue;
        }

        if (!oldContent) {
            console.log(`  ℹ️  New file added (no comparison needed)`);
            continue;
        }

        if (!newContent) {
            console.log(`  ℹ️  File deleted (no comparison needed)`);
            continue;
        }

        // Determine changelog type
        const changelogType = getChangelogType(filePath);

        if (changelogType === "module") {
            changes.push({ filePath, oldContent, newContent, type: "module" });
        } else if (changelogType === "widget") {
            changes.push({ filePath, oldContent, newContent, type: "widget" });
        } else {
            console.log(`  ⚠️  Warning: Unknown changelog type, skipping`);
        }
    }

    for (const change of changes) {
        const isValid = compareChangelogContent(change);
        if (!isValid) {
            console.error(`  ❌ Invalid changes detected in ${change.filePath}`);
            hasErrors = true;
        } else {
            console.log(`  ✅ Valid changes`);
        }
    }

    if (hasErrors) {
        console.error("\n❌ Some CHANGELOG.md files have invalid changes");
        process.exit(1);
    } else {
        console.log(`\n✅ All ${changes.length} CHANGELOG.md file(s) have valid changes`);
    }
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
