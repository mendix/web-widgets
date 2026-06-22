#!/usr/bin/env ts-node-script

import { Version } from "../src";
import { parse as parseModule } from "../src/changelog-parser/parser/module/module";
import { parse as parseWidget } from "../src/changelog-parser/parser/widget/widget";
import { exec } from "../src/shell";

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

async function getChangedFiles(headSha: string, mergedTreeSha: string): Promise<string[]> {
    const result = await exec(`git diff --name-only ${headSha} ${mergedTreeSha}`, { stdio: "pipe" });
    return result.stdout.trim().split("\n").filter(Boolean);
}

/**
 * Simulate merging HEAD into BASE using `git merge-tree --write-tree` and return
 * the SHA of the resulting tree.
 */
async function getMergedTreeSha(baseSha: string, headSha: string): Promise<string | null> {
    let stdout = "";
    let hasConflicts = false;

    try {
        const result = await exec(`git merge-tree --write-tree ${baseSha} ${headSha}`, { stdio: "pipe" });
        stdout = result.stdout;
    } catch (error) {
        // execa throws on non-zero exit. git merge-tree exits 1 when there are
        // conflicts but still prints the tree SHA to stdout.
        const execaError = error as { exitCode?: number; stdout?: string };
        if (execaError.exitCode === 1 && execaError.stdout) {
            stdout = execaError.stdout;
            hasConflicts = true;
        } else {
            console.error(`  ❌ Failed to simulate merge: ${error instanceof Error ? error.message : String(error)}`);
            return null;
        }
    }

    const treeSha = stdout.trim().split("\n")[0].trim();
    if (!treeSha) {
        console.error(`  ❌ git merge-tree did not return a tree SHA`);
        return null;
    }

    if (hasConflicts) {
        console.warn(`  ⚠️  Merge simulation has conflicts – some files will contain conflict markers`);
    }

    return treeSha;
}

/**
 * Read a file from a tree SHA.
 */
async function getFileContentFromTree(treeSha: string, filePath: string): Promise<string | null> {
    try {
        const result = await exec(`git show ${treeSha}:${filePath}`, { stdio: "pipe" });
        return result.stdout;
    } catch (_error) {
        // File not present in the tree
        return null;
    }
}

function hasConflictMarkers(content: string): boolean {
    return content.includes("<<<<<<<") || content.includes(">>>>>>>");
}

async function main(): Promise<void> {
    const base = process.env.BASE_SHA; // main
    const head = process.env.HEAD_SHA; // fix/blah-blah-blah

    if (!base || !head) {
        throw new Error("BASE_SHA and HEAD_SHA environment variables must be set");
    }

    console.log(`Checking CHANGELOG.md files between ${base} and ${head}...`);

    // Simulate the merge first so we can find files actually modified by it.
    console.log(`\nSimulating merge of HEAD (${head}) into BASE (${base})...`);
    const mergedTreeSha = await getMergedTreeSha(base, head);
    if (!mergedTreeSha) {
        throw new Error("Cannot proceed: failed to compute merged tree. Check the error above.");
    }
    console.log(`Merged tree SHA: ${mergedTreeSha}`);

    // Diff HEAD against the merged tree: only files where both sides had changes
    // (requiring a 3-way merge) will appear here. Files exclusively changed in
    // the PR branch or exclusively in BASE are not included.
    const mergeChangedFiles = await getChangedFiles(head, mergedTreeSha);
    console.log(`\nFound ${mergeChangedFiles.length} file(s) modified by the merge`);

    const changelogFiles = mergeChangedFiles.filter(file => file.endsWith("CHANGELOG.md"));

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

        // Old content: what the file looks like on BASE (what is already in main)
        const oldContent = await getFileContentFromTree(base, filePath);

        // New content: what the file would look like *after* merging HEAD into BASE.
        // We read from the simulated merged tree rather than from HEAD directly so
        // that semantic merge conflicts (lines mangled or dropped by the 3-way merge)
        // are caught here, not silently accepted.
        const mergedContent = await getFileContentFromTree(mergedTreeSha, filePath);

        if (!oldContent && !mergedContent) {
            console.log(`  ⚠️  Warning: File not found in either BASE or merged tree, skipping`);
            continue;
        }

        if (!oldContent) {
            console.log(`  ℹ️  New file added in HEAD (no comparison needed)`);
            continue;
        }

        if (!mergedContent) {
            console.log(`  ℹ️  File will be deleted after merge (no comparison needed)`);
            continue;
        }

        if (hasConflictMarkers(mergedContent)) {
            console.error(`  ❌ Merge conflict detected in ${filePath}! Resolve conflicts before merging.`);
            hasErrors = true;
            continue;
        }

        // Determine changelog type
        const changelogType = getChangelogType(filePath);

        if (changelogType === "module") {
            changes.push({ filePath, oldContent, newContent: mergedContent, type: "module" });
        } else if (changelogType === "widget") {
            changes.push({ filePath, oldContent, newContent: mergedContent, type: "widget" });
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
