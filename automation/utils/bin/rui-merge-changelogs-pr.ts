#!/usr/bin/env ts-node-script

import { GitHub } from "../src/github";

const ALLOWED_FILENAMES = new Set(["package.xml", "CHANGELOG.md", "package.json"]);

/** Thrown when the script should stop gracefully without failing the workflow. */
class SkipError extends Error {}

async function main(): Promise<void> {
    const tag = process.argv[2];

    if (!tag) {
        throw new Error(
            "Usage: rui-merge-changelogs-pr <release-tag>\nExample: rui-merge-changelogs-pr badge-web-v1.2.3"
        );
    }

    const gh = new GitHub();
    await gh.ensureAuth();

    // 1. Fetch PR by release tag
    console.log(`\nLooking up PR for tag: ${tag}`);
    const pr = await gh.getPRByReleaseTag(tag);

    if (!pr) {
        throw new SkipError(`No PR found for tag "${tag}". Skipping.`);
    }

    console.log(`\nFound PR:`);
    console.log(`  #${pr.number}: ${pr.title}`);
    console.log(`  State  : ${pr.state}`);
    console.log(`  Branch : ${pr.head.ref} → ${pr.base.ref}`);
    console.log(`  URL    : ${pr.html_url}`);

    if (pr.state !== "open") {
        throw new SkipError(`PR #${pr.number} is already ${pr.state}. Skipping.`);
    }

    // 2. Validate changed files
    console.log(`\nFetching changed files for PR #${pr.number}...`);
    const files = await gh.listPRChangedFiles(pr.number);
    const filenames = files.map(f => f.filename);

    const disallowed = filenames.filter(f => !ALLOWED_FILENAMES.has(f.split("/").at(-1) ?? f));

    if (disallowed.length > 0) {
        throw new SkipError(
            `PR #${pr.number} contains unexpected changed files:\n${disallowed.map(f => `  - ${f}`).join("\n")}\n\nOnly package.xml, CHANGELOG.md and package.json are allowed. Skipping.`
        );
    }

    console.log(`Changed files (${filenames.length}):`);
    filenames.forEach(f => console.log(`  ✓ ${f}`));

    // 3. Merge
    console.log(`\nMerging PR #${pr.number}...`);
    await gh.mergePR(pr.number, "squash");
    console.log(`\n✅ PR #${pr.number} merged successfully.`);
}

main().catch(e => {
    const isSkip = e instanceof SkipError;
    console[isSkip ? "warn" : "error"](`\n${isSkip ? "⚠️" : "❌"} ${e instanceof Error ? e.message : String(e)}`);
    process.exit(isSkip ? 0 : 1);
});
