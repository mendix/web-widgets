#!/usr/bin/env node

import { setTimeout as sleep } from "node:timers/promises";
import { GitHub, type GitHubPR, MergePRError } from "../src/github.ts";

const ALLOWED_FILENAMES = new Set(["package.xml", "CHANGELOG.md", "package.json"]);

// Right after a PR is opened GitHub may still be computing mergeability and answers 405.
const MERGE_ATTEMPTS = 6;
const MERGE_RETRY_DELAY_MS = 10_000;

/** Thrown when the script should stop gracefully without failing the workflow. */
class SkipError extends Error {}

// Draft releases have no git tag yet, so look up by head branch first (names mirror
// resolveChangelogBranch in rui-create-gh-release) and use the tag only for published releases.
async function findChangelogPR(gh: GitHub, tag: string): Promise<GitHubPR | undefined> {
    for (const branch of [`tmp/${tag}`, `${tag}-update-changelog`]) {
        const pr = await gh.getPRByHeadBranch(branch);
        if (pr) {
            return pr;
        }
    }

    try {
        return await gh.getPRByReleaseTag(tag);
    } catch {
        return undefined;
    }
}

async function mergeWithRetry(gh: GitHub, prNumber: number): Promise<void> {
    for (let attempt = 1; ; attempt++) {
        try {
            await gh.mergePR(prNumber, "squash");
            return;
        } catch (e) {
            const retriable = e instanceof MergePRError && e.status === 405;
            if (!retriable || attempt === MERGE_ATTEMPTS) {
                throw e;
            }
            console.warn(`PR #${prNumber} is not mergeable yet (attempt ${attempt}/${MERGE_ATTEMPTS}), retrying...`);
            await sleep(MERGE_RETRY_DELAY_MS);
        }
    }
}

async function main(): Promise<void> {
    const tag = process.argv[2];

    if (!tag) {
        throw new Error(
            "Usage: rui-merge-changelogs-pr <release-tag>\nExample: rui-merge-changelogs-pr badge-web-v1.2.3"
        );
    }

    const gh = new GitHub();
    await gh.ensureAuth();

    console.log(`\nLooking up changelog PR for: ${tag}`);
    const pr = await findChangelogPR(gh, tag);

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

    // Checks are not awaited: the PR only touches release metadata, and flaky checks must not block a release.
    console.log(`\nMerging PR #${pr.number}...`);
    await mergeWithRetry(gh, pr.number);
    console.log(`\n✅ PR #${pr.number} merged successfully.`);
}

main().catch(e => {
    const isSkip = e instanceof SkipError;
    console[isSkip ? "warn" : "error"](`\n${isSkip ? "⚠️" : "❌"} ${e instanceof Error ? e.message : String(e)}`);
    process.exit(isSkip ? 0 : 1);
});
